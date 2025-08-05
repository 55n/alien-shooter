import { useCylinder } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { ReactNode, Ref, useRef } from 'react';
import { Object3D } from 'three';

interface CharacterBodyProps {
    children?: ReactNode;
    position?: [number, number, number];
    radius?: number;
    height?: number;
    mass?: number;
    material?: {
        friction?: number;
        restitution?: number;
    };
    onUpdate?: (ref: Object3D, api: any) => void;
}

const CharacterBody = (({
    children,
    position = [0, 1, 0],
    radius = 0.3,
    height = 1.8,
    mass = 1,
    material = {
        friction: 0.3,
        restitution: 0.01
    },
    onUpdate
}: CharacterBodyProps, ref: Ref<Object3D>) => {
    const meshRef = useRef<Object3D>(null);
    
    // Create capsule-like physics body using cylinder
    // Note: @react-three/cannon doesn't have built-in capsule, so we use cylinder
    // which provides similar smooth collision behavior
    const [cylinderRef, cylinderApi] = useCylinder(() => ({
        mass,
        position,
        args: [radius, radius, height, 8], // radiusTop, radiusBottom, height, numSegments
        material: {
            friction: material.friction || 0.3,
            restitution: material.restitution || 0.01
        },
        // Prevent rotation around X and Z axes (character should stay upright)
        fixedRotation: true,
        // Allow rotation around Y axis for turning
        angularFactor: [0, 1, 0],
        // Low damping for responsive movement
        linearDamping: 0.1,
        angularDamping: 0.8
    }));

    const [topRef, api]
    
    // Update the ref to point to the physics body
    useFrame(() => {
        if (meshRef.current && onUpdate) {
            onUpdate(meshRef.current, api);
        }
        
        // Update external ref if provided
        if (ref && typeof ref !== 'function' && meshRef.current) {
            ref.current = meshRef.current;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Physics body - invisible cylinder */}
            <mesh ref={physicsRef} visible={false}>
                <cylinderGeometry args={[radius, radius, height, 8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            
            {/* Visual representation */}
            <group>
                {children || (
                    /* Default capsule-like visual representation */
                    <group>
                        {/* Main cylinder body */}
                        <mesh position={[0, 0, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[radius, radius, height * 0.7, 12]} />
                            <meshStandardMaterial 
                                color="#4A90E2" 
                                roughness={0.3}
                                metalness={0.1}
                            />
                        </mesh>
                        
                        {/* Top hemisphere */}
                        <mesh position={[0, height * 0.35, 0]} castShadow receiveShadow>
                            <sphereGeometry args={[radius, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                            <meshStandardMaterial 
                                color="#4A90E2" 
                                roughness={0.3}
                                metalness={0.1}
                            />
                        </mesh>
                        
                        {/* Bottom hemisphere */}
                        <mesh position={[0, -height * 0.35, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
                            <sphereGeometry args={[radius, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                            <meshStandardMaterial 
                                color="#4A90E2" 
                                roughness={0.3}
                                metalness={0.1}
                            />
                        </mesh>
                    </group>
                )}
            </group>
        </group>
    );
});

CharacterBody.displayName = 'CharacterBody';

// Export additional utilities for working with character physics
export const CharacterBodyUtils = {
    // Apply movement force to character
    applyMovement: (api: any, direction: [number, number, number], force: number = 10) => {
        api.applyImpulse([
            direction[0] * force,
            direction[1] * force,
            direction[2] * force
        ], [0, 0, 0]);
    },
    
    // Apply jump impulse
    applyJump: (api: any, jumpForce: number = 8) => {
        api.applyImpulse([0, jumpForce, 0], [0, 0, 0]);
    },
    
    // Set character velocity directly
    setVelocity: (api: any, velocity: [number, number, number]) => {
        api.velocity.set(velocity[0], velocity[1], velocity[2]);
    },
    
    // Get character position
    subscribeToPosition: (api: any, callback: (position: [number, number, number]) => void) => {
        return api.position.subscribe(callback);
    },
    
    // Get character velocity
    subscribeToVelocity: (api: any, callback: (velocity: [number, number, number]) => void) => {
        return api.velocity.subscribe(callback);
    }
};

export default CharacterBody;