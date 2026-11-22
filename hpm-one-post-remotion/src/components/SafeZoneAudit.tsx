import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {SAFE, VIDEO} from '../config';

type Box = {x: number; y: number; w: number; h: number; bad: boolean; label: string};

/** QA overlay: outlines the safe zone and every [data-qa] element (red = outside SAFE). */
export const SafeZoneAudit: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  useLayoutEffect(() => {
    const handle = delayRender('safe-zone audit');
    const raf = requestAnimationFrame(() => {
      const root = ref.current?.parentElement;
      if (!root) return continueRender(handle);
      const rr = root.getBoundingClientRect();
      const s = rr.width / VIDEO.width;
      const out: Box[] = [];
      root.querySelectorAll('[data-qa]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        let o = 1;
        for (let e: Element | null = el; e && e !== root; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
        if (o < 0.05) return;
        const b = {x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s};
        const bad = b.x < SAFE.left - 0.5 || b.y < SAFE.top - 0.5 || b.x + b.w > SAFE.right + 0.5 || b.y + b.h > SAFE.bottom + 0.5;
        out.push({...b, bad, label: (el.textContent ?? '').slice(0, 24)});
      });
      const bad = out.filter((b) => b.bad);
      // eslint-disable-next-line no-console
      console.log(`[safe-zone] frame ${frame}: ${out.length} text boxes, ${bad.length} outside` + bad.map((b) => ` | "${b.label}" x${b.x.toFixed(0)}-${(b.x + b.w).toFixed(0)} y${b.y.toFixed(0)}-${(b.y + b.h).toFixed(0)}`).join(''));
      setBoxes(out);
      continueRender(handle);
    });
    return () => cancelAnimationFrame(raf);
  }, [frame]);
  return (
    <AbsoluteFill ref={ref} style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: '3px dashed #22d3ee'}} />
      {boxes.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, border: `3px solid ${b.bad ? '#ff0055' : '#22c55e'}`}} />
      ))}
    </AbsoluteFill>
  );
};
