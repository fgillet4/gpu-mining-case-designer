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
