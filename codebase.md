# .gitignore

```
/node_modules

```

# index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GPU Mining Case Designer</title>
  <link rel="icon" href="/favicon.ico">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      overflow: hidden;
    }

    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

# package.json

```json
{
  "name": "gpu-mining-case-designer",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@react-three/drei": "^9.92.7",
    "@react-three/fiber": "^8.15.12",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.159.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/three": "^0.159.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

```

# public/favicon.ico

```ico

```

# src/App.css

```css
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.controls-panel {
  width: 350px;
  padding: 20px;
  background-color: var(--background-light);
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.preview-panel {
  flex: 1;
  background-color: var(--background-dark);
  position: relative;
}

h1 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 24px;
  color: var(--text-color);
}

h2 {
  margin-top: 20px;
  margin-bottom: 15px;
  font-size: 18px;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.laser-settings {
  margin-bottom: 20px;
  background-color: #f5f9f5;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.laser-settings h2 {
  margin-top: 0;
  color: #4CAF50;
  border-bottom-color: #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 10px;
  width: auto;
}

.checkbox label {
  margin-bottom: 0;
}

/* Improved form styling */
input[type="number"], select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s;
}

input[type="number"]:focus, select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

button {
  padding: 10px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: var(--primary-hover);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .controls-panel {
    width: 100%;
    max-height: 50vh;
  }
}
```

# src/App.tsx

```tsx
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CaseDesigner from './components/CaseDesigner';
import GpuConfigurator from './components/GpuConfigurator';
import ExportOptions from './components/ExportOptions';
import CaseModel from './components/CaseModel';
import { LaserCutExporter } from './utils/LaserCutExporter';
import { SVGExporter } from './utils/SVGExporter';
import { DXFExporter } from './utils/DXFExporter';
import { SimpleSVGExporter } from './utils/SimpleSVGExporter';
import { SimpleDXFExporter } from './utils/SimpleDXFExporter';
import { LaserCutExporter } from './utils/LaserCutExporter';
import './App.css';
import { GPUCase, GPUSlot } from './types';

const App: React.FC = () => {
  // Case dimensions
  const [caseLength, setCaseLength] = useState<number>(24);
  const [caseWidth, setCaseWidth] = useState<number>(6);
  const [caseHeight, setCaseHeight] = useState<number>(8);
  const [materialThickness, setMaterialThickness] = useState<number>(0.25);
  
  // GPU configuration
  const [gpuCount, setGpuCount] = useState<number>(3);
  const [includeAirDuct, setIncludeAirDuct] = useState<boolean>(true);
  const [includeTempSensors, setIncludeTempSensors] = useState<boolean>(false);
  
  // Laser cut specific options
  const [tabWidth, setTabWidth] = useState<number>(0.5);
  const [kerf, setKerf] = useState<number>(0.01);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  
  // GPU models with correct dimensions - RTX 3090 is 336mm x 140mm x 61mm (13.2" x 5.5" x 2.4")
  const [gpuModels, setGpuModels] = useState<GPUSlot[]>([
    { name: 'RTX 3090', length: 13.2, height: 5.5, width: 2.4, tdp: 350 },
    { name: 'RTX 3090', length: 13.2, height: 5.5, width: 2.4, tdp: 350 },
    { name: 'RTX 3090', length: 13.2, height: 5.5, width: 2.4, tdp: 350 }
  ]);
  
  // Combined case model
  const caseModel: GPUCase = {
    dimensions: {
      length: caseLength,
      width: caseWidth,
      height: caseHeight
    },
    material: {
      thickness: materialThickness
    },
    gpuSlots: gpuModels.slice(0, gpuCount),
    thermalManagement: {
      hasDuct: includeAirDuct,
      hasTempSensors: includeTempSensors
    }
  };
  
  // Handle exporting the case design
  const handleExport = (format: 'svg' | 'dxf' | 'dwg' | 'laser-svg' | 'laser-dxf' | 'simple-svg' | 'simple-dxf') => {
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'svg') {
      const exporter = new SVGExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case.svg';
      mimeType = 'image/svg+xml';
    } else if (format === 'simple-svg') {
      const exporter = new SimpleSVGExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case-simple.svg';
      mimeType = 'image/svg+xml';
    } else if (format === 'laser-svg') {
      const exporter = new LaserCutExporter(tabWidth, kerf);
      data = exporter.exportSVG(caseModel);
      filename = 'gpu-case-laser.svg';
      mimeType = 'image/svg+xml';
    } else if (format === 'dxf') {
      const exporter = new DXFExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case.dxf';
      mimeType = 'application/dxf';
    } else if (format === 'simple-dxf') {
      const exporter = new SimpleDXFExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case-simple.dxf';
      mimeType = 'application/dxf';
    } else if (format === 'laser-dxf') {
      const exporter = new LaserCutExporter(tabWidth, kerf);
      data = exporter.exportDXF(caseModel);
      filename = 'gpu-case-laser.dxf';
      mimeType = 'application/dxf';
    } else {
      alert('DWG format is not yet implemented');
      return;
    }
    
    downloadFile(data, filename, mimeType);
  };
  
  // Helper function to download a file
  const downloadFile = (data: string, filename: string, mimeType: string) => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="app-container">
      <div className="controls-panel">
        <h1>GPU Mining Case Designer</h1>
        
        <CaseDesigner 
          length={caseLength}
          width={caseWidth}
          height={caseHeight}
          materialThickness={materialThickness}
          setLength={setCaseLength}
          setWidth={setCaseWidth}
          setHeight={setCaseHeight}
          setMaterialThickness={setMaterialThickness}
        />
        
        <GpuConfigurator 
          gpuCount={gpuCount}
          includeAirDuct={includeAirDuct}
          includeTempSensors={includeTempSensors}
          gpuModels={gpuModels}
          setGpuCount={setGpuCount}
          setIncludeAirDuct={setIncludeAirDuct}
          setIncludeTempSensors={setIncludeTempSensors}
          setGpuModels={setGpuModels}
        />
        
        <div className="laser-settings">
          <h2>Laser Cutting Settings</h2>
          
          <div className="form-group">
            <label htmlFor="tab-width">Tab Width (inches)</label>
            <input
              type="number"
              id="tab-width"
              value={tabWidth}
              onChange={(e) => setTabWidth(Number(e.target.value))}
              min={0.2}
              max={2}
              step={0.1}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="kerf">Kerf / Tolerance (inches)</label>
            <input
              type="number"
              id="kerf"
              value={kerf}
              onChange={(e) => setKerf(Number(e.target.value))}
              min={0.005}
              max={0.05}
              step={0.005}
            />
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="show-labels"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <label htmlFor="show-labels">Show Panel Labels</label>
          </div>
        </div>
        
        <ExportOptions 
          onExport={handleExport} 
          hasLaserOptions={true}
        />
      </div>
      
      <div className="preview-panel">
        <Canvas camera={{ position: [20, 10, 20], fov: 75 }}>
          <color attach="background" args={[0xf0f0f0]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[1, 1, 1]} intensity={0.8} />
          <gridHelper args={[30, 30]} />
          <CaseModel caseModel={caseModel} />
          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
    </div>
  );
};

export default App;
```

