import { getVectorStore } from "./gemini-embeddings";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-template";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createRetrievalChain } from "langchain/chains/retrieval";
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
} //This function will return an array differentiating Human Message and AI Message
export async function callChain({
  question,
  pdfId,
  chatHistory,
}: CallChainArgs) {
  try {
    console.log("Question", question);
    const sanitizedQuestion = question.trim().replace(/\n/g, " ");
    console.log("Sanitized question", sanitizedQuestion);
    const GREETING_REGEX =
      /^(hi|hello|hey|good (morning|afternoon|evening))[\s!.,]*$/i;
    const UNRELATED_REGEX = /^(do you know|tell me about|what is|who is)/i;
    if (GREETING_REGEX.test(sanitizedQuestion)) {
      return {
        context: [],
        answer: "Hello! How can I assist you ?",
      };
    }
    if (!pdfId || UNRELATED_REGEX.test(sanitizedQuestion)) {
      return {
        context: [],
        answer:
          "I'm tuned to only answer questions related to the uploaded PDF. Please upload a file or ask a question related to it.",
      };
    }
    const vectorStore = await getVectorStore(); //getting store instance

    // Convert chat history to BaseMessages
    const formattedChatHistory = formatChatHistory(chatHistory);
    console.log("Formatted chat history", formattedChatHistory);
    // Contextualize question
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", STANDALONE_QUESTION_TEMPLATE], //This is a system level instruction where we are providing standalone question template we can say it si provided by system to our llm
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"], //this are the place holders for getting the dynamic data such as chat history and input provided to this prompt
    ]); //here we are creating a standalone question from the input and chat history which will be replaced by the data provided by user
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: nonStreamingModel, //It Uses nonStreamingModel to prepare a standalone question from the chathistory and input provided so that no context will be required here and then this
      //standalone question will be given to vector store to get reelvant documents from vector db
      retriever: vectorStore.asRetriever({ filter: { pdfId } }), //Uses the vector store retriever to get relevant documents.
      rephrasePrompt: contextualizeQPrompt, //This is the prompy we are giving to llm non streaming model
    });
    // Retrieve context (relevant documents)
    const retrievedDocuments = await historyAwareRetriever.invoke({
      input: sanitizedQuestion,
      chat_history: formattedChatHistory,
    }); //The invoke method will send the input and chathistory to llm  and we will get relevant documents based on that

    // retrievedDocuments,historyAwareRetriever,contextualizeQPrompt the fow of above code  the workflow of the history-aware retrievers functions as follows when .invoke({'input': '...', 'chat_history': '...'}) is called:
    // It replaces the input and chat_history placeholders in the prompt with specified values, creating a new ready-to-use prompt that essentially says "Take this chat history and this last input, and rephrase the last input in a way that anyone can understand it without seeing the chat history".
    // It sends the new prompt to the LLM and receives a rephrased input.
    // It then sends the rephrased input to the vector store retriever and receives a list of documents relevant to this rephrased input.
    // Finnally, it returns this list of relevant documents.
    console.log("Retrieved documents", retrievedDocuments);
    const contextMessages = retrievedDocuments.map(
      (doc: { pageContent: string }) => new HumanMessage(doc.pageContent)
    );

    // Answer question
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", QA_TEMPLATE],
      new MessagesPlaceholder("context"),
      ["human", "{input}"],
    ]); //This is the question answer prompt we are creating so that llm can answer the question as per the answer (here answer is the context llm will just find the answer to our question based on the context we provide it will not include extra information )
    const QAChain = await createStuffDocumentsChain({
      llm: streamingModel,
      prompt: qaPrompt,
    }); //This method is preparing a context  to our question it will consider llm and prompt but the thing is the prompt will include the context
    //Its a chain where we are passing a list of documents (in type of context to llm ) so that it can use that to answer

    const ragChain = await createRetrievalChain({//In this function we are just providing the relevant docs and context source 
      retriever: vectorStore.asRetriever({ filter: { pdfId } }),//the vectorstore will retrieve docs based on the pdfId 
      combineDocsChain: QAChain,//This is the Context which we are giving It includes our chat history and our actual input question 
    }); //this method will consider our input which will contain the context and our actual input ,also we will provide vector store so that it can find relevant document
    console.log("Rag chain", ragChain);
    const result = await ragChain.invoke({//so this RAG will retrieve the relevant docs as  per the context , input  and our vactorstore  
      context: contextMessages,
      input: sanitizedQuestion,
    });

    return result;
    // return LangChainAdapter.toDataStreamResponse(result as ReadableStream);
  } catch (error) {
    console.error("Error in callChain:", error);
    throw new Error("Call chain method failed to execute successfully.");
  }
}
