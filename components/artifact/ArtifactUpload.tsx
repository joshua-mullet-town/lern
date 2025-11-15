'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase-client';
import { COLLECTION_NAMES, Artifact, ArtifactFileType, MAX_ARTIFACT_SIZE } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ArtifactConverter } from '@/lib/converters';

interface ArtifactUploadProps {
  learnerId: string;
  competencyId: string;
  onUploadComplete?: (artifact: Artifact) => void;
}

export function ArtifactUpload({ learnerId, competencyId, onUploadComplete }: ArtifactUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [artifactName, setArtifactName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'jpg', 'jpeg', 'png', 'mp4'].includes(ext)) {
      toast.error('Invalid file type. Please upload PDF, JPG, PNG, or MP4.');
      return;
    }

    // Validate file size
    if (file.size > MAX_ARTIFACT_SIZE) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setArtifactName(file.name.split('.')[0]); // Default to filename without extension
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `artifacts/${learnerId}/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          setUploading(false);
        },
        async () => {
          // Upload complete - get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Determine file type
          const ext = selectedFile.name.split('.').pop()?.toLowerCase();
          let fileType: ArtifactFileType = 'pdf';
          if (ext === 'jpg' || ext === 'jpeg') fileType = 'jpg';
          else if (ext === 'png') fileType = 'png';
          else if (ext === 'mp4') fileType = 'mp4';

          // Create artifact document in Firestore
          const artifactsRef = collection(db, COLLECTION_NAMES.artifacts).withConverter(ArtifactConverter);
          const artifactData: Omit<Artifact, 'id'> = {
            uploaded_by: learnerId,
            learner_id: learnerId,
            file_url: downloadURL,
            file_type: fileType,
            file_size: selectedFile.size,
            file_name: artifactName || selectedFile.name,
            competency_ids: [competencyId],
            created_at: Timestamp.now() as unknown as Date,
            updated_at: Timestamp.now() as unknown as Date,
          };

          const docRef = await addDoc(artifactsRef, artifactData);
          const newArtifact: Artifact = { ...artifactData, id: docRef.id };

          toast.success('Artifact uploaded successfully');
          setUploading(false);
          setSelectedFile(null);
          setArtifactName('');
          setUploadProgress(0);

          if (onUploadComplete) {
            onUploadComplete(newArtifact);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading artifact:', error);
      toast.error('Failed to upload artifact');
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setArtifactName('');
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4 flex flex-col items-center">
      {!selectedFile ? (
        <div className="w-full">
          <Label htmlFor="artifact-upload" className="cursor-pointer block">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-all text-center">
              <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-base text-slate-600 mb-1 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-400">PDF, JPG, PNG, or MP4 (max 50MB)</p>
            </div>
          </Label>
          <Input
            id="artifact-upload"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg p-4 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artifact-name">Artifact Name</Label>
            <Input
              id="artifact-name"
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              placeholder="Enter a name for this artifact"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                {uploadProgress.toFixed(0)}% uploaded
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !artifactName.trim()}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Artifact'}
          </Button>
        </div>
      )}
    </div>
  );
}