# src/components/CaseDesigner.css

```css
.case-designer {
  margin-bottom: 20px;
}

h2 {
  margin-top: 0;
  font-size: 18px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

```

# src/components/CaseDesigner.tsx

```tsx
import React from 'react';
import './CaseDesigner.css';

interface CaseDesignerProps {
  length: number;
  width: number;
  height: number;
  materialThickness: number;
  setLength: (length: number) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setMaterialThickness: (thickness: number) => void;
}

const CaseDesigner: React.FC<CaseDesignerProps> = ({
  length,
  width,
  height,
  materialThickness,
  setLength,
  setWidth,
  setHeight,
  setMaterialThickness
}) => {
  return (
    <div className="case-designer">
      <h2>Case Dimensions</h2>
      
      <div className="form-group">
        <label htmlFor="length">Length (inches)</label>
        <input
          type="number"
          id="length"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          min={10}
          max={48}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="width">Width (inches)</label>
        <input
          type="number"
          id="width"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          min={4}
          max={24}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="height">Height (inches)</label>
        <input
          type="number"
          id="height"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          min={4}
          max={24}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="thickness">Material Thickness (inches)</label>
        <input
          type="number"
          id="thickness"
          value={materialThickness}
          onChange={(e) => setMaterialThickness(Number(e.target.value))}
          min={0.1}
          max={1}
          step={0.05}
        />
      </div>
    </div>
  );
};

export default CaseDesigner;

```

# src/components/CaseModel.tsx

```tsx
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

```

# src/components/ExportOptions.css

```css
.export-options {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.info-text {
  font-style: italic;
  color: #666;
}

```

# src/components/ExportOptions.tsx

```tsx
import React from 'react';
import './ExportOptions.css';

interface ExportOptionsProps {
  onExport: (format: 'svg' | 'dxf' | 'dwg') => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ onExport }) => {
  return (
    <div className="export-options">
      <h2>Export Case Design</h2>
      
      <div className="button-group">
        <button onClick={() => onExport('svg')}>
          Download SVG
        </button>
        <button onClick={() => onExport('dxf')}>
          Download DXF
        </button>
        <button onClick={() => onExport('dwg')}>
          Download DWG
        </button>
      </div>
      
      <div className="info-text">
        <small>Files can be used with laser cutters or CNC machines</small>
      </div>
    </div>
  );
};

export default ExportOptions;

```

# src/components/GpuConfigurator.css

```css
.gpu-configurator {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 20px;
  background-color: #f8f8f8;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.gpu-slot {
  margin-bottom: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.gpu-slot h3 {
  margin-top: 0;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 10px;
  width: auto;
}

.checkbox label {
  margin-bottom: 0;
}

.dimensions-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  font-size: 14px;
}

.dimensions-info div {
  flex: 1 0 40%;
}

.custom-dimensions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.power-summary {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  padding: 10px;
  background-color: #e9f7ef;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item span {
  font-size: 12px;
  color: #666;
}

.summary-item strong {
  font-size: 16px;
  color: #333;
}

.warning-text {
  margin-top: 5px;
  padding: 8px;
  color: #856404;
  background-color: #fff3cd;
  border-radius: 4px;
  font-size: 14px;
  border-left: 3px solid #ffeeba;
}
```

# src/components/GpuConfigurator.tsx

