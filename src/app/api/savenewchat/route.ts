import dbConnection from "@/lib/dbConnect";
import { Message } from "@/lib/features/ChatData";
import { ChatItem, ChatModel } from "@/model/Chat";

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

  await dbConnection();

  const existingEmail = await ChatModel.findOne({ useremail });

  if (existingEmail) {
    // console.log("I am existing chat");

    // Check if chatNumber already exists inside ArrayOfChats
    // const chatExists = existingEmail.ArrayOfChats.find(
    //   (chat: ChatItem) => chat.chatNumber === chatNumber
    // );

    // if (chatExists) {
    // I am already existing caht
    // Update the messages array of the specific chatNumber
    await ChatModel.findOneAndUpdate(
      { useremail },
      {
        $push: {
          ArrayOfChats: {
            chatNumber,
            messages,
          },
        },
      },
      { new: true }
    );

    return Response.json(
      { success: true, message: "Chat  added successfully" },
      { status: 200 }
    );
  } else {
    console.log("I am new chat");
    console.log(chatNumber, messages);
    const saveChat = new ChatModel({
      chatId,
      useremail,
      ArrayOfChats: [
        {
          chatNumber,
          messages,
        },
      ],
    });

    await saveChat.save();
    return Response.json(
      { success: true, message: "Chat Data received and saved successfully" },
      { status: 201 }
    );
    // }
  }
}
