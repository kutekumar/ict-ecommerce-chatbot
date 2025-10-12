import React from "react";

interface Product {
  name: string;
  price: string;
  image: string;
  detailLink: string;
}

interface ChatMessageProps {
  type: "user" | "bot";
  message: string;
  timestamp: Date;
  products?: Product[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  message,
  timestamp,
  products,
}) => {
  const isUser = type === "user";

  console.log('📦 ChatMessage received:', { message, products: products?.length });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-sm font-medium text-blue-600">ICT</span>
            </div>
            <span className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

        <div className={`rounded-2xl px-4 py-3 ${
          isUser ? "bg-blue-600 text-white rounded-br-md" : "bg-white border rounded-bl-md"
        }`}>
          
          {/* Show products if available */}
          {products && products.length > 0 ? (
            <div>
              <div className="text-sm mb-4">{message}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <a
                    key={index}
                    href={product.detailLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 border rounded-lg p-3 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-contain rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-md bg-gray-200 mb-3 flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                    <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-green-600 font-bold">{product.price}</p>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            /* Show normal message if no products */
            <div className="text-sm">{message}</div>
          )}
        </div>

        {isUser && (
          <div className="text-right mt-1">
            <span className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;