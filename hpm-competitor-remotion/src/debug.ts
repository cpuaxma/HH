import {getInputProps} from 'remotion';

/** Temporary profiling switches, passed as input props: {"dbg": "noShadow,noRect"}. */
const raw = String((getInputProps() as {dbg?: string}).dbg ?? '');
export const DBG = new Set(raw.split(',').filter(Boolean));
