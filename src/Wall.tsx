import { useBox } from '@react-three/cannon';

interface WallProps {
    position: [number, number, number];
    size: [number, number, number]; // width, height, depth
    color?: string;
    hasOpening?: boolean;
    openingSize?: [number, number]; // width, height of opening
    openingPosition?: number; // position along the wall (-1 to 1, 0 = center)
}

function Wall({
    position,
    size,
    color = '#8B8B8B',
    hasOpening = false,
    openingSize = [2, 2.5],
    openingPosition = 0
}: WallProps) {
    if (!hasOpening) {
        // Simple solid wall
        const [ref] = useBox(() => ({
            position,
            args: size,
            type: 'Static',
            material: {
                friction: 0.7,
                restitution: 0.1
            }
        }));

        return (
            <mesh ref={ref} castShadow receiveShadow userData={{ interactable: false, type: 'wall' }}>
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} />
            </mesh>
        );
    }

    // Wall with opening (door/window)
    const wallWidth = size[0];
    const wallHeight = size[1];
    const wallDepth = size[2];
    
    const openingWidth = openingSize[0];
    const openingHeight = openingSize[1];
    
    // Calculate opening position along the wall
    const openingOffset = (wallWidth / 2) * openingPosition;
    
    // Calculate wall segments
    const leftWallWidth = (wallWidth - openingWidth) / 2 + openingOffset;
    const rightWallWidth = (wallWidth - openingWidth) / 2 - openingOffset;
    const topWallHeight = wallHeight - openingHeight;
    
    const components = [];
    
    // Left wall segment (if needed)
    if (leftWallWidth > 0.1) {
        components.push(
            <WallSegment
                key="left"
                position={[
                    position[0] - wallWidth/2 + leftWallWidth/2,
                    position[1],
                    position[2]
                ]}
                size={[leftWallWidth, wallHeight, wallDepth]}
                color={color}
            />
        );
    }
    
    // Right wall segment (if needed)  
    if (rightWallWidth > 0.1) {
        components.push(
            <WallSegment
                key="right"
                position={[
                    position[0] + wallWidth/2 - rightWallWidth/2,
                    position[1],
                    position[2]
                ]}
                size={[rightWallWidth, wallHeight, wallDepth]}
                color={color}
            />
        );
    }
    
    // Top wall segment (above opening)
    if (topWallHeight > 0.1) {
        components.push(
            <WallSegment
                key="top"
                position={[
                    position[0] + openingOffset,
                    position[1] + openingHeight/2 + topWallHeight/2,
                    position[2]
                ]}
                size={[openingWidth, topWallHeight, wallDepth]}
                color={color}
            />
        );
    }
    
    return <group>{components}</group>;
}

interface WallSegmentProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function WallSegment({ position, size, color }: WallSegmentProps) {
    const [ref] = useBox(() => ({
        position,
        args: size,
        type: 'Static',
        material: {
            friction: 0.7,
            restitution: 0.1
        }
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow userData={{ interactable: false, type: 'wall' }}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Wall;