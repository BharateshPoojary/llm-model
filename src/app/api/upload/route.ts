import { NextRequest, NextResponse } from "next/server";
import { getChunkedDocsFromPDF } from "@/lib/pdf-processor";
import { embedAndStoreDocs } from "@/lib/gemini-embeddings";
import { callChain } from "@/lib/langchain";
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("pdfFile");
    const messages: string[] = formData.getAll("message[]") as string[];
    console.log(messages);
    const formattedPreviousMessages = messages.slice(0, -1);
    const question = messages.length > 0 ? messages[messages.length - 1] : "";
    if (!question) throw new Error("Question is missing");

    if (!question) {
      return NextResponse.json("Error: No question in the request", {
        status: 400,
      });
    }
    if (uploadedFile) {
      const chunkedDocs = await getChunkedDocsFromPDF(uploadedFile as File);
      await embedAndStoreDocs(chunkedDocs);
    }
    try {
      const streamingTextResponse = await callChain({
        question,
        chatHistory: formattedPreviousMessages.join("\n"),
      });

      return NextResponse.json(
        {
          success: true,
          message: streamingTextResponse,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("Internal server error ", error);
      return NextResponse.json("Error: Something went wrong. Try again!", {
        status: 500,
      });
    }
    // const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    // const data = await pdfParse(fileBuffer);
    // // console.log("Extracted Text:", data.text);
    // const result = await model.embedContent(data.text);
    // console.log("Vector Embeddings", result.embedding.values);
    // let embedding = result.embedding.values;
    // await pc.index("bharat-llm").upsert([
    //   {
    //     id: Date.now() + uploadedFile.name,
    //     values: embedding,
    //     metadata: {
    //       source: "pdf",
    //       title: uploadedFile.name,
    //     },
    //   },
    // ]);
    // const embedInputQuery = await model.embedContent(message as string);
    // const inputEmbedding = embedInputQuery.embedding.values;
    // // console.log("Input Embedding", inputEmbedding);
    // const queryresult = await pc.index("bharat-llm").query({
    //   vector: inputEmbedding, // Use the query embedding
    //   topK: 5, // Number of top results to return
    //   includeMetadata: true, // Include metadata in the result
    // });

    // console.log("Query result", queryresult.matches);
    // const context = queryresult.matches
    //   .map(
    //     (match) =>
    //       `Title: ${match.metadata?.title}\nScore: ${match.score?.toFixed(2)}\n`
    //   )
    //   .join("\n");
    // console.log("Context", context);
    // //     // console.log("Vector upserted");
    // //     const prompt = `
    // // You are an AI assistant. Based on the following search results, provide a helpful response:
    // // ${context}
    // // User's query: "${message}"
    // // `;
    // //     const textResponse = await textGenModel.generateContent(prompt);
    // //     console.log("Result Text ", textResponse.response.text());
    // return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
