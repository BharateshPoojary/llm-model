import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function getChunkedDocsFromPDF(file: File) {
  try {
    const loader = new PDFLoader(file);
    const docs = await loader.load(); //This will return the array of documents
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    // console.log("Document before chunking", docs);
    const chunkedDocs = await textSplitter.splitDocuments(docs);
    // console.log("Document after chunking", chunkedDocs);
    return chunkedDocs;
  } catch (error) {
    throw new Error("PDF Chunking Failed");
  }
}
