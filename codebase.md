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

.button-group {
  display: flex;
  gap: 10px;
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
import { SVGExporter } from './utils/SVGExporter';
import { DXFExporter } from './utils/DXFExporter';
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
  
  // GPU models
  const [gpuModels, setGpuModels] = useState<GPUSlot[]>([
    { name: 'RTX 3080', length: 11.2, height: 4.4, width: 2, tdp: 320 },
    { name: 'RTX 3080', length: 11.2, height: 4.4, width: 2, tdp: 320 },
    { name: 'RTX 3080', length: 11.2, height: 4.4, width: 2, tdp: 320 }
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
  const handleExport = (format: 'svg' | 'dxf' | 'dwg') => {
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'svg') {
      const exporter = new SVGExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case.svg';
      mimeType = 'image/svg+xml';
      downloadFile(data, filename, mimeType);
    } else if (format === 'dxf') {
      const exporter = new DXFExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case.dxf';
      mimeType = 'application/dxf';
      downloadFile(data, filename, mimeType);
    } else {
      alert('DWG format is not yet implemented');
    }
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
        
        <ExportOptions onExport={handleExport} />
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
}

.gpu-slot {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #e9e9e9;
  border-radius: 4px;
}

.gpu-slot h3 {
  margin-top: 0;
  font-size: 16px;
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
  // GPU model definitions
  const gpuDefinitions = {
    'RTX 3060': { length: 9.5, height: 4.4, width: 2, tdp: 170 },
    'RTX 3070': { length: 10.5, height: 4.4, width: 2, tdp: 220 },
    'RTX 3080': { length: 11.2, height: 4.4, width: 2, tdp: 320 },
    'RTX 3090': { length: 12.3, height: 5.4, width: 2.5, tdp: 350 },
    'RTX 4070': { length: 10.8, height: 4.4, width: 2, tdp: 200 },
    'RTX 4080': { length: 11.9, height: 5.0, width: 2.3, tdp: 320 },
    'RTX 4090': { length: 13.5, height: 5.9, width: 2.7, tdp: 450 },
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
                <option value="RTX 3060">RTX 3060</option>
                <option value="RTX 3070">RTX 3070</option>
                <option value="RTX 3080">RTX 3080</option>
                <option value="RTX 3090">RTX 3090</option>
                <option value="RTX 4070">RTX 4070</option>
                <option value="RTX 4080">RTX 4080</option>
                <option value="RTX 4090">RTX 4090</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            {gpu.name === 'Custom' && (
              <>
                <div className="form-group">
                  <label htmlFor={`gpu-length-${index}`}>Length (inches)</label>
                  <input
                    type="number"
                    id={`gpu-length-${index}`}
                    value={gpu.length}
                    onChange={(e) => updateGpuProperty(index, 'length', Number(e.target.value))}
                    min={5}
                    max={16}
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
                    max={3}
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
              </>
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

export class DXFExporter {
  export(model: GPUCase): string {
    // This is a simplified DXF export
    // A real implementation would require a more complete DXF library
    
    const { length, width, height } = model.dimensions;
    
    let dxf = `999
DXF created by GPU Case Designer
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

    // Add bottom panel
    dxf += this.addRectangle(0, height, length, width);
    
    // Add top panel
    dxf += this.addRectangle(0, height + width, length, width);
    
    // Add front panel
    dxf += this.addRectangle(0, 0, length, height);
    
    // Add back panel
    dxf += this.addRectangle(0, height + width * 2, length, height);
    
    // Add side panels
    dxf += this.addRectangle(length, height, width, height);
    dxf += this.addRectangle(length + width, height, width, height);
    
    // Add GPU cutouts and air ducts (simplified)
    if (model.gpuSlots.length > 0 && model.thermalManagement.hasDuct) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const gpuX = slotSpacing * (index + 1) - gpu.width / 2;
        const gpuY = height + width / 2 - gpu.length / 2;
        
        dxf += this.addRectangle(gpuX, gpuY, gpu.width, gpu.length);
      });
    }
    
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  private addRectangle(x: number, y: number, width: number, height: number): string {
    // Create a simple polyline rectangle in DXF format
    return `0
POLYLINE
8
0
66
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
  }
}
```

# src/utils/SVGExporter.ts

```ts
import { GPUCase } from '../types';

export class SVGExporter {
  export(model: GPUCase): string {
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate the unfolded box layout
    // This is a simplified version - a real implementation would include
    // proper tabs and joints for laser cutting
    
    // Calculate total SVG dimensions based on the unfolded pattern
    const svgWidth = length * 3 + width * 2;
    const svgHeight = height * 2 + width * 2;
    
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <svg width="${svgWidth}in" height="${svgHeight}in" viewBox="0 0 ${svgWidth * 96} ${svgHeight * 96}" 
      xmlns="http://www.w3.org/2000/svg">
      <g id="case-outline" fill="none" stroke="black" stroke-width="1">`;
    
    // Bottom panel
    svg += this.drawRectangle(0, height, length, width);
    
    // Top panel
    svg += this.drawRectangle(0, height + width, length, width);
    
    // Front panel
    svg += this.drawRectangle(0, 0, length, height);
    
    // Back panel
    svg += this.drawRectangle(0, height + width * 2, length, height);
    
    // Left side panel
    svg += this.drawRectangle(length, height, width, height);
    
    // Right side panel
    svg += this.drawRectangle(length + width, height, width, height);
    
    // Add GPU cutouts in the top panel if needed
    if (model.gpuSlots.length > 0) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const gpuX = slotSpacing * (index + 1) - gpu.width / 2;
        const gpuY = height + width / 2 - gpu.length / 2;
        
        svg += this.drawRectangle(
          gpuX, 
          gpuY, 
          gpu.width, 
          gpu.length, 
          true
        );
      });
    }
    
    // Add air duct openings if needed
    if (model.thermalManagement.hasDuct) {
      // Top vent cutouts
      for (let i = 0; i < 3; i++) {
        const ventWidth = length / 4;
        const ventX = (length / 3) * i + length / 6 - ventWidth / 2;
        const ventY = height + width / 4;
        
        svg += this.drawRectangle(
          ventX,
          ventY,
          ventWidth,
          width / 2,
          true
        );
      }
      
      // Front fan cutouts
      for (let i = 0; i < model.gpuSlots.length; i++) {
        const fanSize = 3; // Typical fan size in inches
        const fanX = (length / (model.gpuSlots.length + 1)) * (i + 1) - fanSize / 2;
        const fanY = height / 2 - fanSize / 2;
        
        svg += `<circle cx="${(fanX + fanSize/2) * 96}" cy="${(fanY + fanSize/2) * 96}" r="${(fanSize/2) * 96}" />`;
      }
    }
    
    svg += `
      </g>
    </svg>`;
    
    return svg;
  }
  
  private drawRectangle(x: number, y: number, width: number, height: number, isDashed: boolean = false): string {
    const dashing = isDashed ? ' stroke-dasharray="5,5"' : '';
    return `<rect x="${x * 96}" y="${y * 96}" width="${width * 96}" height="${height * 96}"${dashing} />`;
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

