"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, type TemplateInfo } from "@/lib/templates";

interface TemplatePickerModalProps {
    open: boolean;
    onClose: () => void;
}

export default function TemplatePickerModal({ open, onClose }: TemplatePickerModalProps) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);

    // ESC tuşu ile kapatma
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    // Body scroll lock
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    const handleSelectTemplate = (template: TemplateInfo) => {
        if (!template.isAvailable) return;
        onClose();
        router.push(`/dashboard/editor/new?template=${template.id}`);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            style={{ animation: "fadeIn 0.2s ease-out" }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
                style={{ animation: "slideUp 0.3s ease-out" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Şablon Seçin</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Siteniz için bir şablon seçerek başlayın</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Body — kartlar */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 72px)" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => handleSelectTemplate(tpl)}
                                disabled={!tpl.isAvailable}
                                className={`group relative text-left rounded-xl overflow-hidden border-2 transition-all duration-200 ${tpl.isAvailable
                                        ? "border-gray-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                        : "border-gray-100 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                {/* Gradient preview */}
                                <div
                                    className="h-28 flex items-center justify-center relative"
                                    style={{
                                        background: `linear-gradient(135deg, ${tpl.gradient.from}, ${tpl.gradient.to})`,
                                    }}
                                >
                                    <span className="text-4xl drop-shadow-md" style={{ filter: tpl.isAvailable ? "none" : "grayscale(0.5)" }}>
                                        {tpl.emoji}
                                    </span>

                                    {/* Yakında etiketi */}
                                    {!tpl.isAvailable && (
                                        <div className="absolute top-2 right-2 bg-white/90 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                                            Yakında 🔜
                                        </div>
                                    )}

                                    {/* Hover glow */}
                                    {tpl.isAvailable && (
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                                    )}
                                </div>

                                {/* Kart bilgileri */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800 text-sm">{tpl.name}</h3>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                                            {tpl.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                        {tpl.description}
                                    </p>

                                    {tpl.isAvailable && (
                                        <div className="mt-3 text-xs font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                                            Seç ve Başla →
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Animasyon CSS */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}
