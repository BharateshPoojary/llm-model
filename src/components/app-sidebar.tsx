"use client";
import { MessageCirclePlus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import axios from "axios";
import { useRouter } from "next/navigation";
import { setHistory } from "@/lib/features/Chat";
import { clearMessage } from "@/lib/features/ChatData";
import { useEffect, useState } from "react";
const items = [
  {
    title: "New Chat",
    icon: MessageCirclePlus,
  },
];
export function AppSidebar({ useremail }: { useremail: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  // const [chatNumber, setChatNumber] = useState<number>(0);

  const { history } = useSelector((state: RootState) => state.chat);
  const { chatId, messages } = useSelector(
    (state: RootState) => state.chatData
  );
  useEffect(() => {
    console.log("Messages in side bar", messages);
  }, [messages]);
  const getHistory = async () => {
    try {
      const result = await axios.post("/api/getHistory", {
        useremail,
      });
      const chats = result.data.history;
      console.log("History data", chats);
      dispatch(setHistory(chats));
    } catch (error) {
      console.log(error);
    }
  };
  const saveNewChat = async () => {
    console.log("User Email", useremail);
    try {
      console.log("messages.length", messages.length);
      console.log("Current Messages", messages);
      if (messages.length > 0) {
        const response = await axios.post("/api/savenewchat", {
          chatId,
          useremail,
          chatNumber: Date.now(),
          messages,
        });
        if (response.data) {
          // setChatNumber(chatNumber + 1);
          console.log("I am clearing all messages");
          dispatch(clearMessage());
          getHistory();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleNewChatClick = async () => {
    await saveNewChat();
    router.replace("/");
  };
  const handleChat = async (
    chatIdfromHistory: string,
    specificChatNumber: string
  ) => {
    console.log("History length", history.length);

    //await saveChat();//here Existing chat will have different function
    router.replace(`/c/${chatIdfromHistory}?chatNumber=${specificChatNumber}`);
  };
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  onClick={() => handleNewChatClick()}
                  className="cursor-pointer"
                >
                  <SidebarMenuButton asChild>
                    <span>
                      <item.icon />
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {history.map((eachuserchat) =>
                eachuserchat.ArrayOfChats.map((eachchat) => (
                  <SidebarMenuItem
                    key={eachchat.chatNumber}
                    className={`${
                      eachuserchat.ArrayOfChats.length > 0
                        ? "cursor-pointer"
                        : ""
                    }`}
                    onClick={
                      eachuserchat.ArrayOfChats.length > 0
                        ? () =>
                            handleChat(eachuserchat.chatId, eachchat.chatNumber)
                        : undefined
                    }
                  >
                    <SidebarMenuButton asChild>
                      <div>
                        <div className="text-sm text-gray-500">
                          {eachchat.messages?.length > 0
                            ? `${eachchat.messages[
                                eachchat.messages.length - 1
                              ].content.slice(0, 20)}...`
                            : "No Chat History Available"}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