```tsx
import React from 'react';
import { GPUSlot } from '../types';
import './GpuConfigurator.css';

interface GpuConfiguratorProps {
  gpuCount: number;
  includeAirDuct: boolean;
  includeTempSensors: boolean;
  gpuModels: GPUSlot[];
  setGpuCount: (count: number) => void;
  setIncludeAirDuct: (include: boolean) => void;
  setIncludeTempSensors: (include: boolean) => void;
  setGpuModels: (models: GPUSlot[]) => void;
}

const GpuConfigurator: React.FC<GpuConfiguratorProps> = ({
  gpuCount,
  includeAirDuct,
  includeTempSensors,
  gpuModels,
  setGpuCount,
  setIncludeAirDuct,
  setIncludeTempSensors,
  setGpuModels
}) => {
  // GPU model definitions - accurate dimensions
  const gpuDefinitions = {
    // RTX 30 Series
    'RTX 3060': { length: 9.5, height: 4.4, width: 2, tdp: 170 },
    'RTX 3070': { length: 10.5, height: 4.4, width: 2, tdp: 220 },
    'RTX 3080': { length: 11.2, height: 4.4, width: 2, tdp: 320 },
    'RTX 3090': { length: 13.2, height: 5.5, width: 2.4, tdp: 350 }, // 336mm x 140mm x 61mm
    
    // RTX 40 Series
    'RTX 4070': { length: 10.8, height: 4.4, width: 2, tdp: 200 },
    'RTX 4080': { length: 11.9, height: 5.0, width: 2.3, tdp: 320 },
    'RTX 4090': { length: 13.5, height: 5.9, width: 3.0, tdp: 450 }, // 344mm x 150mm x 76mm
    
    // AMD Options
    'RX 6900 XT': { length: 12.2, height: 5.0, width: 2.5, tdp: 300 },
    'RX 7900 XTX': { length: 12.5, height: 5.1, width: 2.4, tdp: 355 },
    
    // Custom
    'Custom': { length: 10.5, height: 4.4, width: 2, tdp: 250 }
  };
  
  // Update GPU model based on selection
  const updateGpuModel = (index: number, modelName: string) => {
    const updatedModels = [...gpuModels];
    
    if (modelName !== 'Custom') {
      const model = gpuDefinitions[modelName as keyof typeof gpuDefinitions];
      updatedModels[index] = {
        name: modelName,
        length: model.length,
        height: model.height,
        width: model.width,
        tdp: model.tdp
      };
    } else {
      // For custom models, keep the existing dimensions
      updatedModels[index] = {
        ...updatedModels[index],
        name: 'Custom'
      };
    }
    
    setGpuModels(updatedModels);
  };
  
  // Update a specific property of a GPU
  const updateGpuProperty = (index: number, property: keyof GPUSlot, value: number) => {
    const updatedModels = [...gpuModels];
    updatedModels[index] = { 
      ...updatedModels[index], 
      [property]: value 
    };
    setGpuModels(updatedModels);
  };
  
  // Calculate total power consumption
  const calculateTotalPower = (): number => {
    return gpuModels
      .slice(0, gpuCount)
      .reduce((total, gpu) => total + (gpu.tdp || 0), 0);
  };
  
  // Calculate required airflow based on TDP
  const calculateRequiredAirflow = (): number => {
    // Rule of thumb: ~1.5 CFM per 100W of heat
    const totalTDP = calculateTotalPower();
    return Math.ceil(totalTDP * 0.015);
  };
  
  return (
    <div className="gpu-configurator">
      <div className="section">
        <h2>GPU Configuration</h2>
        
        <div className="form-group">
          <label htmlFor="gpuCount">Number of GPUs</label>
          <input
            type="number"
            id="gpuCount"
            value={gpuCount}
            onChange={(e) => setGpuCount(Number(e.target.value))}
            min={1}
            max={12}
          />
          {gpuCount > 6 && (
            <div className="warning-text">
              Warning: High GPU count may require additional cooling
            </div>
          )}
        </div>
        
        <div className="power-summary">
          <div className="summary-item">
            <span>Total Power:</span>
            <strong>{calculateTotalPower()} watts</strong>
          </div>
          <div className="summary-item">
            <span>Recommended Airflow:</span>
            <strong>{calculateRequiredAirflow()} CFM</strong>
          </div>
        </div>
        
        {gpuModels.slice(0, gpuCount).map((gpu, index) => (
          <div className="gpu-slot" key={index}>
            <h3>GPU Slot {index + 1}</h3>
            
            <div className="form-group">
              <label htmlFor={`gpu-model-${index}`}>GPU Model</label>
              <select
                id={`gpu-model-${index}`}
                value={gpu.name}
                onChange={(e) => updateGpuModel(index, e.target.value)}
              >
                <optgroup label="RTX 30 Series">
                  <option value="RTX 3060">RTX 3060</option>
                  <option value="RTX 3070">RTX 3070</option>
                  <option value="RTX 3080">RTX 3080</option>
                  <option value="RTX 3090">RTX 3090</option>
                </optgroup>
                <optgroup label="RTX 40 Series">
                  <option value="RTX 4070">RTX 4070</option>
                  <option value="RTX 4080">RTX 4080</option>
                  <option value="RTX 4090">RTX 4090</option>
                </optgroup>
                <optgroup label="AMD">
                  <option value="RX 6900 XT">RX 6900 XT</option>
                  <option value="RX 7900 XTX">RX 7900 XTX</option>
                </optgroup>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div className="dimensions-info">
              <div>Length: {gpu.length}"</div>
              <div>Height: {gpu.height}"</div>
              <div>Width: {gpu.width}"</div>
              <div>TDP: {gpu.tdp}W</div>
            </div>
            
            {gpu.name === 'Custom' && (
              <div className="custom-dimensions">
                <div className="form-group">
                  <label htmlFor={`gpu-length-${index}`}>Length (inches)</label>
                  <input
                    type="number"
                    id={`gpu-length-${index}`}
                    value={gpu.length}
                    onChange={(e) => updateGpuProperty(index, 'length', Number(e.target.value))}
                    min={5}
                    max={16}
                    step={0.1}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`gpu-height-${index}`}>Height (inches)</label>
                  <input
                    type="number"
                    id={`gpu-height-${index}`}
                    value={gpu.height}
                    onChange={(e) => updateGpuProperty(index, 'height', Number(e.target.value))}
                    min={1}
                    max={8}
                    step={0.1}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`gpu-width-${index}`}>Width (inches)</label>
                  <input
                    type="number"
                    id={`gpu-width-${index}`}
                    value={gpu.width}
                    onChange={(e) => updateGpuProperty(index, 'width', Number(e.target.value))}
                    min={1}
                    max={3.5}
                    step={0.1}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`gpu-tdp-${index}`}>TDP (watts)</label>
                  <input
                    type="number"
                    id={`gpu-tdp-${index}`}
                    value={gpu.tdp || 0}
                    onChange={(e) => updateGpuProperty(index, 'tdp', Number(e.target.value))}
                    min={75}
                    max={600}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="section">
        <h2>Thermal Management</h2>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="air-duct"
            checked={includeAirDuct}
            onChange={(e) => setIncludeAirDuct(e.target.checked)}
          />
          <label htmlFor="air-duct">Include Hot Air Duct Channel</label>
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="temp-sensors"
            checked={includeTempSensors}
            onChange={(e) => setIncludeTempSensors(e.target.checked)}
          />
          <label htmlFor="temp-sensors">Include Temperature Sensors & LEDs</label>
        </div>
        
        {calculateTotalPower() > 600 && !includeAirDuct && (
          <div className="warning-text">
            Warning: High power configuration ({calculateTotalPower()}W) recommended to enable air duct for proper cooling
          </div>
        )}
      </div>
    </div>
  );
};

export default GpuConfigurator;
```

