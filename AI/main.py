from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class TextRequest(BaseModel):
    user_text: str

class IntentResponse(BaseModel):
    action: str
    entities: dict = Field(default_factory=dict)

@app.post("/understand-intent", response_model=IntentResponse)
def understand_intent(request: TextRequest):
    user_input = request.user_text.strip()
    action = "UNKNOWN"
    entities = {}

    if "날씨" in user_input:
        action = "GET_WEATHER"
        if "서울" in user_input:
            entities["location"] = "서울"
        if "오늘" in user_input:
            entities["time"] = "오늘"
    elif "회의 잡아줘" in user_input:
        action = "CREATE_MEETING"

    return IntentResponse(action=action, entities=entities)
