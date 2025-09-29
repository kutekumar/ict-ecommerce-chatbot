import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

const VoiceRecorder = ({ onTranscript, disabled }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        // Here you would typically send to a speech-to-text service
        // For now, we'll simulate the process
        setTimeout(() => {
          onTranscript("Voice message transcribed successfully!");
          setIsProcessing(false);
          toast({
            title: "Voice recorded",
            description: "Your message has been transcribed and sent.",
          });
        }, 2000);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your message now...",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isProcessing) {
    return (
      <Button variant="outline" disabled className="animate-pulse">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        Processing...
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={`${isRecording ? "animate-voice-pulse" : ""} transition-all duration-300`}
    >
      {isRecording ? (
        <>
          <Square className="w-4 h-4 mr-2" />
          Stop
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </>
      )}
    </Button>
  );
};

export default VoiceRecorder;