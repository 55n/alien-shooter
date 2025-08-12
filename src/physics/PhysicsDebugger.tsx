import { usePhysicsWorld } from "@/physics/Physics";
import { useFrame, useThree } from "@react-three/fiber";
import CannonDebugger from "cannon-es-debugger";
import { useEffect, useRef } from "react";

export const PhysicsDebugger = () => {
    const world = usePhysicsWorld();
    const { scene } = useThree();
    const debuggerRef = useRef<any>(null);

    useEffect(() => {
        if (!world || debuggerRef.current) return;

        const cannonDebugger = CannonDebugger(scene, world);

        debuggerRef.current = cannonDebugger;

        return () => {
            if (debuggerRef.current) {
                debuggerRef.current.detroy();
                debuggerRef.current = null;
            }
        }
    }, [world, scene]);

    useFrame(() => {
        if (debuggerRef.current) {
            debuggerRef.current.update();
        }
    });
    
    return null;
}