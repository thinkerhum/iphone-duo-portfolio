"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type ScreenLayout = { x: number; y: number; scale: number };

type Props = {
  progress: React.RefObject<number>;
  onLayout: (layout: ScreenLayout) => void;
  onReady: () => void;
  onOpen: (open: boolean) => void;
};

const T = (frame: number) => (frame - 1) / 30;
export const END = T(128);
const TILT_Y = -0.535;
const FLOOR_Y = -0.62;
const DISPLAY_W = 1.5696;
const DISPLAY_H = 1.1016;
const FOV = (2 * Math.atan(Math.tan(Math.atan(18 / 70)) / (16 / 9)) * 180) / Math.PI;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const linear = (x: number) => x;
const seg = (t: number, a: number, b: number, e = inOutCubic) => e(clamp01((t - a) / (b - a)));
const lerp = THREE.MathUtils.lerp;

const CAM_A = new THREE.Vector3(0.25, 3.5, 3.9);
const CAM_B = new THREE.Vector3(0.15, 3, 3.6);
const CAM_C = new THREE.Vector3(0, 0.9, 6.6);
const CAM_D = new THREE.Vector3(0, 0, 5.22);
const CURVE = new THREE.QuadraticBezierCurve3(CAM_B, CAM_C, CAM_D);
const BODY = { frame: "#0f1520", back: "#272d37", camera: "#0d131c" };
const X_AXIS = new THREE.Vector3(1, 0, 0);

function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const panels: [number, number, [number, number, number], number, number?][] = [
    [4.2, 2.2, [-3.6, 3.8, 3.4], 7],
    [0.5, 5, [-3.8, 0.6, -2.6], 9, 0xeef3ff],
    [0.5, 5, [3.8, 1, -2.4], 9, 0xfff6f0],
    [3.6, 3.6, [0.4, 5.5, -0.6], 3.2],
    [2.2, 1.3, [3.2, -0.6, 4.4], 1.2],
    [0.35, 4, [4.2, 0.4, 2.2], 4, 0xf4f6ff],
    [6, 0.25, [0, -2.4, -3], 1.2],
  ];
  for (const [w, h, pos, intensity, hex = 0xffffff] of panels) {
    const color = new THREE.Color(hex).multiplyScalar(intensity);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  return env;
}

