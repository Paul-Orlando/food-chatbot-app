import os
import pathlib
import random
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)

import memory as mem
import vectorstore as vs
from agent import run_agent
from tools.order import take_order as _take_order_tool


@asynccontextmanager
async def lifespan(app: FastAPI):
    await vs.init_vectorstore()
    yield


app = FastAPI(title="Bella Vista Food Chatbot API", lifespan=lifespan)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str
    message: str


class OrderItem(BaseModel):
    name: str
    price: float
    quantity: int


class ConfirmOrderRequest(BaseModel):
    session_id: str
    items: list[OrderItem]


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    async def generate():
        async for event in run_agent(request.session_id, request.message.strip()):
            yield event

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/confirm-order")
async def confirm_order(request: ConfirmOrderRequest):
    if not request.items:
        raise HTTPException(status_code=400, detail="No items in order.")

    subtotal = sum(i.price * i.quantity for i in request.items)
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + tax, 2)

    item_lines = "\n".join(
        f"- {i.quantity}x {i.name} at ${i.price:.2f} each (${i.price * i.quantity:.2f})"
        for i in request.items
    )
    order_details = (
        f"Order details:\n{item_lines}\n\n"
        f"Subtotal: ${subtotal:.2f}\n"
        f"Tax (8%): ${tax:.2f}\n"
        f"Total: ${total:.2f}"
    )

    confirmation = await _take_order_tool(order_details)
    order_number = f"BV-{random.randint(1000, 9999)}"

    mem.add_user(request.session_id, "Please confirm my order.")
    mem.add_assistant(request.session_id, confirmation)
    mem.update_order(request.session_id, order_details, confirmation)

    return {"confirmation": confirmation, "order_number": order_number}


@app.get("/session/{session_id}/order")
async def get_order(session_id: str):
    return {"orders": mem.get_orders(session_id)}


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    mem.clear_session(session_id)
    return {"status": "cleared"}
