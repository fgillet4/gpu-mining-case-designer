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
