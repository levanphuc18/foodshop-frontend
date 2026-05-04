'use client';

import React, { useRef } from 'react';

interface ImageUploaderProps {
  maxImages?: number;
  maxSizeMB?: number;
  imageFiles: File[];
  imageUrls: string[];
  onFilesChange: (files: File[]) => void;
  onUrlsChange: (urls: string[]) => void;
  onError: (msg: string) => void;
}

export default function ImageUploader({
  maxImages = 4,
  maxSizeMB = 5,
  imageFiles,
  imageUrls,
  onFilesChange,
  onUrlsChange,
  onError,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCount = imageFiles.length + imageUrls.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Check max count
    if (currentCount + selectedFiles.length > maxImages) {
      onError(`Ban chi duoc tai len toi da ${maxImages} anh.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      // Check type
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        onError(`File ${file.name} khong duoc ho tro. Vui long dung JPG, PNG hoac WEBP.`);
        continue;
      }
      // Check size
      if (file.size > maxSizeMB * 1024 * 1024) {
        onError(`File ${file.name} vuot qua dung luong cho phep ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesChange([...imageFiles, ...validFiles]);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const removeUrl = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    onUrlsChange(newUrls);
  };

  return (
    <div className="space-y-3">
      {/* Previews */}
      {(imageUrls.length > 0 || imageFiles.length > 0) && (
        <div className="flex gap-2 flex-wrap">
          {/* Existing URLs */}
          {imageUrls.map((url, i) => (
            <div key={`url-${i}`} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[12px] font-bold">close</span>
              </button>
            </div>
          ))}
          {/* New Files */}
          {imageFiles.map((file, i) => (
            <div key={`file-${i}`} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <img src={URL.createObjectURL(file)} alt={`New Preview ${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[12px] font-bold">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {currentCount < maxImages && (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors border border-dashed border-slate-300 dark:border-slate-600"
          >
            <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
            Them anh ({currentCount}/{maxImages})
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/webp"
            multiple
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