function floorAlpha() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "#fff");
  grad.addColorStop(0.18, "#d0d0d0");
  grad.addColorStop(0.42, "#484848");
  grad.addColorStop(0.62, "#000");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export default function PhoneScene({ progress, onLayout, onReady, onOpen }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef({ onLayout, onReady, onOpen });
  cb.current = { onLayout, onReady, onOpen };

  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.environment = buildEnvironment(renderer);

    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 60);

    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-2.2, 6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 1, far: 14 });
    key.shadow.radius = 8;
    key.shadow.bias = -4e-4;
    const rim = new THREE.DirectionalLight(0xdfe6ff, 1.6);
    rim.position.set(4, 1.5, -3);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(2.5, 0.5, 5);
    const spot = new THREE.SpotLight(0xffffff, 60, 14, 0.42, 1, 1.6);
    spot.position.set(-0.6, 5.2, 1.4);
    spot.target.position.set(0, FLOOR_Y, 0);
    scene.add(key, rim, fill, spot, spot.target, new THREE.HemisphereLight(0xc8d0ff, 0x000000, 0.35));

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.36, transparent: true, envMapIntensity: 0.8, alphaMap: floorAlpha() });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 96), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = FLOOR_Y;
    floor.receiveShadow = true;
    scene.add(floor);

    let disposed = false;
    let raf = 0;
    let rig: Record<string, THREE.Object3D> | null = null;
    const screenMats: THREE.MeshBasicMaterial[] = [];
    const screenMeshes: THREE.Mesh[] = [];
    let spineBase = new THREE.Vector3();
    let shown = -1;
    let reveal = 0;
    let revealStart = 0;
    let dirty = true;
    let k = 1;
    let isOpen = false;

    const screenTex = new THREE.TextureLoader().load("/assets/screen-ui.jpg", () => { dirty = true; });
    screenTex.flipY = false;
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    screenTex.repeat.set(1 / 0.8042, 1 / 0.7967);
    screenTex.offset.set(-0.1064 / 0.8042, -0.0697 / 0.7967);
    screenTex.wrapS = screenTex.wrapT = THREE.ClampToEdgeWrapping;

    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const target = new THREE.Vector3();

    const pose = (t: number) => {
      if (!rig) return;
      const { HingeL, Cube001, Center, Tilt, Turn } = rig;
      const open = seg(t, T(84), T(128));
      HingeL.rotation.x = lerp(-Math.PI, 0, open);
      if (Cube001) {
        q.setFromAxisAngle(X_AXIS, HingeL.rotation.x * 0.5);
        Cube001.quaternion.copy(q);
        const shut = -HingeL.rotation.x / Math.PI;
        Cube001.position.copy(spineBase).add(v.set(0, 0, -0.0275).applyQuaternion(q));
        Cube001.scale.set(1 + 0.02 * shut, 1 + 0.12 * shut, 1);
        Cube001.position.add(v.set(0, 0, -1).applyQuaternion(q).multiplyScalar(-0.031 * shut));
      }
      Center.position.x = lerp(-0.41, 0, open);
      Tilt.rotation.x = lerp(-Math.PI / 2, 0, seg(t, T(30), T(78)));
      Tilt.position.y = t <= T(52)
        ? lerp(TILT_Y, TILT_Y + 0.45, seg(t, T(30), T(52)))
        : lerp(TILT_Y + 0.45, 0, seg(t, T(52), T(84)));
      Turn.rotation.y = lerp(Math.PI, 0, seg(t, T(34), T(80)));

      floorMat.opacity = 1 - seg(t, T(40), T(70), linear);
      floor.visible = floorMat.opacity > 0.002;
      key.intensity = lerp(3.2, 1.6, seg(t, T(40), T(70)));
      spot.intensity = lerp(60, 0, seg(t, T(36), T(70)));
      const lit = seg(t, T(100), T(126));
      for (const m of screenMats) m.color.setScalar(lit);

      const p = t < T(30)
        ? new THREE.Vector3().lerpVectors(CAM_A, CAM_B, seg(t, 0, T(30), outCubic))
        : CURVE.getPoint(seg(t, T(30), T(128)));
      scene.updateMatrixWorld(true);
      Tilt.getWorldPosition(target);
      camera.position.copy(target).add(p.sub(target).multiplyScalar(k));
      camera.lookAt(target);
    };

    const reportLayout = () => {
      if (!rig) return;
      const { HingeL, Center, Tilt, Turn } = rig;
      const saved = [HingeL.rotation.x, Center.position.x, Tilt.rotation.x, Tilt.position.y, Turn.rotation.y];
      HingeL.rotation.x = 0; Center.position.x = 0; Tilt.rotation.x = 0; Tilt.position.y = 0; Turn.rotation.y = 0;
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3();
      for (const m of screenMeshes) box.expandByObject(m);
      const c = box.getCenter(new THREE.Vector3());
      [HingeL.rotation.x, Center.position.x, Tilt.rotation.x, Tilt.position.y, Turn.rotation.y] = saved;
      scene.updateMatrixWorld(true);
      const cam = camera.clone();
      cam.position.copy(CAM_D).multiplyScalar(k);
      cam.lookAt(0, 0, 0);
      cam.updateMatrixWorld(true);
      const a = new THREE.Vector3(c.x - DISPLAY_W / 2, c.y + DISPLAY_H / 2, box.max.z).project(cam);
      const b = new THREE.Vector3(c.x + DISPLAY_W / 2, c.y - DISPLAY_H / 2, box.max.z).project(cam);
      const vw = window.innerWidth, vh = window.innerHeight;
      cb.current.onLayout({ x: ((a.x + 1) / 2) * vw, y: ((1 - a.y) / 2) * vh, scale: (((b.x - a.x) / 2) * vw) / 1440 });
    };

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      k = Math.max((0.62 * (16 / 9)) / camera.aspect / 0.92, 0.77 / 0.8);
      reportLayout();
      dirty = true;
    };
    resize();
    window.addEventListener("resize", resize);

    new GLTFLoader().load("/assets/duo.json", (gltf) => {
      if (disposed) return;
      const root = gltf.scene;
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const next = mats.map((mat) => {
          const name = mat.name;
          if (name === "Screen.001") {
            const sm = new THREE.MeshBasicMaterial({ map: screenTex, color: 0x000000, toneMapped: false });
            screenMats.push(sm);
            screenMeshes.push(mesh);
            return sm;
          }
          if (name === "Screen.002") return new THREE.MeshBasicMaterial({ color: 0x000000 });
          if (name === "Glass screen") {
            mesh.renderOrder = 2;
            mesh.castShadow = false;
            return new THREE.MeshPhysicalMaterial({
              color: 0x000000, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 0.5,
              transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
            });
          }
          if (name === "Glass сamera") {
            return new THREE.MeshPhysicalMaterial({
              color: 0x05060a, roughness: 0.02, metalness: 0.1, clearcoat: 1, iridescence: 0.35, iridescenceIOR: 1.5, envMapIntensity: 1.4,
            });
          }
          const std = mat as THREE.MeshStandardMaterial;
          if (std.isMeshStandardMaterial) std.envMapIntensity = 1.15;
          if (name === "Frame (Night Sky)") { std.color.set(BODY.frame); std.roughness = 0.28; }
          if (name === "Glass back") { std.color.set(BODY.back); std.roughness = 0.16; std.metalness = 0.15; std.envMapIntensity = 0.9; }
          if (name === "Camera frame") std.color.set(BODY.camera);
          return mat;
        });
        mesh.material = Array.isArray(mesh.material) ? next : next[0];
      });
      scene.add(root);
      const find = (n: string) => root.getObjectByName(n)!;
      rig = { HingeL: find("HingeL"), Cube001: find("Cube001"), Center: find("Center"), Tilt: find("Tilt"), Turn: find("Turn") };
      if (rig.Cube001) spineBase = rig.Cube001.position.clone().add(new THREE.Vector3(0, 0, 0.0275));
      reportLayout();
      revealStart = performance.now();
      renderer.compile(scene, camera);
      cb.current.onReady();
      dirty = true;
    });

    let last = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const ease = 1 - Math.exp(-Math.min(0.1, (now - last) / 1000) * 9);
      last = now;
      if (!rig) return;
      if (reveal < 1) {
        reveal = clamp01((performance.now() - revealStart) / 1400);
        renderer.toneMappingExposure = lerp(0.05, 1.12, outCubic(reveal));
        dirty = true;
      }
      const goal = (progress.current ?? 0) * END;
      const t = shown < 0 ? goal : shown + (goal - shown) * ease;
      if (Math.abs(t - shown) > 1e-5) { shown = Math.abs(goal - t) < 1e-4 ? goal : t; dirty = true; }
      if (!dirty) return;
      dirty = false;
      pose(shown);
      const nowOpen = shown >= END - 0.004;
      if (nowOpen !== isOpen) { isOpen = nowOpen; cb.current.onOpen(nowOpen); }
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [progress]);

  return <div ref={host} className="scene" aria-hidden="true" />;
}
