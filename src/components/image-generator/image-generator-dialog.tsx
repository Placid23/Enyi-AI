
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ImageGeneratorForm from './image-generator-form';

interface ImageGeneratorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ImageGeneratorDialog: React.FC<ImageGeneratorDialogProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0">
        {/* DialogHeader can be part of ImageGeneratorForm if preferred, or kept minimal here */}
        {/* 
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>AI Image Generator</DialogTitle>
          <DialogDescription>
            Describe the image you want to create. Let your imagination run wild!
          </DialogDescription>
        </DialogHeader>
        */}
        <div className="p-6">
         <ImageGeneratorForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGeneratorDialog;
