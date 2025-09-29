const WEBHOOK_URL = "https://kumarkanaiya.app.n8n.cloud/webhook/ictchat";

export interface ChatResponse {
  message?: string;
  products?: Array<{
    image: string;
    name: string;
    price: string;
    detailLink: string;
    description?: string;
  }>;
  html?: string;
  error?: string;
}

// Keep emoji cleaner if you still want
const removeEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    )
    .trim();
};

export const sendMessageToWebhook = async (
  message: string
): Promise<ChatResponse> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString(),
        source: "web-chat",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (err) {
      // if backend didn’t return JSON
      const text = await response.text();
      return { message: text };
    }

    // ✅ Case 1: structured product response
    if (data.products && Array.isArray(data.products)) {
      return {
        message: data.message || "Here are some products I found for you:",
        products: data.products.map((p: any) => ({
          name: p.name,
          price: p.price,
          image: p.image,
          detailLink: p.detailLink || p.details || "",
          description: p.description || "",
        })),
      };
    }

    // ✅ Case 2: HTML output
    if (typeof data.html === "string") {
      return { html: data.html };
    }
    if (typeof data.data === "string") {
      return { html: data.data };
    }

    // ✅ Case 3: plain message
    if (typeof data.message === "string") {
      return { message: data.message };
    }
    if (typeof data.output === "string") {
      return { message: data.output };
    }

    // ✅ Case 4: string response
    if (typeof data === "string") {
      return { message: data };
    }

    // 🚨 Fallback
    return {
      message: "I received your message. How can I help you further?",
    };
  } catch (error) {
    console.error("Error sending message to webhook:", error);

    return {
      error: "Unable to connect to the server. Please try again later.",
      message:
        "I'm having trouble connecting right now. Please check your connection and try again.",
    };
  }
};
