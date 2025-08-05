import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { Object3D } from 'three';
import CameraControls from './CameraControls';
import CharacterBody from './CharacterBody';
import Crosshair from './Crosshair';
import DebugPanel from './DebugPanel';
import Door from './Door';
import Ground from './Ground';
import InteractionUI from './InteractionUI';
import NPC from './NPC';
import Obstacle from './Obstacle';
import Physics from './Physics';
import RaycastHighlight from './RaycastHighlight';
import './settings.scss';
import Stairs from './Stairs';
import UpperFloor from './UpperFloor';
import Wall from './Wall';

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
                    <Ground size={[100, 100]} />
                    <Stairs position={[3, 0, -26]} stepCount={15} totalWidth={2.5} />
                    <UpperFloor position={[3, 3, 13]} size={[50, 50]} thickness={0.5} hasRailing={false} />
                    
                    {/* Wall blocks around the upper floor room */}
                    {/* Front wall with door opening */}
                    <Wall position={[3, 5, -12]} size={[50, 4, 0.5]} hasOpening={true} openingSize={[3, 3.8]} openingPosition={0} />
                    
                    {/* Right wall (multiple blocks for better collision) */}
                    <Wall position={[28, 5, 3]} size={[0.5, 4, 15]} />
                    <Wall position={[28, 5, 18]} size={[0.5, 4, 15]} />
                    <Wall position={[28, 5, 33]} size={[0.5, 4, 10]} />
                    
                    {/* Left wall (multiple blocks for better collision) */}
                    <Wall position={[-22, 5, 3]} size={[0.5, 4, 15]} />
                    <Wall position={[-22, 5, 18]} size={[0.5, 4, 15]} />
                    <Wall position={[-22, 5, 33]} size={[0.5, 4, 10]} />
                    
                    {/* Back wall */}
                    <Wall position={[3, 5, 38]} size={[50, 4, 0.5]} />
                    
                    {/* Corner reinforcement blocks */}
                    <Wall position={[27.75, 5, -11.75]} size={[1, 4, 1]} />
                    <Wall position={[-21.75, 5, -11.75]} size={[1, 4, 1]} />
                    <Wall position={[27.75, 5, 37.75]} size={[1, 4, 1]} />
                    <Wall position={[-21.75, 5, 37.75]} size={[1, 4, 1]} />
                    
                    {/* Interior wall blocks to create rooms */}
                    <Wall position={[15, 5, 21]} size={[0.5, 4, 20]} />
                    <Wall position={[-10, 5, 11]} size={[0.5, 4, 25]} />
                    <Wall position={[5, 5, 26]} size={[15, 4, 0.5]} hasOpening={true} openingSize={[2.5, 3]} openingPosition={0.3} />
                    
                    <Door position={[3, 4.5, -12]} size={[2.5, 3.5, 0.15]} />
                    <Obstacle position={[2, 0, 6]} size={1} interactable={true} />
                    <Obstacle position={[-3, 0, 4]} size={1} interactable={true} />
                    <Obstacle position={[0, 0, 8]} size={1.5} interactable={true} />
                    <Obstacle position={[5, 0, 3]} size={0.8} interactable={true} />
                    <Obstacle position={[100, 0, 50]} size={50} interactable={false} color="#606060" />
                    
                    {/* Furniture in the upper room */}
                    <Obstacle position={[8, 3, 19]} size={1.5} interactable={true} color="#8B4513" />
                    <Obstacle position={[-8, 3, 23]} size={1} interactable={true} color="#DEB887" />
                    <Obstacle position={[18, 3, 3]} size={2} interactable={true} color="#A0522D" />
                    <Obstacle position={[-12, 3, 3]} size={1.2} interactable={true} color="#CD853F" />
                    <Obstacle position={[0, 3, 26]} size={1.8} interactable={true} color="#D2691E" />
                    
                    {/* Test CharacterBody */}
                    <CharacterBody 
                        position={[5, 1, 5]} 
                        radius={0.35} 
                        height={1.8} 
                        mass={1}
                        material={{ friction: 0.4, restitution: 0.1 }}
                    ></CharacterBody>
                    <NPC position={[3, 0, 2]} name="Village Guard" />
                    <NPC position={[-2, 0, 7]} name="Merchant" color="#8B4513" />
                    <NPC position={[10, 3.3, 16]} name="Room Guard" color="#4A4A4A" />
                    <NPC position={[-5, 3.3, 21]} name="Archive Keeper" color="#8B4513" />
                    <NPC position={[15, 3.3, 1]} name="Quartermaster" color="#2F4F4F" />
                    <NPC position={[-10, 3.3, 6]} name="Librarian" color="#9932CC" />
                </Physics>

                <CameraControls />
                <RaycastHighlight />
            </Canvas>
        </div>
    );
};

export default App;
