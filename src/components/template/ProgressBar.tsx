interface ProgressBarProps {
  totalSlides: number;
  currentSlide: number;
}

export default function ProgressBar({ totalSlides, currentSlide }: ProgressBarProps) {
  return (
    <div className="progress-container">
      {Array.from({ length: totalSlides }, (_, i) => {
        const slideNum = i + 1;
        let widthStyle = "0%";

        if (slideNum < currentSlide) {
          widthStyle = "100%";
        } else if (slideNum === currentSlide) {
          widthStyle = "50%";
        }

        return (
          <div key={slideNum} className="progress-bar-wrapper">
            <div
              className={`progress-bar ${slideNum < currentSlide ? "completed" : ""}`}
              style={{ width: widthStyle }}
            />
          </div>
        );
      })}
    </div>
  );
}
