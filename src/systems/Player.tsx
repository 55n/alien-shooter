import Character from '@/meshes/Character';
import { usePhysicsWorld } from '@/physics/Physics';
import { useFrame, useThree } from '@react-three/fiber';
import * as Cannon from 'cannon-es';
import React, { ReactElement, useEffect, useRef } from 'react';
import * as Three from 'three';

interface PlayerProps {
    children: ReactElement<typeof Character>
}

const moveKeys = { forward:false, back:false, left:false, right:false };

function updateMovement(body: Cannon.Body, cameraDirection: Three.Vector3) {
    const speed = 10;
    const direction = new Three.Vector3(0, 0, 0);
    
    // Get camera forward/right vectors
    const forward = new Three.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
    const right = new Three.Vector3().crossVectors(forward, new Three.Vector3(0, 1, 0)).normalize();
  
    if (moveKeys.forward) direction.add(forward);
    if (moveKeys.back) direction.sub(forward);
    if (moveKeys.left) direction.sub(right);
    if (moveKeys.right) direction.add(right);
  
    if (direction.length() > 0) {
        direction.normalize();
        direction.multiplyScalar(speed);
        

        body.velocity.x = direction.x;
        body.velocity.z = direction.z;
    } else {
        // body.velocity.x = 0;
        // body.velocity.z = 0;
        // 감속
        body.velocity.x *= 0.9;
        body.velocity.z *= 0.9;
    }
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

const Player = (props: PlayerProps) => {
    const world = usePhysicsWorld();
    const targetBodyRef = useRef<Cannon.Body>(undefined);
    const { camera } = useThree();
    const directionRef = useRef<Three.Vector3>(new Three.Vector3(0, 0, -1));

    useEffect(() => {
        targetBodyRef.current = world.bodies.find(body => {
            return body.userData?.name === props.children.props.bodyName;
        });

        return () =>  {
            targetBodyRef.current = undefined;
        }
    });

    useEffect(() => {
        document.addEventListener('keydown', keydownEventHandler);
        document.addEventListener('keyup', keyupEventHandler);

        return () => {
            document.removeEventListener('keydown', keydownEventHandler);
            document.removeEventListener('keyup', keyupEventHandler);
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

            updateMovement(targetBodyRef.current, directionRef.current);
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
