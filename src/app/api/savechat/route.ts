import dbConnection from "@/lib/dbConnect";
import { Message } from "@/lib/features/ChatData";
import { ChatModel } from "@/model/Chat";

export async function POST(request: Request) {
  const { chatId, messages }: { chatId: string; messages: Message[] } =
    await request.json();
  console.log(chatId, messages);
  await dbConnection();
  const existingChat = await ChatModel.findOne({ chatId });

  if (existingChat) {
    console.log("I am existing chat");
    await ChatModel.findOneAndUpdate(
      { chatId },
      { $push: { messages: { $each: messages } } },
      { new: true }
    );
  } else {
    console.log("I am new chat");
    const saveChat = new ChatModel({
      chatId,
      messages,
    });
    await saveChat.save();
  }

  return Response.json(
    { success: true, message: "Chat Data received  and saved successfully" },
    { status: 201 }
  );
}
export async function GET() {
  try {
    await dbConnection();
    const getHistory = await ChatModel.find({});
    if (getHistory) {
      return Response.json(
        {
          success: true,
          message: "All Message received successfully",
          history: getHistory,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        {
          success: false,
          message: `Error getting user message: ${error.message}`,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: false,
        message: "Unknown error occurred while getting history",
      },
      { status: 500 }
    );
  }
}
