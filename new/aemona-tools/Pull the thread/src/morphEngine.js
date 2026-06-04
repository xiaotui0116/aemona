export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function flattenPoints(points, frontX, centerY, falloff = 250) {
  return points.map((point) => {
    const distance = frontX - point.x;
    const influence = clamp(distance / falloff, 0, 1);
    return {
      ...point,
      y: point.originalY + (centerY - point.originalY) * influence,
    };
  });
}
