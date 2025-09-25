from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import shutil
import os
import uuid
from model import load_model, predict_from_file
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = "saved_model.joblib"

app = FastAPI(
    title="SleepGuard API", 
    description="Sleep apnea detection through snore analysis",
    version="1.0.0"
)

# Allow your frontend origin(s) here
origins = [
    "http://localhost:3000",
    "http://localhost:9002",  # Added for Next.js dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:9002",
    "https://sleepguard.vercel.app",
    "*"  # Allow all origins for development - remove in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
def startup_event():
    global model
    logger.info("Loading model...")
    try:
        model = load_model(MODEL_PATH)
        if model:
            logger.info("Model loaded successfully")
        else:
            logger.warning("No model file found, using fallback heuristics")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        model = None

@app.get("/")
async def root():
    return {"message": "SleepGuard API is running", "status": "healthy"}

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "model_loaded": model is not None,
        "service": "SleepGuard API",
        "version": "1.0.0"
    }

@app.post("/analyze")
async def analyze(audio: UploadFile = File(...)):
    logger.info(f"Received file: {audio.filename}, content-type: {audio.content_type}")
    
    # Validate file type by extension and content type
    valid_extensions = ('.wav', '.mp3', '.m4a', '.flac')
    valid_content_types = ('audio/', 'application/octet-stream', None)  # Allow None for some cases
    
    file_extension = os.path.splitext(audio.filename)[1].lower() if audio.filename else ''
    content_type_valid = (audio.content_type is None or 
                         any(audio.content_type.startswith(ct) for ct in valid_content_types if ct is not None) or
                         audio.content_type is None)
    
    if not (file_extension in valid_extensions or content_type_valid):
        logger.warning(f"Invalid file: extension={file_extension}, content-type={audio.content_type}")
        raise HTTPException(
            status_code=400, 
            detail="Invalid audio file. Please upload a .wav, .mp3, .m4a, or .flac file."
        )

    # Create tmp directory if it doesn't exist
    os.makedirs("tmp_uploads", exist_ok=True)
    
    # Save uploaded file temporarily
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(audio.filename)[1] or ".wav"
    tmp_path = os.path.join("tmp_uploads", file_id + ext)

    try:
        with open(tmp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        logger.info(f"File saved to {tmp_path}, processing...")
        
        # Process the audio file
        result = predict_from_file(tmp_path, model)
        
        logger.info(f"Analysis complete: {result['label']} with probability {result['probability']:.3f}")
        
        # Return formatted result
        return JSONResponse(content={
            "success": True,
            "label": result["label"],
            "probability": result["probability"],
            "confidence_score": round(result["probability"] * 100),
            "features": result.get("features", {}),
            "spectrogram": result.get("spectrogram", {}),
            "note": result.get("note", "Analysis completed"),
            "timestamp": file_id
        })
        
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Audio processing failed: {str(e)}"
        )
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                logger.info(f"Cleaned up temporary file: {tmp_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up {tmp_path}: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
