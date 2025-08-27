import { getVectorStore } from "./gemini-embeddings";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-template";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

type CallChainArgs = {
  question: string;
  pdfId?: string;
  chatHistory: string;
};

function formatChatHistory(chatHistory: string) {
  if (!chatHistory) return [];

  const messages = chatHistory
    .split("\n")
    .map((msg) => msg.trim())
    .filter((msg) => msg !== "");
  return messages.map((msg, index) =>
    index % 2 === 0 ? new HumanMessage(msg) : new AIMessage(msg)
  );
}

export async function callChain({
  question,
  pdfId,
  chatHistory,
}: CallChainArgs) {
  try {
    console.log("Question:", question);
    console.log("PDF ID:", pdfId);

    const sanitizedQuestion = question.trim().replace(/\n/g, " ");
    console.log("Sanitized question:", sanitizedQuestion);

    const GREETING_REGEX =
      /^(hi|hello|hey|good (morning|afternoon|evening))[\s!.,]*$/i;
    // const UNRELATED_REGEX = /^(do you know about|tell me about something|what is the weather|who is the president)/i

    if (GREETING_REGEX.test(sanitizedQuestion)) {
      return {
        context: [],
        answer: "Hello! How can I assist you with your PDF document?",
      };
    }

    // if (!pdfId) {
    //   console.error("No PDF ID provided");
    //   return {
    //     context: [],
    //     answer:
    //       "Please upload a PDF document first, then ask questions about its content.",
    //   };
    // }

    // if (UNRELATED_REGEX.test(sanitizedQuestion)) {
    //   return {
    //     context: [],
    //     answer:
    //       "I'm designed to answer questions about your uploaded PDF. Please ask something specific about the document content.",
    //   }
    // }

    console.log("Getting vector store...");
    const vectorStore = await getVectorStore();

    if (!vectorStore) {
      console.error("Vector store not available");
      return {
        context: [],
        answer:
          "Sorry, there was an issue accessing the document database. Please try again.",
      };
    }

    const formattedChatHistory = formatChatHistory(chatHistory);
    console.log("Formatted chat history:", formattedChatHistory);

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", STANDALONE_QUESTION_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    console.log("Creating history-aware retriever...");
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: nonStreamingModel,
      retriever: vectorStore.asRetriever(10),
      rephrasePrompt: contextualizeQPrompt,
    });
    console.log("History Aware Retriever", historyAwareRetriever);
    console.log("Retrieving documents...");
    const retrievedDocuments = await historyAwareRetriever.invoke({
      input: sanitizedQuestion,
      chat_history: formattedChatHistory,
    });

    console.log("Retrieved documents count:", retrievedDocuments.length);

    if (!retrievedDocuments || retrievedDocuments.length === 0) {
      console.warn(
        "No relevant documents found for question:",
        sanitizedQuestion
      );
      return {
        context: [],
        answer:
          "I couldn't find relevant information in the uploaded PDF to answer your question. Please try rephrasing your question or ensure the PDF contains the information you're looking for.",
      };
    }

    // const contextMessages = retrievedDocuments.map(
    //   (doc: { pageContent: string }) => new HumanMessage(doc.pageContent)
    // );

    console.log("Creating QA chain...");
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", QA_TEMPLATE],
      new MessagesPlaceholder("context"),
      ["human", "{input}"],
    ]);

    const QAChain = await createStuffDocumentsChain({
      llm: streamingModel,
      prompt: qaPrompt,
    });
    console.log("Retrieved Docs", retrievedDocuments);
    // console.log("Conetxt Model", contextMessages);
    console.log("Invoking QA chain...");

    const result = await QAChain.invoke({
      context: retrievedDocuments,
      input: sanitizedQuestion,
    });

    console.log("QA chain result:", result);

    if (!result) {
      return {
        context: retrievedDocuments,
        answer:
          "I encountered an issue generating a response. Please try asking your question differently.",
      };
    }

    return {
      context: retrievedDocuments,
      answer: result,
    };
  } catch (error) {
    console.error("Error in callChain:", error);

    if (error instanceof Error) {
      if (error.message.includes("vector store")) {
        return {
          context: [],
          answer:
            "There was an issue accessing the document database. Please ensure your PDF was uploaded successfully.",
        };
      }
      if (error.message.includes("retriever")) {
        return {
          context: [],
          answer:
            "I couldn't retrieve relevant information from your PDF. Please try a different question.",
        };
      }
    }

    return {
      context: [],
      answer:
        "I encountered an unexpected error. Please try again or rephrase your question.",
    };
  }
}
