import pdfParse from "pdf-parse";
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdfFile") as File;
    const message = formData.get("message") as string | undefined;
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const data = await pdfParse(buffer);
    console.log(data.text);
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Error parsing pdf",
      },
      {
        status: 500,
      }
    );
  }
}
