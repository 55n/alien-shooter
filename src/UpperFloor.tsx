import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface UpperFloorProps {
    position?: [number, number, number];
    size?: [number, number];
    thickness?: number;
    color?: string;
    hasRailing?: boolean;
}

function UpperFloor({
    position = [0, 2, 0],
    size = [6, 6],
    thickness = 0.1,
    color = '#666666',
    hasRailing = true
}: UpperFloorProps) {
    // Single reliable physics body for the floor
    const [floorRef] = useBox(() => {
        const floorPhysicsY = position[1] + thickness / 2; // Top surface of floor
        console.log('Floor physics created at:', {
            position: [position[0], floorPhysicsY, position[2]], 
            size: [size[0], thickness, size[1]]
        });
        return {
            position: [position[0], floorPhysicsY, position[2]],
            args: [size[0], thickness, size[1]],
            type: 'Static',
            material: {
                friction: 0.8,
                restitution: 0.1
            }
        };
    });

    const railingHeight = 1.2;
    const railingThickness = 0.1;
    const railingPositions = [
        // Left and right side railings (full length)
        { pos: [position[0] - size[0]/2, position[1] + railingHeight/2, position[2]], size: [railingThickness, railingHeight, size[1]] },
        { pos: [position[0] + size[0]/2, position[1] + railingHeight/2, position[2]], size: [railingThickness, railingHeight, size[1]] },
        
        // Back railing (full width)
        { pos: [position[0], position[1] + railingHeight/2, position[2] + size[1]/2], size: [size[0], railingHeight, railingThickness] }
        // No front railing - this is where stairs connect
    ];

    return (
        <group>
            {/* Main floor with physics */}
            <mesh ref={floorRef} castShadow receiveShadow userData={{ interactable: false, type: 'floor' }}>
                <boxGeometry args={[size[0], thickness, size[1]]} />
                <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Visual border to show floor edges */}
            <lineSegments position={[position[0], position[1] + 0.01, position[2]]}>
                <edgesGeometry args={[new THREE.BoxGeometry(size[0], 0.02, size[1])]} />
                <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>

            {/* Railings */}
            {hasRailing && railingPositions.map((railing, index) => (
                <Railing
                    key={index}
                    position={railing.pos as [number, number, number]}
                    size={railing.size as [number, number, number]}
                    color="#444444"
                />
            ))}
        </group>
    );
}

interface RailingProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function Railing({ position, size, color }: RailingProps) {
    const [ref] = useBox(() => ({
        position,
        args: size,
        type: 'Static',
        material: {
            friction: 0.5,
            restitution: 0.1
        }
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow userData={{ interactable: false, type: 'railing' }}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default UpperFloor;