import type {MechanismId} from '../../config';
import type {Mechanism} from '../types';
import {chain} from './chain';
import {crack} from './crack';
import {fomo} from './fomo';
import {lever} from './lever';
import {rumor} from './rumor';
import {wander} from './wander';

export const MECHANISMS: Record<MechanismId, Mechanism<any>> = {wander, crack, lever, chain, fomo, rumor};
