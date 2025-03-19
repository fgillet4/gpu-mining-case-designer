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
  
  // Set up scene
  useEffect(() => {
    camera.position.set(length * 0.8, height * 0.8, width * 1.5);
    camera.lookAt(0, 0, 0);
  }, [camera, length, height, width]);
  
  // Add subtle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    }
  });
  
  // Calculate panel dimensions
  const panelThickness = thickness || 0.25;
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Create metal texture for the case frame
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.2,
    flatShading: false
  });
  
  // Create transparent material for panels
  const panelMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.2,
    metalness: 0.2,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide
  });
  
  // Create PCB material for GPUs
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0x005500, 
    metalness: 0.1,
    roughness: 0.8
  });
  
  // Create heatsink material
  const heatsinkMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
    roughness: 0.3
  });
  
  // Create fan material
  const fanMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.3,
    roughness: 0.7
  });
  
  // Create vent holes material
  const ventMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.3,
    roughness: 0.7
  });
  
  // Helper function to create ventilation holes
  const createVentilationGrid = (xSize: number, zSize: number, xCount: number, zCount: number) => {
    const group = new THREE.Group();
    const holeSize = Math.min(0.2, xSize / (xCount * 2), zSize / (zCount * 2));
    const xSpacing = xSize / xCount;
    const zSpacing = zSize / zCount;
    
    for (let x = 0; x < xCount; x++) {
      for (let z = 0; z < zCount; z++) {
        const vent = new THREE.Mesh(
          new THREE.CylinderGeometry(holeSize, holeSize, panelThickness * 2, 8),
          ventMaterial
        );
        vent.rotation.x = Math.PI / 2;
        vent.position.set(
          -xSize/2 + xSpacing * (x + 0.5),
          0,
          -zSize/2 + zSpacing * (z + 0.5)
        );
        group.add(vent);
      }
    }
    
    return group;
  };
  
  // Create frame edges with proper thickness
  const createFrame = () => {
    const frame = new THREE.Group();
    
    // Vertical struts at corners
    const struts = [
      { x: -halfLength + panelThickness/2, y: 0, z: -halfWidth + panelThickness/2 },
      { x: halfLength - panelThickness/2, y: 0, z: -halfWidth + panelThickness/2 },
      { x: -halfLength + panelThickness/2, y: 0, z: halfWidth - panelThickness/2 },
      { x: halfLength - panelThickness/2, y: 0, z: halfWidth - panelThickness/2 }
    ];
    
    struts.forEach(pos => {
      const strut = new THREE.Mesh(
        new THREE.BoxGeometry(panelThickness, height, panelThickness),
        metalMaterial
      );
      strut.position.set(pos.x, pos.y, pos.z);
      frame.add(strut);
    });
    
    // Horizontal supports
    const horizontals = [
      // Top frame
      { x: 0, y: halfHeight - panelThickness/2, z: -halfWidth + panelThickness/2, w: length, h: panelThickness, d: panelThickness },
      { x: 0, y: halfHeight - panelThickness/2, z: halfWidth - panelThickness/2, w: length, h: panelThickness, d: panelThickness },
      { x: -halfLength + panelThickness/2, y: halfHeight - panelThickness/2, z: 0, w: panelThickness, h: panelThickness, d: width },
      { x: halfLength - panelThickness/2, y: halfHeight - panelThickness/2, z: 0, w: panelThickness, h: panelThickness, d: width },
      
      // Bottom frame
      { x: 0, y: -halfHeight + panelThickness/2, z: -halfWidth + panelThickness/2, w: length, h: panelThickness, d: panelThickness },
      { x: 0, y: -halfHeight + panelThickness/2, z: halfWidth - panelThickness/2, w: length, h: panelThickness, d: panelThickness },
      { x: -halfLength + panelThickness/2, y: -halfHeight + panelThickness/2, z: 0, w: panelThickness, h: panelThickness, d: width },
      { x: halfLength - panelThickness/2, y: -halfHeight + panelThickness/2, z: 0, w: panelThickness, h: panelThickness, d: width },
    ];
    
    horizontals.forEach(beam => {
      const support = new THREE.Mesh(
        new THREE.BoxGeometry(beam.w, beam.h, beam.d),
        metalMaterial
      );
      support.position.set(beam.x, beam.y, beam.z);
      frame.add(support);
    });
    
    return frame;
  };
  
  // Create case panels with proper ventilation
  const createPanels = () => {
    const panels = new THREE.Group();
    
    // Top panel with ventilation grid
    const topPanel = new THREE.Mesh(
      new THREE.BoxGeometry(length - panelThickness*2, panelThickness, width - panelThickness*2),
      panelMaterial
    );
    topPanel.position.set(0, halfHeight, 0);
    panels.add(topPanel);
    
    // Add ventilation to top panel
    const topVents = createVentilationGrid(length * 0.8, width * 0.8, 10, 6);
    topVents.position.y = halfHeight + panelThickness/2;
    panels.add(topVents);
    
    // Bottom panel
    const bottomPanel = new THREE.Mesh(
      new THREE.BoxGeometry(length - panelThickness*2, panelThickness, width - panelThickness*2),
      panelMaterial
    );
    bottomPanel.position.set(0, -halfHeight, 0);
    panels.add(bottomPanel);
    
    // Front panel with air intakes
    const frontPanel = new THREE.Mesh(
      new THREE.BoxGeometry(length - panelThickness*2, height - panelThickness*2, panelThickness),
      panelMaterial
    );
    frontPanel.position.set(0, 0, -halfWidth);
    panels.add(frontPanel);
    
    // Front intake vents
    const frontVents = createVentilationGrid(length * 0.5, height * 0.3, 12, 4);
    frontVents.rotation.x = Math.PI / 2;
    frontVents.position.set(0, -height * 0.2, -halfWidth - panelThickness/2);
    panels.add(frontVents);
    
    // Back panel with exhaust
    const backPanel = new THREE.Mesh(
      new THREE.BoxGeometry(length - panelThickness*2, height - panelThickness*2, panelThickness),
      panelMaterial
    );
    backPanel.position.set(0, 0, halfWidth);
    panels.add(backPanel);
    
    // Back exhaust vents
    const backVents = createVentilationGrid(length * 0.5, height * 0.3, 12, 4);
    backVents.rotation.x = Math.PI / 2;
    backVents.position.set(0, height * 0.2, halfWidth + panelThickness/2);
    panels.add(backVents);
    
    // Power cable cutout
    const powerHole = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1, panelThickness * 2),
      ventMaterial
    );
    powerHole.position.set(halfLength * 0.5, -halfHeight * 0.5, halfWidth);
    panels.add(powerHole);
    
    // Side panels
    const leftPanel = new THREE.Mesh(
      new THREE.BoxGeometry(panelThickness, height - panelThickness*2, width - panelThickness*2),
      panelMaterial
    );
    leftPanel.position.set(-halfLength, 0, 0);
    panels.add(leftPanel);
    
    const rightPanel = new THREE.Mesh(
      new THREE.BoxGeometry(panelThickness, height - panelThickness*2, width - panelThickness*2),
      panelMaterial
    );
    rightPanel.position.set(halfLength, 0, 0);
    panels.add(rightPanel);
    
    // Side panel vents
    const sideVentsLeft = createVentilationGrid(height * 0.4, width * 0.6, 5, 8);
    sideVentsLeft.rotation.z = Math.PI / 2;
    sideVentsLeft.position.set(-halfLength - panelThickness/2, 0, 0);
    panels.add(sideVentsLeft);
    
    const sideVentsRight = createVentilationGrid(height * 0.4, width * 0.6, 5, 8);
    sideVentsRight.rotation.z = Math.PI / 2;
    sideVentsRight.position.set(halfLength + panelThickness/2, 0, 0);
    panels.add(sideVentsRight);
    
    return panels;
  };
  
  // Create detailed GPU models
  const createDetailedGPU = (gpu: any, position: THREE.Vector3) => {
    const gpuGroup = new THREE.Group();
    gpuGroup.position.copy(position);
    
    // PCB board
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(gpu.length, 0.1, gpu.width * 0.8),
      pcbMaterial
    );
    gpuGroup.add(pcb);
    
    // Heatsink
    const heatsink = new THREE.Mesh(
      new THREE.BoxGeometry(gpu.length * 0.9, gpu.height * 0.7, gpu.width * 0.8),
      heatsinkMaterial
    );
    heatsink.position.set(0, gpu.height * 0.4, 0);
    gpuGroup.add(heatsink);
    
    // Add heatsink fins
    const finCount = 12;
    const finSpacing = (gpu.length * 0.8) / finCount;
    
    for (let i = 0; i < finCount; i++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, gpu.height * 0.6, gpu.width * 0.7),
        metalMaterial
      );
      fin.position.set(-gpu.length * 0.4 + i * finSpacing, gpu.height * 0.4, 0);
      gpuGroup.add(fin);
    }
    
    // Add GPU fans
    const fanCount = gpu.name.includes('90') ? 3 : 
                     gpu.name.includes('80') ? 3 : 2;
    
    const fanSpacing = gpu.length * 0.7 / fanCount;
    const fanSize = Math.min(gpu.width * 0.7, fanSpacing * 0.8);
    
    for (let i = 0; i < fanCount; i++) {
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(fanSize/2, fanSize/2, 0.1, 32),
        fanMaterial
      );
      fan.rotation.x = Math.PI / 2;
      fan.position.set(-gpu.length * 0.3 + i * fanSpacing, gpu.height * 0.8, 0);
      gpuGroup.add(fan);
      
      // Fan blades
      const blades = new THREE.Mesh(
        new THREE.TorusGeometry(fanSize * 0.35, fanSize * 0.1, 8, 9),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
      );
      blades.rotation.x = Math.PI / 2;
      blades.position.copy(fan.position);
      gpuGroup.add(blades);
    }
    
    // Power connectors
    const connector = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    connector.position.set(gpu.length/2 - 0.5, 0.2, -gpu.width/2 + 0.4);
    gpuGroup.add(connector);
    
    return gpuGroup;
  };
  
  // Create mounting rails
  const createMountingRails = () => {
    const railsGroup = new THREE.Group();
    
    // Calculate optimum GPU positions
    const positions = [];
    for (let i = 0; i < gpuSlots.length; i++) {
      positions.push(slotSpacing * (i + 1) - length / 2);
    }
    
    // Create rails
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.3
    });
    
    // Front to back rails
    const railLength = width - panelThickness * 4;
    positions.forEach(pos => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(panelThickness, panelThickness, railLength),
        railMaterial
      );
      rail.position.set(pos, -height/2 + panelThickness * 2, 0);
      railsGroup.add(rail);
      
      // Add GPU mounting holes
      for (let i = 0; i < 4; i++) {
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, panelThickness * 1.5, 16),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.set(
          pos, 
          -height/2 + panelThickness * 2 + 0.05,
          -railLength/2 + railLength/(3) * i
        );
        railsGroup.add(hole);
      }
    });
    
    // Cross support rails
    const crossRailWidth = length - panelThickness * 4;
    const crossRail1 = new THREE.Mesh(
      new THREE.BoxGeometry(crossRailWidth, panelThickness, panelThickness),
      railMaterial
    );
    crossRail1.position.set(0, -height/2 + panelThickness * 2, -width/2 + panelThickness * 2);
    railsGroup.add(crossRail1);
    
    const crossRail2 = new THREE.Mesh(
      new THREE.BoxGeometry(crossRailWidth, panelThickness, panelThickness),
      railMaterial
    );
    crossRail2.position.set(0, -height/2 + panelThickness * 2, 0);
    railsGroup.add(crossRail2);
    
    const crossRail3 = new THREE.Mesh(
      new THREE.BoxGeometry(crossRailWidth, panelThickness, panelThickness),
      railMaterial
    );
    crossRail3.position.set(0, -height/2 + panelThickness * 2, width/2 - panelThickness * 2);
    railsGroup.add(crossRail3);
    
    return railsGroup;
  };
  
  return (
    <group ref={groupRef}>
      {/* Engineering-grade frame */}
      <primitive object={createFrame()} />
      
      {/* Professional case panels with ventilation */}
      <primitive object={createPanels()} />
      
      {/* Mounting rails for GPUs */}
      <primitive object={createMountingRails()} />
      
      {/* Detailed GPU models */}
      {gpuSlots.map((gpu, index) => (
        <primitive 
          key={`gpu-${index}`}
          object={createDetailedGPU(
            gpu,
            new THREE.Vector3(
              slotSpacing * (index + 1) - length / 2,
              -height * 0.15,
              0
            )
          )}
        />
      ))}
      
      {/* Air duct system with proper cooling visualization */}
      {hasDuct && (
        <group>
          {/* Main duct housing */}
          <mesh position={[0, height / 2 - 1, 0]}>
            <boxGeometry args={[length * 0.8, 1.5, width * 0.8]} />
            <meshPhysicalMaterial 
              color={0xdddddd}
              transparent={true}
              opacity={0.3}
              metalness={0.2}
              roughness={0.3}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
          
          {/* Exhaust fans */}
          <mesh 
            position={[0, height / 2 - 0.5, width/2 - 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[2, 2, 0.5, 32]} />
            <meshStandardMaterial color={0x222222} />
          </mesh>
          
          {/* Fan blades */}
          <mesh 
            position={[0, height / 2 - 0.5, width/2 - 0.3]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[1.2, 0.3, 8, 12]} />
            <meshStandardMaterial color={0x555555} />
          </mesh>
          
          {/* Airflow indicators (better visualization) */}
          {gpuSlots.map((gpu, index) => (
            <group key={`airflow-${index}`}>
              {/* Subtle airflow indicator lines */}
              {[...Array(5)].map((_, i) => (
                <mesh 
                  key={`airflow-line-${index}-${i}`}
                  position={[
                    slotSpacing * (index + 1) - length / 2,
                    (i - 2) * 0.5,
                    0
                  ]}
                >
                  <boxGeometry args={[gpu.length * 0.8, 0.02, gpu.width * 0.8]} />
                  <meshBasicMaterial 
                    color={0x0088ff} 
                    transparent={true} 
                    opacity={0.2} 
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}
      
      {/* Temperature sensors with LED indicators */}
      {hasTempSensors && gpuSlots.map((gpu, index) => (
        <group key={`temp-sensor-${index}`}>
          <mesh
            position={[
              slotSpacing * (index + 1) - length / 2 + gpu.length/3,
              gpu.height/2,
              width/2 - 0.8
            ]}
          >
            <boxGeometry args={[0.5, 0.2, 0.1]} />
            <meshStandardMaterial color={0x222222} />
          </mesh>
          <pointLight
            position={[
              slotSpacing * (index + 1) - length / 2 + gpu.length/3,
              gpu.height/2,
              width/2 - 0.7
            ]}
            distance={1}
            intensity={5}
            color={0x00ff00}
          />
        </group>
      ))}
      
      {/* Add additional lighting for better visualization */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[length, height, width]} 
        intensity={0.6}
        castShadow
      />
      <pointLight
        position={[0, height/2, 0]}
        intensity={30}
        distance={50}
        color={0xffffdd}
      />
    </group>
  );
};

export default CaseModel;
