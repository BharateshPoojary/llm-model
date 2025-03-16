"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useChat } from "@ai-sdk/react";
import { ChatLine } from "@/components/chat-line";
import { Message } from "ai";
import { scrollToBottom } from "@/lib/utils";
import { useParams } from "next/navigation";
import { addMessage, setChatId } from "@/lib/features/ChatData";
import { useDispatch } from "react-redux";
import { setHistory } from "@/lib/features/Chat";
const ChatInput = () => {
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const params = useParams<{ chatid: string }>();
  const [isSending, setIsSending] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      onResponse: async (response) => {
        const data = await response.json();
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
  useEffect(() => {
    dispatch(setChatId(params.chatid));
    console.log(params.chatid);
    const getHistory = async () => {
      try {
        const result = await axios.get("/api/savechat");
        const chats = result.data.history;
        dispatch(setHistory(chats));
      } catch (error) {
        console.log(error);
      }
    };
    getHistory();
    const handleChat = async () => {
      const getChat = await axios.post("/api/getchat", {
        chatId: params.chatid,
      });

      if (getChat.data.chats) {
        const chatmessages = getChat.data.chats.messages;
        setMessages(chatmessages);
      }
    };
    handleChat();
  }, [dispatch, setMessages, params.chatid]);

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
    const addMessagetoState = async () => {
      if (messages.length > 0) {
        const { id, role, content } = messages[messages.length - 1];
        const getChat = await axios.post("/api/getchat", {
          chatId: params.chatid,
        });

        if (getChat.data.chats) {
          const chatmessages: Message[] = getChat.data.chats.messages;
          if (!chatmessages.some((message) => message.id === id)) {
            dispatch(addMessage({ id, role, content }));
          }
        } else {
          dispatch(addMessage({ id, role, content }));
        }
      }
    };
    addMessagetoState();
  }, [dispatch, messages]);

  const [isPDFUploading, setisPDFUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const handleFormSubmit = async () => {
    if (isSending || isPDFUploading || !input.trim()) return;

    setIsSending(true);

    try {
      handleSubmit(); // Centralize submission logic here
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Maximum PDF file size must be 2 MB");
      return;
    }

    setFileInfo({
      name: file.name,
      size: file.size,
    });

    try {
      setisPDFUploading(true);
      const formPDFData = new FormData();
      formPDFData.append("pdfFile", file);
      const pdfUploadResponse = await axios.post("/api/upload", formPDFData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (pdfUploadResponse.data) {
        toast("File uploaded successfully");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(`Error uploading file${error.message}`);
      }
    } finally {
      setisPDFUploading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim()) return;

      try {
        await handleFormSubmit(); // handleSubmit should handle the server request
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleSend = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  return (
    <div className="flex flex-col " style={{ height: "calc(100% - 20px)" }}>
      <div className="p-6 overflow-y-auto flex-1" ref={containerRef}>
        {messages.map(({ id, role, content }: Message) => (
          <ChatLine key={id} role={role} content={content} />
        ))}
      </div>

      <div className="w-full sm:w-1/2 bg-white p-2 border-t mx-auto sticky bottom-0">
        <div className="flex items-end gap-2 border rounded-xl p-2 bg-background">
          <Button
            onClick={() => uploadRef.current?.click()}
            size="icon"
            className="p-2 cursor-pointer"
          >
            {isPDFUploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </Button>

          <input
            disabled={isPDFUploading}
            ref={uploadRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <form onSubmit={handleFormSubmit} className="flex w-full">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none overflow-y-auto border-none outline-none bg-transparent"
              style={{
                maxHeight: "200px",
              }}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${Math.min(
                  e.currentTarget.scrollHeight,
                  200
                )}px`;
              }}
            />
            <div className="flex items-end">
              <Button
                disabled={isPDFUploading || isSending}
                type="submit"
                size="icon"
                className="p-2 cursor-pointer"
                onClick={handleSend}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Display file info */}
        {fileInfo && (
          <div className="mt-2 bg-gray-100 p-2 rounded-lg text-sm">
            <p>{fileInfo.name}</p>
            <p>{(fileInfo.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
