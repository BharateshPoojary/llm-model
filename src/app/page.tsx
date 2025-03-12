"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
const ChatInput = () => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const handleSend = async () => {
    const formData = new FormData();
    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }
    message.forEach((msg) => {
      formData.append("message[]", msg);
    });

    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);
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
            value={message.join("")}
            onChange={(e) => setMessage([e.target.value])}
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
