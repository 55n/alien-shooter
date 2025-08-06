import { useFrame } from '@react-three/fiber';
import * as CANNON from 'cannon-es';
import { forwardRef, useEffect, useRef } from 'react';
import { Object3D } from 'three';
import { usePhysicsWorld } from './Physics';

interface CharacterBodyProps {
    position?: [number, number, number];
    radius?: number;
    height?: number;
    mass?: number;
    material?: {
        friction?: number;
        restitution?: number;
    };
    onUpdate?: (body: CANNON.Body) => void;
}

const CharacterBody = forwardRef<Object3D, CharacterBodyProps>(
    (
        {
            position = [0, 1, 0],
            radius = 0.3,
            height = 1.8,
            mass = 1,
            material = {
                friction: 0.3,
                restitution: 0.01,
            },
            onUpdate,
        },
        ref
    ) => {
        const world = usePhysicsWorld();
        const bodyRef = useRef<CANNON.Body | null>(null);

        useEffect(() => {
            // Create capsule-like physics body using cylinder
            const shape = new CANNON.Cylinder(radius, radius, height, 8);
            const body = new CANNON.Body({
                mass,
                position: new CANNON.Vec3(...position),
                shape: shape,
                material: new CANNON.Material({
                    friction: material.friction || 0.3,
                    restitution: material.restitution || 0.01,
                }),
                // Prevent rotation around X and Z axes (character should stay upright)
                fixedRotation: true,
                // Allow rotation around Y axis for turning
                angularFactor: new CANNON.Vec3(0, 1, 0),
                // Low damping for responsive movement
                linearDamping: 0.1,
                angularDamping: 0.8,
            });

            bodyRef.current = body;
            world.addBody(body);

            return () => {
                if (bodyRef.current) {
                    world.removeBody(bodyRef.current);
                }
            };
        }, [world, position, radius, height, mass, material]);

        // Update the ref to point to the physics body
        useFrame(() => {
            if (bodyRef.current) {
                // Sync mesh position with physics body

                if (onUpdate) {
                    onUpdate(bodyRef.current);
                }
            }
        });

        // Physics-only component - no visual mesh rendering
        return null;
    }
);

CharacterBody.displayName = 'CharacterBody';

// Export additional utilities for working with character physics
export const CharacterBodyUtils = {
    // Apply movement force to character
    applyMovement: (body: CANNON.Body, direction: [number, number, number], force: number = 10) => {
        body.applyImpulse(
            new CANNON.Vec3(direction[0] * force, direction[1] * force, direction[2] * force),
            new CANNON.Vec3(0, 0, 0)
        );
    },

    // Apply jump impulse
    applyJump: (body: CANNON.Body, jumpForce: number = 8) => {
        body.applyImpulse(new CANNON.Vec3(0, jumpForce, 0), new CANNON.Vec3(0, 0, 0));
    },

    // Set character velocity directly
    setVelocity: (body: CANNON.Body, velocity: [number, number, number]) => {
        body.velocity.set(velocity[0], velocity[1], velocity[2]);
    },

    // Get character position
    getPosition: (body: CANNON.Body): [number, number, number] => {
        return [body.position.x, body.position.y, body.position.z];
    },

    // Get character velocity
    getVelocity: (body: CANNON.Body): [number, number, number] => {
        return [body.velocity.x, body.velocity.y, body.velocity.z];
    },
};

export default CharacterBody;
