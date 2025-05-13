
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
}
