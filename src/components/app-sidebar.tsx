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
export function AppSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { history } = useSelector((state: RootState) => state.chat);
  const { chatId, messages } = useSelector(
    (state: RootState) => state.chatData
  );
  const getHistory = async () => {
    try {
      const result = await axios.get("/api/savechat");
      const chats = result.data.history;
      dispatch(setHistory(chats));
    } catch (error) {
      console.log(error);
    }
  };
  const saveChat = async () => {
    try {
      if (messages.length > 0) {
        const response = await axios.post("/api/savechat", {
          chatId,
          messages,
        });
        if (response.data) {
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
                  className="cursor-pointer"
                  onClick={() => handleChat(eachchat.chatId)}
                >
                  <SidebarMenuButton asChild>
                    <div>
                      <div className="text-sm text-gray-500">
                        {eachchat.messages[
                          eachchat.messages.length - 1
                        ]?.content.slice(0, 20)}
                        ...
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
