# Bella Vista Food Ordering Chatbot

A full-stack AI food ordering assistant for Bella Vista Italian Restaurant.

**Stack:** FastAPI + ChromaDB + OpenAI GPT-4o (backend) · Next.js 14 + Tailwind CSS (frontend)

---

## Architecture

```
Browser
 ├── Menu Panel (left)     — static menu display, click-to-order
 ├── Chat Window (center)  — SSE streaming chat
 └── Order Summary (right) — confirmed orders

FastAPI Backend
 ├── OpenAI Moderation     — entry gate on every message
 ├── GPT-4o Agent          — temp 0.2, max_tokens 600, max_iter 10
 │   ├── chatbot_reasoning — ChromaDB RAG + CoT prompt (returnDirect)
 │   ├── calculator        — safe arithmetic eval
 │   └── take_order        — GPT-4o LLM chain + moderation (returnDirect)
 └── In-memory session store
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key (with access to `gpt-4o` and `text-embedding-3-small`)

---

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

On first startup, the server will embed `menu.txt` into ChromaDB (takes ~5 seconds).

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/chat` | Streaming SSE chat (session_id, message) |
| GET | `/session/{id}/order` | Get confirmed orders for session |
| DELETE | `/session/{id}` | Clear session |

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Agent Tools

| Tool | Trigger | returnDirect |
|------|---------|--------------|
| `chatbot_reasoning` | Any menu/ingredient/allergen/price question | Yes |
| `calculator` | Price arithmetic, totals, subtotals | No |
| `take_order` | Confirmed order with items + prices | Yes |

### Ordering Flow

1. User asks about a dish → `chatbot_reasoning` fetches info from ChromaDB
2. User requests total → `calculator` computes it
3. User confirms order → `take_order` generates order confirmation
4. Order appears in the right panel

### Moderation

OpenAI Moderation runs at two points:
- On every incoming user message (agent entry)
- On `take_order` input before processing

---

## Deployment

### Backend — Railway

1. Push `backend/` to a Railway project
2. Set environment variables: `OPENAI_API_KEY`, `CHROMA_PATH=/data/chroma_db`, `ALLOWED_ORIGINS=https://your-app.vercel.app`
3. Railway uses `Procfile` automatically: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add a persistent volume mounted at `/data` for ChromaDB

### Frontend — Vercel

1. Push `frontend/` to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
3. Vercel detects Next.js automatically

---

## Project Structure

```
Food_Chatbot/
├── backend/
│   ├── main.py           FastAPI app + SSE routes
│   ├── agent.py          GPT-4o agent loop
│   ├── vectorstore.py    ChromaDB init + menu ingestion
│   ├── memory.py         In-memory session store
│   ├── moderation.py     OpenAI moderation wrapper
│   ├── tools/
│   │   ├── rag.py        chatbot_reasoning (CoT RAG)
│   │   ├── calculator.py Safe arithmetic eval
│   │   └── order.py      take_order LLM chain
│   ├── menu.txt          Bella Vista menu (knowledge base)
│   ├── requirements.txt
│   ├── Procfile
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx      Main page (3-column layout)
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── MenuPanel.tsx
│   │   ├── MenuCard.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── OrderSummary.tsx
│   │   └── ChunkBadge.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   └── useOrder.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── menu-data.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── .env.local.example
└── README.md
```
