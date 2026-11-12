import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Form, heroState, barGlow} from '../../heroTrack';
import {barGeometry, bangleGeometry, cubeGeometry, dinarGeometry, goldMaterial, lydianGeometry, NUGGET_PILE, nuggetGeometry, panGeometry, sunGeometry} from './goldForms';

/** The one gold object. Reads its whole life story from heroState(frame). Use inside a ThreeCanvas. */
export const GoldHero3D: React.FC = () => {
  const frame = useCurrentFrame();
  const st = heroState(frame);

  const geo = useMemo(
    () => ({
      nugget: nuggetGeometry(0),
      pile: NUGGET_PILE.map((n) => nuggetGeometry(n.seed)),
      bangle: bangleGeometry(),
      sun: sunGeometry(),
      lydian: lydianGeometry(),
      dinar: dinarGeometry(),
      bar: barGeometry(),
      cube: cubeGeometry(),
      pan: panGeometry(),
      drop: new THREE.SphereGeometry(1, 48, 32),
    }),
    [],
  );
  const mat = useMemo(
    () => ({
      gold: goldMaterial(0.2),
      cube: goldMaterial(0.27),
      hammered: goldMaterial(0.32),
      pan: new THREE.MeshStandardMaterial({color: '#2E333D', metalness: 0.7, roughness: 0.55, side: THREE.DoubleSide}),
      drop: new THREE.MeshStandardMaterial({color: '#FFB347', emissive: new THREE.Color('#FF7A1A'), emissiveIntensity: 2.6, roughness: 0.3, metalness: 0.2}),
    }),
    [],
  );
  // Molten glow, plus extra brilliance for the bar once it breaks free.
  const glow = barGlow(frame);
  mat.gold.emissiveIntensity = st.heat * 2.2;
  mat.hammered.emissiveIntensity = st.heat * 2.2;
  mat.cube.emissiveIntensity = st.heat * 2.2;
  mat.cube.opacity = st.opacity;
  mat.cube.transparent = st.opacity < 1;
  mat.gold.envMapIntensity = 1.3 + glow * 0.6 * (st.parts[0]?.form === 'bar' ? 1 : 0);
  mat.gold.opacity = st.opacity;
  mat.gold.transparent = st.opacity < 1;
  mat.hammered.opacity = st.opacity;
  mat.hammered.transparent = st.opacity < 1;

  const render = (form: Form) => {
    switch (form) {
      case 'nugget':
        return <mesh geometry={geo.nugget} material={mat.gold} />;
      case 'bangle':
        return <mesh geometry={geo.bangle} material={mat.hammered} />;
      case 'sun':
        return <mesh geometry={geo.sun} material={mat.gold} />;
      case 'lydian':
        return (
          <group>
            <mesh geometry={geo.lydian.body} material={mat.hammered} />
            <mesh geometry={geo.lydian.maneG} material={mat.gold} />
            <mesh geometry={geo.lydian.head} material={mat.gold} />
          </group>
        );
      case 'dinar':
        return <mesh geometry={geo.dinar} material={mat.gold} />;
      case 'pile':
        return (
          <group>
            <mesh geometry={geo.pan} material={mat.pan} position={[0, -0.1, 0]} />
            {NUGGET_PILE.map((n, k) => (
              <mesh key={k} geometry={geo.pile[k]} material={mat.gold} position={n.p} scale={n.s} />
            ))}
          </group>
        );
      case 'bar':
        return (
          <group>
            <mesh geometry={geo.bar.body} material={mat.gold} />
            <mesh geometry={geo.bar.plaque} material={mat.gold} />
          </group>
        );
      case 'cube':
        return <mesh geometry={geo.cube} material={mat.cube} />;
      default:
        return null;
    }
  };

  const wob = Math.sin(frame * 0.5) * 0.08;
  return (
    <group position={st.pos} scale={st.scale}>
      {st.parts.map((p, k) => (
        <group key={k} rotation={st.rot} scale={[p.sx * p.s, p.sy * p.s, p.sx * p.s]}>
          {render(p.form)}
        </group>
      ))}
      {st.drop > 0.01 ? <mesh geometry={geo.drop} material={mat.drop} scale={[0.55 * st.drop * (1 + wob), 0.55 * st.drop * (1 - wob), 0.55 * st.drop]} /> : null}
    </group>
  );
};
