"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
const ChatInput = () => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const handleSend = () => {
    if (!message.trim()) return;
    if (!pdfFile) return;
    const formData = new FormData();
    formData.append("pdfFile", pdfFile);
    formData.append("message", message);
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; //if [0] is not there optional chaining will prevent error and assign file as undefined
    if (!file) return;
    setPdfFile(file);
    console.log(file);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat messages will go here */}
      </div>

      {/* Input fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 sm:w-1/2 w-full bg-white p-2 border-t mx-auto">
        <div className="flex items-center gap-2 border rounded-xl p-2 bg-background">
          {/* + Icon for file upload */}
          <Button
            onClick={() => uploadRef.current?.click()}
            size="icon"
            className="p-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Hidden file input */}
          <input
            ref={uploadRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-none outline-none bg-transparent"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="p-2 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
