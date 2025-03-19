import React from 'react';
import './ExportOptions.css';

interface ExportOptionsProps {
  onExport: (format: 'svg' | 'dxf' | 'dwg') => void;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ onExport }) => {
  return (
    <div className="export-options">
      <h2>Export Case Design</h2>
      
      <div className="export-section">
        <h3>Export Options</h3>
        <div className="button-group">
          <button 
            onClick={() => onExport('svg')}
            className="primary-button"
          >
            Download SVG
          </button>
          <button 
            onClick={() => onExport('dxf')}
            className="primary-button"
          >
            Download DXF
          </button>
          <button onClick={() => onExport('dwg')} disabled>
            Download DWG
          </button>
        </div>
        <div className="info-text">
          <small>Optimized for laser cutters and CNC machines with finger joint tabs</small>
        </div>
      </div>
      
      <div className="help-section">
        <h3>Export Guide</h3>
        <ul>
          <li><strong>SVG</strong> - Vector format for design software and laser cutters</li>
          <li><strong>DXF</strong> - CAD format compatible with most CNC software</li>
          <li><strong>DWG</strong> - AutoCAD native format (not implemented yet)</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportOptions;
