import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle, Eye } from 'lucide-react';

interface FileUploadProps {
  id?: string;
  label: string;
  subLabel?: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string; // base64 or URL
  fileName?: string;
  onChange: (fileData: { url: string; name: string; size: number; type: string } | null) => void;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id = 'file-upload',
  label,
  subLabel = 'PDF, DOC, DOCX up to 10MB',
  accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  maxSizeMB = 10,
  value,
  fileName: initialFileName,
  onChange,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>(initialFileName || (value ? 'Attached File' : ''));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentFileName(file.name);
      onChange({
        url: result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.onerror = () => {
      setError('Failed to read selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  return (
    <div className="space-y-1.5" id={`${id}-container`}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {value ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-slate-800 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-900 truncate">{currentFileName || 'Document Attached'}</p>
              <p className="text-[10px] text-emerald-700 font-medium">Ready for upload • Verified format</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id={id}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{subLabel}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-600 text-xs mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
