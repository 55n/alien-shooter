import { useBox } from '@react-three/cannon';

interface StairsProps {
    position?: [number, number, number];
    stepCount?: number;
    stepWidth?: number;
    stepDepth?: number;
    stepHeight?: number;
    totalWidth?: number;
    color?: string;
}

function Stairs({
    position = [0, 0, 0],
    stepCount = 8,
    stepWidth = 3,
    stepDepth = 0.3,
    stepHeight = 0.2,
    totalWidth = 2,
    color = '#606060'
}: StairsProps) {
    const steps = [];

    for (let i = 0; i < stepCount; i++) {
        const stepY = position[1] + (i + 0.5) * stepHeight;
        const stepZ = position[2] + i * stepDepth;
        
        steps.push(
            <Step
                key={i}
                position={[position[0], stepY, stepZ]}
                size={[totalWidth, stepHeight, stepDepth]}
                color={color}
            />
        );
    }

    return <group>{steps}</group>;
}

interface StepProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
}

function Step({ position, size, color }: StepProps) {
    const [ref] = useBox(() => ({
        position,
        args: size,
        type: 'Static',
        material: {
            friction: 0.8,
            restitution: 0.1
        }
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow userData={{ interactable: false, type: 'stair' }}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

export default Stairs;