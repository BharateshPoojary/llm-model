import dbConnection from "@/lib/dbConnect";
import { ChatModel } from "@/model/Chat";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chatId, useremail, ArrayOfChats } = await request.json();
    console.log(chatId, useremail, ArrayOfChats);

    await dbConnection();

    const isExistingUser = await ChatModel.findOne({ useremail });
    if (isExistingUser) {
      return NextResponse.json(
        {
          success: true,
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    const saveUser = await new ChatModel({
      chatId,
      useremail,
      ArrayOfChats,
    }).save();
    console.log(saveUser);
    if (saveUser) {
      return NextResponse.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Server Error:", error.message); // 👈 helpful debug output
    }
    return NextResponse.json(
      {
        success: false,
        message: `Internal Server Error`,
      },
      { status: 500 }
    );
  }
}
