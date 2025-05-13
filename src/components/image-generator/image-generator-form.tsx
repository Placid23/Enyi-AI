
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
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ImageGeneratorForm() {
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
    setGeneratedImage(null); // Clear previous image while loading new one

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
    <div className="w-full">
      <Card className="shadow-none border-0">
        <CardHeader className="px-1 pt-2 pb-4">
          <div className="flex items-center space-x-2 mb-1">
            <ImageIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold text-foreground">AI Image Generator</CardTitle>
          </div>
          <CardDescription className="text-sm">
            Describe the image you want to create.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1 pb-4">
          <form onSubmit={handleGenerateImage} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="image-prompt" className="text-sm font-medium">Image Prompt</Label>
              <Input
                id="image-prompt"
                type="text"
                placeholder="e.g., A cat wearing a party hat"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm py-2 px-3 rounded-md focus:ring-accent focus:border-accent"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-sm py-2 rounded-md" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Generation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && !generatedImage && (
             <div className="mt-6 text-center py-8 bg-muted/30 rounded-md">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-3 text-sm">Enyi is creating your image...</p>
            </div>
          )}

        </CardContent>
          {generatedImage && (
            <CardFooter className="flex flex-col items-center pt-4 px-1 border-t mt-4">
              <h3 className="text-md font-semibold mb-3 text-foreground">Generated Image:</h3>
              <div className="relative w-full max-w-sm aspect-square rounded-md overflow-hidden shadow-md border border-border">
                <Image
                  src={generatedImage.imageDataUri}
                  alt={generatedImage.revisedPrompt || prompt}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint="generated art"
                />
              </div>
              {generatedImage.revisedPrompt && (
                <p className="mt-3 text-xs text-muted-foreground italic text-center">
                  <strong>Model's interpretation:</strong> {generatedImage.revisedPrompt}
                </p>
              )}
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
