from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.agent import build_agent
from app.db.models import get_db, Conversation, MessageRecord
from langchain_ollama import ChatOllama


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


title_model = ChatOllama(model="qwen3:4b", temperature=0.3)

def generate_title(first_message: str) -> str:
    try:
        prompt = (
            "Generate a short title (3-6 words, no punctuation, no quotes) "
            f"summarizing what this message is about:\n\n{first_message}"
        )
        result = title_model.invoke(prompt)
        title = result.content.strip().strip('"')
        return title[:60]  
    except Exception:
        return first_message[:40] + ("..." if len(first_message) > 40 else "")



# def stream_reply(history: list[dict]):
#     """Yields text chunks of the agent's final answer as they're generated."""
#     for chunk, metadata in agent.stream({"messages":history}, stream_mode="messages"):
#         if metadata.get("langgraph_node") == "model" and chunk.content:
#             yield chunk.content
    

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    conversation = db.get(Conversation, req.session_id)
    if conversation is None:
        title = generate_title(req.message)
        conversation = Conversation(id=req.session_id, title=title)
        db.add(conversation)
        db.commit()

    user_message = MessageRecord(
        conversation_id=req.session_id, role="user", content=req.message
    )
    db.add(user_message)
    db.commit()

    history = [
        {"role": m.role, "content": m.content} for m in conversation.messages
    ]

    result = agent.invoke({"messages": history})
    final_message = result["messages"][-1]

    agent_message = MessageRecord(
        conversation_id=req.session_id, role="assistant", content=final_message.content
    )
    db.add(agent_message)
    db.commit()

    return ChatResponse(reply=final_message.content)




@app.get("/conversations")
def list_conversations(db: Session= Depends(get_db)):
    conversations=(
        db.query(Conversation).
        order_by(Conversation.created_at.desc()).
        all()
    )

    return [
        {"id": str(c.id), "title": c.title or "New chat", "created_at": c.created_at}
        for c in conversations
    ]


@app.get("/conversations/{conversation_id}/messages")
def list_messages(conversation_id: str, db: Session=Depends(get_db)):
    messages=(
        db.query(MessageRecord)
        .filter(MessageRecord.conversation_id==conversation_id)
        .order_by(MessageRecord.created_at.asc())
        .all()
    )

    return[
        {"role":m.role, "content":m.content} for m in messages
    ] 











@app.get("/health")
def health():
    return {"status": "ok"}