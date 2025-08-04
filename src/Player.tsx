import { useRef, useEffect, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Object3D, Vector3 } from 'three';
import type { Triplet } from '@react-three/cannon';
import { usePlayerStore } from './stores/playerStore';
import { useCameraStore } from './stores/cameraStore';
import { useDebugStore } from './stores/debugStore';

interface PlayerProps {
    position?: [number, number, number];
    size?: [number, number, number]; // width, height, depth
    mass?: number;
    color?: string;
}

const Player = forwardRef<Object3D, PlayerProps>(({
    position = [0, 2, 0],
    size = [0.6, 1.8, 0.3], // domino proportions: wider than deep, tall
    mass = 1,
    color = '#ffffff' // white like a domino
}, ref) => {
    const { camera } = useThree();
    
    // Zustand stores
    const { 
        keys, 
        setKey, 
        speed,
        setPlayerRef, 
        setPosition,
        setIsGrounded 
    } = usePlayerStore();
    
    const { direction, rotation } = useCameraStore();
    const { setPlayerPosition, setVelocity, setIsGrounded: setDebugIsGrounded } = useDebugStore();

    // Local component state only
    const canJumpRef = useRef(false);
    const velocityRef = useRef<Triplet>([0, 0, 0]);
    const debugUpdateCounter = useRef(0);
    const visualGroupRef = useRef<Object3D>(null);
    
    const [meshRef, api] = useBox(() => ({
        mass,
        position,
        args: size,
        material: {
            friction: 0.4,
            restitution: 0.1
        },
        fixedRotation: true, // prevent box from tipping over
        angularFactor: [0, 1, 0], // only allow Y-axis rotation
        angularDamping: 0.9,
        linearDamping: 0.1
    }));

    const tempForward = useRef(new Vector3());
    const tempRight = useRef(new Vector3());
    const tempMove = useRef(new Vector3());
    const up = useRef(new Vector3(0, 1, 0));

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setKey(event.code.toLowerCase(), true);
            
            if (event.code === 'Space' && canJumpRef.current) {
                api.velocity.set(0, 6, 0);
                canJumpRef.current = false;
                setIsGrounded(false);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            setKey(event.code.toLowerCase(), false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [api, setKey, setIsGrounded]);

    useEffect(() => {
        const unsubscribeVelocity = api.velocity.subscribe((velocity) => {
            velocityRef.current = velocity;
        });

        // Subscribe to position changes from physics body
        const unsubscribePosition = api.position.subscribe((position) => {
            if (meshRef.current) {
                // Directly set the mesh position from physics
                meshRef.current.position.fromArray(position);
                // Update position in store
                setPosition(meshRef.current.position);
            }
        });

        // Simple ground detection - allow jumping when velocity is low
        const checkGrounded = () => {
            const isGrounded = Math.abs(velocityRef.current[1]) < 0.1;
            if (isGrounded) {
                canJumpRef.current = true;
                setIsGrounded(true);
                setDebugIsGrounded(true);
            } else {
                setIsGrounded(false);
                setDebugIsGrounded(false);
            }
        };
        
        const interval = setInterval(checkGrounded, 100);

        return () => {
            unsubscribeVelocity();
            unsubscribePosition();
            clearInterval(interval);
        };
    }, [api, setIsGrounded]);

    useFrame(() => {
        if (!meshRef.current) return;

        camera.getWorldDirection(tempForward.current);
        // Flatten the forward vector to prevent flying when looking up/down
        tempForward.current.y = 0;
        tempForward.current.normalize();
        
        tempRight.current.crossVectors(tempForward.current, up.current).normalize();
        tempMove.current.set(0, 0, 0);

        if (keys.keyw || keys.arrowup) {
            tempMove.current.add(tempForward.current);
        }
        if (keys.keys || keys.arrowdown) {
            tempMove.current.sub(tempForward.current);
        }
        if (keys.keya || keys.arrowleft) {
            tempMove.current.sub(tempRight.current);
        }
        if (keys.keyd || keys.arrowright) {
            tempMove.current.add(tempRight.current);
        }

        if (tempMove.current.lengthSq() > 0) {
            tempMove.current.normalize().multiplyScalar(speed);
            
            api.velocity.set(
                tempMove.current.x,
                velocityRef.current[1],
                tempMove.current.z
            );
        } else {
            // Stop horizontal movement when no keys are pressed
            api.velocity.set(
                0,
                velocityRef.current[1],
                0
            );
        }

        // Update refs and global state
        if (ref && typeof ref !== 'function') {
            ref.current = meshRef.current;
        }

        if (meshRef.current) {
            // Update player ref in store
            setPlayerRef(meshRef.current);
            
            // Rotate visual mesh to follow camera direction (only Y-axis rotation)
            if (visualGroupRef.current) {
                visualGroupRef.current.rotation.y = rotation.theta;
            }
            
            // Update debug info less frequently to reduce unnecessary re-renders
            debugUpdateCounter.current++;
            if (debugUpdateCounter.current % 3 === 0) {
                setPlayerPosition(meshRef.current.position);
                // Update velocity in debug panel
                const vel = new Vector3(velocityRef.current[0], velocityRef.current[1], velocityRef.current[2]);
                setVelocity(vel);
            }
        }
    });

    return (
        <group ref={meshRef}>
            {/* Visual representation - this will rotate */}
            <group ref={visualGroupRef}>
                {/* Main domino body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={size} />
                    <meshStandardMaterial 
                        color={color}
                        roughness={0.3}
                        metalness={0.1}
                    />
                </mesh>
                
                {/* Black center line like a domino */}
                <mesh position={[0, 0, size[2]/2 + 0.001]} castShadow>
                    <boxGeometry args={[size[0] * 0.8, size[1] * 0.1, 0.002]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                
                {/* Dots on top half */}
                <mesh position={[-size[0]/4, size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[size[0]/4, size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                
                {/* Dots on bottom half */}
                <mesh position={[-size[0]/4, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[size[0]/4, -size[1]/4, size[2]/2 + 0.002]} castShadow>
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </group>
        </group>
    );
});

Player.displayName = 'Player';

export default Player;