import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Object3D } from "three";


const MainControls = () => {
    const controlsRef = useRef<any>(null);
    const heroMeshRef = useRef<Object3D>(undefined);
    const { camera, scene } = useThree();
    
    useEffect(() => {
        heroMeshRef.current = scene.getObjectByName('hero');
        // camera.position.copy(new Vector3(0, 50, 50));
    });

    useFrame(() => {
        if (heroMeshRef.current && controlsRef.current) {
            camera.position.copy(heroMeshRef.current.position);
        }
    });

    return <PointerLockControls ref={controlsRef} />
}

export default MainControls;