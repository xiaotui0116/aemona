export function pointsToSmoothPath(points) {
  if (!points || points.length === 0) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cx = (prev.x + cur.x) / 2;
    const cy = (prev.y + cur.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${cx} ${cy}`;
  }

  d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}
