const WEBHOOK_URL = "https://kumarkanaiya.app.n8n.cloud/webhook/ictchat";

export interface ChatResponse {
  output?: string;
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

const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

export const sendMessageToWebhook = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        timestamp: new Date().toISOString(),
        source: 'web-chat'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats from n8n
    if (data.products && Array.isArray(data.products)) {
      return {
        message: data.output ? data.output : (data.message || "Here are some products I found for you:"),
        products: data.products
      };
    }
    
    if (data.output) {
      return { message: data.output };
    }
    
    if (data.message) {
      return { message: data.message };
    }
    
    // Fallback for plain text response
    if (typeof data === 'string') {
      return { message: data };
    }
    
    return {
      message: "I received your message. How can I help you further?",
    };
    
  } catch (error) {
    console.error('Error sending message to webhook:', error);
    
    return {
      error: "Unable to connect to the server. Please try again later.",
      message: "I'm having trouble connecting right now. Please check your connection and try again."
    };
  }
};