'use client';

import { Artifact } from '@/types';
import { FileText, Film, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ArtifactThumbnailProps {
  artifact: Artifact;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
  onDelete?: (artifactId: string) => void;
  showDelete?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export function ArtifactThumbnail({ artifact, showName = true, size = 'md', whiteText = false, onDelete, showDelete = false }: ArtifactThumbnailProps) {
  const isImage = artifact.file_type === 'jpg' || artifact.file_type === 'png';
  const isPdf = artifact.file_type === 'pdf';
  const isVideo = artifact.file_type === 'mp4';

  const handleDownload = () => {
    window.open(artifact.file_url, '_blank');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(artifact.id);
    }
  };

  return (
    <div className="group relative">
      {/* Delete button (top right corner) */}
      {showDelete && onDelete && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 z-10 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-80 hover:!opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Thumbnail */}
      <div
        className={`${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-400 transition-all cursor-pointer relative bg-slate-50`}
        onClick={handleDownload}
      >
        {isImage ? (
          <Image
            src={artifact.file_url}
            alt={artifact.file_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            {isPdf && <FileText className="w-8 h-8 text-red-600" />}
            {isVideo && <Film className="w-8 h-8 text-purple-600" />}
            <span className="text-xs font-bold text-slate-600 mt-1 uppercase">
              {artifact.file_type}
            </span>
          </div>
        )}

        {/* Hover overlay with download icon */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Name below thumbnail */}
      {showName && (
        <p className={`text-xs mt-1 truncate max-w-[100px] text-center ${whiteText ? 'text-white' : 'text-slate-600'}`}>
          {artifact.file_name}
        </p>
      )}
    </div>
  );
}
