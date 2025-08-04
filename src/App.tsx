import './settings.scss';
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Object3D } from 'three';
import Physics from './Physics';
import Player from './Player';
import Ground from './Ground';
import Obstacle from './Obstacle';
import NPC from './NPC';
import CameraControls from './CameraControls';
import DebugPanel from './DebugPanel';
import Crosshair from './Crosshair';
import RaycastHighlight from './RaycastHighlight';
import InteractionUI from './InteractionUI';

const App = () => {
    const playerRef = useRef<Object3D | null>(null);

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <DebugPanel />
            <Crosshair />
            <InteractionUI />
            
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
                    <Obstacle position={[2, 0, 6]} size={1} />
                    <Obstacle position={[-3, 0, 4]} size={1} />
                    <Obstacle position={[0, 0, 8]} size={1.5} />
                    <Obstacle position={[5, 0, 3]} size={0.8} />
                    <Obstacle position={[100, 0, 50]} size={50} />
                    <NPC position={[3, 0, 2]} name="Village Guard" />
                    <NPC position={[-2, 0, 7]} name="Merchant" color="#8B4513" />
                </Physics>

                <CameraControls />
                <RaycastHighlight />
            </Canvas>
        </div>
    );
};

export default App;
