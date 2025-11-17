# BettrMe.AI Chatbot – Aggression Detection Flow

## Short Note: How Aggression Is Detected and Handled

The chatbot uses a simple but explicit pipeline around the `/chat/` endpoint in `chatbot/app.py`:

1. **Receive message**
   - The frontend sends the user message and `user_id` to `POST /chat/`.
   - The backend appends the message to the in-memory `conversation_history[user_id]`.

2. **Normalize the latest user message**
   - In `generate_response(conversation)`, the bot extracts the latest human message.
   - It lowercases and trims it so checks are robust: `user_message = ... .lower().strip()`.

3. **Empty-message guard**
   - If the conversation is empty, the bot returns a friendly greeting without calling Gemini.

4. **Aggression / inappropriate language detection**
   - The helper `is_inappropriate(text: str) -> bool` checks if the text contains any word/phrase from a small list of aggressive or rude terms (for example: `"stupid", "idiot", "sucks", "hate", "fuck", "shit"`, etc.).
   - If any of these are found, the bot **does not call Gemini**. Instead, it immediately returns a de‑escalation response.

5. **De‑escalation response (bringing the user back)**
   - When aggression is detected, the bot sends a calm, two‑bullet response along the lines of:
     - Acknowledging that the user is upset and offering support.
     - Politely asking to keep the conversation respectful and to rephrase what happened in a calmer way.
   - This explicitly invites the user to **step back from aggression** and restate their problem.

6. **Quick non‑aggressive responses**
   - For common, non‑aggressive inputs like `"hi"`, `"hello"`, `"thanks"`, the bot returns a pre‑defined friendly reply.
   - These paths also bypass the Gemini API for speed and reliability.

7. **Normal coaching flow (Gemini)**
   - If the message is not empty, not aggressive, and not a quick‑reply keyword, the bot:
     - Keeps only the last few exchanges for context.
     - Builds a short prompt that includes the system instructions and the user’s latest message.
     - Calls `model.generate_content(...)` on the configured Gemini model.
     - Cleans the text to remove formatting characters and sends the response back to the frontend.

This structure ensures that **aggressive messages are intercepted early**, handled with empathy, and the user is gently nudged back into a cooperative coaching conversation.

---

## Flow Diagram (Text)

```text
User sends message
        |
        v
/chat/ endpoint receives JSON (user_id, text)
        |
        v
Append message to conversation_history[user_id]
        |
        v
Call generate_response(conversation)
        |
        v
Extract latest human message
(lowercase + strip whitespace)
        |
        v
Is conversation empty?
  ├─ Yes -> return friendly greeting
  └─ No
        |
        v
Check is_inappropriate(user_message)
  ├─ Yes ->
  |        return de‑escalation message:
  |          - acknowledge feelings
  |          - ask to rephrase calmly
  |        (no Gemini API call)
  └─ No
        |
        v
Is user_message a quick greeting/thanks?
  ├─ Yes -> return predefined quick reply
  └─ No
        |
        v
Build short context (last few turns)
        |
        v
Call Gemini model.generate_content(prompt)
        |
        v
Clean response text and send back
        |
        v
Frontend displays reply
  and (optionally) reads it aloud
```

This diagram complements the code in `chatbot/app.py` and can be used in documentation, presentations, or the GitHub README to explain how the chatbot detects aggression, handles it gracefully, and brings the user back into a productive conversation.
