import { GPUCase } from '../types';

/**
 * An SVG exporter that creates a standard SVG file for the case design
 * Now with improved layout and finger joints inspired by MakerCase
 */
export class SVGExporter {
  // Configuration for the finger joints
  private tabWidth = 0.5; // Width of the finger tabs in inches
  private tolerance = 0.01; // Tolerance for laser cutting in inches
  private spacing = 0.5; // Spacing between panels

  /**
   * Export the case model as an SVG with proper laser-cutting patterns
   * Creates a well-organized layout with non-overlapping panels
   */
  export(model: GPUCase): string {
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate optimal tab count for each dimension
    const tabSizeInches = 0.5; // Target size for tabs
    const widthTabs = Math.max(3, Math.floor(width / tabSizeInches));
    const lengthTabs = Math.max(3, Math.floor(length / tabSizeInches));
    const heightTabs = Math.max(3, Math.floor(height / tabSizeInches));
    
    // Calculate total SVG dimensions with organized panel layout
    const svgWidth = width + length * 2 + width + this.spacing * 4 + 1;
    const svgHeight = height + length * 2 + this.spacing * 3 + 1;
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${svgWidth}in" height="${svgHeight}in" viewBox="0 0 ${svgWidth * 96} ${svgHeight * 96}" 
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <path d="M 96 0 L 0 0 0 96" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <!-- Background grid (1-inch grid) -->
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <g id="case-outline" fill="none" stroke="#000000" stroke-width="0.5">`;
    
    // Create a well-organized layout with proper spacing
    // Define panel positions in a logical unfolded box pattern (in inches)
    const panels = {
      // Bottom row
      bottom: { x: width + this.spacing, y: 0.5, w: width, h: length },
      
      // Middle row
      left: { x: 0.5, y: length + this.spacing + 0.5, w: length, h: height },
      front: { x: length + this.spacing + 0.5, y: length + this.spacing + 0.5, w: width, h: height },
      right: { x: length + width + this.spacing * 2 + 0.5, y: length + this.spacing + 0.5, w: length, h: height },
      back: { x: length * 2 + width + this.spacing * 3 + 0.5, y: length + this.spacing + 0.5, w: width, h: height },
      
      // Top row
      top: { x: width + this.spacing, y: length + height + this.spacing * 2 + 0.5, w: width, h: length }
    };
    
    // Draw panels with finger joints
    // Bottom panel
    svg += this.drawBottomPanel(panels.bottom.x, panels.bottom.y, width, length, t, widthTabs, lengthTabs);
    
    // Top panel with ventilation holes
    svg += this.drawTopPanel(panels.top.x, panels.top.y, width, length, t, widthTabs, lengthTabs, model);
    
    // Side panels
    svg += this.drawLeftPanel(panels.left.x, panels.left.y, length, height, t, lengthTabs, heightTabs);
    
    // Front/back panels
    svg += this.drawFrontPanel(panels.front.x, panels.front.y, width, height, t, widthTabs, heightTabs);
    svg += this.drawBackPanel(panels.back.x, panels.back.y, width, height, t, widthTabs, heightTabs, model);
    
    // Right panel with ventilation
    svg += this.drawRightPanel(panels.right.x, panels.right.y, length, height, t, lengthTabs, heightTabs, model);
    
    // Add panel labels
    svg += this.addPanelLabels(panels);
    
    // Add diagram title and dimensions
    svg += `
    <!-- Diagram title and information -->
    <text x="${(svgWidth/2) * 96}" y="${(svgHeight - 0.25) * 96}" font-family="Arial" font-size="14" 
          text-anchor="middle" fill="#333333">
      GPU Mining Case: ${width}" × ${length}" × ${height}" - Material: ${t}"
    </text>`;
    
    // Close SVG
    svg += `
  </g>
</svg>`;
    
    return svg;
  }
  
  /**
   * Draw the bottom panel with finger joints
   */
  private drawBottomPanel(x: number, y: number, width: number, length: number, thickness: number, 
                          widthTabs: number, lengthTabs: number): string {
    let path = `
    <!-- Bottom Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    path += `M ${x * 96} ${(y + length) * 96}`;
    
    // Draw edges with finger joints
    path += this.drawEdgeWithTabs(width, widthTabs, false, false); // Bottom edge
    path += this.drawEdgeWithTabs(length, lengthTabs, true, false); // Right edge
    path += this.drawEdgeWithTabs(width, widthTabs, false, true); // Top edge
    path += this.drawEdgeWithTabs(length, lengthTabs, true, true); // Left edge
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw the top panel with finger joints and ventilation holes
   */
  private drawTopPanel(x: number, y: number, width: number, length: number, thickness: number, 
                       widthTabs: number, lengthTabs: number, model: GPUCase): string {
    let svg = `
    <!-- Top Panel with Ventilation -->
    <path d="`;
    
    // Start at the bottom-left corner
    svg += `M ${x * 96} ${(y + length) * 96}`;
    
    // Draw edges with finger joints (inverted from bottom panel)
    svg += this.drawEdgeWithTabs(width, widthTabs, false, true); // Bottom edge
    svg += this.drawEdgeWithTabs(length, lengthTabs, true, true); // Right edge
    svg += this.drawEdgeWithTabs(width, widthTabs, false, false); // Top edge
    svg += this.drawEdgeWithTabs(length, lengthTabs, true, false); // Left edge
    
    svg += `" />`;
    
    // Add GPU ventilation holes
    if (model.gpuSlots.length > 0) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        // Determine number of fans based on GPU model
        const fanCount = gpu.name.includes('3090') || gpu.name.includes('4090') ? 3 : 
                         gpu.name.includes('3080') || gpu.name.includes('4080') ? 3 : 2;
        
        const gpuCenterY = y + slotSpacing * (index + 1);
        const fanSpacing = gpu.length / (fanCount + 1);
        const fanDiameter = Math.min(1.5, gpu.width);
        
        // Add fan ventilation holes
        for (let i = 0; i < fanCount; i++) {
          const fanY = gpuCenterY;
          const fanX = x + width/2 - (fanCount-1)*fanSpacing/2 + i*fanSpacing;
          
          svg += `
    <!-- GPU ${index + 1} Fan ${i + 1} -->
    <circle cx="${fanX * 96}" cy="${fanY * 96}" r="${(fanDiameter/2) * 96}" />`;
        }
      });
      
