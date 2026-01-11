
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
  | 'global-history'
  | 'family-fusion'
  | 'admin-panel'; // Modul baru

export interface ModuleDefinition {
  id: ModuleId;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  adminOnly?: boolean; // Flag untuk modul khusus admin
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user'; // Role baru
}

export interface GenerationConfig {
  prompt: string;
  image?: File;
  aspectRatio: string;
  imageSize?: string;
}

export type Theme = 'light' | 'dark';