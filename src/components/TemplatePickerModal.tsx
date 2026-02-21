"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { TEMPLATES, type TemplateInfo } from "@/lib/templates";

interface TemplatePickerModalProps {
    open: boolean;
    onClose: () => void;
}

export default function TemplatePickerModal({ open, onClose }: TemplatePickerModalProps) {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState<string>("Tümü");

    // Derive unique categories from templates
    const categories = ["Tümü", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

    const filteredTemplates =
        activeCategory === "Tümü"
            ? TEMPLATES
            : TEMPLATES.filter((t) => t.category === activeCategory);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveCategory("Tümü");
                onClose();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        setActiveCategory("Tümü");
        onClose();
    };

    const handleSelectTemplate = (template: TemplateInfo) => {
        if (!template.isAvailable) return;
        handleClose();
        router.push(`/dashboard/editor/new?template=${template.id}`);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
            onClick={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div
                ref={modalRef}
                className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-[scaleUp_0.3s_ease-out]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Şablon Seçin</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Siteniz için bir şablon seçerek başlayın
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Category Filter Bar */}
                <div className="px-6 pt-4 pb-2 flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                activeCategory === cat
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-border"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 150px)" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredTemplates.map((tpl) => (
                            <button
                                key={tpl.id}
                                onClick={() => handleSelectTemplate(tpl)}
                                disabled={!tpl.isAvailable}
                                className={`group relative text-left rounded-xl overflow-hidden border transition-all duration-300 ${
                                    tpl.isAvailable
                                        ? "bg-card border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                                        : "bg-card border-border opacity-50 cursor-not-allowed"
                                }`}
                            >
                                <div
                                    className="h-36 flex items-center justify-center relative"
                                    style={{
                                        background: `linear-gradient(135deg, ${tpl.gradient.from}, ${tpl.gradient.to})`,
                                    }}
                                >
                                    <span
                                        className="text-5xl drop-shadow-md"
                                        style={{ filter: tpl.isAvailable ? "none" : "grayscale(0.5)" }}
                                    >
                                        {tpl.emoji}
                                    </span>

                                    {!tpl.isAvailable && (
                                        <div className="absolute top-2.5 right-2.5 bg-card/90 text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full border border-border">
                                            Yakında
                                        </div>
                                    )}

                                    {tpl.isAvailable && (
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="font-semibold text-foreground text-sm">
                                            {tpl.name}
                                        </h3>
                                        <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                            {tpl.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                        {tpl.description}
                                    </p>

                                    {tpl.isAvailable && (
                                        <div className="mt-3 text-xs font-medium text-primary group-hover:text-accent transition-colors">
                                            Seç ve Başla →
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
