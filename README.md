# Bella Vista — AI Food Ordering Chatbot
### Next.js · FastAPI · OpenAI · ChromaDB

A full-stack AI-powered food ordering chatbot for Bella Vista 
Italian Restaurant. Browse the menu, ask questions about 
ingredients and allergens, add items to your cart, and place 
orders — all through a conversational AI interface with a 
complete checkout flow.

---

## 🔗 Live Demo

**[Try it live → food-chatbot-app.vercel.app](https://food-chatbot-app.vercel.app)**

---

## What It Does

- Browse the full menu with allergen and dietary information
- Ask the AI about ingredients, allergens, and pricing
- Add items to cart with real-time quantity and total updates
- Checkout with subtotal, tax, and grand total
- Place orders via chat or cart — both flows supported
- Order confirmation with unique order number
- PG-13 content filter keeps conversations appropriate

---

## Architecture

```
User Browser
├── Menu Panel (left)      — browse, add to cart
├── Chat Window (center)   — conversational AI
└── Order Summary (right)  — cart, checkout, confirmation

Next.js Frontend → FastAPI Backend
                      ├── OpenAI Moderation (entry gate)
                      ├── PG-13 LLM Filter (gpt-4o-mini)
                      ├── GPT-4o Agent (temp 0.2, max_iter 10)
                      │     ├── chatbot_reasoning → ChromaDB RAG
                      │     ├── calculator        → safe arithmetic
                      │     └── take_order        → order confirmation
                      └── In-memory session store
```

---

## Key Features

- **Three-column layout** — Menu Panel, Chat Window, Order Summary
- **RAG pipeline** — menu.txt embedded in ChromaDB, top 3 chunks
  retrieved per query
- **Three specialized tools** — chatbot_reasoning, calculator,
  take_order
- **Dual moderation** — OpenAI Moderation API + PG-13 LLM filter
- **Shopping cart** — add items, adjust quantities, remove items
- **Real-time totals** — subtotal, 8% tax, grand total
- **Checkout flow** — cart → review → confirm → order number
- **Session management** — clean reset with Start New Order
- **Streaming responses** — SSE real-time output
- **Allergen chips** — gluten, dairy, eggs, seafood displayed per item
- **Dietary badges** — Vegetarian, Vegan, Gluten-Free per item
- **3 chunks retrieved badge** — shows RAG retrieval on each response
- **Mobile responsive** — menu collapses to drawer on mobile

---

## Agent Tools

All tools preserved from the original Flowise configuration:

### chatbot_reasoning
RAG tool that queries ChromaDB for menu information.
Uses Chain-of-Thought reasoning:
- Step 1: Is this food-related?
- Step 2: Does the item exist in the menu?
- Step 3: Provide grounded answer from context

### calculator
Safe arithmetic evaluation for price totals,
subtotals, and order calculations.

### take_order
Order confirmation chain tool. Hard prerequisite:
items, quantities, and prices must all be confirmed
before firing. Uses returnDirect — bypasses agent
rewording for consistent order confirmations.

---

## Moderation Layers

**Layer 1 — OpenAI Moderation API**
Blocks explicitly harmful content at the entry gate
and again on take_order input.

**Layer 2 — PG-13 LLM Filter**
Uses gpt-4o-mini to evaluate message appropriateness
for a family-friendly restaurant environment.
Blocks profanity, crude language, sexual references,
and aggressive tone.

Moderation error message:
> "Sorry, I can only help with food orders and menu
> questions. Please try a different message!"

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + shadcn/ui + Tailwind CSS |
| Backend | Python FastAPI |
| AI Agent | OpenAI GPT-4o |
| Moderation | OpenAI Moderation API + GPT-4o-mini |
| Vector Store | ChromaDB |
| Embeddings | text-embedding-3-small |
| Streaming | SSE (Server-Sent Events) |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| Built With | Claude Code |

---

## Agent Configuration

| Parameter | Value | Reason |
|---|---|---|
| Model | GPT-4o | Best reasoning for food queries |
| Temperature | 0.2 | Deterministic transactional responses |
| Max Tokens | 600 | Concise responses, cost control |
| Max Iterations | 10 | Prevents runaway loops |
| returnDirect | true | Order confirmations bypass rewording |
| strictToolCalling | false | Calculator schema compatibility |

---

## RAG System

- Knowledge base: `menu.txt` — Bella Vista full menu
- Chunk size: 500 chars, 100 char overlap
- Embedding model: `text-embedding-3-small`
- Vector store: ChromaDB local persistent
- Top 3 chunks retrieved per query
- Chunk count displayed in UI per response

---

## Project Structure

```
food-chatbot-app/
│
├── backend/
│   ├── main.py              FastAPI app + CORS + SSE routes
│   ├── agent.py             GPT-4o agent loop + tool routing
│   ├── vectorstore.py       ChromaDB init + menu ingestion
│   ├── memory.py            Session store + order state
│   ├── moderation.py        OpenAI moderation + PG-13 filter
│   ├── tools/
│   │   ├── rag.py           chatbot_reasoning tool
│   │   ├── calculator.py    safe arithmetic tool
│   │   └── order.py         take_order chain tool
│   ├── menu.txt             Bella Vista restaurant menu
│   ├── requirements.txt
│   └── Procfile
│
├── frontend/
│   ├── app/                 Next.js App Router
│   ├── components/
│   │   ├── MenuPanel.tsx    collapsible menu with cards
│   │   ├── MenuCard.tsx     item card with allergen chips
│   │   ├── ChatWindow.tsx   messages + input + suggestions
│   │   ├── MessageBubble.tsx user/bot message bubbles
│   │   ├── OrderSummary.tsx cart + checkout + confirmation
│   │   └── TypingIndicator.tsx animated typing dots
│   ├── hooks/
│   │   ├── useChat.ts       chat state + SSE streaming
│   │   └── useOrder.ts      cart state + order management
│   └── lib/
│       ├── api.ts           backend API client
│       ├── menu-data.ts     static menu structure
│       └── types.ts         TypeScript types
│
├── menu.txt                 Reference menu file
├── .gitignore
└── README.md
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env

uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# .env.local points to http://localhost:8000

npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `FRONTEND_URL` | optional | Default: `http://localhost:3000` |
| `ALLOWED_ORIGINS` | optional | Default: `http://localhost:3000` |
| `CHROMA_PATH` | optional | Default: `./chroma_db` |
| `PORT` | optional | Railway assigns automatically |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend URL — do NOT mark Sensitive in Vercel |

---

## Deployment

### Backend → Railway

1. New project → Deploy from GitHub repo
2. Set Root Directory: `backend`
3. Add environment variables
4. Procfile already configured:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
5. Generate domain in Settings → Networking

### Frontend → Vercel

1. Import repo → Root Directory: `frontend`
2. Add environment variable:
```
NEXT_PUBLIC_API_URL = https://your-railway-url.up.railway.app
```
⚠️ **Critical:** Do NOT mark `NEXT_PUBLIC_API_URL` as Sensitive

3. Deploy

---

## Deployment Notes

**CORS**
Backend uses `allow_origin_regex` to whitelist all
`*.vercel.app` domains automatically.

**NEXT_PUBLIC_ variables**
Baked into the JavaScript bundle at build time.
Never mark as Sensitive in Vercel.

---

## Related Repos

| Repo | Pattern | Framework |
|---|---|---|
| [ai-food-chatbot-agent](https://github.com/Paul-Orlando/ai-food-chatbot-agent) | Flowise Prototype | Flowise + Postgres |
| [ai-agent-team-supervisor-app](https://github.com/Paul-Orlando/ai-agent-team-supervisor-app) | Supervisor Pattern | OpenAI Agents SDK |
| [data-analysis-agent-app](https://github.com/Paul-Orlando/data-analysis-agent-app) | Interactive Agent | Next.js + FastAPI |
| [deep-research-agent](https://github.com/Paul-Orlando/deep-research-agent) | Research App | Claude Code + Next.js |

---

## Author

Paul Orlando
Creative Technologist | AI Agent Developer | Data Analytics
🌐 [paulforlando.com](https://www.paulforlando.com)
💼 [LinkedIn](https://www.linkedin.com/in/paul-orlando-7841b5154)
🐙 [GitHub](https://github.com/Paul-Orlando)

---

## License

MIT License
