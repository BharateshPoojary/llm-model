import dbConnection from "@/lib/dbConnect";
import { Message } from "@/lib/features/ChatData";
import { ChatModel } from "@/model/Chat";
// import { ChatItem } from "../../../model/Chat";

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

  const existingChat = await ChatModel.findOne({ useremail });

  if (existingChat) {
    console.log("I am existing chat");

    // Check if chatNumber already exists inside ArrayOfChats
    // const chatExists = existingChat.ArrayOfChats.find(
    //   (chat: ChatItem) => chat.chatNumber === chatNumber
    // );

    // if (chatExists) {
    //I am already existing caht
    // Update the messages array of the specific chatNumber
    await ChatModel.findOneAndUpdate(
      { useremail, "ArrayOfChats.chatNumber": chatNumber },
      {
        $push: { "ArrayOfChats.$.messages": { $each: messages } }, //as per logic I want to send onl
        //$push operator pushes the single element to any array so as messages is an array of object we cannot insert it directly
        //we will use $each operator which will insert the message object seperately to messages array
      },
      { new: true }
    );
    return Response.json(
      { success: true, message: "Chat  added successfully" },
      { status: 200 }
    );
    // } else {
    //   // Add a new chatNumber entry to ArrayOfChats
    //   await ChatModel.findOneAndUpdate(
    //     { useremail },
    //     {
    //       ArrayOfChats: [
    //         {
    //           chatNumber,
    //           messages,
    //         },
    //       ],
    //     },
    //     { new: true }
    //   );
    //   return Response.json(
    //     { success: true, message: "Chat saved successfully" },
    //     { status: 200 }
    //   );
    // }
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
  }

  return Response.json(
    { success: true, message: "Chat Data received and saved successfully" },
    { status: 201 }
  );
}
