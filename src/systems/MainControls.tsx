import { usePhysicsWorld } from "@/Physics";
import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as Cannon from 'cannon-es';
import { useEffect, useRef } from "react";
import { Object3D } from "three";

const moveKeys = { forward:false, back:false, left:false, right:false };

function updateMovement(body: Cannon.Body) {
    const speed = 5;
    const velocity = new Cannon.Vec3(0, 0, 0);
  
    if (moveKeys.forward) velocity.z -= 1;
    if (moveKeys.back) velocity.z += 1;
    if (moveKeys.left) velocity.x -= 1;
    if (moveKeys.right) velocity.x += 1;
  
    if (velocity.x !== 0 || velocity.z !== 0) {
      velocity.normalize();
    }
  
    velocity.x *= speed;
    velocity.z *= speed;
    
    body.velocity.x = velocity.x;
    body.velocity.z = velocity.z;
}

function keydownEventHandler(e: KeyboardEvent) {
    if (e.code==='KeyW') moveKeys.forward=true;
    if (e.code==='KeyS') moveKeys.back=true;
    if (e.code==='KeyA') moveKeys.left=true;
    if (e.code==='KeyD') moveKeys.right=true;
}

function keyupEventHandler(e: KeyboardEvent) {
    if (e.code==='KeyW') moveKeys.forward=false;
    if (e.code==='KeyS') moveKeys.back=false;
    if (e.code==='KeyA') moveKeys.left=false;
    if (e.code==='KeyD') moveKeys.right=false;
}

const MainControls = () => {
    const controlsRef = useRef<any>(null);
    const heroMeshRef = useRef<Object3D>(undefined);
    const targetBodyRef = useRef<Cannon.Body>(null);
    const world = usePhysicsWorld();
    const { camera, scene } = useThree();
    
    useEffect(() => {
        heroMeshRef.current = scene.getObjectByName('hero');
    });

    useEffect(() => {
        // 월드에 있는 특정 바디를 찾는 함수
        for (let i = 0; i < world.bodies.length; i++) {
            const body = world.bodies[i];
            if (body.userData.name === 'hero') {
                targetBodyRef.current = body;
            }
        }
    });

    useEffect(() => {
        // --- 입력: 키 ---
        document.addEventListener('keydown', keydownEventHandler);
        document.addEventListener('keyup', keyupEventHandler);

        return () => {
            document.removeEventListener('keydown', keydownEventHandler);
            document.removeEventListener('keydown', keyupEventHandler);
        }
    });

    useFrame(() => {
        if (heroMeshRef.current && controlsRef.current) {
            updateMovement(targetBodyRef.current);

            camera.position.copy(heroMeshRef.current.position);
        }
    });

    return <PointerLockControls ref={controlsRef} />
}

export default MainControls;