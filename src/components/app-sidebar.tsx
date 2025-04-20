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
const items = [
  {
    title: "New Chat",
    icon: MessageCirclePlus,
  },
];
export function AppSidebar({ useremail }: { useremail: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { history } = useSelector((state: RootState) => state.chat);
  const { chatId, messages } = useSelector(
    (state: RootState) => state.chatData
  );
  const getHistory = async () => {
    try {
      const result = await axios.post("/api/getHistory", {
        useremail,
      });
      const chats = result.data.history;
      dispatch(setHistory(chats));
    } catch (error) {
      console.log(error);
    }
  };
  const saveChat = async () => {
    console.log("User Email", useremail);
    try {
      console.log("messages.length", messages.length);
      if (messages.length > 0) {
        const response = await axios.post("/api/savechat", {
          chatId,
          useremail,
          messages,
        });
        if (response.data) {
          console.log("I am clearing all messages");
          dispatch(clearMessage());
          getHistory();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleClick = async () => {
    await saveChat();
    router.replace("/");
  };
  const handleChat = async (chatIdfromHistory: string) => {
    console.log("History length", history.length);

    await saveChat();
    router.replace(`/c/${chatIdfromHistory}`);
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
                  onClick={() => handleClick()}
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
              {history.map((eachchat) => (
                <SidebarMenuItem
                  key={eachchat.chatId}
                  className={`${
                    eachchat.messages.length > 0 ? "cursor-pointer" : ""
                  } `}
                  onClick={
                    eachchat.messages.length > 0
                      ? () => handleChat(eachchat.chatId)
                      : undefined
                  }
                >
                  <SidebarMenuButton asChild>
                    <div>
                      <div className="text-sm text-gray-500">
                        {eachchat.messages[
                          eachchat.messages.length - 1
                        ]?.content.slice(0, 20)}
                        {eachchat.messages.length > 0
                          ? "..."
                          : "No Chat History Available"}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
