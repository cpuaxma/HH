import React, {createContext, useContext} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';

/**
 * The real (integer) frame, captured outside the motion-blur sampler. Line boil and grain read it
 * so every blur sample of one frame shares the same jitter pattern.
 */
export const RenderFrameContext = createContext(0);
export const useRenderFrame = () => useContext(RenderFrameContext);

const OffsetContext = createContext(0);

/** A named <Sequence> whose children still think in absolute timeline frames (see timeline.ts). */
export const Beat: React.FC<{name: string; from: number; children: React.ReactNode}> = ({
	name,
	from,
	children,
}) => (
	<Sequence name={name} from={from} layout="none">
		<OffsetContext.Provider value={from}>{children}</OffsetContext.Provider>
	</Sequence>
);

/** Absolute timeline frame (fractional while motion blur samples sub-frames). */
export const useTimelineFrame = () => useCurrentFrame() + useContext(OffsetContext);
