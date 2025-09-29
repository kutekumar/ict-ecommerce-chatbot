const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="max-w-[80%]">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-sm font-medium text-primary">AI</span>
          </div>
          <span className="text-xs text-muted-foreground">typing...</span>
        </div>
        
        <div className="bot-message rounded-2xl px-4 py-3 message-shadow rounded-bl-md">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;