import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GPUCase } from '../types';

interface CaseModelProps {
  caseModel: GPUCase;
}

const CaseModel: React.FC<CaseModelProps> = ({ caseModel }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Extract case dimensions
  const { length, width, height } = caseModel.dimensions;
  const { gpuSlots } = caseModel;
  const { hasDuct, hasTempSensors } = caseModel.thermalManagement;

  // Calculate slot spacing based on case length and GPU count
  const slotSpacing = length / (gpuSlots.length + 1);
  
  useFrame(() => {
    if (groupRef.current) {
      // Optional animations can be added here
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Case frame (edges) */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(length, height, width)]} />
        <lineBasicMaterial color={0x000000} />
      </lineSegments>
      
      {/* Case panels */}
      <mesh>
        <boxGeometry args={[length, height, width]} />
        <meshBasicMaterial 
          color={0xeeeeee} 
          transparent={true} 
          opacity={0.5} 
        />
      </mesh>
      
      {/* GPU slots */}
      {gpuSlots.map((gpu, index) => (
        <group key={`gpu-${index}`}>
          {/* GPU model */}
          <mesh 
            position={[
              slotSpacing * (index + 1) - length / 2, 
              0, 
              0
            ]}
          >
            <boxGeometry args={[gpu.length, gpu.height, gpu.width]} />
            <meshBasicMaterial 
              color={0x3399ff} 
              transparent={true} 
              opacity={0.7} 
            />
          </mesh>
          
          {/* Add fans if needed */}
          {hasDuct && (
            <mesh 
              position={[
                slotSpacing * (index + 1) - length / 2,
                -height / 2 + 1,
                0
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[1, 1, 0.5, 16]} />
              <meshBasicMaterial color={0x66ccff} />
            </mesh>
          )}
          
          {/* Add temperature sensors if needed */}
          {hasTempSensors && (
            <mesh
              position={[
                slotSpacing * (index + 1) - length / 2 + 2,
                -height / 3,
                width / 2 - 0.5
              ]}
            >
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial color={0x00ff00} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* Air duct if needed */}
      {hasDuct && (
        <>
          <mesh position={[0, height / 2 - 1, 0]}>
            <boxGeometry args={[length, 2, width]} />
            <meshBasicMaterial 
              color={0xff6666} 
              transparent={true} 
              opacity={0.3} 
            />
          </mesh>
          
          {/* Air flow arrows */}
          <arrowHelper
            args={[
              new THREE.Vector3(0, 1, 0),
              new THREE.Vector3(0, height / 2, 0),
              3,
              0xff0000
            ]}
          />
          
          {/* Cold air intake arrows */}
          {gpuSlots.map((gpu, index) => (
            <arrowHelper
              key={`air-arrow-${index}`}
              args={[
                new THREE.Vector3(0, 0, -1),
                new THREE.Vector3(
                  slotSpacing * (index + 1) - length / 2,
                  -height / 3,
                  width / 2 + 1
                ),
                3,
                0x0088ff
              ]}
            />
          ))}
        </>
      )}
    </group>
  );
};

export default CaseModel;
