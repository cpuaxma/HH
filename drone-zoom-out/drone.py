import cv2, numpy as np, subprocess, sys, math
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
W, H = int(cap.get(3)), int(cap.get(4)); fps = cap.get(5)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
T = 10.5  # seconds for the pull-back
S0, ROT0 = 2.6, 9.0          # start zoom, start yaw (deg)
C0 = (0.5*W, 0.43*H)         # start centered on the cans
C1 = (0.5*W, 0.5*H)
ff = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(fps),'-i','-',
    '-i',src,'-map','0:v','-map','1:a?','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p',
    '-c:a','copy','-movflags','+faststart','-shortest',out], stdin=subprocess.PIPE)
def ease(p):  # smooth start, long glide out
    return 1 - (1-p)**3 if p < 1 else 1.0
def covers(M):
    inv = cv2.invertAffineTransform(M)
    pts = np.array([[0,0,1],[W-1,0,1],[0,H-1,1],[W-1,H-1,1]],float) @ inv.T
    return (pts[:,0]>=0).all() and (pts[:,0]<=W-1).all() and (pts[:,1]>=0).all() and (pts[:,1]<=H-1).all()
i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    t = i/fps; p = ease(min(t/T, 1.0)); q = 1-p
    s = 1 + (S0-1)*q
    ang = ROT0*q
    cx = C0[0]*q + C1[0]*p; cy = C0[1]*q + C1[1]*p
    while True:
        M = cv2.getRotationMatrix2D((cx,cy), ang, s)
        M[:,2] += (W/2-cx, H/2-cy)
        if covers(M) or s > 4: break
        s += 0.005
    g = cv2.warpAffine(f, M, (W,H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    ff.stdin.write(g.tobytes()); i += 1
ff.stdin.close(); ff.wait(); print('frames', i)
