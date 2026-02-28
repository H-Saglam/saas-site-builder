export function isWebP(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) {
    return false;
  }
  return (
    buffer.toString("utf8", 0, 4) === "RIFF" &&
    buffer.toString("utf8", 8, 12) === "WEBP"
  );
}