      // Add air duct if enabled
      if (model.thermalManagement.hasDuct) {
        svg += `
    <!-- Air Duct -->
    <rect x="${(x + width*0.25) * 96}" y="${(y + length*0.25) * 96}" 
          width="${(width*0.5) * 96}" height="${(length*0.5) * 96}" 
          rx="${0.25 * 96}" ry="${0.25 * 96}" />`;
      }
    }
    
    return svg;
  }
  
  /**
   * Draw the front panel with finger joints
   */
  private drawFrontPanel(x: number, y: number, width: number, height: number, thickness: number, 
                         widthTabs: number, heightTabs: number): string {
    let svg = `
    <!-- Front Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    svg += `M ${x * 96} ${(y + height) * 96}`;
    
    // Draw edges with finger joints
    svg += this.drawEdgeWithTabs(width, widthTabs, false, false); // Bottom edge (no tabs)
    svg += this.drawEdgeWithTabs(height, heightTabs, true, false); // Right edge
    svg += this.drawEdgeWithTabs(width, widthTabs, false, true); // Top edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, true); // Left edge
    
    svg += `" />`;
    
    // Add air intake vents for better cooling
    const ventCount = 3;
    const ventWidth = width * 0.6;
    const ventHeight = 0.5;
    const ventX = x + (width - ventWidth) / 2;
    
    for (let i = 0; i < ventCount; i++) {
      const ventY = y + height * (i + 1) / (ventCount + 1);
      
      svg += `
    <!-- Front Air Intake ${i+1} -->
    <rect x="${ventX * 96}" y="${(ventY - ventHeight/2) * 96}" 
          width="${ventWidth * 96}" height="${ventHeight * 96}" 
          rx="${(ventHeight/2) * 96}" ry="${(ventHeight/2) * 96}" />`;
    }
    
    return svg;
  }
  
  /**
   * Draw the back panel with finger joints and exhaust vent
   */
  private drawBackPanel(x: number, y: number, width: number, height: number, thickness: number, 
                        widthTabs: number, heightTabs: number, model: GPUCase): string {
    let svg = `
    <!-- Back Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    svg += `M ${x * 96} ${(y + height) * 96}`;
    
    // Draw edges with finger joints
    svg += this.drawEdgeWithTabs(width, widthTabs, false, true); // Bottom edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, true); // Right edge
    svg += this.drawEdgeWithTabs(width, widthTabs, false, false); // Top edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, false); // Left edge
    
    svg += `" />`;
    
    // Add exhaust vent if air duct is enabled
    if (model.thermalManagement.hasDuct) {
      svg += `
    <!-- Exhaust Vent -->
    <circle cx="${(x + width/2) * 96}" cy="${(y + height/2) * 96}" r="${(Math.min(width, height)/3) * 96}" />`;
    }
    
    // Add power cable cutout
    svg += `
    <!-- Power Cable Cutout -->
    <rect x="${(x + width/2 - 1) * 96}" y="${(y + height - 1.5) * 96}" 
          width="${2 * 96}" height="${1 * 96}" 
          rx="${0.2 * 96}" ry="${0.2 * 96}" />`;
    
    return svg;
  }
  
  /**
   * Draw the left panel with finger joints
   */
  private drawLeftPanel(x: number, y: number, length: number, height: number, thickness: number, 
                        lengthTabs: number, heightTabs: number): string {
    let svg = `
    <!-- Left Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    svg += `M ${x * 96} ${(y + height) * 96}`;
    
    // Draw edges with finger joints
    svg += this.drawEdgeWithTabs(length, lengthTabs, false, true); // Bottom edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, false); // Right edge
    svg += this.drawEdgeWithTabs(length, lengthTabs, false, false); // Top edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, true); // Left edge
    
    svg += `" />`;
    
    // Add ventilation slots
    for (let i = 0; i < 3; i++) {
      const ventY = y + height * (i + 1) / 4;
      const ventWidth = length * 0.6;
      const ventHeight = 0.5;
      const ventX = x + (length - ventWidth) / 2;
      
      svg += `
    <!-- Left Side Ventilation ${i+1} -->
    <rect x="${ventX * 96}" y="${(ventY - ventHeight/2) * 96}" 
          width="${ventWidth * 96}" height="${ventHeight * 96}" 
          rx="${(ventHeight/2) * 96}" ry="${(ventHeight/2) * 96}" />`;
    }
    
    return svg;
  }
  
  /**
   * Draw the right panel with finger joints and ventilation
   */
  private drawRightPanel(x: number, y: number, length: number, height: number, thickness: number, 
                         lengthTabs: number, heightTabs: number, model: GPUCase): string {
    let svg = `
    <!-- Right Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    svg += `M ${x * 96} ${(y + height) * 96}`;
    
    // Draw edges with finger joints
    svg += this.drawEdgeWithTabs(length, lengthTabs, false, false); // Bottom edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, true); // Right edge
    svg += this.drawEdgeWithTabs(length, lengthTabs, false, true); // Top edge
    svg += this.drawEdgeWithTabs(height, heightTabs, true, false); // Left edge
    
    svg += `" />`;
    
    // Add ventilation slots
    for (let i = 0; i < 3; i++) {
      const ventY = y + height * (i + 1) / 4;
      const ventWidth = length * 0.6;
      const ventHeight = 0.5;
      const ventX = x + (length - ventWidth) / 2;
      
      svg += `
    <!-- Right Side Ventilation ${i+1} -->
    <rect x="${ventX * 96}" y="${(ventY - ventHeight/2) * 96}" 
          width="${ventWidth * 96}" height="${ventHeight * 96}" 
          rx="${(ventHeight/2) * 96}" ry="${(ventHeight/2) * 96}" />`;
    }
    
    // Add temperature sensor holes if enabled
    if (model.thermalManagement.hasTempSensors) {
      for (let i = 0; i < 3; i++) {
        const sensorY = y + height * (i + 1) / 4;
        
        svg += `
    <!-- Temperature Sensor ${i+1} -->
    <circle cx="${(x + length - 0.5) * 96}" cy="${sensorY * 96}" r="${0.125 * 96}" />`;
      }
    }
    
    return svg;
  }
  
  /**
   * Draw an edge with finger joint tabs
   */
  private drawEdgeWithTabs(edgeLength: number, tabCount: number, isVertical: boolean, invert: boolean): string {
    let path = '';
    const actualTabWidth = edgeLength / (tabCount * 2);
    
    for (let i = 0; i < tabCount; i++) {
      for (let j = 0; j < 2; j++) {
        const hasTab = (j === 0) !== invert;
        
        if (isVertical) {
          // Vertical edge
          if (hasTab) {
            // Tab jutting out
            path += ` l ${this.tolerance * 96} 0`;
            path += ` l 0 ${-actualTabWidth * 96}`;
            path += ` l ${-this.tolerance * 96} 0`;
          } else {
            // Slot indented
            path += ` l ${-this.tolerance * 96} 0`;
            path += ` l 0 ${-actualTabWidth * 96}`;
            path += ` l ${this.tolerance * 96} 0`;
          }
        } else {
          // Horizontal edge
          if (hasTab) {
            // Tab jutting out
            path += ` l 0 ${-this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${this.tolerance * 96}`;
          } else {
            // Slot indented
            path += ` l 0 ${this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${-this.tolerance * 96}`;
          }
        }
      }
    }
    
    return path;
  }
  
  /**
   * Add text labels to each panel
   */
  private addPanelLabels(panels: any): string {
    let labels = '';
    
    // Add labels to each panel
    labels += this.addLabel('Top Panel', panels.top.x + panels.top.w/2, panels.top.y + panels.top.h/2);
    labels += this.addLabel('Bottom Panel', panels.bottom.x + panels.bottom.w/2, panels.bottom.y + panels.bottom.h/2);
    labels += this.addLabel('Front Panel', panels.front.x + panels.front.w/2, panels.front.y + panels.front.h/2);
    labels += this.addLabel('Back Panel', panels.back.x + panels.back.w/2, panels.back.y + panels.back.h/2);
    labels += this.addLabel('Left Panel', panels.left.x + panels.left.w/2, panels.left.y + panels.left.h/2);
    labels += this.addLabel('Right Panel', panels.right.x + panels.right.w/2, panels.right.y + panels.right.h/2);
    
    return labels;
  }
  
  /**
   * Add a text label for a panel
   */
  private addLabel(text: string, x: number, y: number): string {
    return `
    <text x="${x * 96}" y="${y * 96}" font-family="Arial" font-size="14" text-anchor="middle" fill="#666666">
      ${text}
    </text>`;
  }
}