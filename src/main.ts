import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import './settings.css';

const FULL_SIZE_WIDTH = window.innerWidth;
const FULL_SIZE_HEIGHT = window.innerHeight;

const renderer = new THREE.WebGLRenderer();

renderer.setSize(FULL_SIZE_WIDTH, FULL_SIZE_HEIGHT);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x202020);

// 직교 카메라
// const aspect = window.innerWidth / window.innerHeight;
// const d = 10;
// const camera = new THREE.OrthographicCamera(
//     -d * aspect, d * aspect,
//     d, -d,
//     0.1, 1000
// );

// 광각 카메라 
const camera = new THREE.PerspectiveCamera(60, FULL_SIZE_WIDTH / FULL_SIZE_HEIGHT, 0.1, 1000);

// 어깨 카메라
// const cameraOffset = new THREE.Vector3(0, 2, -5); // y는 높이, z는 뒤쪽

function updateCamera() {
    // 플레이어 위치 가져오기
    const playerPos = new THREE.Vector3(
        playerBody.position.x,
        playerBody.position.y,
        playerBody.position.z
    );

    const rotatedOffset = cameraOffset.clone().applyQuaternion(playerBody.quaternion);

    // 최종 카메라 위치
    const cameraPos = playerPos.clone().add(rotatedOffset);
    camera.position.copy(cameraPos);

    // 카메라가 플레이어 바라보게

    return cameraPos;
}


// camera.position.y = 10; // 플레이어 눈높이

function resizeRenderer() {
    const width = window.innerWidth - 0.1;
    const height = window.innerHeight - 0.1;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
}

let resizeTimer: number;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeRenderer, 150);
});

window.addEventListener('minimize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeRenderer, 150);
});

const controls = new PointerLockControls(camera, document.body);

document.body.addEventListener('click', () => {
    controls.lock();
});
scene.add(controls.object);

// 중력
import * as CANNON from 'cannon-es';

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
});
world.broadphase = new CANNON.NaiveBroadphase();


// 바닥

const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // 바닥 XZ 평면
world.addBody(groundBody);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ color: 0x888888 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// cannon 플레이어 body
const playerBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(0.5),
    position: new CANNON.Vec3(0, 2, 0),
});
playerBody.fixedRotation = true; // 회전 방지
playerBody.updateMassProperties();
world.addBody(playerBody);

const playerMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
scene.add(playerMesh);





// 박스
function addObstacle(x: number, y: number, z: number, size = 2) {
    const boxGeo = new THREE.BoxGeometry(size, size, size);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x8866ff });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.position.set(x, y + size / 2, z); // 바닥 위에 배치
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape,
        position: new CANNON.Vec3(x, y + size / 2, z),
    });
    world.addBody(body);

    return mesh;
}

addObstacle(100, 0, 50, 50);
addObstacle(2, 0, 6, 1);

// 조명
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);


// 카메라 하이라이팅
let lastHighlightedMesh: THREE.Mesh | null = null;
let originalColor: THREE.Color | null = null;

function highlightMeshInCenter() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(scene.children, true); // true: 자식까지 탐색

    if (intersects.length > 0) {
        const hit = intersects[0].object;

        // 이전 하이라이트 복원
        if (lastHighlightedMesh && originalColor) {
            (lastHighlightedMesh.material as THREE.MeshStandardMaterial).color.copy(originalColor);
            lastHighlightedMesh = null;
            originalColor = null;
        }

        // 현재 hit가 Mesh이면 하이라이트
        if (hit instanceof THREE.Mesh && 'color' in hit.material) {
            const mesh = hit as THREE.Mesh;
            const mat = mesh.material as THREE.MeshStandardMaterial;

            originalColor = mat.color.clone(); // 원래 색 저장
            mat.color.set(0xffff00); // 노란색 하이라이트
            lastHighlightedMesh = mesh;
        }
    } else {
        // 아무것도 안 맞았으면 복원
        if (lastHighlightedMesh && originalColor) {
            (lastHighlightedMesh.material as THREE.MeshStandardMaterial).color.copy(originalColor);
            lastHighlightedMesh = null;
            originalColor = null;
        }
    }
}


// src/main.ts 조작 이동

let canJump = false;

playerBody.addEventListener('collide', (event: any) => {
    const contact = event.contact;

    // 바닥과 충돌한 경우
    const normal = contact.ni.clone();
    if (contact.bi.id === playerBody.id) {
        normal.negate(normal);
    }

    if (normal.y > 0.5) {
        canJump = true;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && canJump) {
        playerBody.velocity.y = 6;
        canJump = false;
    }
});

const keys: Record<string, boolean> = {};
const speed = 10;

// 키 이벤트 리스너
document.addEventListener('keydown', (event) => {
    keys[event.code.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code.toLowerCase()] = false;
});

// 타이머 계산용
let prevTime = performance.now();
const tempForward = new THREE.Vector3();
const tempRight = new THREE.Vector3();
const tempMove = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

const cameraOffset = new THREE.Vector3(0, 2, -5); // 위로 1.5, 뒤로 3


function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    world.step(1 / 60, delta);

    if (controls.isLocked) {
        // 카메라 하이라이팅
        highlightMeshInCenter();

        // 입력 처리
        camera.getWorldDirection(tempForward);
        tempForward.y = 0;
        tempForward.normalize();

        tempRight.crossVectors(tempForward, up).normalize();

        tempMove.set(0, 0, 0);

        if (keys.keyw || keys.arrowup) tempMove.add(tempForward);
        if (keys.keys || keys.arrowdown) tempMove.sub(tempForward);
        if (keys.keya || keys.arrowleft) tempMove.sub(tempRight);
        if (keys.keyd || keys.arrowright) tempMove.add(tempRight);

        if (tempMove.lengthSq() > 0) {
            tempMove.normalize().multiplyScalar(speed);

            playerBody.velocity.set(
                tempMove.x,
                playerBody.velocity.y,
                tempMove.z
            );
        }
    }

    // 플레이어메쉬와 플레이어바디 위치 동기화
    playerMesh.position.copy(playerBody.position);
    playerMesh.quaternion.copy(playerBody.quaternion);

    // 카메라를 플레이어에 맞춤
    controls.object.position.copy(updateCamera());

    renderer.render(scene, camera);
    prevTime = time;
}

animate();
