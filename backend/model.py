import numpy as np
import librosa
import librosa.display
import joblib
import os
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64

def extract_features(file_path: str, sr: int = 22050):
    y, sr = librosa.load(file_path, sr=sr, mono=True, duration=300.0)
    if y.size == 0:
        raise ValueError("Empty audio file")

    rms = librosa.feature.rms(y=y).mean()
    zcr = librosa.feature.zero_crossing_rate(y).mean()
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr).mean()
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr).mean()
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr).mean()
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_means = mfcc.mean(axis=1)

    vector = np.hstack([rms, zcr, spectral_centroid, spectral_bandwidth,
                        spectral_rolloff, mfcc_means]).astype(float)

    # Generate spectrogram data
    spectrogram_data = generate_spectrogram(y, sr)

    summary = {
        "rms": float(rms),
        "zcr": float(zcr),
        "spectral_centroid": float(spectral_centroid),
        "spectral_bandwidth": float(spectral_bandwidth),
        "spectral_rolloff": float(spectral_rolloff),
        "mfcc_1": float(mfcc_means[0]),
    }
    return {"vector": vector, "summary": summary, "spectrogram": spectrogram_data}

def generate_spectrogram(y, sr):
    """Generate spectrogram data for visualization"""
    try:
        print(f"Generating spectrogram for audio: length={len(y)}, sr={sr}")  # Debug log
        
        # Ensure we have enough audio data
        if len(y) < 1024:
            print("Audio too short for spectrogram analysis")
            return {
                "image_base64": None,
                "frequency_analysis": {},
                "time_duration": 0.0,
                "error": "Audio too short for analysis"
            }
        
        # Create spectrogram
        D = librosa.stft(y, n_fft=2048, hop_length=512)
        S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
        
        # Get time and frequency axes
        times = librosa.times_like(S_db, sr=sr, hop_length=512)
        freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
        
        print(f"Spectrogram shape: {S_db.shape}, Frequency range: {freqs[0]:.1f}-{freqs[-1]:.1f} Hz")
        
        # Generate base64 encoded plot
        plt.figure(figsize=(14, 8))
        
        # Spectrogram plot
        plt.subplot(2, 1, 1)
        librosa.display.specshow(S_db, sr=sr, hop_length=512, x_axis='time', y_axis='hz',
                                fmax=2000, cmap='viridis')
        plt.colorbar(format='%+2.0f dB')
        plt.title('Audio Spectrogram - Frequency vs Time', fontsize=14, fontweight='bold')
        plt.ylabel('Frequency (Hz)', fontsize=12)
        
        # Average frequency spectrum plot
        plt.subplot(2, 1, 2)
        avg_spectrum = np.mean(S_db, axis=1)
        relevant_freqs = freqs[freqs <= 2000]  # Focus on relevant frequency range
        relevant_spectrum = avg_spectrum[:len(relevant_freqs)]
        
        plt.plot(relevant_freqs, relevant_spectrum, linewidth=2, color='blue')
        plt.fill_between(relevant_freqs, relevant_spectrum, alpha=0.3, color='lightblue')
        plt.title('Average Frequency Spectrum', fontsize=14, fontweight='bold')
        plt.xlabel('Frequency (Hz)', fontsize=12)
        plt.ylabel('Magnitude (dB)', fontsize=12)
        plt.xlim(0, 2000)
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Convert plot to base64 string
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        plt.close()
        
        print(f"Generated spectrogram image, base64 length: {len(img_base64)}")
        
        # Extract key frequency features with better handling
        if len(relevant_spectrum) > 0:
            dominant_freq_idx = np.argmax(relevant_spectrum)
            dominant_freq = relevant_freqs[dominant_freq_idx] if dominant_freq_idx < len(relevant_freqs) else 0
            
            # Calculate energy in frequency bands
            low_mask = relevant_freqs <= 100
            mid_mask = (relevant_freqs > 100) & (relevant_freqs <= 500)
            high_mask = relevant_freqs > 500
            
            freq_range_energy = {
                "low_freq_energy": float(np.mean(relevant_spectrum[low_mask])) if np.any(low_mask) else 0.0,
                "mid_freq_energy": float(np.mean(relevant_spectrum[mid_mask])) if np.any(mid_mask) else 0.0,
                "high_freq_energy": float(np.mean(relevant_spectrum[high_mask])) if np.any(high_mask) else 0.0,
                "dominant_frequency": float(dominant_freq),
                "spectral_peak": float(np.max(relevant_spectrum))
            }
        else:
            freq_range_energy = {
                "low_freq_energy": 0.0,
                "mid_freq_energy": 0.0,
                "high_freq_energy": 0.0,
                "dominant_frequency": 0.0,
                "spectral_peak": 0.0
            }
        
        result = {
            "image_base64": img_base64,
            "frequency_analysis": freq_range_energy,
            "time_duration": float(times[-1]) if len(times) > 0 else 0.0
        }
        
        print(f"Spectrogram generation successful. Dominant frequency: {freq_range_energy['dominant_frequency']:.1f} Hz")
        return result
        
    except Exception as e:
        print(f"Error generating spectrogram: {e}")
        import traceback
        traceback.print_exc()
        return {
            "image_base64": None,
            "frequency_analysis": {},
            "time_duration": 0.0,
            "error": str(e)
        }

def load_model(path: str):
    return joblib.load(path) if os.path.exists(path) else None

def predict_from_file(file_path: str, model):
    feat = extract_features(file_path)
    x = feat["vector"].reshape(1, -1)

    if model is not None:
        try:
            probs = model.predict_proba(x)[0]
            prob = float(probs[1])
            label = "likely_apnea" if prob >= 0.5 else "unlikely"
            return {"probability": prob, "label": label,
                    "features": feat["summary"],
                    "spectrogram": feat["spectrogram"],
                    "note": "Model-based prediction"}
        except Exception:
            pred = int(model.predict(x)[0])
            prob = float(pred)
            label = "likely_apnea" if pred == 1 else "unlikely"
            return {"probability": prob, "label": label,
                    "features": feat["summary"],
                    "spectrogram": feat["spectrogram"],
                    "note": "Prediction (no probability)"}
    else:
        s = feat["summary"]
        score = min(1.0, s["rms"] * 10.0) + max(0.0, (0.2 - s["zcr"]) * 5.0)
        prob = max(0.0, min(1.0, score / 2.0))
        label = "likely_apnea" if prob >= 0.5 else "unlikely"
        return {"probability": prob, "label": label,
                "features": feat["summary"],
                "spectrogram": feat["spectrogram"],
                "note": "Heuristic fallback"}
