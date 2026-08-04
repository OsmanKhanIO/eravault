// src/types/index.ts

export interface User {
  id: string; // Clerk User ID
  email: string;
  createdAt: Date;
}

export interface AiTag {
  id: string;
  imageId: string;
  tagName: string;
  confidenceScore: number;
}

export interface ImageMetadata {
  id: string;
  userId: string;
  imageUrl: string; // URL from ImgBB
  filename: string;
  fileSizeBytes: number;
  tags?: AiTag[]; // Optional, populated after Gemini processes it
  createdAt: Date;
}

// API Response type for ImgBB
export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url: string;
    delete_url: string;
    size: number;
  };
  success: boolean;
  status: number;
}