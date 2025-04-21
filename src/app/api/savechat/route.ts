import dbConnection from "@/lib/dbConnect";
import { Message } from "@/lib/features/ChatData";
import { ChatModel } from "@/model/Chat";

export async function POST(request: Request) {
  const {
    chatId,
    chatNumber,
    useremail,
    messages,
  }: {
    chatId: string;
    useremail: string;
    chatNumber: string;
    messages: Message[];
  } = await request.json();
  console.log(chatId, useremail, messages);
  await dbConnection();
  const existingChat = await ChatModel.findOne({ useremail });

  if (existingChat) {
    console.log("I am existing chat");
    await ChatModel.findOneAndUpdate(
      { useremail },
      {
        $set: { chatId },
        $push: { "ArrayOfChats.$.messages": { $each: messages } },
      },
      { new: true }
    );
  } else {
    console.log("I am new chat");
    const saveChat = new ChatModel({
      chatId,
      useremail,
      $push: {
        ArrayofChats: {
          chatNumber,
          messages,
        },
      },
    });
    await saveChat.save();
  }

  return Response.json(
    { success: true, message: "Chat Data received  and saved successfully" },
    { status: 201 }
  );
}
