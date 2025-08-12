import { useFrame } from '@react-three/fiber';
import * as Cannon from 'cannon-es';
import React, { createContext, ReactNode, useContext, useMemo, useRef } from 'react';

interface PhysicsProps {
    children: ReactNode;
    gravity?: [number, number, number];
    step?: number;
}

// Physics context to share the world instance
const PhysicsContext = createContext<Cannon.World | null>(null);

export const usePhysicsWorld = () => {
    const world = useContext(PhysicsContext);
    if (!world) {
        throw new Error('usePhysicsWorld must be used within Physics provider');
    }
    return world;
};

const defaultGravity: [number, number, number] = [0, -9.81, 0];

const Physics = React.memo(({ children, gravity = defaultGravity, step = 1 / 120 }: PhysicsProps) => {
    const lastCallTime = useRef(0);

    // Create physics world
    const world = useMemo(() => {
        const world = new Cannon.World({
            gravity: new Cannon.Vec3(...gravity),
        });

        // Configure world settings
        world.broadphase = new Cannon.SAPBroadphase(world);
        (world.solver as any).iterations = 10;
        (world.solver as any).tolerance = 0.001;
        // world.allowSleep = true;
        // world.broadphase = new Cannon.NaiveBroadphase();

        return world;
    }, []);


    // Step the physics world
    useFrame((state, delta) => {
        const time = performance.now() / 1000;
        if (!lastCallTime.current) {
            lastCallTime.current = time;
        }
        const dt = time - lastCallTime.current;
        lastCallTime.current = time;
        world.step(step, dt, 3);
    });

    return (
        <PhysicsContext.Provider value={world}>
            <group>{children}</group>
        </PhysicsContext.Provider>
    );
});

export default Physics;
