import { Physics as CannonPhysics, Debug } from '@react-three/cannon';
import { ReactNode, useEffect } from 'react';
import { useDebugStore } from './stores/debugStore';

interface PhysicsProps {
    children: ReactNode;
    gravity?: [number, number, number];
    step?: number;
}

function Physics({ 
    children, 
    gravity = [0, -9.82, 0]
}: PhysicsProps) {
    const { showPhysicsDebugger, setShowPhysicsDebugger } = useDebugStore();
    
    // Keyboard shortcut to toggle physics debugger
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'p' && event.ctrlKey) {
                event.preventDefault();
                setShowPhysicsDebugger(!showPhysicsDebugger);
                console.log('Physics debugger:', !showPhysicsDebugger ? 'ON' : 'OFF');
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);

    }, [showPhysicsDebugger, setShowPhysicsDebugger]);
    
    return (
        <CannonPhysics 
            gravity={gravity}
            broadphase="Naive"
            allowSleep={false}
            iterations={15}
            tolerance={0.0001}
        >
            {showPhysicsDebugger && (
                <Debug color="green" scale={1.1}>
                    {children}
                </Debug>
            )}
            {!showPhysicsDebugger && children}
        </CannonPhysics>
    );
}

export default Physics;