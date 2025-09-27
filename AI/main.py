from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import uvicorn

# -----------------------------------------------------------
# 1. FastAPI 앱 생성 및 AI 모델 로딩
# -----------------------------------------------------------
app = FastAPI()

# 허깅페이스 허브 저장소 ID를 지정
try:
    model_path = "KIMKK2K/MrDaebok" 
    classifier = pipeline("text-classification", model=model_path)
    print("✅ AI 모델 로딩 성공!")
except Exception as e:
    print(f"❌ AI 모델 로딩 실패: {e}")
    classifier = None


# -----------------------------------------------------------
# 2. 데이터 형식 정의 (Pydantic 모델)
# -----------------------------------------------------------

# Java에서 보낼 요청 데이터의 형식을 정의합니다.
class TextRequest(BaseModel):
    text: str  # 문장은 'text'라는 키에 담겨 올 것으로 약속합니다.

# Java로 돌려줄 응답 데이터의 형식을 정의합니다.
class PredictionResponse(BaseModel):
    label: str
    score: float

# -----------------------------------------------------------
# 3. API 엔드포인트 생성
# -----------------------------------------------------------

# "/predict" 주소로 POST 요청을 받을 수 있는 창구를 엽니다.
# response_model=PredictionResponse는 응답 형식을 검증하고 문서화하는 역할을 합니다.
@app.post("/MrDaebak", response_model=PredictionResponse)
def predict_intent(request: TextRequest):
    """
    입력된 텍스트의 의도를 예측하여 라벨과 신뢰도 점수를 반환합니다.
    """
    if not classifier:
        return {"label": "error", "score": 0.0, "message": "모델이 로드되지 않았습니다."}

    # 1. Java에서 보낸 데이터 추출
    input_text = request.text
    print(f"📩 Java로부터 문장 수신: {input_text}")

    # 2. AI 모델로 예측 수행
    # 파이프라인은 리스트를 반환하므로, 첫 번째 결과를 사용합니다.
    prediction = classifier(input_text)[0]

    # 3. 예측 결과를 응답 형식에 맞춰 반환
    print(f"🔍 예측 결과: {prediction['label']} (신뢰도: {prediction['score']:.2f})")
    return PredictionResponse(label=prediction['label'], score=prediction['score'])

# (선택) 서버가 잘 실행되고 있는지 확인하는 기본 경로
@app.get("/")
def read_root():
    return {"status": "AI Inference Server is running"}


# -----------------------------------------------------------
# 4. 서버 실행
# -----------------------------------------------------------
if __name__ == "__main__":
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    # 0.0.0.0으로 해야 외부(Java)에서 접속 가능합니다.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)