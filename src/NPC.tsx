import { useBox } from '@react-three/cannon';
import { useRef, useEffect } from 'react';
import { Group } from 'three';

interface NPCProps {
    position?: [number, number, number];
    name?: string;
    color?: string;
}

function NPC({ 
    position = [3, 1, 2], 
    name = "Village Guard",
    color = '#4a90e2' 
}: NPCProps) {
    const groupRef = useRef<Group>(null);
    
    // Physics body for collision (invisible, just for interaction detection)
    const [bodyRef] = useBox(() => ({
        position,
        args: [0.8, 2, 0.8], // width, height, depth
        type: 'Static' // NPCs don't move with physics
    }));

    // Set userData for identification
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.userData = {
                type: 'npc',
                name: name
            };
        }
        if (bodyRef.current) {
            bodyRef.current.userData = {
                type: 'npc',
                name: name
            };
        }
    }, [name]);

    return (
        <group ref={groupRef} position={position}>
            {/* Physics collision body (invisible) */}
            <mesh ref={bodyRef} visible={false}>
                <boxGeometry args={[0.8, 2, 0.8]} />
                <meshStandardMaterial transparent opacity={0} />
            </mesh>

            {/* Visual NPC model */}
            <group>
                {/* Head */}
                <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="#ffdbac" />
                </mesh>

                {/* Body */}
                <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.7, 0.3]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Arms */}
                <mesh position={[-0.35, 1.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0.35, 1.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.6, 0.15]} />
                    <meshStandardMaterial color={color} />
                </mesh>

                {/* Legs */}
                <mesh position={[-0.15, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.8, 0.15]} />
                    <meshStandardMaterial color="#654321" />
                </mesh>
                <mesh position={[0.15, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.15, 0.8, 0.15]} />
                    <meshStandardMaterial color="#654321" />
                </mesh>

                {/* Simple face features */}
                {/* Eyes */}
                <mesh position={[-0.08, 1.75, 0.14]} castShadow>
                    <sphereGeometry args={[0.02]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <mesh position={[0.08, 1.75, 0.14]} castShadow>
                    <sphereGeometry args={[0.02]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>

                {/* Name tag (floating above head) */}
                <mesh position={[0, 2.1, 0]}>
                    <planeGeometry args={[1, 0.2]} />
                    <meshBasicMaterial 
                        color="rgba(0, 0, 0, 0.7)" 
                        transparent 
                        opacity={0.7}
                    />
                </mesh>
                
                {/* Name text would go here - for now just a colored rectangle */}
                <mesh position={[0, 2.1, 0.01]}>
                    <planeGeometry args={[0.8, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </group>
        </group>
    );
}

export default NPC;