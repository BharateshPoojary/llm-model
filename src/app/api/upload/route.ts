import { embedAndStoreDocs } from "@/lib/gemini-embeddings";
import { getChunkedDocsFromPDF } from "@/lib/pdf-processor";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("pdfFile");
    if (uploadedFile) {
      console.log("Uploaded File", uploadedFile);

      const chunkedDocs = await getChunkedDocsFromPDF(uploadedFile as File);
      if (chunkedDocs) {
        await embedAndStoreDocs(chunkedDocs);
      }
      return NextResponse.json(
        {
          success: true,
          message: "File Uploaded Successfully",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Internal server error ", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        {
          status: 500,
        }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Error: Something went wrong while uploading. Try again!",
      },
      {
        status: 500,
      }
    );
  }
}
