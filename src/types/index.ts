
export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  dataUri: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  file?: FileAttachment;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
  analyzedInfo?: {
    summary: string;
    keyInsights: string;
    confidenceLevel: number;
  };
  requiresContext?: boolean;
  intent?: string;
  feedback?: 'positive' | 'negative';
  correction?: string;
  streamedText?: string; // For streaming text
}

// New Type for Image History
export interface ImageHistoryEntry {
  id: string;
  prompt: string;
  imageDataUri: string;
  revisedPrompt?: string;
  timestamp: Date;
}
