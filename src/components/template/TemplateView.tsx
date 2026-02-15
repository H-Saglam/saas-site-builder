"use client";

import "@/styles/template.css";
import type { SlideData, MusicTrack } from "@/lib/types";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import ProgressBar from "./ProgressBar";
import CoverSlide, { FinaleSlide } from "./CoverSlide";
import PhotoSlide from "./PhotoSlide";
import CollageSlide from "./CollageSlide";
import TextSlide from "./TextSlide";

interface TemplateViewProps {
  recipientName: string;
  slides: SlideData[];
  musicTrack?: MusicTrack | null;
  musicUrl?: string | null;
}

export default function TemplateView({
  recipientName,
  slides,
  musicTrack,
  musicUrl,
}: TemplateViewProps) {
  const totalSlides = slides.length;

  const {
    currentSlide,
    isFirstTap,
    handleClick,
    handleTouchStart,
    handleTouchEnd,
    replay,
    containerRef,
  } = useSlideshow({ totalSlides });

  useAudioPlayer({
    musicUrl: musicUrl || musicTrack?.fileUrl || null,
    currentSlide,
    isFirstTap,
  });

  const renderSlide = (slide: SlideData, index: number) => {
    const slideNum = index + 1;
    const isActive = currentSlide === slideNum;
    const songTitle = musicTrack?.title;
    const songArtist = musicTrack?.artist;

    switch (slide.type) {
      case "cover":
        return (
          <CoverSlide
            key={slideNum}
            recipientName={recipientName}
            subtitle={slide.description}
            gradient={slide.gradient}
            songTitle={songTitle}
            songArtist={songArtist}
            isActive={isActive}
            isFirstTap={isFirstTap}
          />
        );

      case "photo":
        return (
          <PhotoSlide
            key={slideNum}
            heading={slide.heading}
            description={slide.description}
            imageUrl={slide.imageUrl || ""}
            imageAlt={slide.imageAlt}
            gradient={slide.gradient}
            songTitle={songTitle}
            songArtist={songArtist}
            isActive={isActive}
          />
        );

      case "collage":
        return (
          <CollageSlide
            key={slideNum}
            heading={slide.heading}
            description={slide.description}
            collageUrls={slide.collageUrls || []}
            gradient={slide.gradient}
            songTitle={songTitle}
            songArtist={songArtist}
            isActive={isActive}
          />
        );

      case "text":
        return (
          <TextSlide
            key={slideNum}
            heading={slide.heading}
            description={slide.description}
            gradient={slide.gradient}
            songTitle={songTitle}
            songArtist={songArtist}
            isActive={isActive}
          />
        );

      case "finale":
        return (
          <FinaleSlide
            key={slideNum}
            heading={slide.heading}
            description={slide.description}
            imageUrl={slide.imageUrl}
            handPointerText={slide.handPointerText}
            gradient={slide.gradient}
            songTitle={songTitle}
            songArtist={songArtist}
            isActive={isActive}
            onReplay={replay}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="template-container"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ProgressBar totalSlides={totalSlides} currentSlide={currentSlide} />
      <div className="slides-container">
        {slides.map((slide, index) => renderSlide(slide, index))}
      </div>
      <div className="navigation-hint">Devam etmek için tıkla &rarr;</div>
    </div>
  );
}
