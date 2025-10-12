const WEBHOOK_URL = "https://n8n-gjpjmvws.ap-northeast-1.clawcloudrun.com/webhook/ictchat";

export interface ChatResponse {
  message?: string;
  products?: Array<{
    image: string;
    name: string;
    price: string;
    detailLink: string;
    description?: string;
  }>;
  error?: string;
}

export const sendMessageToWebhook = async (
  message: string
): Promise<ChatResponse> => {
  try {
    console.log('🟡 Sending message:', message);
    
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

    const data = await response.json();
    console.log('🟢 Raw n8n response:', data);

    // SIMPLE: If data has products array, use it
    if (data.products && Array.isArray(data.products)) {
      return {
        message: data.message || "Here are the products:",
        products: data.products
      };
    }

    // SIMPLE: If no products, just return message
    return {
      message: data.message || "I received your message."
    };

  } catch (error) {
    console.error('🔴 Error:', error);
    return {
      error: "Connection failed. Please try again.",
      message: "I'm having trouble connecting right now.",
    };
  }
};