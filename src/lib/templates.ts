// ============================================
// Şablon Tanımları
// ============================================

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: { from: string; to: string };
  category: string;
  isAvailable: boolean;
  editorFields: TemplateEditorField[];
}

export type TemplateEditorFieldId = "coverImage" | "mainTitle" | "paragraph" | "musicId";
export type TemplateEditorFieldType = "image" | "text" | "textarea" | "music";

export interface TemplateEditorField {
  id: TemplateEditorFieldId;
  type: TemplateEditorFieldType;
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "valentines",
    name: "Dijital Hikaye",
    description: "Fotoğraf, müzik ve yazılarla sevdiklerinize özel hikaye anlatımı. Sevgililer günü, yıldönümü ve özel anlar için ideal.",
    emoji: "💝",
    gradient: { from: "#2b0a3d", to: "#511a68" },
    category: "Romantik",
    isAvailable: true,
    editorFields: [
      {
        id: "coverImage",
        type: "image",
        label: "Kapak Fotoğrafı",
        helperText: "Kapakta ve içerikte kullanılacak tek görsel.",
        required: true,
      },
      {
        id: "mainTitle",
        type: "text",
        label: "Ana Başlık",
        placeholder: "Örn: Seninle Her Gün Güzel",
        required: true,
      },
      {
        id: "paragraph",
        type: "textarea",
        label: "Paragraf",
        placeholder: "Mesajını buraya yaz...",
        required: true,
      },
      {
        id: "musicId",
        type: "music",
        label: "Müzik",
        helperText: "Bu şablon için bir şarkı seçmelisiniz.",
        required: true,
      },
    ],
  },
  {
    id: "birthday",
    name: "Doğum Günü Sürprizi",
    description: "Doğum günü kutlamaları için eğlenceli ve renkli şablon. Balon animasyonları ve konfetiler ile.",
    emoji: "🎂",
    gradient: { from: "#F9A825", to: "#FF6F00" },
    category: "Kutlama",
    isAvailable: false,
    editorFields: [],
  },
  {
    id: "friendship",
    name: "Arkadaşlık Defteri",
    description: "En yakın arkadaşlarınıza özel anı defteri. Komik anılar ve ortak hatıralar için.",
    emoji: "🤝",
    gradient: { from: "#1565C0", to: "#42A5F5" },
    category: "Arkadaşlık",
    isAvailable: false,
    editorFields: [],
  },
  {
    id: "wedding",
    name: "Düğün Hikayesi",
    description: "Düğün ve nişan için zarif ve şık bir hikaye şablonu. Çiftlerin yolculuğunu anlatın.",
    emoji: "💍",
    gradient: { from: "#880E4F", to: "#F48FB1" },
    category: "Romantik",
    isAvailable: false,
    editorFields: [],
  },
  {
    id: "travel",
    name: "Seyahat Günlüğü",
    description: "Gezilerinizi ve maceralarınızı hikaye formatında paylaşın. Harita ve konum desteği ile.",
    emoji: "✈️",
    gradient: { from: "#00695C", to: "#4DB6AC" },
    category: "Seyahat",
    isAvailable: false,
    editorFields: [],
  },
  {
    id: "graduation",
    name: "Mezuniyet Anısı",
    description: "Mezuniyet töreninizi ölümsüzleştirin. Okul anıları ve başarılarınızı sergileyin.",
    emoji: "🎓",
    gradient: { from: "#4A148C", to: "#CE93D8" },
    category: "Kutlama",
    isAvailable: false,
    editorFields: [],
  },
];
