import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { Message } from "@/model/Chat";

export async function POST(req: NextRequest) {
  try {
    const { messages, data } = await req.json();
    console.log("Data", data);
    const formattedPreviousMessages = messages
      .slice(0, -1) //0 means starting element and -1 means ending element but slice method will not consider last element it will exclude last element and consider only remaining element
      .map((eachmessage: Message) => eachmessage.content?.trim()) //trimming each message to remove white spaces
      .filter((content: Message) => content); //It will only consider true value removing falsy value
    const question =
      messages.length > 0 ? messages[messages.length - 1].content?.trim() : ""; //the question the user has asked now the last element from the messages array
    console.log("Question", question);
    console.log("Formatted Previous Message", formattedPreviousMessages);
    try {
      const stream = await callChain({
        question,
        // pdfId: data.pdfId,
        chatHistory: formattedPreviousMessages.join("\n"), //joining the  array elements which contain previous messages with /n
      }); //sending the question and chathistory to call chain for processing
      //This will return the context and answer
      console.log("Stream", stream.answer);
      return NextResponse.json(
        {
          success: true,
          content: stream.answer, //sending the answer as response
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
