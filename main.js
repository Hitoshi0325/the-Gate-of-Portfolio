import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { Wireframe } from "three/examples/jsm/Addons.js";

//uiを実装

const gui = new dat.GUI();

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//キャンバスの取得
const canvas = document.querySelector(".webgl");

//カメラ
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.z = 6;
scene.add(camera);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, //背景が真っ黒になるのでこれで透明にする。
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//マテリアル
const material = new THREE.MeshPhysicalMaterial({
  color: "#3c94d7",
  metalness: 0.86,
  roughness: 0.37,
  flatShading: true, //trueでポリゴンが見えるようにする
});

gui.addColor(material, "color");
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);
gui.add(material, "wireframe");
gui.add(material, "visible");

//メッシュ
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 69), material);
const mesh2 = new THREE.Mesh(new THREE.OctahedronGeometry(), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
const mesh4 = new THREE.Mesh(new THREE.IcosahedronGeometry(), material);

//回転させるために配置
mesh1.position.set(2, 0, 0);
mesh2.position.set(-1, 0, 0);
mesh3.position.set(2, 0, -6);
mesh4.position.set(5, 0, 3);

scene.add(mesh1, mesh2, mesh3, mesh4);

const meshes = [mesh1, mesh2, mesh3, mesh4];

//パーティクル追加
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;

const positionArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  positionArray[i] = (Math.random() - 0.5) * 10; //0.5で正と負の領域をとる。

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
}

//パーティクルのマテリアル
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.025,
  color: "#ffffff",
});

//パーティクルメッシュ化
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

//ライト
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
scene.add(directionalLight);
directionalLight.position.set(0.5, 1, 0);

//リサイズ操作
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});

//ホイール実装
let speed = 0;
let rotation = 0;
window.addEventListener("wheel", (event) => {
  speed += event.deltaY * 0.0002;
  //console.log(speed);
});

//回転操作（ホイール）
function rot() {
  rotation += speed;
  speed *= 0.93;

  //ジオメトリ全体を回転

  mesh1.position.x = 2 + 3.8 * Math.cos(rotation); //x軸に対してプラス２、半径３.８を移動
  mesh1.position.z = -3 + 3.8 * Math.sin(rotation); //z軸に対してマイナス３、半径3.8を以蔵

  mesh2.position.x = 2 + 3.8 * Math.cos(rotation + Math.PI / 2); //90度ずれた場所からスタート
  mesh2.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI / 2);

  mesh3.position.x = 2 + 3.8 * Math.cos(rotation) + Math.PI;
  mesh3.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI);

  mesh4.position.x = 2 + 3.8 * Math.cos(rotation + 3 * (Math.PI / 2));
  mesh4.position.z = -3 + 3.8 * Math.sin(rotation + 3 * (Math.PI / 2));

  window.requestAnimationFrame(rot);
}

rot();

//カーソルの一を取得
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

const clock = new THREE.Clock(); //全てのPCでのローテション時間を統一

const animate = () => {
  renderer.render(scene, camera);

  let getDeltaTime = clock.getDelta();

  //mesh操作
  for (const mesh of meshes) {
    mesh.rotation.x += 0.1 * getDeltaTime; //時間反映
    mesh.rotation.y += 0.12 * getDeltaTime; //時間反映
  }

  camera.position.y += -cursor.y * getDeltaTime;
  camera.position.x += cursor.x * getDeltaTime;

  //カメラ制御
  camera.position.x += cursor.x * getDeltaTime;

  window.requestAnimationFrame(animate);
};

animate();
