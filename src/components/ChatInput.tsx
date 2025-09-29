import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    onSendMessage(transcript);
  };

  return (
    <div className="sticky bottom-0 bg-background border-t border-border p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or use voice..."
                disabled={disabled}
                className="min-h-[44px] rounded-full border-2 px-4 py-2 resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 flex-1"
              />
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="rounded-full px-4 py-2 h-[44px] bg-primary hover:bg-primary/90 transition-colors ml-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
          
          <VoiceRecorder 
            onTranscript={handleVoiceTranscript}
            disabled={disabled}
          />
        </div>
        
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Powered by ICT.com.mm AI Assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;