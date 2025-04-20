import dbConnection from "@/lib/dbConnect";
import { ChatModel } from "@/model/Chat";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { useremail } = await request.json();
    await dbConnection();
    const getHistory = await ChatModel.find({ useremail });
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
