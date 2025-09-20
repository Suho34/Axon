# Axon - AI-Powered Document Analyzer

Axon is a web application that lets students, researchers, and professionals upload study materials (PDFs, notes, research papers) and instantly interact with them. Using Retrieval-Augmented Generation (RAG), Axon enables semantic search, summaries, flashcards, quizzes, and more.

---

## ✨ Features

- **Workspace Management**: Create and organize workspaces for different projects or document collections.
- **PDF Upload**: Upload PDF documents up to **10MB** in size.
- **Smart Chunking**: Automatically splits documents into meaningful chunks for processing.
- **Vector Embeddings**: Converts all content into embeddings for **semantic search**.
- **RAG-Powered Chat**: Ask natural language questions and get accurate, context-aware answers.
- **Quick Actions**: Pre-built prompts for common document analysis tasks like summaries, flashcards, and quizzes.
- **Source Tracking**: Shows the exact parts of documents that informed each response.

---

## 🚀 Tech Stack

- **Frontend**: Next.js (React, TypeScript, TailwindCSS)
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose ODM)
- **AI**: Retrieval-Augmented Generation (RAG) pipeline
- **Embeddings**: Vector-based semantic search(JINA AI)
- **AI/ML**: OpenAI / Free-tier embedding models (e.g., Hugging Face, Sentence Transformers)
- **Authentication**: NextAuth.js (Google & GitHub OAuth)
- **File Parsing**: `pdf-parse`

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/axon.git
cd axon

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

---

## 📂 Project Structure

```
axon/
├── app/             # Next.js App Router code
├── Models/          # Mongoose schemas
├── lib/             # Utility functions (DB, embeddings, etc.)
├── public/          # Static assets
├── components/      # UI components
└── ...
```

---

## 🛠️ Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret


GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret


GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


MONGODB_URI=your_mongodb_connection_string


JINA_API_KEY=your_jina_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📖 Usage

1. **Create a Workspace**: Start by creating a dedicated workspace for your project

2. **Upload Documents**: Add PDF files (up to 10MB each) to your workspace

3. **Automatic Processing**: Axon processes your documents, creating chunks and generating embeddings

4. **Ask Questions**: Use natural language to query your documents

5. **Get Contextual Answers**: Receive accurate responses grounded in your document content with source citations

---

## 🔮 Roadmap

- [ ] Support for DOCX, TXT, and image-based PDFs (OCR).
- [ ] Multi-user collaboration.
- [ ] Advanced summarization modes (short, detailed, key insights).
- [ ] Export notes/flashcards to Anki or Notion.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📜 License

MIT License © 2025 Axon Contributors
