import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import ProductCard from "./ProductCard";
import { sendMessageToWebhook, ChatResponse } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
interface Message {
  id: string;
  type: "user" | "bot";
  message: string;
  timestamp: Date;
  products?: Array<{
    image: string;
    name: string;
    price: string;
    detailLink: string;
    description?: string;
  }>;
}
const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    type: "bot",
    message: "Hello! I'm your AI shopping assistant. I can help you find products, answer questions, and provide recommendations. What are you looking for today?",
    timestamp: new Date()
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      message: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    try {
      // Send to n8n webhook
      const response: ChatResponse = await sendMessageToWebhook(messageText);

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        message: response.error || response.message || "I received your message.",
        timestamp: new Date(),
        products: response.products
      };
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        if (response.error) {
          toast({
            title: "Connection Issue",
            description: response.error,
            variant: "destructive"
          });
        }
      }, 1500); // Simulate thinking time
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="flex flex-col h-screen bg-chat-bg bg-slate-100">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map(message => <ChatMessage key={message.id} type={message.type} message={message.message} timestamp={message.timestamp}>
              {message.products && message.products.length > 0 && <div className="mt-4">
                  <p className="text-sm mb-3">{message.message}</p>
                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {message.products.map((product, index) => <ProductCard key={index} image={product.image} name={product.name} price={product.price} detailLink={product.detailLink} description={product.description} />)}
                  </div>
                </div>}
            </ChatMessage>)}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>;
};
export default ChatInterface;