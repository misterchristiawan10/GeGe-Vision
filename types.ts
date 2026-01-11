
import React from 'react';

export type ModuleId = 
  | 'home'
  | 'virtual-photoshoot'
  | 'prewed-virtual'
  | 'content-creator'
  | 'cosplay-fusion'
  | 'bikini-photoshoot'
  | 'pinsta-product'
  | 'karikatur'
  | 'infografis'
  | 'smart-panda-studio'
  | 'vidgen'
  | 'story-board'
  | 'voice-over'
  | 'rebel-fx'
  | 'mp4-to-mp3'
  | 'thumbnail-maker'
  | 'asmr-visual'
  | 'image-resizer'
  | 'renovation-timelapse'
  | 'world-tour'
  | 'family-fusion'
  | 'admin-panel'
  | 'settings'
  | 'global-history'; // @google/genai-api:fix - Added missing global-history ID

export interface ModuleDefinition {
  id: ModuleId;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  adminOnly?: boolean;
}

export interface UserApiKey {
  id: string;
  label: string;
  key: string;
  isActive: boolean;
}

export interface Draft {
  id: string;
  title: string;
  module: string;
  content: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}

export interface GenerationConfig {
  prompt: string;
  image?: File;
  aspectRatio: string;
  imageSize?: string;
}

export type Theme = 'light' | 'dark';