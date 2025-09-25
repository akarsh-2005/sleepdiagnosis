# SleepGuard AI 🛌✨

**AI-powered sleep analysis through environment optimization & snore detection**

SleepGuard AI is a comprehensive sleep analysis system that combines advanced audio processing, computer vision, and machine learning to provide personalized sleep health insights.

## 🌟 Features

### 🏠 **Sleep Space Analysis**
- Upload bedroom photos for AI-powered environment analysis
- Get personalized recommendations for optimal sleep conditions
- Color-coded severity levels (high, moderate, low)
- Professional sleep environment advice

### 🎙️ **Auto Record Snoring**
- Real-time snoring detection and automatic recording
- Configurable sensitivity settings (10-90%)
- Customizable recording duration (5 minutes to 2 hours)
- Live audio level monitoring with visual feedback
- Smart snoring event counting

### 📁 **Upload Audio Analysis**
- Support for .wav, .mp3, .m4a, and .flac files
- Advanced spectrogram generation and visualization
- Frequency band analysis (Low, Mid, High frequency ranges)
- Dominant frequency detection
- Sleep apnea probability scoring

### 📊 **Advanced Analytics**
- **Spectrogram Visualization**: Time-frequency analysis with matplotlib
- **Frequency Band Breakdown**: 
  - Low Frequency (0-100 Hz): Deep breathing, body movements
  - Mid Frequency (100-500 Hz): Primary snoring range
  - High Frequency (>500 Hz): Airway turbulence, apnea events
- **Medical Interpretation**: AI-powered insights for sleep patterns
- **Confidence Scoring**: Probability-based sleep apnea detection

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python
- **ML Model**: Audio feature extraction using librosa + scikit-learn

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   python main.py
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:9002`

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /analyze` - Audio analysis endpoint

## Usage

1. Open the web interface at `http://localhost:9002`
2. Either record new audio or upload an existing file
3. Click \"Analyze Snore Audio\" to process the recording
4. View the results with confidence scores and recommendations

## Medical Disclaimer

This tool is for screening purposes only and should not replace professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment of sleep apnea.

## Development

### Project Structure

```
SleepApnea/
├── backend/           # FastAPI backend
│   ├── main.py       # API server
│   ├── model.py      # ML model and audio processing
│   └── requirements.txt
├── src/
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── lib/          # Utility functions
├── package.json      # Frontend dependencies
└── tailwind.config.ts # Tailwind configuration
```

### Building for Production

```bash
# Frontend
npm run build
npm start

# Backend
# Use uvicorn or gunicorn for production deployment
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please ensure compliance with medical device regulations if adapting for clinical use.