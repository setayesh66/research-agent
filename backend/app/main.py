from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent import build_agent
from app.db.models import get_db, Conversation, MessageRecord


app = FastAPI(title="Research Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

agent= build_agent()


class ChatRequest(BaseModel):
    message: str
    session_id: str= "default"

class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
def chat(req:ChatRequest, db: Session = Depends(get_db)):
    conversation = db.get(Conversation, req.session_id)
    if conversation is None:
        conversation= Conversation(id=req.session_id)
        db.add(conversation)
        db.commit()

    user_message = MessageRecord(
        conversation_id=req.session_id, role="user" , content= req.message
    )
    db.add(user_message)
    db.commit()

    history=[
        {"role": m.role, "content": m.content} for m in conversation.messages
    ]

    result = agent.invoke({"messages": history})
    final_message= result["messages"][-1]

    agent_message= MessageRecord(
        conversation_id= req.session_id, role="assistant", content= final_message.content
    )

    db.add(agent_message)
    db.commit()

    return ChatResponse(reply=final_message.content)



@app.get("/health")
def health():
    return {"status": "ok"}