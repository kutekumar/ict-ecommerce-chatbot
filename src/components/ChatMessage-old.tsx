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
  products?: Product[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  message,
  timestamp,
  children,
  products,
}) => {
  const isUser = type === "user";

  // Debug: Log all props
  console.log('🔍 ChatMessage Props:', { 
    type, 
    message, 
    products, 
    hasProductsProp: !!products,
    productsCount: products?.length 
  });

  const productsToDisplay = useMemo(() => {
    // ✅ Priority 1: Use products prop directly from JSON
    if (products && products.length > 0) {
      console.log('✅ Using products from props:', products);
      return products;
    }

    // ✅ Priority 2: Try to parse HTML as fallback
    try {
      if (typeof window !== "undefined" && typeof DOMParser !== "undefined" && message) {
        const doc = new DOMParser().parseFromString(message, "text/html");
        const productDivs = doc.querySelectorAll('div[style*="margin-bottom: 20px"]');
        
        const parsedProducts: Product[] = [];
        
        for (const div of productDivs) {
          const nameElement = div.querySelector('h3');
          const name = nameElement?.textContent?.trim() || "";

          const priceElement = Array.from(div.querySelectorAll('p')).find(p => 
            p.textContent?.includes('Price:')
          );
          const price = priceElement?.textContent?.replace('Price:', '').trim() || "";

          const imageLink = div.querySelector('a img');
          const image = imageLink ? imageLink.getAttribute('src') || "" : "";

          const firstAnchor = div.querySelector('a');
          let detailLink = firstAnchor ? firstAnchor.getAttribute('href') || "" : "";

          if (!detailLink) {
            const viewProductAnchor = Array.from(div.querySelectorAll('a')).find(a => 
              a.textContent?.includes('View Product')
            );
            detailLink = viewProductAnchor ? viewProductAnchor.getAttribute('href') || "" : "";
          }

          if (name) {
            parsedProducts.push({ name, price, image, detailLink, description: "" });
          }
        }

        if (parsedProducts.length > 0) {
          console.log('✅ Parsed products from HTML:', parsedProducts);
          return parsedProducts;
        }
      }
    } catch (e) {
      console.error("DOM parsing failed:", e);
    }

    console.log('❌ No products found');
    return [];
  }, [message, products]);

  const hasProducts = productsToDisplay && productsToDisplay.length > 0;
  console.log('📦 Final products to display:', productsToDisplay, 'Has products:', hasProducts);

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
          {hasProducts ? (
            <div>
              {/* Display message text */}
              <div className="text-sm mb-4 text-foreground leading-relaxed">
                {message || "Here are the products I found for you:"}
              </div>
              
              {/* Product cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsToDisplay.map((product, index) => (
                  <a
                    key={index}
                    href={product.detailLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block bg-white border rounded-lg shadow-sm p-3 flex flex-col items-center text-center ${
                      product.detailLink 
                        ? 'hover:shadow-lg transition-transform transform hover:scale-105' 
                        : 'cursor-default'
                    }`}
                    style={{ minHeight: '220px' }}
                    onClick={(e) => !product.detailLink && e.preventDefault()}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-contain rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-md bg-gray-100 mb-3 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}

                    <h3 className="text-sm font-semibold mb-1 break-words line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-primary font-bold mt-1">
                      {product.price || "Price not available"}
                    </p>
                  </a>
                ))}
              </div>
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