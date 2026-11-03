import {projectOnPhone} from '../../src/lib/projection';
import {computeCamera} from '../../src/lib/camera';
import {youPose, competitorPose} from '../../src/lib/story';
for (const f of [90, 490, 940]) {
  const c = computeCamera(f, 'vertical');
  const a = projectOnPhone(f, 'vertical', youPose(f), [-0.38, 0.81, 0]);
  const b = projectOnPhone(f, 'vertical', competitorPose(f), [0.38, -0.81, 0]);
  console.log(f, c.fov.toFixed(1), c.dist.toFixed(2), a, b);
}
