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
