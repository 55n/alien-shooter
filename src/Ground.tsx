import { useBox } from '@react-three/cannon';
import * as THREE from 'three';

interface GroundProps {
    size?: [number, number];
    thickness?: number;
    color?: string;
}

function Ground({ size = [20, 20], thickness = 0.1, color = '#888888' }: GroundProps) {
    const [ref] = useBox(() => ({
        position: [0, -thickness / 2, 0],
        args: [size[0], thickness, size[1]], // width, height, depth
        type: 'Static'
    }));

    return (
        <group>
            {/* Main ground platform */}
            <mesh ref={ref} receiveShadow userData={{ interactable: false, type: 'ground' }}>
                <boxGeometry args={[size[0], thickness, size[1]]} />
                <meshStandardMaterial color={color} />
            </mesh>
            
            {/* Visual border to show ground edges */}
            <lineSegments position={[0, 0.01, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(size[0], 0.02, size[1])]} />
                <lineBasicMaterial color="#ffffff" linewidth={2} />
            </lineSegments>
        </group>
    );
}

export default Ground;