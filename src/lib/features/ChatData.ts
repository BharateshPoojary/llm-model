import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  role: string;
  content: string;
}

export interface ChatDataState {
  chatId: string;
  chatNumber: string;
  messages: Message[];
  bulkIds: string[];
}

const initialState: ChatDataState = {
  chatId: "",
  chatNumber: Date.now().toString(),
  messages: [],
  bulkIds: [],
};

export const chatDataSlice = createSlice({
  name: "chatData",
  initialState,
  reducers: {
    setChatId: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
    addBulkIds: (state, action: PayloadAction<string[]>) => {
      state.bulkIds = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessage: (state) => {
      state.messages = [];
    },
    setChatNumber: (state, action: PayloadAction<string>) => {
      state.chatNumber = action.payload;
    },
  },
});

export const {
  setChatId,
  addBulkIds,
  addMessage,
  setChatNumber,
  clearMessage,
} = chatDataSlice.actions;

export default chatDataSlice.reducer;
