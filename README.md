## PDF Summarizer using LLM
A powerful LLM-based PDF summarizer web application that allows users to interact with the content of any uploaded PDF.
## Features
### 🔐  User Authentication
Sign up using your email and password. After registration, enter the verification code to access the app.

### 💬  Chat with PDF
Upload a PDF document and ask questions based on its content. The AI will respond using the context from the uploaded file.

### 🧠  Powered by LLM
Uses a Large Language Model to understand and answer user queries from the PDF file.

### 💾  Chat History
All your past interactions are saved. You can view or continue previous conversations or start a new one with a single click.

## Preview
![pdf-summarizer](https://github.com/user-attachments/assets/6ddd62dc-6514-4d56-b084-9784b5474ddc)

## 🛠️ How It Works
### 1. Sign Up
Create an account using your email and password. A verification code will be sent to complete the signup process.

### 2. Upload PDF
Once logged in, you'll land on the chat interface. Upload a PDF file to begin interacting with its content.

### 3. Ask Questions
Type any question related to the PDF. The LLM will respond based on the file content.

### 4. Chat Management
Start a new chat or revisit any of your existing chat sessions from the sidebar.

## 📦 Tech Stack
### Frontend: Next.js, TypeScript, Tailwind CSS, ShadCN UI
### Authentication: Clerk
### Backend: Next.js
### AI Tools:  Gemini (Google Gen. AI) , LangChain , Vercel AI SDK

## Getting Started

1.Clone the repository
```bash git clone https://github.com/BharateshPoojary/llm-model.git
 cd llm-model
### NOTE: Do not ask question apart from the content of PDF you uploaded as this llm is tuned only  to answer about the user uploaded pdf.
