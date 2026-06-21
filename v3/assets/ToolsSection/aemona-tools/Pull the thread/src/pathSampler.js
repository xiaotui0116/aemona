export function samplePath(pathEl, count = 260) {
  const length = pathEl.getTotalLength();
  const points = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const { x, y } = pathEl.getPointAtLength(t * length);
    points.push({ x, y, originalY: y });
  }

  return points;
}
