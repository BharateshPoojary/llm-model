import dbConnection from "@/lib/dbConnect";
import { ChatModel } from "@/model/Chat";

export async function POST(request: Request) {
  const { useremail } = await request.json();
  await dbConnection();
  try {
    const getChat = await ChatModel.findOne({ useremail });
    return Response.json(
      {
        success: true,
        chats: getChat,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return Response.json(
        {
          success: false,
          message: `Error getting user chat: ${error.message}`,
        },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: false,
        message: "Unknown error occurred while getting userchat",
      },
      { status: 500 }
    );
  }
}
