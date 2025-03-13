import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  chatId: string;
  messages: Message[];
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
