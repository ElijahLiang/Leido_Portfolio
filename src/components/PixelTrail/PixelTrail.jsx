import { useEffect, useRef, useCallback } from 'react';

export default function PixelTrail({
  gridSize = 20,
  trailSize = 0.3,
  maxAge = 700,
  interpolate = 5,
  color = '#ffffff',
  gooeyFilter = null,
  gooeyEnabled = false,
  gooStrength = 2,
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const prevMouseRef = useRef({ x: -9999, y: -9999 });
  const pixelsRef = useRef({});
  const animFrameRef = useRef(null);
  const filterId = gooeyFilter?.id || 'pixel-trail-goo';
  const filterStrength = gooeyFilter?.strength ?? gooStrength ?? 2;

  const getPixelKey = (col, row) => `${col},${row}`;

  const activatePixel = useCallback((col, row) => {
    const key = getPixelKey(col, row);
    pixelsRef.current[key] = Date.now();
  }, []);

  const interpolateAndActivate = useCallback((x1, y1, x2, y2, cellSize) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / (cellSize / interpolate)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ix = x1 + dx * t;
      const iy = y1 + dy * t;
      const col = Math.floor(ix / cellSize);
      const row = Math.floor(iy / cellSize);
      activatePixel(col, row);
    }
  }, [interpolate, activatePixel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x, y };
      interpolateAndActivate(
        prevMouseRef.current.x, prevMouseRef.current.y,
        x, y,
        gridSize
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixelDrawSize = gridSize * trailSize;
      const offset = (gridSize - pixelDrawSize) / 2;

      for (const [key, timestamp] of Object.entries(pixelsRef.current)) {
        const age = now - timestamp;
        if (age > maxAge) {
          delete pixelsRef.current[key];
          continue;
        }
        const [col, row] = key.split(',').map(Number);
        const alpha = 1 - age / maxAge;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(
          col * gridSize + offset,
          row * gridSize + offset,
          pixelDrawSize,
          pixelDrawSize
        );
      }
      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, [gridSize, trailSize, maxAge, color, interpolateAndActivate]);

  const filterStyle = gooeyEnabled
    ? { filter: `url(#${filterId})` }
    : {};

  return (
    <>
      {gooeyEnabled && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation={filterStrength * 4} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${18 + filterStrength * 3} -7`}
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          ...filterStyle,
        }}
      />
    </>
  );
}
