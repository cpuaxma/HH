"use client";
import { useSyncExternalStore } from "react";

export type HeatLevel = 0 | 1 | 2 | 3;

export const LEVELS = [
  {
    name: "Bell pepper",
    shu: "0 SHU",
    scope: "The basics, done right",
    heat: 0.08,
    pepper: "#5f8f2a",
    glow: "196 120 52",
    line: "A clean start for an account that needs the basics done right.",
    includes: ["[Profile audit and fixes]", "[Content plan for one platform]", "[Posting schedule you run]"],
  },
  {
    name: "Jalapeño",
    shu: "2,500–8,000 SHU",
    scope: "Posting and replies",
    heat: 0.36,
    pepper: "#2f5f1f",
    glow: "214 82 38",
    line: "We take over the posting and the replies.",
    includes: ["Everything in Bell pepper, plus", "[Shoots and edits each month]", "[Posting on your behalf]", "[Comment and DM replies]"],
  },
  {
    name: "Cayenne",
    shu: "30,000–50,000 SHU",
    scope: "Plus paid ads",
    heat: 0.66,
    pepper: "#c81d0e",
    glow: "226 59 36",
    line: "Content plus paid reach, measured every month.",
    includes: ["Everything in Jalapeño, plus", "[Paid ad campaigns]", "[Audience targeting and testing]", "[Monthly report and review]"],
  },
  {
    name: "Habanero",
    shu: "100,000–350,000 SHU",
    scope: "Every platform",
    heat: 1,
    pepper: "#f2620c",
    glow: "255 92 22",
    line: "The full team on every platform you use.",
    includes: ["Everything in Cayenne, plus", "[Every platform you use]", "[Launch and campaign support]", "[Weekly check-in call]"],
  },
] as const;

let level: HeatLevel = 2;
const listeners = new Set<() => void>();

function apply(l: HeatLevel) {
  if (typeof document === "undefined") return;
  const s = document.documentElement.style;
  s.setProperty("--heat", String(LEVELS[l].heat));
  s.setProperty("--glow", LEVELS[l].glow);
}

export function setHeat(l: HeatLevel) {
  if (l === level) return;
  level = l;
  apply(l);
  listeners.forEach((fn) => fn());
}

export function getHeat() {
  return level;
}

export function subscribeHeat(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useHeat() {
  return useSyncExternalStore(subscribeHeat, getHeat, () => 2 as HeatLevel);
}
