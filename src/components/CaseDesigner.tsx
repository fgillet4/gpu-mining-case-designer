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
