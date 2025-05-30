import dbConnection from "@/lib/dbConnect";
import { ChatModel } from "@/model/Chat";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { chatId, useremail, messages } = await request.json();
  console.log(chatId, useremail, messages);
  await dbConnection();
  const isExistingUser = await ChatModel.findOne({ useremail });
  if (isExistingUser) {
    return Response.json(
      {
        success: true,
        message: "User with this email already exists",
      },
      {
        status: 409,
      }
    );
  }
  const saveUser = await new ChatModel({
    chatId,
    useremail,
    messages,
  }).save();
  if (saveUser) {
    return Response.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      {
        status: 201,
      }
    );
  }
}
