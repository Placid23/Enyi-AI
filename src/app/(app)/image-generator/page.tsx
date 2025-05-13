
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateImage } from '@/ai/flows/generate-image-flow';
import type { GenerateImageOutput } from '@/ai/flows/generate-image-flow';
import { Loader2, ImageIcon, AlertTriangle } from 'lucide-react';
import Image from 'next/image'; // Using next/image for optimization
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage({ prompt });
      setGeneratedImage(result);
      toast({
        title: 'Image Generated!',
        description: result.revisedPrompt || `Successfully generated image for: ${prompt}`,
      });
    } catch (err) {
      console.error('Error generating image:', err);
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred during image generation.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 flex-grow">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-foreground">AI Image Generator</CardTitle>
          </div>
          <CardDescription>
            Describe the image you want to create. Let your imagination run wild!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerateImage} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-lg font-medium">Image Prompt</Label>
              <Input
                id="prompt"
                type="text"
                placeholder="e.g., A futuristic cityscape at sunset, synthwave style"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-base py-3 px-4 rounded-lg focus:ring-accent focus:border-accent"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Generation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !generatedImage && (
             <div className="mt-8 text-center py-10 bg-muted/50 rounded-lg">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-4 text-lg">Enyi is creating your masterpiece...</p>
            </div>
          )}

        </CardContent>
          {generatedImage && (
            <CardFooter className="flex flex-col items-center pt-6 border-t mt-6">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Generated Image:</h3>
              <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-lg border border-border">
                <Image
                  src={generatedImage.imageDataUri}
                  alt={generatedImage.revisedPrompt || prompt}
                  fill
                  style={{ objectFit: 'contain' }} // 'cover' might crop, 'contain' shows full image
                  priority // Prioritize loading this image as it's key content
                  data-ai-hint="generated art"
                />
              </div>
              {generatedImage.revisedPrompt && (
                <p className="mt-4 text-sm text-muted-foreground italic text-center">
                  <strong>Model's interpretation:</strong> {generatedImage.revisedPrompt}
                </p>
              )}
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
