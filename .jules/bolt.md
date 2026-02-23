## 2025-05-15 - React.memo for Slideshow Performance
**Learning:** In a carousel/slideshow component where only the active slide changes, wrapping individual slide components in `React.memo` prevents unnecessary re-renders of inactive slides.
**Action:** Always consider `React.memo` for list items or slides where only a small subset of items updates frequently.
