
'use client';

import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { ChatProvider } from '@/context/chat-context';
import { ImageHistoryProvider } from '@/context/image-history-context'; // Import new provider
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import React, { useState } from 'react';
import { AppSettingsProvider, useAppSettings } from '@/context/app-settings-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FacialSentimentAnalyzer from '@/components/facial-sentiment/facial-sentiment-analyzer';

// Inner component to access AppSettingsContext for AppHeader and other parts if needed
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentLanguage, setCurrentLanguage } = useAppSettings();
  const [isFacialSentimentDialogOpen, setIsFacialSentimentDialogOpen] = useState(false);

  return (
    // ChatProvider can be here or wrap AppSettingsProvider in the main export,
    // depending on whether ChatProvider needs access to app settings or vice-versa.
    // For simplicity, keeping it here.
    <ImageHistoryProvider> {/* Wrap with ImageHistoryProvider */}
      <ChatProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <AppSidebar />
            <SidebarInset className="flex flex-col flex-1 overflow-hidden">
              <AppHeader
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onFacialSentimentClick={() => setIsFacialSentimentDialogOpen(true)}
              />
              <main className="flex-grow flex flex-col overflow-hidden">
                {children}
              </main>
            </SidebarInset>
          </div>
          <Dialog open={isFacialSentimentDialogOpen} onOpenChange={setIsFacialSentimentDialogOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Facial Sentiment Analysis</DialogTitle>
                <DialogDescription>
                  Allow camera access, position your face in the view, and click "Analyze Sentiment".
                </DialogDescription>
              </DialogHeader>
              <FacialSentimentAnalyzer />
            </DialogContent>
          </Dialog>
        </SidebarProvider>
      </ChatProvider>
    </ImageHistoryProvider>
  );
}

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSettingsProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AppSettingsProvider>
  );
}
