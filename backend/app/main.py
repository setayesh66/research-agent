from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent import build_agent


app = FastAPI(title="Research Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

agent= build_agent()
sessions: dict[str, list]={}

class ChatRequest(BaseModel):
    message: str
    session_id: str= "default"

class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
def chat(req:ChatRequest):
    history = sessions.get(req.session_id, [])
    history.append({"role":"user", "content":req.message})

    result = agent.invoke({"messages": history})
    final_message = result["messages"][-1]

    sessions[req.session_id] = result["messages"]
    return ChatResponse(reply=final_message.content)


@app.get("/health")
def health():
    return {"status": "ok"}