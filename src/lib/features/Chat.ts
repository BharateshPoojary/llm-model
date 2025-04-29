import { ChatItem } from "@/model/Chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Chat {
  chatId: string;
  useremail: string;
  ArrayOfChats: ChatItem[];
}

interface ChatState {
  history: Chat[];
}

const initialState: ChatState = {
  history: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setHistory: (state, action: PayloadAction<Chat[]>) => {
      state.history = action.payload;
    },
  },
});

export const { setHistory } = chatSlice.actions;
export default chatSlice.reducer;
