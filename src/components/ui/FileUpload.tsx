"use client";

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from "react";
import { HiUpload, HiX, HiDocument } from "react-icons/hi";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  error?: string;
  onChange: (files: File[]) => void;
  value?: File[];
}

export default function FileUpload({
  label,
  accept,
  multiple = false,
  maxSizeMB = 10,
  error,
  onChange,
  value = [],
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid: File[] = [];

      for (const file of files) {
        if (file.size > maxBytes) {
          setLocalError(
            `ไฟล์ "${file.name}" มีขนาดเกิน ${maxSizeMB} MB`
          );
          continue;
        }
        valid.push(file);
      }

      return valid;
    },
    [maxSizeMB]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      setLocalError(null);
      const files = Array.from(fileList);
      const valid = validateFiles(files);

      if (valid.length > 0) {
        onChange(multiple ? [...value, ...valid] : valid.slice(0, 1));
      }
    },
    [multiple, onChange, validateFiles, value]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    },
    [value, onChange]
  );

  const displayError = error || localError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 cursor-pointer
          transition-colors duration-150
          ${
            isDragging
              ? "border-primary-500 bg-primary-50"
              : displayError
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50"
          }
        `}
      >
        <HiUpload className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          <span className="font-medium text-primary-600">คลิกเพื่ออัปโหลด</span>{" "}
          หรือลากไฟล์มาวางที่นี่
        </p>
        <p className="mt-1 text-xs text-gray-500">
          ขนาดไฟล์สูงสุด {maxSizeMB} MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* File list */}
      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <HiDocument className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              >
                <HiX className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {displayError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
    </div>
  );
}
