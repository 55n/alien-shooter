import { MainControls } from '@/systems/MainControls';
import { Canvas } from '@react-three/fiber';
import Crosshair from './Crosshair';
import Door from './Door';
import Ground from './Ground';
import InteractionUI from './InteractionUI';
import Obstacle from './Obstacle';
import Physics from './Physics';
import Player from './Player';
import RaycastHighlight from './RaycastHighlight';
import Stairs from './Stairs';

const App = () => {
    // const _playerRef = useRef<Object3D | null>(null);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Crosshair />
            <InteractionUI />

            <Canvas camera={{ fov: 75, near: 0.1, far: 100 }} gl={{ antialias: true }} shadows>
                <color attach="background" args={['#27142c']} />

                <hemisphereLight
                    intensity={0.5}
                    args={['#ffffff', '#444444']}
                    position={[0, 20, 0]}
                />

                <Physics>
                    <Ground size={[100, 100]} />
                    <Stairs position={[3, 0, -26]} stepCount={15} totalWidth={2.5} />

                    <Door position={[3, 4.5, -12]} size={[2.5, 3.5, 0.15]} />
                    <Obstacle position={[5, 0, 3]} size={0.8} interactable={true} />
                    <Obstacle
                        position={[100, 0, 50]}
                        size={50}
                        interactable={false}
                        color="#606060"
                    />

                    {/* Furniture in the upper room */}
                    <Obstacle
                        position={[8, 3, 19]}
                        size={1.5}
                        interactable={true}
                        color="#8B4513"
                    />
                    <Obstacle position={[-8, 3, 23]} size={1} interactable={true} color="#DEB887" />
                    <Obstacle
                        position={[-12, 3, 3]}
                        size={1.2}
                        interactable={true}
                        color="#CD853F"
                    />

                    <Player position={[0, 1, 0]} radius={0.3} height={1.8} mass={1} />
                </Physics>

                <MainControls />
                <RaycastHighlight />
            </Canvas>
        </div>
    );
};

export default App;
