import dbConnection from "@/lib/dbConnect";
import { ChatModel } from "@/model/Chat";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { useremail } = await request.json();
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
  const saveUser = await ChatModel.insertOne({ useremail });
  if (saveUser) {
    return Response.json(
      {
        success: true,
        message: "Email saved successfully",
      },
      {
        status: 200,
      }
    );
  }
}
