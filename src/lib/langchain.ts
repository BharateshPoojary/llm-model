import { getVectorStore } from "./gemini-embeddings";
import { LangChainAdapter } from "ai";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-template";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
// ChatPromptTemplate – Template for creating structured prompts.
// MessagesPlaceholder – Placeholder for dynamic content (like chatHistory) in the prompt.
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
type CallChainArgs = {
  question: string;
  chatHistory: string;
};
function formatChatHistory(chatHistory: string) {
  if (!chatHistory) return [];

  const messages = chatHistory.split("\n").map((msg) => msg.trim());
  return messages.map((msg, index) =>
    index % 2 === 0 ? new HumanMessage(msg) : new AIMessage(msg)
  );
}
export async function callChain({ question, chatHistory }: CallChainArgs) {
  try {
    console.log("Question", question);
    const sanitizedQuestion = question.trim().replace(/\n/g, " ");
    console.log("Sanitized question", sanitizedQuestion);
    const vectorStore = await getVectorStore();

    // Convert chat history to BaseMessages
    const formattedChatHistory = formatChatHistory(chatHistory);
    console.log("Formatted chat history", formattedChatHistory);
    // Contextualize question
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      //Defines a prompt for contextualizing the question using chat history
      ["system", STANDALONE_QUESTION_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: nonStreamingModel, //Uses nonStreamingModel to rephrase the question based on context.
      retriever: vectorStore.asRetriever(), //Uses the vector store retriever to get relevant documents.
      rephrasePrompt: contextualizeQPrompt,
    });
    // Retrieve context (relevant documents)
    const retrievedDocuments = await historyAwareRetriever.invoke({
      input: sanitizedQuestion,
      chat_history: formattedChatHistory,
    });
    const context = retrievedDocuments
      .map((doc: { pageContent: string }) => doc.pageContent)
      .join("\n");
    // Answer question
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", QA_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{context}"],
    ]);
    const questionAnswerChain = await createStuffDocumentsChain({
      llm: streamingModel,
      prompt: qaPrompt,
    }); //Creates a chain that combines retrieved documents and generates a response using the streamingModel.

    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain,
    });

    const resultStream = await ragChain.invoke({
      input: sanitizedQuestion,
      context,
    });

    console.log("Generated text:", resultStream);
    return resultStream;
    // return generatedText;
  } catch (error) {
    console.error("Error in callChain:", error);
    throw new Error("Call chain method failed to execute successfully.");
  }
}