# src/index.css

```css
:root {
  --primary-color: #4CAF50;
  --primary-hover: #45a049;
  --background-light: #f5f5f5;
  --background-dark: #e0e0e0;
  --border-color: #ddd;
  --text-color: #333;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#root {
  height: 100vh;
  width: 100vw;
}

input[type="number"], select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-hover);
}

```

# src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

```

# src/types.ts

```ts
export interface GPUSlot {
  name: string;
  length: number;
  height: number;
  width: number;
  tdp?: number;
}

export interface GPUCase {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  material: {
    thickness: number;
  };
  gpuSlots: GPUSlot[];
  thermalManagement: {
    hasDuct: boolean;
    hasTempSensors: boolean;
  };
}

```

# src/utils/DXFExporter.ts

```ts
import { GPUCase } from '../types';

/**
 * A simplified DXF exporter that creates a laser-cutting ready file
 * This version creates a minimal DXF that works with LibreCAD
 */
export class SimpleDXFExporter {
  export(model: GPUCase): string {
    // Basic DXF header
    let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
`;

    // Define panels
    const { length, width, height } = model.dimensions;
    
    // Panel spacing
    const spacing = 1;
    
    // Define panel positions (in inches)
    const panels = {
      bottom: { x: 0, y: 0, w: width, h: length },
      top: { x: width + spacing, y: 0, w: width, h: length },
      front: { x: 0, y: length + spacing, w: width, h: height },
      back: { x: width + spacing, y: length + spacing, w: width, h: height },
      left: { x: width*2 + spacing*2, y: 0, w: length, h: height },
      right: { x: width*2 + spacing*2, y: height + spacing, w: length, h: height }
    };
    
    // Draw bottom panel
    dxf += this.addRectangle(panels.bottom.x, panels.bottom.y, panels.bottom.w, panels.bottom.h);
    
    // Draw top panel
    dxf += this.addRectangle(panels.top.x, panels.top.y, panels.top.w, panels.top.h);
    
    // Add GPU ventilation holes
    if (model.gpuSlots.length > 0) {
      const slotSpacing = panels.top.h / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        // Determine number of fans based on GPU model
        const fanCount = gpu.name.includes('3090') || gpu.name.includes('4090') ? 3 : 
                         gpu.name.includes('3080') || gpu.name.includes('4080') ? 3 : 2;
        
        const gpuCenterY = panels.top.y + slotSpacing * (index + 1);
        const fanSpacing = gpu.length / (fanCount + 1);
        const fanDiameter = Math.min(1.5, gpu.width);
        
        // Add fan ventilation holes
        for (let i = 0; i < fanCount; i++) {
          const fanY = gpuCenterY - gpu.length/2 + fanSpacing * (i + 1);
          
          dxf += this.addCircle(
            panels.top.x + panels.top.w/2, 
            fanY, 
            fanDiameter/2
          );
        }
      });
      
      // Add air duct if enabled
      if (model.thermalManagement.hasDuct) {
        dxf += this.addRectangle(
          panels.top.x + panels.top.w*0.25, 
          panels.top.y + panels.top.h*0.25, 
          panels.top.w*0.5, 
          panels.top.h*0.5
        );
      }
    }
    
    // Draw front panel
    dxf += this.addRectangle(panels.front.x, panels.front.y, panels.front.w, panels.front.h);
    
    // Draw back panel
    dxf += this.addRectangle(panels.back.x, panels.back.y, panels.back.w, panels.back.h);
    
    // Add exhaust vent if air duct is enabled
    if (model.thermalManagement.hasDuct) {
      dxf += this.addCircle(
        panels.back.x + panels.back.w/2, 
        panels.back.y + panels.back.h/2, 
        Math.min(panels.back.w, panels.back.h)/3
      );
    }
    
    // Draw left panel
    dxf += this.addRectangle(panels.left.x, panels.left.y, panels.left.w, panels.left.h);
    
    // Draw right panel
    dxf += this.addRectangle(panels.right.x, panels.right.y, panels.right.w, panels.right.h);
    
    // Close DXF
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  /**
   * Add a rectangle to the DXF
   */
  private addRectangle(x: number, y: number, width: number, height: number): string {
    // Create a polyline for the rectangle
    let dxf = `0
POLYLINE
8
0
66
1
70
1
0
VERTEX
8
0
10
${x}
20
${y}
0
VERTEX
8
0
10
${x + width}
20
${y}
0
VERTEX
8
0
10
${x + width}
20
${y + height}
0
VERTEX
8
0
10
${x}
20
${y + height}
0
VERTEX
8
0
10
${x}
20
${y}
0
SEQEND
`;
    return dxf;
  }
  
  /**
   * Add a circle to the DXF
   */
  private addCircle(x: number, y: number, radius: number): string {
    let dxf = `0
CIRCLE
8
0
10
${x}
20
${y}
40
${radius}
`;
    return dxf;
  }
}
```

# src/utils/ExportOptions.css

```css
.export-options {
    margin-bottom: 20px;
  }
  
  .export-section {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f8f8f8;
  }
  
  .export-section h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #444;
  }
  
  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  .button-group button {
    min-width: 140px;
    padding: 8px 12px;
  }
  
  .primary-button {
    background-color: #4caf50;
    color: white;
  }
  
  .primary-button:hover {
    background-color: #45a049;
  }
  
  .info-text {
    font-style: italic;
    color: #666;
    margin-bottom: 10px;
  }
  
  .help-section {
    margin-top: 20px;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }
  
  .help-section h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .help-section ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .help-section li {
    margin-bottom: 5px;
    font-size: 14px;
  }
```

# src/utils/ExportOptions.tsx

```tsx
import React from 'react';
import './ExportOptions.css';

interface ExportOptionsProps {
  onExport: (format: 'svg' | 'dxf' | 'dwg' | 'laser-svg' | 'laser-dxf' | 'simple-svg' | 'simple-dxf') => void;
  hasLaserOptions?: boolean;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ 
  onExport,
  hasLaserOptions = false
}) => {
  return (
    <div className="export-options">
      <h2>Export Case Design</h2>
      
      <div className="export-section">
        <h3>Standard Exports</h3>
        <div className="button-group">
          <button onClick={() => onExport('svg')}>
            Download SVG
          </button>
          <button onClick={() => onExport('dxf')}>
            Download DXF
          </button>
          <button onClick={() => onExport('dwg')}>
            Download DWG
          </button>
        </div>
      </div>
      
      <div className="export-section">
        <h3>LibreCAD Compatible</h3>
        <div className="button-group">
          <button 
            onClick={() => onExport('simple-svg')}
            className="primary-button"
          >
            Download Simple SVG
          </button>
          <button 
            onClick={() => onExport('simple-dxf')}
            className="primary-button"
          >
            Download Simple DXF
          
      
      {hasLaserOptions && (
        <div className="export-section">
          <h3>Laser Cutting Exports</h3>
          <div className="button-group">
            <button 
              onClick={() => onExport('laser-svg')}
              className="primary-button"
            >
              Download Laser-Ready SVG
            </button>
            <button 
              onClick={() => onExport('laser-dxf')}
              className="primary-button"
            >
              Download Laser-Ready DXF
            </button>
          </div>
          <div className="info-text">
            <small>Files include finger joints for easy assembly</small>
          </div>
        </div>
      )}
      
      <div className="info-text">
        <small>Files can be used with laser cutters or CNC machines</small>
      </div>
      
      <div className="help-section">
        <h3>Export Guide</h3>
        <ul>
          <li><strong>SVG</strong> - Standard vector format for design software</li>
          <li><strong>DXF</strong> - Compatible with CAD software and laser cutters</li>
          <li><strong>DWG</strong> - AutoCAD native format</li>
          <li><strong>Laser-Ready</strong> - Includes finger joints and assembly tabs</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportOptions;
```

# src/utils/LaserCutExporter.ts

```ts
import { GPUCase, GPUSlot } from '../types';

/**
 * Enhanced exporter for laser-cutting compatible SVG files
 * Includes proper GPU dimensions and thermal management considerations
 */
export class LaserCutExporter {
  // Configuration for the finger joints and assembly
  private tabWidth: number = 0.5; // Width of the finger tabs in inches
  private tolerance: number = 0.01; // Tolerance for laser cutting in inches
  private tabLength: number = 0.5; // Length of glue tabs in inches
  private showLabels: boolean = true;
  
  constructor(tabWidth?: number, tolerance?: number, showLabels?: boolean) {
    if (tabWidth) this.tabWidth = tabWidth;
    if (tolerance) this.tolerance = tolerance;
    if (showLabels !== undefined) this.showLabels = showLabels;
  }
  
  /**
   * Export the case model as an SVG with proper laser-cutting patterns
   */
  exportSVG(model: GPUCase): string {
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate total SVG dimensions for the unfolded pattern
    const svgWidth = length * 2 + width * 2 + 2; // Add some padding
    const svgHeight = height * 2 + width * 2 + 2;
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${svgWidth}in" height="${svgHeight}in" viewBox="0 0 ${svgWidth * 96} ${svgHeight * 96}" 
  xmlns="http://www.w3.org/2000/svg">
  <!-- GPU Mining Case Design - Laser Cut Template -->
  <defs>
    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
    </pattern>
    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="url(#smallGrid)"/>
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" stroke-width="1"/>
    </pattern>
  </defs>
  
  <!-- Background Grid -->
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <!-- Case Outline - Cut Lines (Red) -->
  <g id="case-outline" fill="none" stroke="red" stroke-width="0.5">`;
    
    // Define panel positions (in inches)
    const panels = {
      bottom: { x: 1, y: 1, w: width, h: length },
      top: { x: 1, y: 1 + length + 1, w: width, h: length },
      front: { x: 1 + width + 1, y: 1, w: width, h: height },
      back: { x: 1 + width + 1, y: 1 + height + 1, w: width, h: height },
      left: { x: 1 + width + width + 2, y: 1, w: length, h: height },
      right: { x: 1 + width + width + 2, y: 1 + height + 1, w: length, h: height }
    };
    
    // Draw each panel with finger joints and appropriate cutouts
    svg += this.drawBottomPanel(panels.bottom.x, panels.bottom.y, width, length, t, model);
    svg += this.drawTopPanel(panels.top.x, panels.top.y, width, length, t, model);
    svg += this.drawFrontPanel(panels.front.x, panels.front.y, width, height, t, model);
    svg += this.drawBackPanel(panels.back.x, panels.back.y, width, height, t, model);
    svg += this.drawLeftPanel(panels.left.x, panels.left.y, length, height, t, model);
    svg += this.drawRightPanel(panels.right.x, panels.right.y, length, height, t, model);

    // Add panel labels if enabled
    if (this.showLabels) {
      svg += this.addPanelLabels(panels, width, length, height);
    }
    
    // Add assembly instructions
    svg += `
  </g>
  
  <!-- Text Annotations (Blue) - For Reference Only -->
  <g id="annotations" fill="none" stroke="blue" stroke-width="0.5">
    <text x="${(svgWidth/2) * 96}" y="${(svgHeight - 0.5) * 96}" font-family="Arial" font-size="16" text-anchor="middle" fill="blue">
      GPU Mining Case Design - For ${width}" x ${length}" x ${height}" Case
    </text>
    <text x="${(svgWidth/2) * 96}" y="${(svgHeight - 0.25) * 96}" font-family="Arial" font-size="12" text-anchor="middle" fill="blue">
      Material Thickness: ${t}" - Tab Width: ${this.tabWidth}" - GPU Slots: ${model.gpuSlots.length}
    </text>
  </g>
</svg>`;
    
    return svg;
  }
  
