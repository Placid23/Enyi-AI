'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeFacialSentiment } from '@/ai/flows/analyze-facial-sentiment';
import type { AnalyzeFacialSentimentOutput } from '@/ai/flows/analyze-facial-sentiment';
import { Camera, Loader2, Smile, Meh, Frown, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FacialSentimentAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFacialSentimentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false);
        setError('Camera access denied. Please enable camera permissions in your browser settings.');
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleAnalyzeSentiment = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
      toast({
        variant: 'destructive',
        title: 'Cannot Analyze',
        description: 'Camera not ready or permission denied.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not get canvas context.' });
      setIsAnalyzing(false);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg');

    try {
      const result = await analyzeFacialSentiment({ imageDataUri });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error analyzing sentiment:', err);
      setError('Failed to analyze sentiment. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: (err as Error).message || 'An unknown error occurred.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [hasCameraPermission, toast]);

  const SentimentIcon = ({ sentiment, confidence }: AnalyzeFacialSentimentOutput) => {
    const size = 48;
    if (confidence < 0.3) return <Meh size={size} className="text-muted-foreground" />;
    switch (sentiment.toLowerCase()) {
      case 'happy': return <Smile size={size} className="text-green-500" />;
      case 'sad': return <Frown size={size} className="text-blue-500" />;
      case 'neutral': return <Meh size={size} className="text-gray-500" />;
      case 'surprised': return <Smile size={size} className="text-yellow-500" />; // Using Smile as placeholder
      case 'angry': return <Frown size={size} className="text-red-500" />; // Using Frown as placeholder
      default: return <Meh size={size} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4 p-1">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4">
            <Camera size={48} className="mb-4 text-destructive" />
            <p className="text-lg font-semibold">Camera Access Required</p>
            <p className="text-sm text-center">Please allow camera access in your browser settings to use this feature.</p>
          </div>
        )}
         {hasCameraPermission === null && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
         )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleAnalyzeSentiment}
        disabled={!hasCameraPermission || isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Camera className="mr-2 h-4 w-4" />
        )}
        Analyze Sentiment
      </Button>

      {isAnalyzing && (
        <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground mt-2">Analyzing...</p>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-xl">
              <span>Analysis Result</span>
              <SentimentIcon {...analysisResult} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-bold capitalize text-primary">
              {analysisResult.sentiment}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Confidence</span>
                <span>{(analysisResult.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={analysisResult.confidence * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacialSentimentAnalyzer;
