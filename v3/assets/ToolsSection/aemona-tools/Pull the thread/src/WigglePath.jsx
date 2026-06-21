import { useEffect, useRef, useState } from 'react';

import { ORIGINAL_PATH } from './paths';
import { samplePath } from './pathSampler';
import { pointsToSmoothPath } from './pathBuilder';
import { flattenPoints } from './morphEngine';

export default function WigglePath() {
  const svgRef = useRef(null);
  const hiddenPathRef = useRef(null);
  const visiblePathRef = useRef(null);

  const originalPointsRef = useRef([]);
  const centerYRef = useRef(0);
  const frontXRef = useRef(0);
  const minXRef = useRef(0);
  const pathWidthRef = useRef(0);
  const svgWidthRef = useRef(0);
  const viewBoxOffsetRef = useRef(0);

  const [sliderValue, setSliderValue] = useState(0);
  const [handleX, setHandleX] = useState(0);

  function render() {
    const visiblePath = visiblePathRef.current;

    if (!visiblePath) return;

    const points = flattenPoints(
      originalPointsRef.current,
      frontXRef.current,
      centerYRef.current,
      120
    );

    visiblePath.setAttribute(
      'd',
      pointsToSmoothPath(points)
    );
  }

  useEffect(() => {
    const svg = svgRef.current;
    const hiddenPath = hiddenPathRef.current;
    const visiblePath = visiblePathRef.current;

    if (!svg || !hiddenPath || !visiblePath) return;

    const originalPoints = samplePath(hiddenPath, 280);

    originalPointsRef.current = originalPoints;

    const ys = originalPoints.map((p) => p.y);

    centerYRef.current =
      (Math.min(...ys) + Math.max(...ys)) / 2;

    const xs = originalPoints.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    minXRef.current = minX;
    pathWidthRef.current = maxX - minX;

    const bbox = hiddenPath.getBBox();

    svg.setAttribute(
      'viewBox',
      `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
    );

    svgWidthRef.current = bbox.width;
    viewBoxOffsetRef.current = bbox.x;

    frontXRef.current = bbox.x;
    setHandleX(bbox.x);

    render();
  }, []);
  function handleSliderChange(event) {
    const normalized =
     parseFloat(event.target.value);

   const falloff = 250;

   // Map slider to actual path center coordinates: 0 -> minX, 1 -> minX + pathWidth
   const minX = minXRef.current;
   const pathWidth = pathWidthRef.current;
  const centerX = minX + normalized * pathWidth;
  // Set front (leading edge) to the right of the slider center so the sweep flattens to the left
  const frontX = centerX + falloff / 2;
  frontXRef.current = frontX;

   const visiblePath = visiblePathRef.current;
   if (!visiblePath) return;

   // special-case: at or very near 100% => fully flatten whole path
   if (normalized >= 0.999) {
     const pts = originalPointsRef.current.map((p) => ({ ...p, y: centerYRef.current }));
     visiblePath.setAttribute('d', pointsToSmoothPath(pts));
     setSliderValue(normalized);
     return;
   }

    setSliderValue(normalized);

    render();
}

  return (
    <div className="wiggle-stage">
      <div className="wiggle-controls">
        <label className="slider-label">

          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={sliderValue}
            onChange={handleSliderChange}
            className="wiggle-slider"
          />
        </label>
      </div>

      <svg
        ref={svgRef}
        className="wiggle-svg"
        width="100%"
        height="100%"
      >
        <path
          ref={hiddenPathRef}
          d={ORIGINAL_PATH}
          fill="none"
          stroke="none"
        />

        <path
          ref={visiblePathRef}
          d={ORIGINAL_PATH}
          fill="none"
          stroke="#9371B6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

    </div>
  );
}
