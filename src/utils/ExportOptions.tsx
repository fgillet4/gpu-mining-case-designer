import React from 'react';
import './ExportOptions.css';

interface ExportOptionsProps {
  onExport: (format: 'svg' | 'dxf' | 'dwg' | 'laser-svg' | 'laser-dxf') => void;
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