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