import { useBox } from '@react-three/cannon';

interface ObstacleProps {
    position: [number, number, number];
    size?: number;
    color?: string;
}

function Obstacle({ position, size = 2, color = '#8866ff' }: ObstacleProps) {
    const halfSize = size / 2;
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1] + halfSize,
        position[2]
    ];

    const [ref] = useBox(() => ({
        position: adjustedPosition,
        args: [size, size, size],
        type: 'Static'
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Obstacle;