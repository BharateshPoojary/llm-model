import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
export async function embedAndStoreDocs( // @ts-ignore docs type error
  chunkedDocs: Document<Record<string, any>>[]
) {
  try {
    const index = pc.index("bharat-llm");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
      apiKey: process.env.GEMINI_API_KEY as string,
    });
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });
    console.log("Embed xtored successfully");
  } catch (error) {
    throw new Error("Error while generating embeds");
  }
}
// Returns vector-store handle to be used a retrievers on langchains
export async function getVectorStore() {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
      apiKey: process.env.GEMINI_API_KEY as string,
    });
    const index = pc.index("bharat-llm");

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
    });

    return vectorStore; //It is responsible for retrieving vector store
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
}
