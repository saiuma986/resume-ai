import React, { useState, useRef } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
        setSelectedFile(file);
        onFileSelect(file);
        if (fileInputRef.current) {
            fileInputRef.current.files = e.dataTransfer.files;
        }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-3 border border-neutral-300 rounded-lg bg-neutral-50">
        <div className="flex items-center min-w-0">
          <FileIcon className="h-6 w-6 text-neutral-500 mr-3 flex-shrink-0" />
          <span className="text-sm text-neutral-700 truncate">{selectedFile.name}</span>
        </div>
        <button onClick={clearFile} className="p-1 rounded-full hover:bg-neutral-200">
          <XIcon className="h-5 w-5 text-neutral-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx"
      />
      <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center mb-3">
        <UploadCloudIcon className="h-6 w-6 text-neutral-500" />
      </div>
      <p className="text-sm text-neutral-600">
        <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-neutral-500 mt-1">PDF or DOCX (max. 5MB)</p>
    </div>
  );
};