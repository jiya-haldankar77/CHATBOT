from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Dict
import os
import google.generativeai as genai
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="BettrMe.AI Support Chatbot")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static & Template dirs
static_dir = os.path.join(os.path.dirname(__file__), "static")
templates_dir = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(static_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=templates_dir)

# Clean text
def clean_text(text: str) -> str:
    text = re.sub(r"[*_#`~]+", "", text)
    text = text.replace("**", "").replace("```", "")
    text = re.sub(r"\s+", " ", text)
    return text.strip()

# System Prompt
SYSTEM_PROMPT = clean_text("""
You are BettrBot, a friendly communication coach.
Respond ONLY in clean simple bullet points.
No bold, no stars, no markdown, no special characters.
""")

# Gemini Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Using gemini-2.5-flash which is available in your API
MODEL_NAME = "models/gemini-2.5-flash"

try:
    model = genai.GenerativeModel(MODEL_NAME)
    print(f"Successfully initialized Gemini model: {MODEL_NAME}")
except Exception as e:
    print(f"Error initializing Gemini: {e}")
    raise RuntimeError("Failed to initialize Gemini model")

conversation_history: Dict[str, List[Dict[str, str]]] = {}

class Message(BaseModel):
    user_id: str
    text: str

class ChatResponse(BaseModel):
    response: str
    is_escalated: bool = False

# Bad language filter
def is_inappropriate(text: str) -> bool:
    bad = ["stupid", "idiot", "sucks", "hate", "terrible", "worst",
           "useless", "waste", "dumb", "screw you", "fuck",
           "shit", "asshole", "bitch", "damn", "mad", "crap"]
    return any(word in text.lower() for word in bad)

# Generate response
async def generate_response(conversation: List[Dict[str, str]]) -> ChatResponse:
    try:
        # Quick response for empty conversation
        if not conversation:
            return ChatResponse(response="Hi! How can I assist you today?")

        # Get last user message
        user_message = next(
            (msg["text"] for msg in reversed(conversation) if msg["type"] == "human"), 
            ""
        ).lower().strip()

        # Check for aggressive / inappropriate language
        if is_inappropriate(user_message):
            return ChatResponse(
                response=(
                    "- I can hear that you're feeling upset. I'm here to support you.\n"
                    "- Let's keep our conversation respectful so I can better help you. "
                    "Could you share what happened in a calmer way?"
                ),
                is_escalated=False
            )

        # Quick responses for common inputs (no API call needed)
        quick_responses = {
            "hi": "Hello! How can I help you today?",
            "hello": "Hi there! What would you like to work on?",
            "hey": "Hey! I'm here to help with your communication skills.",
            "thanks": "You're welcome! Is there anything else I can help you with?",
            "thank you": "You're welcome! How can I assist you further?"
        }

        if user_message in quick_responses:
            return ChatResponse(response=quick_responses[user_message])

        # Only keep last 2 exchanges for context
        messages = [
            {"role": "user" if msg["type"] == "human" else "model", "parts": [msg["text"]]}
            for msg in conversation[-4:]  # Last 2 exchanges (user + bot)
        ]

        # Simple prompt for faster response
        prompt = f"""
        {SYSTEM_PROMPT}
        User: {user_message}
        Respond in 1-2 bullet points:
        """

        # Generate response with timeout
        response = model.generate_content(prompt)

        # Clean and return response
        return ChatResponse(
            response=clean_text(response.text) or "I'm here to help. Could you tell me more?",
            is_escalated=False
        )

    except Exception as e:
        print(f"Error: {e}")
        return ChatResponse(
            response="I'm having trouble responding. Could you try again?",
            is_escalated=False
        )

def validate_message(message: Message) -> None:
    if not message.user_id or not isinstance(message.user_id, str):
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not message.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

@app.post("/chat/")
async def chat_endpoint(message: Message):
    validate_message(message)

    user_id = message.user_id
    text = message.text.strip()

    if user_id not in conversation_history:
        conversation_history[user_id] = [
            {"type": "ai", "text": "Hello! I'm your communication coach. How can I help you today?"}
        ]

    conversation_history[user_id].append({"type": "human", "text": text})

    response = await generate_response(conversation_history[user_id])

    conversation_history[user_id].append({"type": "ai", "text": response.response})
    conversation_history[user_id] = conversation_history[user_id][-10:]

    return response

@app.get("/test-gemini")
async def test_gemini():
    try:
        test_model = genai.GenerativeModel(MODEL_NAME)
        response = test_model.generate_content("Say 'Hello, Gemini is working!'")

        return {
            "status": "success",
            "message": f"Successfully connected using: {MODEL_NAME}",
            "response": response.text
        }

    except Exception as e:
        models = []
        try:
            models = [m.name for m in genai.list_models()]
        except:
            models = ["Unable to fetch model list"]

        return {
            "status": "error",
            "message": str(e),
            "available_models": models
        }

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