  /**
   * Export the case model as DXF
   */
  exportDXF(model: GPUCase): string {
    // For DXF export we would implement similar patterns but in DXF format
    // This is simplified for the example - a real implementation would use a DXF library
    
    const { length, width, height } = model.dimensions;
    
    let dxf = `999
DXF created by GPU Mining Case Designer
0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
`;

    // Add panels with finger joints
    // Similar to the SVG approach but in DXF format
    
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  /**
   * Draw the bottom panel with finger joints and GPU mounting slots
   */
  private drawBottomPanel(x: number, y: number, width: number, length: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Bottom Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    path += `M ${x * 96} ${(y + length) * 96}`;
    
    // Draw bottom edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, true);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, true, false);
    
    // Draw top edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, true, true);
    
    path += `" />`;
    
    // Add GPU mounting slots
    if (model.gpuSlots.length > 0) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const mountY = y + slotSpacing * (index + 1);
        
        // GPU mounting bracket slots
        path += `
        <!-- GPU ${index + 1} Mounting Bracket -->
        <rect x="${(x + width/4) * 96}" y="${(mountY - 0.5) * 96}" width="${(width/2) * 96}" height="${1 * 96}" rx="${0.1 * 96}" ry="${0.1 * 96}" />`;
      });
    }
    
    return path;
  }
  
  /**
   * Draw the top panel with finger joints and GPU ventilation cutouts
   */
  private drawTopPanel(x: number, y: number, width: number, length: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Top Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add ventilation cutouts over GPU positions
    if (model.gpuSlots.length > 0) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const fanCount = gpu.name.includes('3090') || gpu.length > 12 ? 3 : 
                         gpu.name.includes('3080') ? 3 : 
                         gpu.name.includes('3070') ? 2 : 2;
        
        const gpuCenterY = y + slotSpacing * (index + 1);
        const fanSpacing = gpu.length / (fanCount + 1);
        const fanDiameter = Math.min(1.5, gpu.width);
        
        // Draw gpu outline
        path += `
        <!-- GPU ${index + 1} Outline (${gpu.name}) -->
        <rect x="${(x + width/2 - gpu.width/2) * 96}" y="${(gpuCenterY - gpu.length/2) * 96}" 
              width="${gpu.width * 96}" height="${gpu.length * 96}" 
              stroke="blue" stroke-dasharray="5,2" />`;
        
        // Draw fan ventilation holes
        for (let i = 0; i < fanCount; i++) {
          const fanY = gpuCenterY - gpu.length/2 + fanSpacing * (i + 1);
          
          path += `
        <!-- GPU ${index + 1} Fan ${i + 1} Ventilation -->
        <circle cx="${(x + width/2) * 96}" cy="${fanY * 96}" r="${(fanDiameter/2) * 96}" />`;
        }
      });
    }
    
    // Add air duct cutout for heat extraction if enabled
    if (model.thermalManagement.hasDuct) {
      path += `
      <!-- Hot Air Duct Cutout -->
      <rect x="${(x + width/4) * 96}" y="${(y + length/4) * 96}" 
            width="${(width/2) * 96}" height="${(length/2) * 96}" 
            rx="${0.25 * 96}" ry="${0.25 * 96}" />`;
    }
    
    return path;
  }
  
  /**
   * Draw the front panel with finger joints and air intake cutouts
   */
  private drawFrontPanel(x: number, y: number, width: number, height: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Front Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge (bottom of case)
    path += ` l ${width * 96} 0`;
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add air intake cutouts for GPU cooling
    if (model.gpuSlots.length > 0) {
      const slotSpacing = width / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const intakeX = x + slotSpacing * (index + 1);
        const intakeWidth = Math.min(2, gpu.width);
        const intakeHeight = 1;
        
        path += `
        <!-- GPU ${index + 1} Air Intake -->
        <rect x="${(intakeX - intakeWidth/2) * 96}" y="${(y + height - intakeHeight - 0.5) * 96}" 
              width="${intakeWidth * 96}" height="${intakeHeight * 96}" 
              rx="${0.2 * 96}" ry="${0.2 * 96}" />`;
      });
    }
    
    return path;
  }
  
  /**
   * Draw the back panel with finger joints and exhaust/cable cutouts
   */
  private drawBackPanel(x: number, y: number, width: number, height: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Back Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add exhaust vent if air duct is enabled
    if (model.thermalManagement.hasDuct) {
      const ductDiameter = Math.min(4, width * 0.8);
      
      path += `
      <!-- Hot Air Exhaust Duct -->
      <circle cx="${(x + width/2) * 96}" cy="${(y + height/2) * 96}" r="${(ductDiameter/2) * 96}" />`;
    }
    
    // Add power cable cutout
    path += `
    <!-- Power Cable Cutout -->
    <rect x="${(x + width/2 - 1) * 96}" y="${(y + height - 1.5) * 96}" 
          width="${2 * 96}" height="${1 * 96}" 
          rx="${0.2 * 96}" ry="${0.2 * 96}" />`;
    
    return path;
  }
  
  /**
   * Draw the left panel with finger joints and side ventilation
   */
  private drawLeftPanel(x: number, y: number, length: number, height: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Left Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add ventilation slots for side airflow
    for (let i = 0; i < 5; i++) {
      const ventY = y + (height / 6) * (i + 1);
      const ventWidth = length / 2;
      const ventHeight = 0.5;
      
      path += `
      <!-- Side Ventilation Slot ${i + 1} -->
      <rect x="${(x + length/4) * 96}" y="${(ventY - ventHeight/2) * 96}" 
            width="${ventWidth * 96}" height="${ventHeight * 96}" 
            rx="${(ventHeight/2) * 96}" ry="${(ventHeight/2) * 96}" />`;
    }
    
    return path;
  }
  
  /**
   * Draw the right panel with finger joints and side ventilation
   */
  private drawRightPanel(x: number, y: number, length: number, height: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Right Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add ventilation slots for side airflow
    for (let i = 0; i < 5; i++) {
      const ventY = y + (height / 6) * (i + 1);
      const ventWidth = length / 2;
      const ventHeight = 0.5;
      
      path += `
      <!-- Side Ventilation Slot ${i + 1} -->
      <rect x="${(x + length/4) * 96}" y="${(ventY - ventHeight/2) * 96}" 
            width="${ventWidth * 96}" height="${ventHeight * 96}" 
            rx="${(ventHeight/2) * 96}" ry="${(ventHeight/2) * 96}" />`;
    }
    
    // Add temperature sensor holes if enabled
    if (model.thermalManagement.hasTempSensors) {
      for (let i = 0; i < 3; i++) {
        const sensorY = y + (height / 4) * (i + 1);
        
        path += `
        <!-- Temperature Sensor ${i + 1} -->
        <circle cx="${(x + length - 0.5) * 96}" cy="${sensorY * 96}" r="${0.125 * 96}" />`;
      }
    }
    
    return path;
  }
  
  /**
   * Draw an edge with finger joint tabs
   * @param length Length of the edge
   * @param tabWidth Width of each tab
   * @param isVertical Whether the edge is vertical
   * @param invert Whether to invert the tab pattern
   */
  private drawEdgeWithTabs(length: number, tabWidth: number, isVertical: boolean, invert: boolean): string {
    let path = '';
    const numTabs = Math.max(2, Math.floor(length / (tabWidth * 2)));
    const actualTabWidth = length / (numTabs * 2);
    
    for (let i = 0; i < numTabs; i++) {
      for (let j = 0; j < 2; j++) {
        const hasTab = (j === 0) !== invert;
        
        if (isVertical) {
          if (hasTab) {
            // Draw a tab (jutting out)
            path += ` l ${this.tolerance * 96} 0`;
            path += ` l 0 ${actualTabWidth * 96}`;
            path += ` l ${-this.tolerance * 96} 0`;
          } else {
            // Draw a slot (indented)
            path += ` l ${-this.tolerance * 96} 0`;
            path += ` l 0 ${actualTabWidth * 96}`;
            path += ` l ${this.tolerance * 96} 0`;
          }
        } else {
          if (hasTab) {
            // Draw a tab (jutting out)
            path += ` l 0 ${this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${-this.tolerance * 96}`;
          } else {
            // Draw a slot (indented)
            path += ` l 0 ${-this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${this.tolerance * 96}`;
          }
        }
      }
    }
    
    return path;
  }
  
  /**
   * Add glue tab to an edge
   * Not currently used but available for future implementation
   */
  private addGlueTab(x: number, y: number, length: number, isVertical: boolean): string {
    const tabLength = this.tabLength;
    
    if (isVertical) {
      return `
      <rect x="${(x) * 96}" y="${y * 96}" width="${tabLength * 96}" height="${length * 96}" 
            stroke="red" stroke-dasharray="5,2" />`;
    } else {
      return `
      <rect x="${x * 96}" y="${(y) * 96}" width="${length * 96}" height="${tabLength * 96}" 
            stroke="red" stroke-dasharray="5,2" />`;
    }
  }
  
  /**
   * Add text labels to each panel
   */
  private addPanelLabels(panels: any, width: number, length: number, height: number): string {
    let labels = '';
    
    // Add labels to each panel
    labels += this.addLabel('Top', panels.top.x + width/2, panels.top.y + length/2);
    labels += this.addLabel('Bottom', panels.bottom.x + width/2, panels.bottom.y + length/2);
    labels += this.addLabel('Front', panels.front.x + width/2, panels.front.y + height/2);
    labels += this.addLabel('Back', panels.back.x + width/2, panels.back.y + height/2);
    labels += this.addLabel('Left', panels.left.x + length/2, panels.left.y + height/2);
    labels += this.addLabel('Right', panels.right.x + length/2, panels.right.y + height/2);
    
    return labels;
  }
  
  /**
   * Add a text label to a panel
   */
  private addLabel(text: string, x: number, y: number): string {
    return `
    <text x="${x * 96}" y="${y * 96}" font-family="Arial" font-size="14" text-anchor="middle" fill="#666666">
      ${text}
    </text>`;
  }
  
  /**
   * Add a dimension line with measurement text
   * Not currently used but available for future implementation
   */
  private addDimension(x1: number, y1: number, x2: number, y2: number, text: string, offset: number = 0.25): string {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Calculate perpendicular offset
    const nx = -dy / length;
    const ny = dx / length;
    const ox = nx * offset;
    const oy = ny * offset;
    
    return `
    <path d="M ${x1*96} ${y1*96} L ${x2*96} ${y2*96}" stroke="blue" stroke-dasharray="5,2" />
    <text x="${(x1+x2)/2*96 + ox*96}" y="${(y1+y2)/2*96 + oy*96}" font-family="Arial" font-size="10" 
          text-anchor="middle" fill="blue" transform="rotate(${angle}, ${(x1+x2)/2*96 + ox*96}, ${(y1+y2)/2*96 + oy*96})">
      ${text}
    </text>`;
  }
}
```

# src/utils/SVGExporter.ts

```ts
import { GPUCase } from '../types';

