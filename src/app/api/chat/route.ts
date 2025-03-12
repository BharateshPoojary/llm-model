import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { Message } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    console.log(messages);
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map((eachmessage: Message) => eachmessage.content?.trim())
      .filter((content: Message) => content);
    const question =
      messages.length > 0 ? messages[messages.length - 1].content?.trim() : "";
    console.log("Question", question);
    console.log("Formatted Previous Message", formattedPreviousMessages);
    try {
      const stream = await callChain({
        question,
        chatHistory: formattedPreviousMessages.join("\n"),
      });
      return NextResponse.json(
        {
          success: true,
          content: stream.answer,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Internal server error ", error);
      return NextResponse.json("Error: Something went wrong. Try again!", {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
