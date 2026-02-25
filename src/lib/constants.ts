import { MusicCategory, SlideGradient } from "./types";

// ============================================
// Gradient Presets
// ============================================

export const GRADIENT_PRESETS: { name: string; gradient: SlideGradient }[] = [
  { name: "Mor Gece", gradient: { from: "#2b0a3d", to: "#511a68" } },
  { name: "Kahve", gradient: { from: "#3E2723", to: "#5D4037" } },
  { name: "Karanlık", gradient: { from: "#000000", to: "#434343" } },
  { name: "Okyanus", gradient: { from: "#1A237E", to: "#3949AB" } },
  { name: "Aşk", gradient: { from: "#880E4F", to: "#C2185B" } },
  { name: "Gün Batımı", gradient: { from: "#EF6C00", to: "#FFA726" } },
  { name: "Evren", gradient: { from: "#512DA8", to: "#7E57C2" } },
  { name: "Altın", gradient: { from: "#F9A825", to: "#FBC02D" } },
  { name: "Ateş", gradient: { from: "#BF360C", to: "#E64A19" } },
  { name: "Orman", gradient: { from: "#1B5E20", to: "#4CAF50" } },
  { name: "Gece Mavisi", gradient: { from: "#0D47A1", to: "#42A5F5" } },
  { name: "Pembe Rüya", gradient: { from: "#AD1457", to: "#F48FB1" } },
  { name: "Turkuaz", gradient: { from: "#006064", to: "#4DD0E1" } },
  { name: "Lavanta", gradient: { from: "#4A148C", to: "#CE93D8" } },
  { name: "Gül Kurusu", gradient: { from: "#4E342E", to: "#A1887F" } },
];

// ============================================
// Müzik Kategorileri
// ============================================

export const MUSIC_CATEGORIES: { value: MusicCategory; label: string; emoji: string }[] = [
  { value: "romantic", label: "Romantik", emoji: "💕" },
  { value: "joyful", label: "Neşeli", emoji: "🎉" },
  { value: "melancholic", label: "Hüzünlü", emoji: "🥺" },
  { value: "energetic", label: "Enerjik", emoji: "⚡" },
];