/**
 * A simplified SVG exporter that creates a laser-cutting ready file
 * This version focuses on generating a practical output that works in LibreCAD
 */
export class SimpleSVGExporter {
  /**
   * Export the case model as an SVG with proper laser-cutting patterns
   */
  export(model: GPUCase): string {
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate total SVG dimensions
    const svgWidth = length * 2 + width * 2 + 2; // Add some padding
    const svgHeight = height * 2 + width + 2;
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${svgWidth}in" height="${svgHeight}in" viewBox="0 0 ${svgWidth * 96} ${svgHeight * 96}" 
  xmlns="http://www.w3.org/2000/svg">
  <g id="case-outline" fill="none" stroke="#000000" stroke-width="0.5">`;
    
    // Define panel positions (in inches)
    const panels = {
      bottom: { x: 1, y: 1, w: width, h: length },
      top: { x: 1 + width + 1, y: 1, w: width, h: length },
      front: { x: 1, y: 1 + length + 1, w: width, h: height },
      back: { x: 1 + width + 1, y: 1 + length + 1, w: width, h: height },
      left: { x: 1 + width*2 + 2, y: 1, w: length, h: height },
      right: { x: 1 + width*2 + 2, y: 1 + height + 1, w: length, h: height }
    };
    
    // Simple bottom panel
    svg += this.drawPanel(panels.bottom.x, panels.bottom.y, panels.bottom.w, panels.bottom.h, 'Bottom');
    
    // Top panel with GPU ventilation
    svg += this.drawPanel(panels.top.x, panels.top.y, panels.top.w, panels.top.h, 'Top');
    svg += this.addGPUVentilation(panels.top, model);
    
    // Front panel with intake vents
    svg += this.drawPanel(panels.front.x, panels.front.y, panels.front.w, panels.front.h, 'Front');
    
    // Back panel with exhaust
    svg += this.drawPanel(panels.back.x, panels.back.y, panels.back.w, panels.back.h, 'Back');
    svg += this.addExhaustVent(panels.back, model);
    
    // Side panels
    svg += this.drawPanel(panels.left.x, panels.left.y, panels.left.w, panels.left.h, 'Left');
    svg += this.drawPanel(panels.right.x, panels.right.y, panels.right.w, panels.right.h, 'Right');
    
    // Close SVG
    svg += `
  </g>
</svg>`;
    
    return svg;
  }
  
  /**
   * Draw a simple panel rectangle
   */
  private drawPanel(x: number, y: number, width: number, height: number, label: string): string {
    return `
    <!-- ${label} Panel -->
    <rect x="${x * 96}" y="${y * 96}" width="${width * 96}" height="${height * 96}" />`;
  }
  
  /**
   * Add GPU ventilation holes to the top panel
   */
  private addGPUVentilation(panel: { x: number, y: number, w: number, h: number }, model: GPUCase): string {
    if (model.gpuSlots.length === 0) return '';
    
    let ventilation = '';
    const slotSpacing = panel.h / (model.gpuSlots.length + 1);
    
    model.gpuSlots.forEach((gpu, index) => {
      // Determine number of fans based on GPU model
      const fanCount = gpu.name.includes('3090') || gpu.name.includes('4090') ? 3 : 
                      gpu.name.includes('3080') || gpu.name.includes('4080') ? 3 : 2;
      
      const gpuCenterY = panel.y + slotSpacing * (index + 1);
      const fanSpacing = gpu.length / (fanCount + 1);
      const fanDiameter = Math.min(1.5, gpu.width);
      
      // Add fan ventilation holes
      for (let i = 0; i < fanCount; i++) {
        const fanY = gpuCenterY - gpu.length/2 + fanSpacing * (i + 1);
        
        ventilation += `
    <!-- GPU ${index + 1} Fan ${i + 1} -->
    <circle cx="${(panel.x + panel.w/2) * 96}" cy="${fanY * 96}" r="${(fanDiameter/2) * 96}" />`;
      }
    });
    
    // Add air duct if enabled
    if (model.thermalManagement.hasDuct) {
      ventilation += `
    <!-- Air Duct -->
    <rect x="${(panel.x + panel.w*0.25) * 96}" y="${(panel.y + panel.h*0.25) * 96}" 
         width="${(panel.w*0.5) * 96}" height="${(panel.h*0.5) * 96}" rx="${10}" ry="${10}" />`;
    }
    
    return ventilation;
  }
  
  /**
   * Add exhaust vent to the back panel
   */
  private addExhaustVent(panel: { x: number, y: number, w: number, h: number }, model: GPUCase): string {
    if (!model.thermalManagement.hasDuct) return '';
    
    return `
    <!-- Exhaust Vent -->
    <circle cx="${(panel.x + panel.w/2) * 96}" cy="${(panel.y + panel.h/2) * 96}" r="${(Math.min(panel.w, panel.h)/3) * 96}" />`;
  }
}
```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

```

# tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}

```

# vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true
  }
});

```

