import React, {createContext, useContext} from 'react';
import {Scrim} from '../components/Overlays';

/** Vertical centre of the main text block (inside the safe zone, below the arena's centre). */
export const TEXT_Y = 1372;

/** In audit mode (safe-zone check) scrims and decorative layers are hidden so only text remains. */
export const AuditContext = createContext(false);
export const useAudit = () => useContext(AuditContext);

/** A text block centred at y with its scrim. */
export const Block: React.FC<{y?: number; h?: number; scrim?: number; children: React.ReactNode}> = ({y = TEXT_Y, h = 430, scrim = 1, children}) => {
  const audit = useAudit();
  return (
    <>
      {audit ? null : <Scrim y={y} h={h} o={scrim} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>{children}</div>
    </>
  );
};
