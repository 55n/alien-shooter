import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Raycaster, Vector2, Vector3, Mesh, Material, MeshStandardMaterial } from 'three';
import { useInteractionStore } from './stores/interactionStore';

function RaycastHighlight() {
    const { camera, scene } = useThree();
    const { setHighlightedObject, setCanInteract, setObjectName, setObjectDistance, setIsInRange } = useInteractionStore();
    const raycaster = useRef(new Raycaster());
    const pointer = useRef(new Vector2(0, 0)); // Center of screen
    const previousHighlighted = useRef<Mesh | null>(null);
    const originalMaterial = useRef<Material | Material[] | null>(null);

    useFrame(() => {
        // Set raycaster from camera through center of screen
        raycaster.current.setFromCamera(pointer.current, camera);

        // Get all intersectable objects from the scene
        const intersects = raycaster.current.intersectObjects(scene.children, true);

        // Reset previous highlight
        if (previousHighlighted.current && originalMaterial.current) {
            previousHighlighted.current.material = originalMaterial.current;
            previousHighlighted.current = null;
            originalMaterial.current = null;
        }

        // Reset interaction state
        setCanInteract(false);
        setHighlightedObject(null);
        setObjectName('');
        setObjectDistance(Infinity);
        setIsInRange(false);

        // Find the first interactable mesh (excluding the player and non-interactable objects)
        for (const intersect of intersects) {
            const object = intersect.object;
            
            // Skip if it's not a mesh
            if (!(object instanceof Mesh)) continue;
            
            // Skip player mesh by checking for domino-like proportions
            const geometry = object.geometry;
            if (geometry && geometry.type === 'BoxGeometry') {
                const box = geometry.parameters;
                // Skip if it looks like our player domino (width=0.6, height=1.8, depth=0.3)
                if (box && Math.abs(box.width - 0.6) < 0.1 && Math.abs(box.height - 1.8) < 0.1) {
                    continue;
                }
            }
            
            // Check if object is marked as interactable
            const isInteractable = object.userData?.interactable !== false;
            if (!isInteractable) {
                continue; // Skip non-interactable objects like walls, floors, stairs
            }

            // Store original material and apply highlight
            originalMaterial.current = object.material;
            previousHighlighted.current = object;

            // Create highlighted material
            if (object.material instanceof MeshStandardMaterial) {
                const highlightedMaterial = object.material.clone();
                highlightedMaterial.emissive.setHex(0x0066ff); // Blue glow
                highlightedMaterial.emissiveIntensity = 0.4;
                // Slightly brighten the base color
                highlightedMaterial.color.multiplyScalar(1.2);
                object.material = highlightedMaterial;
            } else {
                // Fallback for other material types
                const highlightMaterial = new MeshStandardMaterial({
                    color: 0xffffff,
                    emissive: 0x0066ff,
                    emissiveIntensity: 0.4
                });
                object.material = highlightMaterial;
            }

            // Calculate distance from camera to object
            const distance = intersect.distance;
            const maxInteractionDistance = 5.0;
            const isInRange = distance <= maxInteractionDistance;
            
            // Update interaction state
            setHighlightedObject(object);
            setObjectDistance(distance);
            setIsInRange(isInRange);
            setCanInteract(true); // Always show highlight, but interaction depends on range
            
            // Determine object name based on properties or position
            let objectName = 'Object';
            
            // Check for custom object name first
            if (object.userData && object.userData.name) {
                objectName = object.userData.name;
            }
            
            // Check if this is an NPC by looking at the object hierarchy
            let currentObj: any = object;
            let isNPC = false;
            while (currentObj.parent) {
                currentObj = currentObj.parent;
                // Look for NPC indicators in the parent hierarchy
                if (currentObj.userData && currentObj.userData.type === 'npc') {
                    isNPC = true;
                    objectName = currentObj.userData.name || 'NPC';
                    break;
                }
            }
            
            // If not an NPC and no custom name, check for box types
            if (!isNPC && !object.userData?.name && geometry && geometry.type === 'BoxGeometry') {
                const box = geometry.parameters;
                if (box) {
                    const size = Math.max(box.width, box.height, box.depth);
                    // Check object type from userData first
                    if (object.userData?.type === 'obstacle') {
                        if (size > 10) {
                            objectName = 'Large Container';
                        } else if (size > 2) {
                            objectName = 'Storage Box';
                        } else {
                            objectName = 'Small Crate';
                        }
                    } else if (Math.abs(box.width - 0.8) < 0.1 && Math.abs(box.height - 2) < 0.1) {
                        // This is likely an NPC collision box, try to find the NPC name
                        objectName = 'NPC';
                        isNPC = true;
                    }
                }
            }
            setObjectName(objectName);

            break; // Only highlight the first (closest) object
        }
    });

    return null; // This component doesn't render anything visible
}

export default RaycastHighlight;