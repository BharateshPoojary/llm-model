"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useCompletion } from "@ai-sdk/react";
const ChatInput = () => {
  const { completion } = useCompletion();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const [isPdfUploading, setIsPdfUploading] = useState<boolean>(false);
  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    const updatedMessages = [...messages, inputMessage.trim()];
    setMessages(updatedMessages);
    setInputMessage("");
    const formData = new FormData();

    console.log(messages);
    updatedMessages.forEach((msg) => {
      formData.append("message[]", msg);
    });
    try {
      const message = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(message.data.stream);
    } catch (error) {
      console.error(error);
    }
  };
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; //if [0] is not there optional chaining will prevent error and assign file as undefined
    if (!file) return;

    console.log(file);
    if (file) {
      try {
        setIsPdfUploading(true);
        const formPDFData = new FormData();
        formPDFData.append("pdfFile", file);
        const pdfUploadResponse = await axios.post("/api/upload", formPDFData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (pdfUploadResponse.data) {
          toast("File Uploaded successfully");
        }
      } catch (error) {
        toast("Error uploading file");
      } finally {
        setIsPdfUploading(false);
      }
    }
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
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg}
          </div>
        ))}
        {/* Show completion */}
        {completion && <div className="text-gray-500">{completion}</div>}
      </div>

      {/* Input fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 sm:w-1/2 w-full bg-white p-2 border-t mx-auto">
        <div className="flex items-center gap-2 border rounded-xl p-2 bg-background">
          <Button
            onClick={() => uploadRef.current?.click()}
            size="icon"
            className="p-2 cursor-pointer"
          >
            {isPdfUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>

          <input
            disabled={isPdfUploading}
            ref={uploadRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border-none outline-none bg-transparent"
          />
          <Button
            disabled={isPdfUploading}
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
