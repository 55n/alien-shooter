import { forwardRef } from 'react';
import { Object3D } from 'three';
import CharacterBody from './CharacterBody';

interface NPCProps {
    position?: [number, number, number];
    name?: string;
    color?: string;
    radius?: number;
    height?: number;
    mass?: number;
}

const NPC = forwardRef<Object3D, NPCProps>(
    ({ position = [3, 1, 2], name = 'Village Guard', color = '#4a90e2', radius = 0.4, height = 2, mass = 0 }, ref) => {
        // NPC physics update callback
        const handleNPCUpdate = (meshRef: Object3D, bodyRef: any) => {
            // Set userData for identification
            meshRef.userData = {
                type: 'npc',
                name: name,
            };
            (bodyRef as any).userData = {
                type: 'npc',
                name: name,
            };
        };

        return (
            <CharacterBody
                ref={ref}
                position={position}
                radius={radius}
                height={height}
                mass={mass} // Static by default (mass = 0)
                material={{ friction: 0.6, restitution: 0.01 }}
                onUpdate={handleNPCUpdate}
            />
        );
    }
);

NPC.displayName = 'NPC';

export default NPC;
