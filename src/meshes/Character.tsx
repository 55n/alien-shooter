import { characterMaterial } from "@/physics/Material";
import { usePhysicsWorld } from "@/physics/Physics";
import { useFrame } from "@react-three/fiber";
import * as Cannon from "cannon-es";
import { useEffect, useMemo, useRef } from "react";
import * as Three from "three";

interface CharacterProps {
    name?: string;
    bodyName?: string;
    userData?: {
        type: string
    };
    defaultPosition: Cannon.Vec3;
}

const Character = (props: CharacterProps) => {
    const world = usePhysicsWorld();
    const meshRef = useRef<Three.Mesh>(null);
    const bodyRef = useRef<Cannon.Body>(null);

    const body = useMemo(() => {
        const body = new Cannon.Body({
            mass: 1,
            fixedRotation: true,
            linearDamping: 0,
            angularDamping: 0,
            position: props.defaultPosition,
            material: characterMaterial,
        });

        body.userData = {
            name: props.bodyName
        }

        const cylinderRadius = 0.5;
        const cylinderHeight = 1;
        const cylinderShape = new Cannon.Cylinder(cylinderRadius, cylinderRadius, cylinderHeight, 16);

        const sphereRadius = 0.5;
        const sphereShape = new Cannon.Sphere(sphereRadius);

        body.addShape(cylinderShape, new Cannon.Vec3(0, 0, 0));
        body.addShape(sphereShape, new Cannon.Vec3(0, cylinderHeight / 2, 0));
        body.addShape(sphereShape, new Cannon.Vec3(0, -cylinderHeight / 2, 0));

        return body;
    }, [props.userData]);

    useEffect(() => {
        bodyRef.current = body;
        world.addBody(body);

        return () => {
            if (bodyRef.current) {
                world.removeBody(bodyRef.current);
            }
        }
    }, [world, body]);

    useFrame((state, delta) => {
        if (meshRef.current && bodyRef.current) {
            meshRef.current.position.copy(bodyRef.current.position);
            meshRef.current.quaternion.copy(bodyRef.current.quaternion);
        }
    });

    return (
        <mesh ref={meshRef} userData={props.userData} name={props.name}>
            <capsuleGeometry />
            <meshStandardMaterial />
        </mesh>
    );
}



export default Character;