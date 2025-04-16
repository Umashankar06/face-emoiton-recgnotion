import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import { Camera, RefreshCw } from 'lucide-react';

const emotions = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised'];

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [model, setModel] = useState<faceDetection.FaceDetector | null>(null);
  const [emotion, setEmotion] = useState<string>('neutral');
  const [isLoading, setIsLoading] = useState(true);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const model = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      );
      setModel(model);
      setIsLoading(false);
    };
    loadModel();
  }, []);

  const detectEmotion = async () => {
    if (model && webcamRef.current && isWebcamReady) {
      const video = webcamRef.current.video;
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const faces = await model.estimateFaces(video);
          if (faces.length > 0) {
            // For demo purposes, we'll randomly select an emotion
            // In a real application, you'd use a proper emotion classification model
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            setEmotion(randomEmotion);
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detectEmotion();
    }, 1000);

    return () => clearInterval(interval);
  }, [model, isWebcamReady]);

  const handleWebcamLoad = () => {
    setIsWebcamReady(true);
  };

  return (
    <div className="min-h-screen emotion-gradient flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 emotion-text-shadow">
            <Camera className="w-10 h-10 text-purple-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Emotion Recognition
            </span>
          </h1>
          <button 
            onClick={() => setIsLoading(true)} 
            className="p-3 rounded-full hover:bg-purple-100 transition-all duration-300 group"
          >
            <RefreshCw className="w-7 h-7 text-purple-600 transition-transform group-hover:rotate-180 duration-500" />
          </button>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-8 shadow-lg ring-1 ring-gray-900/5">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="mt-4 text-gray-600 font-medium">Loading...</div>
              </div>
            </div>
          ) : (
            <Webcam
              ref={webcamRef}
              mirrored
              className="w-full h-full object-cover"
              width={640}
              height={480}
              onLoadedData={handleWebcamLoad}
            />
          )}
        </div>

        <div className="bg-white/50 rounded-xl p-6 shadow-lg ring-1 ring-gray-900/5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 emotion-text-shadow">
            Detected Emotion
          </h2>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold capitalize transition-colors duration-300 ${
              emotion === 'happy' ? 'text-green-500' :
              emotion === 'sad' ? 'text-blue-500' :
              emotion === 'angry' ? 'text-red-500' :
              emotion === 'surprised' ? 'text-yellow-500' :
              emotion === 'disgusted' ? 'text-purple-500' :
              emotion === 'fearful' ? 'text-orange-500' :
              'text-gray-700'
            } emotion-text-shadow`}>
              {emotion}
            </div>
            <div className={`h-3 w-3 rounded-full animate-pulse ${
              emotion === 'happy' ? 'bg-green-500' :
              emotion === 'sad' ? 'bg-blue-500' :
              emotion === 'angry' ? 'bg-red-500' :
              emotion === 'surprised' ? 'bg-yellow-500' :
              emotion === 'disgusted' ? 'bg-purple-500' :
              emotion === 'fearful' ? 'bg-orange-500' :
              'bg-gray-500'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;