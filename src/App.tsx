import './settings.scss';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Object3D } from 'three';
import Physics from './Physics';
import Player from './Player';
import Ground from './Ground';
import Obstacle from './Obstacle';
import CameraControls from './CameraControls';
import DebugPanel from './DebugPanel';

const App = () => {
    const playerRef = useRef<Object3D | null>(null);

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <DebugPanel />
            
            <Canvas
                camera={{ fov: 75, near: 0.1, far: 100 }}
                gl={{ antialias: true }}
                shadows
            >
                <color attach="background" args={['#202020']} />
                
                <hemisphereLight 
                    intensity={0.5} 
                    args={['#ffffff', '#444444']}
                    position={[0, 20, 0]} 
                />
                
                <Physics>
                    <Ground size={[10, 10]} />
                    <Player ref={playerRef} />
                    <Obstacle position={[100, 0, 50]} size={50} />
                    <Obstacle position={[2, 0, 6]} size={1} />
                </Physics>

                <CameraControls />
            </Canvas>
        </div>
    );
};

export default App;
