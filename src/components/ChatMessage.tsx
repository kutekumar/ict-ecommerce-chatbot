import React, { ReactNode, useMemo } from "react";

interface Product {
  name: string;
  price: string;
  image: string;
  detailLink: string;
  description?: string;
}

interface ChatMessageProps {
  type: "user" | "bot";
  message: string;
  timestamp: Date;
  children?: ReactNode;
  products?: Product[]; // optional pre-parsed products
}

const isImageUrl = (url?: string) => {
  if (!url) return false;
  return /\.(jpe?g|png|webp|gif|svg)(?:[\?#].*)?$/i.test(url);
};

const chooseBestAnchor = (anchors: HTMLAnchorElement[], imgSrc?: string) => {
  if (!anchors || anchors.length === 0) return "";

  // prefer anchors with "detail" or "product" in text or href, and not pointing to image files
  const priority = anchors.find((a) => {
    const href = a.getAttribute("href") || "";
    const text = (a.textContent || "").toLowerCase();
    const hrefLower = href.toLowerCase();
    if (isImageUrl(href)) return false;
    if (text.includes("detail") || text.includes("view") || text.includes("product")) return true;
    if (hrefLower.includes("/product") || hrefLower.includes("/products/")) return true;
    return false;
  });
  if (priority) return priority.getAttribute("href") || "";

  // fallback: find any anchor whose href is not the same as imgSrc and not an image url
  const nonImgAnchor = anchors.find((a) => {
    const href = a.getAttribute("href") || "";
    if (!href) return false;
    if (isImageUrl(href)) return false;
    if (imgSrc && href === imgSrc) return false;
    return true;
  });
  if (nonImgAnchor) return nonImgAnchor.getAttribute("href") || "";

  // last fallback: first anchor href (even if it points to image)
  return anchors[0].getAttribute("href") || "";
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  message,
  timestamp,
  children,
  products,
}) => {
  const isUser = type === "user";

  const parsedProducts = useMemo<Product[]>(() => {
    // use pre-parsed products if provided
    if (products && products.length > 0) return products;

    const found: Product[] = [];

    // 1) Try JSON parse
    try {
      const maybe = JSON.parse(message);
      if (maybe && Array.isArray(maybe.products)) {
        return maybe.products.map((p: any) => ({
          name: p.name || "",
          price: p.price || "",
          image: p.image || "",
          detailLink: p.detailLink || p.details || p.url || "",
          description: p.description || "",
        }));
      }
    } catch (e) {
      // not JSON
    }

    // 2) DOM parsing
    try {
      if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
        const doc = new DOMParser().parseFromString(message, "text/html");
        const candidates = Array.from(doc.querySelectorAll("li"));
        const fallbackCandidates = Array.from(doc.querySelectorAll("p"));
        const elements = candidates.length > 0 ? candidates : fallbackCandidates;

        for (const el of elements) {
          const text = (el.textContent || "").trim();
          if (!text) continue;

          // name detection
          const strong = el.querySelector("strong");
          const nameFromStrong = strong ? (strong.textContent || "").trim() : null;
          const nameMatch = text.match(/Product[:\s]*([^\n<]+)/i);
          const name =
            (nameFromStrong && nameFromStrong.replace(/^Product[:\s]*/i, "").trim()) ||
            (nameMatch ? nameMatch[1].trim() : undefined);

          // price detection
          const priceMatch = text.match(/Price[:\s]*([^\n<]+)/i);
          const price = priceMatch ? priceMatch[1].trim() : "";

          // 🔥 improved image detection
          let img = el.querySelector("img")?.getAttribute("src") || "";
          if (!img) {
            // try markdown
            const mdImg = el.innerHTML.match(/!\[[^\]]*\]\(([^)]+)\)/);
            if (mdImg) img = mdImg[1];
            else {
              const htmlImg = el.innerHTML.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
              if (htmlImg) img = htmlImg[1];
              else {
                // ✅ NEW: check <a href="...jpg"> links
                const anchorImg = Array.from(el.querySelectorAll("a")).find((a) =>
                  isImageUrl(a.getAttribute("href") || "")
                );
                if (anchorImg) img = anchorImg.getAttribute("href") || "";
              }
            }
          }

          // anchor detection
          const anchors = Array.from(el.querySelectorAll("a"));
          const detail = chooseBestAnchor(anchors as HTMLAnchorElement[], img) || "";

          if (name && (price || img || detail)) {
            found.push({
              name: name || "",
              price: price || "",
              image: img || "",
              detailLink: detail || "",
            });
          }
        }

        if (found.length > 0) return found;
      }
    } catch (e) {
      // ignore
    }

    // 3) Regex fallback
    const productRegex =
      /Product[:\s]*([^\n<]+)[\s\S]*?Price[:\s]*([^\n<]+)[\s\S]*?(?:<img[^>]*src=["']([^"']+)["'][\s\S]*?>|!\[[^\]]*\]\(([^)]+)\))?[\s\S]*?(?:href=["']([^"']+)["']|\[.*?\]\((https?:\/\/[^)]+)\))?/gi;
    let m;
    while ((m = productRegex.exec(message)) !== null) {
      const name = (m[1] || "").trim();
      const price = (m[2] || "").trim();
      const img = (m[3] || m[4] || "").trim();
      const link = (m[5] || m[6] || "").trim();
      if (name) {
        const detailLink = !isImageUrl(link) ? link : "";
        found.push({
          name,
          price,
          image: img,
          detailLink,
        });
      }
    }
    if (found.length > 0) return found;

    return [];
  }, [message, products]);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in-up`}
    >
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <span className="text-sm font-medium text-primary">ICT</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 message-shadow ${
            isUser
              ? "user-message text-white ml-auto rounded-br-md"
              : "bot-message text-foreground rounded-bl-md"
          }`}
        >
          {parsedProducts && parsedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parsedProducts.map((p, i) => (
                <a
                  key={i}
                  href={p.detailLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border rounded-lg shadow-sm hover:shadow-lg p-3 transition-transform transform hover:scale-105 flex flex-col items-center text-center"
                  style={{ minHeight: 220 }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: 125, height: 125, objectFit: "contain" }}
                      className="rounded-md mb-3"
                    />
                  ) : (
                    <div
                      style={{ width: 125, height: 125 }}
                      className="rounded-md bg-gray-100 mb-3 flex items-center justify-center"
                    >
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold mb-1 break-words">{p.name}</h3>
                  <p className="text-sm text-primary font-bold">{p.price}</p>
                </a>
              ))}
            </div>
          ) : children ? (
            <div>{children}</div>
          ) : (
            <div
              className="text-sm leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </div>

        {isUser && (
          <div className="text-right mt-1">
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
