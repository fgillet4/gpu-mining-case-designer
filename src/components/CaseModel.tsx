import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GPUCase } from '../types';

interface CaseModelProps {
  caseModel: GPUCase;
}

const CaseModel: React.FC<CaseModelProps> = ({ caseModel }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Extract case dimensions
  const { length, width, height } = caseModel.dimensions;
  const { thickness } = caseModel.material;
  const { gpuSlots } = caseModel;
  const { hasDuct, hasTempSensors } = caseModel.thermalManagement;

  // Calculate slot spacing based on case length and GPU count
  const slotSpacing = length / (gpuSlots.length + 1);
  
  // Improved camera positioning for better visibility
  useEffect(() => {
    camera.position.set(length * 0.9, height * 1.2, width * 1.8);
    camera.lookAt(0, 0, 0);
  }, [camera, length, height, width]);
  
  // Add subtle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.08;
    }
  });
  
  // Calculate panel dimensions
  const panelThickness = thickness || 0.25;
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Create materials for transparent acrylic
  const acrylicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xeeeeee,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.95,
    thickness: 0.05,
    side: THREE.DoubleSide
  });
  
  // GPU materials
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0x006600, 
    metalness: 0.1,
    roughness: 0.8
  });
  
  const heatsinkMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.8,
    roughness: 0.3
  });
  
  const fanMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.3,
    roughness: 0.7
  });
  
  // Create acrylic case with interlocking tabs (jigsaw style)
  const createAcrylicCase = () => {
    const caseGroup = new THREE.Group();
    
    // Helper function to create an acrylic panel with cutouts and tabs
    const createPanelWithJigsawTabs = (
      dimensions: [number, number, number],
      position: [number, number, number],
      rotation: [number, number, number] = [0, 0, 0],
      edges: {
        edge: 'top' | 'bottom' | 'left' | 'right',
        hasTabs: boolean,
        tabCount: number
      }[] = [],
      cutouts: {
        shape: 'rectangle' | 'circle' | 'slot',
        width: number,
        height: number,
        x: number,
        y: number,
        count?: [number, number],
        spacing?: [number, number]
      }[] = []
    ) => {
      // Panel dimensions
      const [width, height, depth] = dimensions;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      
      // Create the panel base shape
      const panelShape = new THREE.Shape();
      
      // Tab dimensions
      const tabWidth = width * 0.07;
      const tabHeight = height * 0.07;
      const tabDepth = depth;
      const tabSize = 0.4; // Size relative to edge
      
      // Start with basic rectangle
      let currentX = -halfWidth;
      let currentY = -halfHeight;
      
      // Helper to add jigsaw tabs along an edge
      const addTabsToShape = (
        edge: 'top' | 'bottom' | 'left' | 'right',
        numTabs: number,
        hasTabs: boolean
      ) => {
        switch (edge) {
          case 'bottom':
            // Start from bottom-left corner
            panelShape.moveTo(-halfWidth, -halfHeight);
            
            if (numTabs > 0 && hasTabs) {
              const segmentLength = width / (numTabs * 2);
              
              for (let i = 0; i < numTabs * 2; i++) {
                if (i % 2 === 0) {
                  // Straight segment
                  panelShape.lineTo(-halfWidth + (i + 1) * segmentLength, -halfHeight);
                } else {
                  // Tab or notch
                  if (hasTabs) {
                    // Create protruding tab
                    panelShape.lineTo(-halfWidth + i * segmentLength, -halfHeight - tabSize);
                    panelShape.lineTo(-halfWidth + (i + 1) * segmentLength, -halfHeight - tabSize);
                    panelShape.lineTo(-halfWidth + (i + 1) * segmentLength, -halfHeight);
                  } else {
                    // Create notch for receiving tab
                    panelShape.lineTo(-halfWidth + i * segmentLength, -halfHeight + tabSize);
                    panelShape.lineTo(-halfWidth + (i + 1) * segmentLength, -halfHeight + tabSize);
                    panelShape.lineTo(-halfWidth + (i + 1) * segmentLength, -halfHeight);
                  }
                }
              }
            } else {
              // Straight edge
              panelShape.lineTo(halfWidth, -halfHeight);
            }
            break;
            
          case 'right':
            // Continue from bottom-right corner
            if (numTabs > 0 && hasTabs !== undefined) {
              const segmentLength = height / (numTabs * 2);
              
              for (let i = 0; i < numTabs * 2; i++) {
                if (i % 2 === 0) {
                  // Straight segment
                  panelShape.lineTo(halfWidth, -halfHeight + (i + 1) * segmentLength);
                } else {
                  // Tab or notch
                  if (hasTabs) {
                    // Create protruding tab
                    panelShape.lineTo(halfWidth + tabSize, -halfHeight + i * segmentLength);
                    panelShape.lineTo(halfWidth + tabSize, -halfHeight + (i + 1) * segmentLength);
                    panelShape.lineTo(halfWidth, -halfHeight + (i + 1) * segmentLength);
                  } else {
                    // Create notch for receiving tab
                    panelShape.lineTo(halfWidth - tabSize, -halfHeight + i * segmentLength);
                    panelShape.lineTo(halfWidth - tabSize, -halfHeight + (i + 1) * segmentLength);
                    panelShape.lineTo(halfWidth, -halfHeight + (i + 1) * segmentLength);
                  }
                }
              }
            } else {
              // Straight edge
              panelShape.lineTo(halfWidth, halfHeight);
            }
            break;
            
          case 'top':
            // Continue from top-right corner
            if (numTabs > 0 && hasTabs !== undefined) {
              const segmentLength = width / (numTabs * 2);
              
              for (let i = 0; i < numTabs * 2; i++) {
                if (i % 2 === 0) {
                  // Straight segment
                  panelShape.lineTo(halfWidth - (i + 1) * segmentLength, halfHeight);
                } else {
                  // Tab or notch
                  if (hasTabs) {
                    // Create protruding tab
                    panelShape.lineTo(halfWidth - i * segmentLength, halfHeight + tabSize);
                    panelShape.lineTo(halfWidth - (i + 1) * segmentLength, halfHeight + tabSize);
                    panelShape.lineTo(halfWidth - (i + 1) * segmentLength, halfHeight);
                  } else {
                    // Create notch for receiving tab
                    panelShape.lineTo(halfWidth - i * segmentLength, halfHeight - tabSize);
                    panelShape.lineTo(halfWidth - (i + 1) * segmentLength, halfHeight - tabSize);
                    panelShape.lineTo(halfWidth - (i + 1) * segmentLength, halfHeight);
                  }
                }
              }
            } else {
              // Straight edge
              panelShape.lineTo(-halfWidth, halfHeight);
            }
            break;
            
          case 'left':
            // Continue from top-left back to start
            if (numTabs > 0 && hasTabs !== undefined) {
              const segmentLength = height / (numTabs * 2);
              
              for (let i = 0; i < numTabs * 2; i++) {
                if (i % 2 === 0) {
                  // Straight segment
                  panelShape.lineTo(-halfWidth, halfHeight - (i + 1) * segmentLength);
                } else {
                  // Tab or notch
                  if (hasTabs) {
                    // Create protruding tab
                    panelShape.lineTo(-halfWidth - tabSize, halfHeight - i * segmentLength);
                    panelShape.lineTo(-halfWidth - tabSize, halfHeight - (i + 1) * segmentLength);
                    panelShape.lineTo(-halfWidth, halfHeight - (i + 1) * segmentLength);
                  } else {
                    // Create notch for receiving tab
                    panelShape.lineTo(-halfWidth + tabSize, halfHeight - i * segmentLength);
                    panelShape.lineTo(-halfWidth + tabSize, halfHeight - (i + 1) * segmentLength);
                    panelShape.lineTo(-halfWidth, halfHeight - (i + 1) * segmentLength);
                  }
                }
              }
            } else {
              // Straight edge
              panelShape.lineTo(-halfWidth, -halfHeight);
            }
            break;
        }
      };
      
      // Process each edge with tabs or notches
      let hasDefinedEdges = edges.length > 0;
      
      if (hasDefinedEdges) {
        // Start with bottom edge
        const bottomEdge = edges.find(e => e.edge === 'bottom');
        addTabsToShape('bottom', bottomEdge?.tabCount || 0, bottomEdge?.hasTabs || false);
        
        // Right edge
        const rightEdge = edges.find(e => e.edge === 'right');
        addTabsToShape('right', rightEdge?.tabCount || 0, rightEdge?.hasTabs || false);
        
        // Top edge
        const topEdge = edges.find(e => e.edge === 'top');
        addTabsToShape('top', topEdge?.tabCount || 0, topEdge?.hasTabs || false);
        
        // Left edge
        const leftEdge = edges.find(e => e.edge === 'left');
        addTabsToShape('left', leftEdge?.tabCount || 0, leftEdge?.hasTabs || false);
      } else {
        // Simple rectangle if no edges defined
        panelShape.moveTo(-halfWidth, -halfHeight);
        panelShape.lineTo(halfWidth, -halfHeight);
        panelShape.lineTo(halfWidth, halfHeight);
        panelShape.lineTo(-halfWidth, halfHeight);
        panelShape.lineTo(-halfWidth, -halfHeight);
      }
      
      // Add cutouts based on parameters
      cutouts.forEach(cutout => {
        // For each cutout, create appropriate shape
        if (cutout.shape === 'rectangle') {
          const cutoutX = cutout.x - cutout.width / 2;
          const cutoutY = cutout.y - cutout.height / 2;
          
          if (cutout.count && cutout.spacing) {
            // Create grid of cutouts
            const [countX, countY] = cutout.count;
            const [spacingX, spacingY] = cutout.spacing;
            
            for (let i = 0; i < countX; i++) {
              for (let j = 0; j < countY; j++) {
                const x = cutoutX + i * spacingX;
                const y = cutoutY + j * spacingY;
                
                const hole = new THREE.Path();
                hole.moveTo(x, y);
                hole.lineTo(x + cutout.width, y);
                hole.lineTo(x + cutout.width, y + cutout.height);
                hole.lineTo(x, y + cutout.height);
                hole.lineTo(x, y);
                
                panelShape.holes.push(hole);
              }
            }
          } else {
            // Create single cutout
            const hole = new THREE.Path();
            hole.moveTo(cutoutX, cutoutY);
            hole.lineTo(cutoutX + cutout.width, cutoutY);
            hole.lineTo(cutoutX + cutout.width, cutoutY + cutout.height);
            hole.lineTo(cutoutX, cutoutY + cutout.height);
            hole.lineTo(cutoutX, cutoutY);
            
            panelShape.holes.push(hole);
          }
        } else if (cutout.shape === 'circle') {
          const hole = new THREE.Path()
            .absarc(cutout.x, cutout.y, cutout.width / 2, 0, Math.PI * 2, false);
          
          if (cutout.count && cutout.spacing) {
            // Create grid of circular cutouts
            const [countX, countY] = cutout.count;
            const [spacingX, spacingY] = cutout.spacing;
            
            for (let i = 0; i < countX; i++) {
              for (let j = 0; j < countY; j++) {
                const x = cutout.x + (i - Math.floor(countX/2)) * spacingX;
                const y = cutout.y + (j - Math.floor(countY/2)) * spacingY;
                
                const circleHole = new THREE.Path()
                  .absarc(x, y, cutout.width / 2, 0, Math.PI * 2, false);
                
                panelShape.holes.push(circleHole);
              }
            }
          } else {
            panelShape.holes.push(hole);
          }
        } else if (cutout.shape === 'slot') {
          // Create a rounded rectangle slot
          const slotPath = new THREE.Path();
          const radius = cutout.height / 2;
          const cutoutX = cutout.x - cutout.width / 2;
          const cutoutY = cutout.y - cutout.height / 2;
          
          slotPath.moveTo(cutoutX + radius, cutoutY);
          slotPath.lineTo(cutoutX + cutout.width - radius, cutoutY);
          slotPath.absarc(cutoutX + cutout.width - radius, cutoutY + radius, radius, -Math.PI / 2, 0, false);
          slotPath.lineTo(cutoutX + cutout.width, cutoutY + cutout.height - radius);
          slotPath.absarc(cutoutX + cutout.width - radius, cutoutY + cutout.height - radius, radius, 0, Math.PI / 2, false);
          slotPath.lineTo(cutoutX + radius, cutoutY + cutout.height);
          slotPath.absarc(cutoutX + radius, cutoutY + cutout.height - radius, radius, Math.PI / 2, Math.PI, false);
          slotPath.lineTo(cutoutX, cutoutY + radius);
          slotPath.absarc(cutoutX + radius, cutoutY + radius, radius, Math.PI, Math.PI * 3 / 2, false);
          
          if (cutout.count && cutout.spacing) {
            // Create grid of slots
            const [countX, countY] = cutout.count;
            const [spacingX, spacingY] = cutout.spacing;
            
            for (let i = 0; i < countX; i++) {
              for (let j = 0; j < countY; j++) {
                const x = (i - Math.floor(countX/2)) * spacingX;
                const y = (j - Math.floor(countY/2)) * spacingY;
                
                // Create a new path with translated coordinates
                const slotClone = new THREE.Path();
                
                // Recreate the slot path with translated coordinates
                const radius = cutout.height / 2;
                const newCutoutX = cutout.x - cutout.width / 2 + x;
                const newCutoutY = cutout.y - cutout.height / 2 + y;
                
                slotClone.moveTo(newCutoutX + radius, newCutoutY);
                slotClone.lineTo(newCutoutX + cutout.width - radius, newCutoutY);
                slotClone.absarc(newCutoutX + cutout.width - radius, newCutoutY + radius, radius, -Math.PI / 2, 0, false);
                slotClone.lineTo(newCutoutX + cutout.width, newCutoutY + cutout.height - radius);
                slotClone.absarc(newCutoutX + cutout.width - radius, newCutoutY + cutout.height - radius, radius, 0, Math.PI / 2, false);
                slotClone.lineTo(newCutoutX + radius, newCutoutY + cutout.height);
                slotClone.absarc(newCutoutX + radius, newCutoutY + cutout.height - radius, radius, Math.PI / 2, Math.PI, false);
                slotClone.lineTo(newCutoutX, newCutoutY + radius);
                slotClone.absarc(newCutoutX + radius, newCutoutY + radius, radius, Math.PI, Math.PI * 3 / 2, false);
                
                panelShape.holes.push(slotClone);
              }
            }
          } else {
            panelShape.holes.push(slotPath);
          }
        }
      });
      
      // Create extruded geometry from shape
      const panelGeometry = new THREE.ExtrudeGeometry(panelShape, {
        depth: depth,
        bevelEnabled: false
      });
      
      // Create mesh and apply material
      const panelMesh = new THREE.Mesh(panelGeometry, acrylicMaterial);
      
      // Apply rotation and position
      panelMesh.rotation.set(...rotation);
      
      // Adjust position based on rotation
      let adjustedPosition = [...position];
      if (rotation[0] !== 0 || rotation[1] !== 0 || rotation[2] !== 0) {
        if (Math.abs(rotation[0]) === Math.PI/2) {
          adjustedPosition[1] += depth/2 * (rotation[0] > 0 ? -1 : 1);
        }
        if (Math.abs(rotation[1]) === Math.PI/2) {
          adjustedPosition[0] += depth/2 * (rotation[1] > 0 ? 1 : -1);
        }
      }
      
      panelMesh.position.set(...adjustedPosition);
      
      return panelMesh;
    };
    
    // Create top panel with exhaust vents and tabs
    const topPanel = createPanelWithJigsawTabs(
      [length - panelThickness*2, width - panelThickness*2, panelThickness],
      [0, halfHeight, 0],
      [0, 0, 0],
      [
        { edge: 'bottom', hasTabs: false, tabCount: 2 }, // Notches to receive tabs from side panels
        { edge: 'left', hasTabs: false, tabCount: 2 },
        { edge: 'right', hasTabs: false, tabCount: 2 },
        { edge: 'top', hasTabs: false, tabCount: 2 }
      ],
      [
        // Circular exhaust vents
        {
          shape: 'circle',
          width: width * 0.1,
          height: width * 0.1,
          x: 0,
          y: 0,
          count: [5, 5],
          spacing: [width * 0.15, width * 0.15]
        }
      ]
    );
    caseGroup.add(topPanel);
    
    // Create bottom panel with mounting holes and tabs
    const bottomPanel = createPanelWithJigsawTabs(
      [length - panelThickness*2, width - panelThickness*2, panelThickness],
      [0, -halfHeight, 0],
      [0, 0, 0],
      [
        { edge: 'top', hasTabs: false, tabCount: 2 }, // Notches to receive tabs from side panels
        { edge: 'left', hasTabs: false, tabCount: 2 },
        { edge: 'right', hasTabs: false, tabCount: 2 },
        { edge: 'bottom', hasTabs: false, tabCount: 2 }
      ],
      [
        // Motherboard mounting holes
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: -length * 0.3,
          y: -width * 0.3
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: -length * 0.3,
          y: width * 0.1
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: -length * 0.1,
          y: -width * 0.3
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: -length * 0.1,
          y: width * 0.1
        },
        // PSU mounting holes
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: length * 0.25,
          y: -width * 0.25
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: length * 0.25,
          y: width * 0.25
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: length * 0.4,
          y: -width * 0.25
        },
        {
          shape: 'circle',
          width: 0.2,
          height: 0.2,
          x: length * 0.4,
          y: width * 0.25
        },
        // Cable management holes
        {
          shape: 'circle',
          width: 0.8,
          height: 0.8,
          x: -halfLength * 0.5,
          y: 0
        },
        {
          shape: 'circle',
          width: 0.8,
          height: 0.8,
          x: halfLength * 0.5,
          y: 0
        },
        {
          shape: 'circle',
          width: 0.8,
          height: 0.8,
          x: 0,
          y: -width * 0.3
        }
      ]
    );
    caseGroup.add(bottomPanel);
    
    // Create front panel with intake slits and tabs
    const frontPanel = createPanelWithJigsawTabs(
      [length - panelThickness*2, height - panelThickness*2, panelThickness],
      [0, 0, -halfWidth],
      [0, 0, 0],
      [
        { edge: 'left', hasTabs: true, tabCount: 2 }, // Tabs that insert into side panels
        { edge: 'right', hasTabs: true, tabCount: 2 },
        { edge: 'top', hasTabs: true, tabCount: 2 },
        { edge: 'bottom', hasTabs: true, tabCount: 2 }
      ],
      // Add intake slits
      Array.from({ length: 6 }).map((_, i) => ({
        shape: 'slot',
        width: length * 0.1,
        height: 0.4,
        x: -length * 0.35 + (i * length * 0.14),
        y: -height * 0.25,
        count: [1, 5],
        spacing: [0, height * 0.12]
      }))
    );
    caseGroup.add(frontPanel);
    
    // Create back panel with exhaust, I/O cutouts, and tabs
    const backPanel = createPanelWithJigsawTabs(
      [length - panelThickness*2, height - panelThickness*2, panelThickness],
      [0, 0, halfWidth],
      [0, 0, 0],
      [
        { edge: 'left', hasTabs: true, tabCount: 2 }, // Tabs that insert into side panels
        { edge: 'right', hasTabs: true, tabCount: 2 },
        { edge: 'top', hasTabs: true, tabCount: 2 },
        { edge: 'bottom', hasTabs: true, tabCount: 2 }
      ],
      [
        // Main central exhaust
        {
          shape: 'rectangle',
          width: length * 0.4,
          height: height * 0.4,
          x: 0,
          y: height * 0.1
        },
        // Power supply cutout
        {
          shape: 'rectangle',
          width: 3,
          height: 1.5,
          x: length * 0.25,
          y: -height * 0.25
        },
        // I/O cutout
        {
          shape: 'rectangle',
          width: 2.5,
          height: 1,
          x: -length * 0.25,
          y: -height * 0.25
        }
      ]
    );
    caseGroup.add(backPanel);
    
    // Create left side panel with ventilation pattern and tabs
    const leftPanel = createPanelWithJigsawTabs(
      [height - panelThickness*2, width - panelThickness*2, panelThickness],
      [-halfLength, 0, 0],
      [0, Math.PI/2, 0],
      [
        { edge: 'left', hasTabs: true, tabCount: 2 }, // Tabs that insert into front/back panels
        { edge: 'right', hasTabs: true, tabCount: 2 },
        { edge: 'top', hasTabs: true, tabCount: 2 }, 
        { edge: 'bottom', hasTabs: true, tabCount: 2 }
      ],
      // Ventilation slots
      Array.from({ length: 4 }).map((_, i) => ({
        shape: 'slot',
        width: width * 0.15,
        height: 0.4,
        x: -width * 0.35 + (i * width * 0.2),
        y: 0,
        count: [1, 4],
        spacing: [0, height * 0.15]
      }))
    );
    caseGroup.add(leftPanel);
    
    // Create right side panel with ventilation pattern and tabs
    const rightPanel = createPanelWithJigsawTabs(
      [height - panelThickness*2, width - panelThickness*2, panelThickness],
      [halfLength, 0, 0],
      [0, Math.PI/2, 0],
      [
        { edge: 'left', hasTabs: true, tabCount: 2 }, // Tabs that insert into front/back panels
        { edge: 'right', hasTabs: true, tabCount: 2 },
        { edge: 'top', hasTabs: true, tabCount: 2 },
        { edge: 'bottom', hasTabs: true, tabCount: 2 }
      ],
      // Ventilation slots
      Array.from({ length: 4 }).map((_, i) => ({
        shape: 'slot',
        width: width * 0.15,
        height: 0.4,
        x: -width * 0.35 + (i * width * 0.2),
        y: 0,
        count: [1, 4],
        spacing: [0, height * 0.15]
      }))
    );
    caseGroup.add(rightPanel);
    
    // Create GPU support rails
    const createGpuRail = (isLeft: boolean) => {
      // Create the rail with jigsaw tabs
      const railLength = length - panelThickness * 4;
      const railWidth = panelThickness;
      const railHeight = panelThickness * 2;
      const railZ = isLeft ? -width * 0.25 : width * 0.25;
      const railY = -height * 0.25;
      
      // Main rail base
      const railShape = new THREE.Shape();
      railShape.moveTo(-railLength/2, -railHeight/2);
      railShape.lineTo(railLength/2, -railHeight/2);
      railShape.lineTo(railLength/2, railHeight/2);
      railShape.lineTo(-railLength/2, railHeight/2);
      railShape.lineTo(-railLength/2, -railHeight/2);
      
      // Add GPU mounting slots to rail
      for (let i = 0; i < gpuSlots.length; i++) {
        const slotPos = slotSpacing * (i + 1) - length / 2 + panelThickness * 2;
        const slotRelativeX = slotPos + railLength/2; // Convert to relative position on rail
        
        // Create T-shaped tab for holding GPU
        const tabWidth = panelThickness;
        const tabHeight = railHeight + panelThickness;
        
        // Base of tab
        const tabBase = new THREE.Mesh(
          new THREE.BoxGeometry(tabWidth, tabHeight, railWidth * 3),
          acrylicMaterial
        );
        tabBase.position.set(slotPos, railY, railZ);
        caseGroup.add(tabBase);
        
        // Add slot label
        const labelGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x777777 });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.position.set(slotPos, railY - 0.4, railZ + (isLeft ? -0.4 : 0.4));
        caseGroup.add(label);
      }
      
      // Create the rail
      const railGeometry = new THREE.ExtrudeGeometry(railShape, {
        depth: railWidth,
        bevelEnabled: false
      });
      
      const rail = new THREE.Mesh(railGeometry, acrylicMaterial);
      rail.position.set(0, railY, railZ);
      
      return rail;
    };
    
    // Add GPU rails
    caseGroup.add(createGpuRail(true));
    caseGroup.add(createGpuRail(false));
    
    return caseGroup;
  };
  
  // Create simplified GPU models
  const createGPU = (gpu: any, position: THREE.Vector3) => {
    const gpuGroup = new THREE.Group();
    gpuGroup.position.copy(position);
    
    // PCB
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(gpu.length * 0.9, 0.1, gpu.width * 0.9),
      pcbMaterial
    );
    pcb.position.set(0, 0, 0);
    gpuGroup.add(pcb);
    
    // Gold edge connector
    const connector = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 0.3),
      new THREE.MeshStandardMaterial({ 
        color: 0xd4af37, 
        metalness: 0.9,
        roughness: 0.1 
      })
    );
    connector.position.set(0, -0.1, 0);
    gpuGroup.add(connector);
    
    // Heatsink
    const heatsink = new THREE.Mesh(
      new THREE.BoxGeometry(gpu.length * 0.8, 0.5, gpu.width * 0.8),
      heatsinkMaterial
    );
    heatsink.position.set(0, 0.3, 0);
    gpuGroup.add(heatsink);
    
    // Simplified cooling fans
    const fanCount = 2;
    const fanSpacing = gpu.length * 0.5 / (fanCount);
    
    for (let i = 0; i < fanCount; i++) {
      const fanX = -gpu.length * 0.2 + i * fanSpacing;
      
      // Fan frame
      const fanFrame = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16),
        fanMaterial
      );
      fanFrame.rotation.x = Math.PI / 2;
      fanFrame.position.set(fanX, 0.4, 0);
      gpuGroup.add(fanFrame);
      
      // Fan center
      const fanCenter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      fanCenter.rotation.x = Math.PI / 2;
      fanCenter.position.set(fanX, 0.41, 0);
      gpuGroup.add(fanCenter);
      
      // Simplified fan blades
      const fanBlades = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.15, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
      );
      fanBlades.rotation.x = Math.PI / 2;
      fanBlades.position.set(fanX, 0.41, 0);
      gpuGroup.add(fanBlades);
    }
    
    // Power connector
    const powerConnector = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    powerConnector.position.set(gpu.length * 0.3, 0.3, 0);
    gpuGroup.add(powerConnector);
    
    return gpuGroup;
  };
  
  // Central air duct system for optimal thermal management
  const createAirManagement = () => {
    if (!hasDuct) return null;
    
    const ductSystem = new THREE.Group();
    
    // Central collection chamber - transparent acrylic
    const centralChamber = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.5, height * 0.2, width * 0.5),
      new THREE.MeshPhysicalMaterial({
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.2,
        metalness: 0.1,
        roughness: 0.05,
        clearcoat: 1.0,
        transmission: 0.9
      })
    );
    centralChamber.position.set(0, height * 0.2, 0);
    ductSystem.add(centralChamber);
    
    // Collection ducts from each GPU - transparent acrylic tubes
    gpuSlots.forEach((gpu, idx) => {
      const gpuX = slotSpacing * (idx + 1) - length / 2;
      
      // Create collection duct using CatmullRomCurve for smooth path
      const ductPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(gpuX, -height * 0.1, 0), // Start above GPU
        new THREE.Vector3(gpuX, height * 0.1, 0), // Mid-point
        new THREE.Vector3(0, height * 0.2, 0) // End at central chamber
      ]);
      
      const duct = new THREE.Mesh(
        new THREE.TubeGeometry(ductPath, 12, 0.3, 8, false),
        new THREE.MeshPhysicalMaterial({
          color: 0xeeeeee,
          transparent: true,
          opacity: 0.15,
          metalness: 0.1,
          roughness: 0.05,
          clearcoat: 1.0,
          transmission: 0.9
        })
      );
      ductSystem.add(duct);
      
      // Small fan at collection point
      const collectionFan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16),
        fanMaterial
      );
      collectionFan.rotation.x = Math.PI / 2;
      collectionFan.position.set(gpuX, -height * 0.1, 0);
      ductSystem.add(collectionFan);
      
      // Fan blades
      const fanBlades = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.08, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
      );
      fanBlades.rotation.x = Math.PI / 2;
      fanBlades.position.copy(collectionFan.position);
      ductSystem.add(fanBlades);
    });
    
    // Central exhaust duct to back panel
    const exhaustDuct = new THREE.Mesh(
      new THREE.BoxGeometry(length * 0.4, height * 0.2, width * 0.3),
      new THREE.MeshPhysicalMaterial({
        color: 0xeeeeee,
        transparent: true,
        opacity: 0.15,
        metalness: 0.1,
        roughness: 0.05,
        clearcoat: 1.0,
        transmission: 0.9
      })
    );
    exhaustDuct.position.set(0, height * 0.2, width * 0.25);
    ductSystem.add(exhaustDuct);
    
    // Main exhaust fans (2)
    [-1, 1].forEach((side, i) => {
      const exhaustFan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16),
        fanMaterial
      );
      exhaustFan.rotation.z = Math.PI / 2;
      exhaustFan.position.set(side * length * 0.15, height * 0.2, width * 0.4);
      ductSystem.add(exhaustFan);
      
      // Fan blades
      const blades = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.15, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x666666 })
      );
      blades.position.copy(exhaustFan.position);
      blades.rotation.copy(exhaustFan.rotation);
      ductSystem.add(blades);
    });
    
    return ductSystem;
  };
  
  // Create airflow visualization
  const createAirflow = () => {
    // Helper to create directional airflow arrows
    const createFlowArrow = (from: THREE.Vector3, to: THREE.Vector3, color: number, index: number) => {
      const direction = new THREE.Vector3().subVectors(to, from).normalize();
      const arrowLength = from.distanceTo(to);
      
      return (
        <arrowHelper 
          key={`arrow-${color.toString(16)}-${index}`}
          args={[
            direction,
            from,
            arrowLength, 
            color,
            Math.min(0.3, arrowLength * 0.2),
            Math.min(0.15, arrowLength * 0.1)
          ]}
        />
      );
    };
    
    // Create cold intake airflow arrows (blue)
    const intakeArrows = [];
    for (let i = 0; i < Math.min(20, gpuSlots.length * 4); i++) {
      const x = -length * 0.4 + Math.random() * length * 0.8;
      const y = -height * 0.3 + Math.random() * height * 0.6;
      
      const from = new THREE.Vector3(x, y, -width * 0.6);
      
      // Find nearest GPU
      const gpuIndex = Math.floor((x + length / 2) / slotSpacing);
      const gpuX = Math.max(0, Math.min(gpuSlots.length - 1, gpuIndex)) * slotSpacing + slotSpacing - length / 2;
      
      const to = new THREE.Vector3(gpuX, y, -width * 0.1);
      
      intakeArrows.push(createFlowArrow(from, to, 0x0088ff, i));
    }
    
    // Create hot exhaust airflow arrows (red) - centralized to one exhaust point
    const exhaustArrows = [];
    for (let i = 0; i < Math.min(30, gpuSlots.length * 6); i++) {
      const gpuIndex = Math.floor(Math.random() * gpuSlots.length);
      const gpuX = slotSpacing * (gpuIndex + 1) - length / 2;
      
      // Starting position near GPU
      const from = new THREE.Vector3(
        gpuX + (Math.random() * 1 - 0.5),
        -height * 0.1 + Math.random() * 0.2,
        0
      );
      
      // Midpoint heading to central collector
      const mid = new THREE.Vector3(
        gpuX * 0.3,
        height * 0.15,
        Math.random() * width * 0.2
      );
      
      // End point at central exhaust
      const to = new THREE.Vector3(
        0,
        height * 0.25, 
        width * 0.4
      );
      
      // Add first segment (GPU to central collector)
      exhaustArrows.push(createFlowArrow(from, mid, 0xff5500, i * 2));
      
      // Add second segment (collector to exhaust)
      exhaustArrows.push(createFlowArrow(mid, to, 0xff2200, i * 2 + 1));
    }
    
    return (
      <group>
        {intakeArrows}
        {exhaustArrows}
      </group>
    );
  };
  
  // Simplified temperature sensor visualization
  const createTempSensors = () => {
    if (!hasTempSensors) return null;
    
    const sensorGroup = new THREE.Group();
    
    // Main display panel
    const displayPanel = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    displayPanel.position.set(length * 0.3, height * 0.35, width * 0.45);
    sensorGroup.add(displayPanel);
    
    // Display screen
    const display = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x22ff22 }) // Green LED
    );
    display.position.set(length * 0.3, height * 0.35, width * 0.46);
    sensorGroup.add(display);
    
    // Simplified temperature sensors on each GPU
    gpuSlots.forEach((gpu, idx) => {
      const gpuX = slotSpacing * (idx + 1) - length / 2;
      
      // Sensor probe
      const probe = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
      );
      probe.position.set(gpuX, -height * 0.2, 0.2);
      sensorGroup.add(probe);
      
      // Wire from probe to display
      const wirePath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(gpuX, -height * 0.2, 0.2),
        new THREE.Vector3(gpuX, height * 0.1, width * 0.2),
        new THREE.Vector3(length * 0.2, height * 0.2, width * 0.3),
        new THREE.Vector3(length * 0.3, height * 0.35, width * 0.45)
      ]);
      
      const wire = new THREE.Mesh(
        new THREE.TubeGeometry(wirePath, 8, 0.03, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x777777 })
      );
      sensorGroup.add(wire);
      
      // Status LED on each GPU
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5
        })
      );
      led.position.set(gpuX + 0.1, -height * 0.2, 0.25);
      sensorGroup.add(led);
    });
    
    return sensorGroup;
  };
  
  return (
    <group ref={groupRef}>
      {/* Acrylic case with tab-joint construction */}
      <primitive object={createAcrylicCase()} />
      
      {/* Simplified GPUs */}
      {gpuSlots.map((gpu, index) => {
        const gpuX = slotSpacing * (index + 1) - length / 2;
        const gpuY = -height * 0.25;
        const gpuZ = 0;
        
        return (
          <group 
            key={`gpu-${index}`}
            position={[gpuX, gpuY, gpuZ]}
          >
            <primitive 
              object={createGPU(
                gpu, 
                new THREE.Vector3(0, 0, 0)
              )}
            />
          </group>
        );
      })}
      
      {/* Central air management system */}
      {hasDuct && <primitive object={createAirManagement()} />}
      
      {/* Temperature sensors */}
      {hasTempSensors && <primitive object={createTempSensors()} />}
      
      {/* Airflow visualization */}
      {createAirflow()}
      
      {/* Improved lighting for visibility */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[length, height, width]} 
        intensity={0.7}
        castShadow
      />
      <directionalLight 
        position={[-length, height, -width]} 
        intensity={0.5}
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={15}
        distance={50}
        color={0xffffee}
      />
    </group>
  );
};

export default CaseModel;