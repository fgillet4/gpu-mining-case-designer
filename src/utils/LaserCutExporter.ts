import { GPUCase } from '../types';

/**
 * Enhanced exporter for laser-cutting compatible SVG files
 * Inspired by MakerCase's approach to create finger joints and assembly tabs
 */
export class LaserCutExporter {
  // Configuration for the finger joints
  private tabWidth: number = 0.5; // Width of the finger tabs in inches
  private tolerance: number = 0.01; // Tolerance for laser cutting in inches
  
  constructor(tabWidth?: number, tolerance?: number) {
    if (tabWidth) this.tabWidth = tabWidth;
    if (tolerance) this.tolerance = tolerance;
  }
  
  /**
   * Export the case model as an SVG with proper laser-cutting patterns
   */
  exportSVG(model: GPUCase): string {
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate box dimensions adjusted for material thickness
    const adjustedLength = length;
    const adjustedWidth = width;
    const adjustedHeight = height;
    
    // Calculate total SVG dimensions for the unfolded pattern
    const svgWidth = adjustedLength * 3 + adjustedWidth * 2 + 2; // Add some padding
    const svgHeight = adjustedHeight * 2 + adjustedWidth * 2 + 2;
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${svgWidth}in" height="${svgHeight}in" viewBox="0 0 ${svgWidth * 96} ${svgHeight * 96}" 
  xmlns="http://www.w3.org/2000/svg">
  <g id="case-outline" fill="none" stroke="red" stroke-width="0.5">`;
    
    // Define panel positions (in inches)
    const panels = {
      bottom: { x: adjustedLength, y: adjustedHeight, w: adjustedWidth, h: adjustedLength },
      top: { x: adjustedLength, y: 0, w: adjustedWidth, h: adjustedLength },
      front: { x: adjustedLength, y: adjustedHeight + adjustedLength, w: adjustedWidth, h: adjustedHeight },
      back: { x: adjustedLength, y: adjustedHeight + adjustedLength + adjustedHeight, w: adjustedWidth, h: adjustedHeight },
      left: { x: 0, y: adjustedHeight, w: adjustedLength, h: adjustedHeight },
      right: { x: adjustedLength + adjustedWidth, y: adjustedHeight, w: adjustedLength, h: adjustedHeight }
    };
    
    // Draw each panel with finger joints
    svg += this.drawBottomPanel(panels.bottom.x, panels.bottom.y, adjustedLength, adjustedWidth, t);
    svg += this.drawTopPanel(panels.top.x, panels.top.y, adjustedLength, adjustedWidth, t, model);
    svg += this.drawFrontPanel(panels.front.x, panels.front.y, adjustedWidth, adjustedHeight, t);
    svg += this.drawBackPanel(panels.back.x, panels.back.y, adjustedWidth, adjustedHeight, t);
    svg += this.drawLeftPanel(panels.left.x, panels.left.y, adjustedLength, adjustedHeight, t);
    svg += this.drawRightPanel(panels.right.x, panels.right.y, adjustedLength, adjustedHeight, t);

    // Add panel labels
    svg += this.addPanelLabels(panels, adjustedLength, adjustedWidth, adjustedHeight);
    
    // Close SVG
    svg += `
  </g>
</svg>`;
    
    return svg;
  }
  
  /**
   * Export the case model as DXF
   */
  exportDXF(model: GPUCase): string {
    // For DXF export we would implement similar patterns but in DXF format
    // This is simplified for the example - a real implementation would use a DXF library
    
    const { length, width, height } = model.dimensions;
    
    let dxf = `999
DXF created by GPU Mining Case Designer
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

    // Add panels with finger joints
    // Each panel would be drawn with proper finger joints using POLYLINE entities
    // Similar to the SVG approach but in DXF format
    
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  /**
   * Draw the bottom panel with finger joints
   */
  private drawBottomPanel(x: number, y: number, length: number, width: number, thickness: number): string {
    let path = `
    <!-- Bottom Panel -->
    <path d="`;
    
    // Start at the bottom-left corner
    path += `M ${x * 96} ${(y + width) * 96}`;
    
    // Draw bottom edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, true, false);
    
    // Draw top edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, true, true);
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw the top panel with finger joints and GPU cutouts
   */
  private drawTopPanel(x: number, y: number, length: number, width: number, thickness: number, model: GPUCase): string {
    let path = `
    <!-- Top Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, true, false);
    
    path += `" />`;
    
    // Add GPU cutouts
    if (model.gpuSlots.length > 0) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      for (let i = 0; i < model.gpuSlots.length; i++) {
        const gpu = model.gpuSlots[i];
        const gpuX = x + slotSpacing * (i + 1) - gpu.width / 2;
        const gpuY = y + width / 2 - gpu.length / 2;
        
        path += `
        <!-- GPU Slot ${i + 1} Cutout -->
        <rect x="${gpuX * 96}" y="${gpuY * 96}" width="${gpu.width * 96}" height="${gpu.length * 96}" />`;
      }
    }
    
    // Add ventilation slots if air duct is enabled
    if (model.thermalManagement.hasDuct) {
      for (let i = 0; i < 5; i++) {
        const ventWidth = length / 6;
        const ventHeight = width / 3;
        const ventX = x + (length / 6) * (i + 1) - ventWidth / 2;
        const ventY = y + width / 2 - ventHeight / 2;
        
        path += `
        <!-- Ventilation Slot ${i + 1} -->
        <rect x="${ventX * 96}" y="${ventY * 96}" width="${ventWidth * 96}" height="${ventHeight * 96}" rx="${(ventHeight / 4) * 96}" ry="${(ventHeight / 4) * 96}" />`;
      }
    }
    
    return path;
  }
  
  /**
   * Draw the front panel with finger joints
   */
  private drawFrontPanel(x: number, y: number, width: number, height: number, thickness: number): string {
    let path = `
    <!-- Front Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with no tabs (this edge sits on the ground)
    path += ` l ${width * 96} 0`;
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw the back panel with finger joints
   */
  private drawBackPanel(x: number, y: number, width: number, height: number, thickness: number): string {
    let path = `
    <!-- Back Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to right panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(width, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to left panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw the left panel with finger joints
   */
  private drawLeftPanel(x: number, y: number, length: number, height: number, thickness: number): string {
    let path = `
    <!-- Left Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw the right panel with finger joints
   */
  private drawRightPanel(x: number, y: number, length: number, height: number, thickness: number): string {
    let path = `
    <!-- Right Panel -->
    <path d="`;
    
    // Start at the top-left corner
    path += `M ${x * 96} ${y * 96}`;
    
    // Draw top edge with tabs (connecting to top panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, false);
    
    // Draw right edge with tabs (connecting to front panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, true);
    
    // Draw bottom edge with tabs (connecting to bottom panel)
    path += this.drawEdgeWithTabs(length, this.tabWidth, false, true);
    
    // Draw left edge with tabs (connecting to back panel)
    path += this.drawEdgeWithTabs(height, this.tabWidth, true, false);
    
    path += `" />`;
    
    return path;
  }
  
  /**
   * Draw an edge with finger joint tabs
   * @param length Length of the edge
   * @param tabWidth Width of each tab
   * @param isVertical Whether the edge is vertical
   * @param invert Whether to invert the tab pattern
   */
  private drawEdgeWithTabs(length: number, tabWidth: number, isVertical: boolean, invert: boolean): string {
    let path = '';
    const numTabs = Math.floor(length / (tabWidth * 2));
    const actualTabWidth = length / (numTabs * 2);
    
    for (let i = 0; i < numTabs; i++) {
      for (let j = 0; j < 2; j++) {
        const hasTab = (j === 0) !== invert;
        
        if (isVertical) {
          if (hasTab) {
            // Draw a tab (jutting out)
            path += ` l ${this.tolerance * 96} 0`;
            path += ` l 0 ${actualTabWidth * 96}`;
            path += ` l ${-this.tolerance * 96} 0`;
          } else {
            // Draw a slot (indented)
            path += ` l ${-this.tolerance * 96} 0`;
            path += ` l 0 ${actualTabWidth * 96}`;
            path += ` l ${this.tolerance * 96} 0`;
          }
        } else {
          if (hasTab) {
            // Draw a tab (jutting out)
            path += ` l 0 ${this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${-this.tolerance * 96}`;
          } else {
            // Draw a slot (indented)
            path += ` l 0 ${-this.tolerance * 96}`;
            path += ` l ${actualTabWidth * 96} 0`;
            path += ` l 0 ${this.tolerance * 96}`;
          }
        }
      }
    }
    
    return path;
  }
  
  /**
   * Add text labels to each panel
   */
  private addPanelLabels(panels: any, length: number, width: number, height: number): string {
    let labels = '';
    
    // Add labels to each panel
    labels += this.addLabel('Top', panels.top.x + width/2, panels.top.y + length/2);
    labels += this.addLabel('Bottom', panels.bottom.x + width/2, panels.bottom.y + length/2);
    labels += this.addLabel('Front', panels.front.x + width/2, panels.front.y + height/2);
    labels += this.addLabel('Back', panels.back.x + width/2, panels.back.y + height/2);
    labels += this.addLabel('Left', panels.left.x + length/2, panels.left.y + height/2);
    labels += this.addLabel('Right', panels.right.x + length/2, panels.right.y + height/2);
    
    return labels;
  }
  
  /**
   * Add a text label to a panel
   */
  private addLabel(text: string, x: number, y: number): string {
    return `
    <text x="${x * 96}" y="${y * 96}" font-family="Arial" font-size="24" text-anchor="middle" fill="#666666">
      ${text}
    </text>`;
  }
}