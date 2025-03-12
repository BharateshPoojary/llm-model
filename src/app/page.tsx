"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useChat } from "@ai-sdk/react";
import { ChatLine } from "@/components/chat-line";
import { Message } from "ai";
const ChatInput = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  // const [messages, setMessages] = useState<string[]>([]);
  // const [inputMessage, setInputMessage] = useState("");
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      onResponse: async (response) => {
        const data = await response.json();
        console.log(data.content);
        if (data.content) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: data.content,
            },
          ]);
        }
      },
    });

  const [isPdfUploading, setIsPdfUploading] = useState<boolean>(false);
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // handleSend();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container */}

      <div className="p-6 overflow-y-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message) => (
          <ChatLine key={id} role={role} content={content} />
        ))}
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
            {isPdfUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>

          {/* Hidden file input */}
          <input
            disabled={isPdfUploading}
            ref={uploadRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <form onSubmit={handleSubmit} className="flex">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none overflow-hidden border-none outline-none bg-transparent"
              onInput={(e) => {
                e.currentTarget.style.height = "auto"; // Reset height to recalculate
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; // Set to scroll height
              }}
            />

            <Button
              disabled={isPdfUploading}
              type="submit"
              size="icon"
              className="p-2 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
