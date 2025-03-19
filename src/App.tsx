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
  const handleExport = (format: 'svg' | 'dxf' | 'dwg' | 'laser-svg' | 'laser-dxf') => {
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'svg') {
      const exporter = new SVGExporter();
      data = exporter.export(caseModel);
      filename = 'gpu-case.svg';
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