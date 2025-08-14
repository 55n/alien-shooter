import Character from '@/meshes/Character';
import { playerGroundContactMaterial } from '@/physics/Material';
import { usePhysicsWorld } from '@/physics/Physics';
import { Pose, useHeroStore } from '@/stores/heroStore';
import { getBodyHeight } from '@/utils/physicsUtils';
import { useFrame, useThree } from '@react-three/fiber';
import * as Cannon from 'cannon-es';
import React, { ReactElement, useEffect, useRef } from 'react';
import * as Three from 'three';

interface PlayerProps {
    children: ReactElement<typeof Character>
}

const Player = (props: PlayerProps) => {
    const world = usePhysicsWorld();
    const targetBodyRef = useRef<Cannon.Body>(undefined);
    const { camera } = useThree();
    const directionRef = useRef<Three.Vector3>(new Three.Vector3(0, 0, -1));
    const wasMoving = useRef<boolean>(false);
    const moveKeysRef = useRef({ 
        forward: false, 
        back: false, 
        left: false, 
        right: false,
        crouch: false,
        crawl: false,
    });
    const heroStore = useHeroStore();
    
    function updateMovement(body: Cannon.Body, cameraDirection: Three.Vector3, speed: number) {
        const direction = new Three.Vector3(0, 0, 0);
        
        // Get camera forward/right vectors
        const forward = new Three.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
        const right = new Three.Vector3().crossVectors(forward, new Three.Vector3(0, 1, 0)).normalize();

        if (moveKeysRef.current.forward) direction.add(forward);
        if (moveKeysRef.current.back) direction.sub(forward);
        if (moveKeysRef.current.left) direction.sub(right);
        if (moveKeysRef.current.right) direction.add(right);
    
        const isMoving = direction.length() > 0;
        
        // Only change friction when movement state changes
        if (isMoving !== wasMoving.current) {
            playerGroundContactMaterial.friction = isMoving ? 0 : 0.3;
            wasMoving.current = isMoving;
        }
      
        if (isMoving) {
            direction.normalize();
            direction.multiplyScalar(speed);
    
            body.velocity.x = direction.x;
            body.velocity.z = direction.z;
        } else {
            // 감속
            body.velocity.x = 0;
            body.velocity.z = 0;
        }
    }

    function updatePose() {
        if (targetBodyRef.current && targetBodyRef.current.world) {
            if (heroStore.pose === Pose.STAND && moveKeysRef.current.crouch) {
                
            }

            const origin = new Cannon.Vec3();
            const height = getBodyHeight(targetBodyRef.current);
            origin.copy(new Cannon.Vec3(
                targetBodyRef.current.position.x,
                targetBodyRef.current.position.y - height / 2,
                targetBodyRef.current.position.z,
            ));

            const result = new Cannon.RaycastResult();
            targetBodyRef.current.world.raycastClosest(origin, new Cannon.Vec3(0, height + 0.1, 0), {}, result);
            
            
        }
    }
    
    function keyDownEventHandler(e: KeyboardEvent) {
        if (e.code==='KeyW') moveKeysRef.current.forward = true;
        if (e.code==='KeyS') moveKeysRef.current.back = true;
        if (e.code==='KeyA') moveKeysRef.current.left = true;
        if (e.code==='KeyD') moveKeysRef.current.right = true;
        if (e.code==='KeyC') moveKeysRef.current.crouch = true;
        if (e.code==='KeyV') moveKeysRef.current.crawl = true;
    }
    
    function keyUpEventHandler(e: KeyboardEvent) {
        if (e.code==='KeyW') moveKeysRef.current.forward = false;
        if (e.code==='KeyS') moveKeysRef.current.back = false;
        if (e.code==='KeyA') moveKeysRef.current.left = false;
        if (e.code==='KeyD') moveKeysRef.current.right = false;
        if (e.code==='KeyC') moveKeysRef.current.crouch = false;
        if (e.code==='KeyV') moveKeysRef.current.crawl = false;
    }
    
    // 플레이어 물리 바디 찾기
    useEffect(() => {
        targetBodyRef.current = world.bodies.find(body => {
            return body.userData?.name === props.children.props.bodyName;
        });

        return () =>  {
            targetBodyRef.current = undefined;
        }
    }, [world]);

    // 플레이어 레이캐스팅
    useEffect(() => {
        
    });

    // 이벤트 등록
    useEffect(() => {
        document.addEventListener('keydown', keyDownEventHandler);
        document.addEventListener('keyup', keyUpEventHandler);

        return () => {
            document.removeEventListener('keydown', keyDownEventHandler);
            document.removeEventListener('keyup', keyUpEventHandler);
        }
    })

    useFrame(() => {
        if (targetBodyRef.current && directionRef.current) {
            camera.getWorldDirection(directionRef.current);

            const targetQuaternion = new Cannon.Quaternion();
            targetQuaternion.setFromAxisAngle(
                new Cannon.Vec3(0, 1, 0), 
                Math.atan2(directionRef.current.x, directionRef.current.z)
            );
            targetBodyRef.current.quaternion.copy(targetQuaternion);

            updateMovement(targetBodyRef.current, directionRef.current, 10);

            camera.position.copy(new Three.Vector3(
                targetBodyRef.current.position.x,
                targetBodyRef.current.position.y + 0.8,
                targetBodyRef.current.position.z
            ));
        }
    });

    const child = React.Children.only(props.children);

    return (
        <>
            { props.children }
        </>
    );
}

export default Player;
