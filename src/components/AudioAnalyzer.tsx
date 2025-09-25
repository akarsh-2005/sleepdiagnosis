'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileUp, 
  Loader2, 
  Mic, 
  RotateCcw, 
  Square, 
  Upload 
} from 'lucide-react';

// Simple UI components for now - we'll create proper ones later
const Button = ({ children, onClick, disabled, className = '', variant = 'default', size = 'default' }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium transition-colors ${
      variant === 'destructive' 
        ? 'bg-red-600 text-white hover:bg-red-700' 
        : variant === 'outline'
        ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${size === 'lg' ? 'px-6 py-3 text-lg' : ''} ${className} disabled:opacity-50`}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: any) => (
  <div className="p-6 pb-4">
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children }: any) => (
  <h2 className="text-2xl font-bold text-gray-900 mb-2">
    {children}
  </h2>
);

const CardDescription = ({ children }: any) => (
  <p className="text-gray-600">
    {children}
  </p>
);

const Tabs = ({ children, defaultValue, className = '' }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab }) : child
      )}
    </div>
  );
};

const TabsList = ({ children, className = '' }: any) => (
  <div className={`flex bg-gray-100 rounded-md p-1 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, setActiveTab }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
      activeTab === value 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab }: any) => (
  activeTab === value ? <div className="mt-4">{children}</div> : null
);

type AnalysisState = 'idle' | 'recording' | 'processing' | 'results';
type AnalysisResult = {
  label: string;
  score: number;
  explanation: string;
  summary: string;
};

export function AudioAnalyzer() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'audio/wav' || file.type === 'audio/mpeg') {
        setAudioFile(file);
        alert('File uploaded successfully!');
      } else {
        alert('Please upload a .wav or .mp3 file.');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const file = new File([audioBlob], 'recording.mp3', { type: 'audio/mpeg' });
        setAudioFile(file);
        setAnalysisState('idle');
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setAnalysisState('recording');
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && analysisState === 'recording') {
      mediaRecorderRef.current.stop();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!audioFile) return;

    setIsAnalyzing(true);
    setAnalysisState('processing');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      // Convert backend response to frontend format
      const result: AnalysisResult = {
        label: data.label === 'likely_apnea' ? 'Likely Sleep Apnea' : 'Normal Snoring',
        score: Math.round(data.probability * 100),
        explanation: `Analysis indicates ${data.label === 'likely_apnea' ? 'potential sleep apnea patterns' : 'normal snoring patterns'} based on audio characteristics.`,
        summary: `The analysis found ${data.note}. Confidence: ${Math.round(data.probability * 100)}%`
      };

      setResult(result);
      setAnalysisState('results');
    } catch (error) {
      console.error('Error analyzing audio:', error);
      alert('Analysis failed. Please make sure the backend is running.');
      setAnalysisState('idle');
    } finally {
      setIsAnalyzing(false);
    }
  }, [audioFile]);

  const handleReset = () => {
    setAnalysisState('idle');
    setAudioFile(null);
    setResult(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const renderContent = () => {
    switch (analysisState) {
      case 'idle':
      case 'recording':
        return (
          <Tabs defaultValue="record" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">
                <Mic className="mr-2 w-4 h-4" /> Record Audio
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="mr-2 w-4 h-4" /> Upload File
              </TabsTrigger>
            </TabsList>
            <TabsContent value="record">
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                {analysisState === 'recording' ? (
                  <>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                      className="w-full"
                    >
                      <Square className="mr-2 w-4 h-4" /> Stop Recording
                    </Button>
                    <p className="text-lg font-mono text-gray-600">
                      {formatTime(recordingTime)}
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="w-full"
                    >
                      <Mic className="mr-2 w-4 h-4" /> Start Recording
                    </Button>
                    <p className="text-sm text-gray-600">
                      Record up to 5 minutes of snoring.
                    </p>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="upload">
              <div className="flex flex-col items-center justify-center p-6 space-y-2">
                <label htmlFor="audio-upload" className="w-full cursor-pointer">
                  <Button size="lg" className="w-full">
                    <FileUp className="mr-2 w-4 h-4" /> Choose File
                  </Button>
                </label>
                <input
                  id="audio-upload"
                  type="file"
                  accept=".wav,.mp3"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-600">
                  {audioFile ? audioFile.name : '(.wav or .mp3)'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center p-10 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600">Analyzing your audio...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        );
      case 'results':
        return (
          result && (
            <div className="space-y-6 p-4 md:p-6">
              {/* Results Card */}
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                  <CardDescription>
                    Based on the audio provided, here is our screening analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <h3 className="text-2xl font-semibold">{result.label}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.label === 'Likely Sleep Apnea' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.label === 'Likely Sleep Apnea' ? 'High Risk Indicator' : 'Normal Pattern'}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">
                        Confidence Score
                      </span>
                      <span className="text-lg font-bold text-blue-600">{result.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{result.explanation}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-600 mt-1">!</div>
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-1">Medical Disclaimer</h4>
                      <p className="text-sm text-orange-700">
                        This tool is for screening purposes only and should not replace professional medical advice. 
                        Please consult a healthcare provider for proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleReset} className="w-full">
                  <RotateCcw className="mr-2 w-4 h-4" /> Start Over
                </Button>
              </div>
            </div>
          )
        );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg overflow-hidden">
      {analysisState !== 'results' && (
        <CardHeader>
          <CardTitle>Audio Input</CardTitle>
          <CardDescription>
            Record your snoring or upload an audio file to begin.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="min-h-[220px] flex items-center justify-center">
          {renderContent()}
        </div>
      </CardContent>
      {analysisState === 'idle' && (
        <div className="border-t p-4">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!audioFile || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analyzing...
              </>
            ) : (
              'Analyze Snore Audio'
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}