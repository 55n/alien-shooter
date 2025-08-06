import { ReactNode, useEffect, createContext, useContext } from 'react';
import * as CANNON from 'cannon-es';
import { useFrame } from '@react-three/fiber';
import { useDebugStore } from './stores/debugStore';

interface PhysicsProps {
    children: ReactNode;
    gravity?: [number, number, number];
    step?: number;
}

// Physics context to share the world instance
const PhysicsContext = createContext<CANNON.World | null>(null);

export const usePhysicsWorld = () => {
    const world = useContext(PhysicsContext);
    if (!world) {
        throw new Error('usePhysicsWorld must be used within Physics provider');
    }
    return world;
};

function Physics({ children, gravity = [0, -9.82, 0], step = 1 / 60 }: PhysicsProps) {
    const { showPhysicsDebugger, setShowPhysicsDebugger } = useDebugStore();

    // Create physics world
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(...gravity),
    });

    // Configure world settings
    world.broadphase = new CANNON.NaiveBroadphase();
    (world.solver as any).iterations = 15;
    (world.solver as any).tolerance = 0.0001;
    world.allowSleep = false;

    // Keyboard shortcut to toggle physics debugger
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'p' && event.ctrlKey) {
                event.preventDefault();
                setShowPhysicsDebugger(!showPhysicsDebugger);
                console.log('Physics debugger:', !showPhysicsDebugger ? 'ON' : 'OFF');
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [showPhysicsDebugger, setShowPhysicsDebugger]);

    // Step the physics world
    useFrame((state, delta) => {
        world.fixedStep(step, delta);
    });

    return (
        <PhysicsContext.Provider value={world}>
            <group>{children}</group>
        </PhysicsContext.Provider>
    );
}

export default Physics;
