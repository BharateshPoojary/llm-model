import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  role: string;
  content: string;
}

export interface ChatDataState {
  chatId: string;
  messages: Message[];
}

const initialState: ChatDataState = {
  chatId: "",
  messages: [],
};

export const chatDataSlice = createSlice({
  name: "chatData",
  initialState,
  reducers: {
    setChatId: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setChatId, addMessage } = chatDataSlice.actions;

export default chatDataSlice.reducer;
