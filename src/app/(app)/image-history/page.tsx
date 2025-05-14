
'use client';

import React from 'react';
import { useImageHistory } from '@/context/image-history-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Images, Trash2, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';


export default function ImageHistoryPage() {
  const { imageHistory, isLoadingImageHistory, clearImageHistory } = useImageHistory();

  const sortedHistory = React.useMemo(() => {
    return [...imageHistory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [imageHistory]);

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-6">
      <Card className="flex-grow flex flex-col shadow-xl rounded-xl overflow-hidden border-border/30 bg-card backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center">
              <Images className="mr-3 h-6 w-6 text-primary" />
              Image Generation History
            </CardTitle>
            <CardDescription>
              Browse images you've generated with Enyi.
            </CardDescription>
          </div>
          {sortedHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your generated image history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearImageHistory}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoadingImageHistory ? (
              <div className="flex items-center justify-center h-full p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : sortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Images className="h-20 w-20 text-muted-foreground opacity-50 mb-6" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Images Yet</h3>
                <p className="text-muted-foreground">
                  Start generating images and they'll appear here.
                </p>
                <Button variant="link" className="mt-4 text-primary" asChild>
                  <Link href="/">
                    Go to Chat & Generate
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 md:p-6">
                {sortedHistory.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <div className="relative w-full aspect-square bg-muted">
                      <Image
                        src={entry.imageDataUri}
                        alt={entry.prompt}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        data-ai-hint="history generated image"
                        onError={(e) => {
                           e.currentTarget.srcset = 'https://placehold.co/300x300.png?text=Error+loading';
                           e.currentTarget.src = 'https://placehold.co/300x300.png?text=Error+loading';
                        }}
                      />
                    </div>
                    <CardContent className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground truncate" title={entry.prompt}>
                          <strong>Prompt:</strong> {entry.prompt}
                        </p>
                        {entry.revisedPrompt && (
                          <p className="text-xs text-muted-foreground/80 italic truncate" title={entry.revisedPrompt}>
                            <strong>Revised:</strong> {entry.revisedPrompt}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
