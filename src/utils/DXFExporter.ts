import { GPUCase } from '../types';

/**
 * DXF exporter that creates a laser-cutting ready file with finger joints
 * Inspired by MakerCase layout with organized, non-overlapping panels
 */
export class DXFExporter {
  // Configuration for the finger joints
  private tabWidth = 0.5; // Width of the finger tabs in inches
  private tolerance = 0.01; // Tolerance for laser cutting in inches
  private spacing = 0.5; // Spacing between panels
  
  export(model: GPUCase): string {
    // Basic DXF header
    let dxf = `0
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

    // Define panels
    const { length, width, height } = model.dimensions;
    const t = model.material.thickness;
    
    // Calculate optimal tab count for each dimension
    const tabSizeInches = 0.5; // Target size for tabs
    const widthTabs = Math.max(3, Math.floor(width / tabSizeInches));
    const lengthTabs = Math.max(3, Math.floor(length / tabSizeInches));
    const heightTabs = Math.max(3, Math.floor(height / tabSizeInches));
    
    // Create a well-organized layout with proper spacing
    // Each panel is properly positioned to avoid overlaps
    const totalWidth = width + length + this.spacing * 2;
    const totalHeight = height + length + this.spacing * 2;
    
    // Define panel positions (in inches) to match SVG layout
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
    dxf += this.drawBottomPanel(panels.bottom.x, panels.bottom.y, width, length, t, widthTabs, lengthTabs);
    
    // Top panel with ventilation holes
    dxf += this.drawTopPanel(panels.top.x, panels.top.y, width, length, t, widthTabs, lengthTabs, model);
    
    // Front panel
    dxf += this.drawFrontPanel(panels.front.x, panels.front.y, width, height, t, widthTabs, heightTabs);
    
    // Back panel with exhaust vent
    dxf += this.drawBackPanel(panels.back.x, panels.back.y, width, height, t, widthTabs, heightTabs, model);
    
    // Left panel
    dxf += this.drawLeftPanel(panels.left.x, panels.left.y, length, height, t, lengthTabs, heightTabs);
    
    // Right panel
    dxf += this.drawRightPanel(panels.right.x, panels.right.y, length, height, t, lengthTabs, heightTabs, model);
    
    // Close DXF
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  /**
   * Draw bottom panel with finger joints
   */
  private drawBottomPanel(x: number, y: number, width: number, length: number, thickness: number, 
                          widthTabs: number, lengthTabs: number): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, width, length,
      true, true, true, true, // All sides have finger joints
      widthTabs, lengthTabs,
      false, false, false, false // No sides inverted
    );
    
    dxf += this.addPolyline(points);
    
    // Add mounting holes for GPUs if needed
    // (For simplicity, skipping them in this update)
    
    return dxf;
  }
  
  /**
   * Draw top panel with finger joints and ventilation
   */
  private drawTopPanel(x: number, y: number, width: number, length: number, thickness: number, 
                       widthTabs: number, lengthTabs: number, model: GPUCase): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, width, length,
      true, true, true, true, // All sides have finger joints
      widthTabs, lengthTabs,
      true, true, true, true // Invert all sides (opposite of bottom panel)
    );
    
    dxf += this.addPolyline(points);
    
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
          const fanY = gpuCenterY - gpu.length/2 + fanSpacing * (i + 1);
          
          dxf += this.addCircle(
            x + width/2, 
            fanY, 
            fanDiameter/2
          );
        }
      });
      
      // Add air duct cutout if enabled
      if (model.thermalManagement.hasDuct) {
        dxf += this.addRectangleWithRoundedCorners(
          x + width*0.25, 
          y + length*0.25, 
          width*0.5, 
          length*0.5,
          0.25 // Corner radius
        );
      }
    }
    
    return dxf;
  }
  
  /**
   * Draw front panel with finger joints
   */
  private drawFrontPanel(x: number, y: number, width: number, height: number, thickness: number, 
                         widthTabs: number, heightTabs: number): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, width, height,
      true, true, false, true, // Top, right, bottom (no tabs), left
      widthTabs, heightTabs,
      true, false, false, true // Invert top and left
    );
    
    dxf += this.addPolyline(points);
    
    // Add air intake holes if needed (simplified for this update)
    
    return dxf;
  }
  
  /**
   * Draw back panel with finger joints and exhaust vent
   */
  private drawBackPanel(x: number, y: number, width: number, height: number, thickness: number, 
                        widthTabs: number, heightTabs: number, model: GPUCase): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, width, height,
      true, true, true, true, // All sides have finger joints
      widthTabs, heightTabs,
      false, true, true, false // Invert bottom and right
    );
    
    dxf += this.addPolyline(points);
    
    // Add exhaust vent if air duct is enabled
    if (model.thermalManagement.hasDuct) {
      dxf += this.addCircle(
        x + width/2, 
        y + height/2, 
        Math.min(width, height)/3
      );
    }
    
    // Add power cable cutout
    dxf += this.addRectangleWithRoundedCorners(
      x + width/2 - 1,
      y + height - 1.5,
      2,
      1,
      0.2 // Corner radius
    );
    
    return dxf;
  }
  
  /**
   * Draw left panel with finger joints
   */
  private drawLeftPanel(x: number, y: number, length: number, height: number, thickness: number, 
                        lengthTabs: number, heightTabs: number): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, length, height,
      true, true, true, true, // All sides have finger joints
      lengthTabs, heightTabs,
      false, false, true, true // Invert bottom and left
    );
    
    dxf += this.addPolyline(points);
    
    // Add ventilation slots
    for (let i = 0; i < 3; i++) {
      const ventY = y + (height / 4) * (i + 1);
      const ventWidth = length / 2;
      const ventHeight = 0.5;
      
      dxf += this.addRectangleWithRoundedCorners(
        x + length/4,
        ventY - ventHeight/2,
        ventWidth,
        ventHeight,
        ventHeight/2 // Corner radius
      );
    }
    
    return dxf;
  }
  
  /**
   * Draw right panel with finger joints
   */
  private drawRightPanel(x: number, y: number, length: number, height: number, thickness: number, 
                         lengthTabs: number, heightTabs: number, model: GPUCase): string {
    let dxf = '';
    
    // Generate the lines for the box with finger joints
    const points = this.generateBoxWithFingerJoints(
      x, y, length, height,
      true, true, true, true, // All sides have finger joints
      lengthTabs, heightTabs,
      true, true, false, false // Invert top and right
    );
    
    dxf += this.addPolyline(points);
    
    // Add ventilation slots
    for (let i = 0; i < 3; i++) {
      const ventY = y + (height / 4) * (i + 1);
      const ventWidth = length / 2;
      const ventHeight = 0.5;
      
      dxf += this.addRectangleWithRoundedCorners(
        x + length/4,
        ventY - ventHeight/2,
        ventWidth,
        ventHeight,
        ventHeight/2 // Corner radius
      );
    }
    
    // Add temperature sensor holes if enabled
    if (model.thermalManagement.hasTempSensors) {
      for (let i = 0; i < 3; i++) {
        const sensorY = y + (height / 4) * (i + 1);
        
        dxf += this.addCircle(
          x + length - 0.5,
          sensorY,
          0.125
        );
      }
    }
    
    return dxf;
  }
  
  /**
   * Generate points for a box with finger joints
   */
  private generateBoxWithFingerJoints(
    x: number, y: number, width: number, height: number,
    hasTopTabs: boolean, hasRightTabs: boolean, hasBottomTabs: boolean, hasLeftTabs: boolean,
    widthTabCount: number, heightTabCount: number,
    invertTop: boolean, invertRight: boolean, invertBottom: boolean, invertLeft: boolean
  ): { x: number, y: number }[] {
    const points: { x: number, y: number }[] = [];
    
    // Calculate actual tab width for each edge
    const actualWidthTabWidth = width / (widthTabCount * 2);
    const actualHeightTabWidth = height / (heightTabCount * 2);
    
    // Starting point: bottom-left corner
    let currentX = x;
    let currentY = y;
    points.push({ x: currentX, y: currentY });
    
    // Bottom edge (left to right)
    if (hasBottomTabs) {
      for (let i = 0; i < widthTabCount; i++) {
        for (let j = 0; j < 2; j++) {
          const hasTab = (j === 0) !== invertBottom;
          
          if (hasTab) {
            // Draw a tab (jutting out)
            currentY -= this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentX += actualWidthTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentY += this.tolerance;
            points.push({ x: currentX, y: currentY });
          } else {
            // Draw a slot (indented)
            currentY += this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentX += actualWidthTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentY -= this.tolerance;
            points.push({ x: currentX, y: currentY });
          }
        }
      }
    } else {
      // Just a straight line
      currentX += width;
      points.push({ x: currentX, y: currentY });
    }
    
    // Right edge (bottom to top)
    if (hasRightTabs) {
      for (let i = 0; i < heightTabCount; i++) {
        for (let j = 0; j < 2; j++) {
          const hasTab = (j === 0) !== invertRight;
          
          if (hasTab) {
            // Draw a tab (jutting out)
            currentX += this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentY += actualHeightTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentX -= this.tolerance;
            points.push({ x: currentX, y: currentY });
          } else {
            // Draw a slot (indented)
            currentX -= this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentY += actualHeightTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentX += this.tolerance;
            points.push({ x: currentX, y: currentY });
          }
        }
      }
    } else {
      // Just a straight line
      currentY += height;
      points.push({ x: currentX, y: currentY });
    }
    
    // Top edge (right to left)
    if (hasTopTabs) {
      for (let i = 0; i < widthTabCount; i++) {
        for (let j = 0; j < 2; j++) {
          const hasTab = (j === 0) !== invertTop;
          
          if (hasTab) {
            // Draw a tab (jutting out)
            currentY += this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentX -= actualWidthTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentY -= this.tolerance;
            points.push({ x: currentX, y: currentY });
          } else {
            // Draw a slot (indented)
            currentY -= this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentX -= actualWidthTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentY += this.tolerance;
            points.push({ x: currentX, y: currentY });
          }
        }
      }
    } else {
      // Just a straight line
      currentX -= width;
      points.push({ x: currentX, y: currentY });
    }
    
    // Left edge (top to bottom)
    if (hasLeftTabs) {
      for (let i = 0; i < heightTabCount; i++) {
        for (let j = 0; j < 2; j++) {
          const hasTab = (j === 0) !== invertLeft;
          
          if (hasTab) {
            // Draw a tab (jutting out)
            currentX -= this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentY -= actualHeightTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentX += this.tolerance;
            points.push({ x: currentX, y: currentY });
          } else {
            // Draw a slot (indented)
            currentX += this.tolerance;
            points.push({ x: currentX, y: currentY });
            
            currentY -= actualHeightTabWidth;
            points.push({ x: currentX, y: currentY });
            
            currentX -= this.tolerance;
            points.push({ x: currentX, y: currentY });
          }
        }
      }
    } else {
      // Just a straight line
      currentY -= height;
      points.push({ x: currentX, y: currentY });
    }
    
    return points;
  }
  
  /**
   * Add a polyline to the DXF
   */
  private addPolyline(points: { x: number, y: number }[]): string {
    let dxf = `0
POLYLINE
8
0
66
1
70
1
`;
    
    // Add all vertices
    for (const point of points) {
      dxf += `0
VERTEX
8
0
10
${point.x}
20
${point.y}
`;
    }
    
    // Close the polyline
    dxf += `0
SEQEND
`;
    
    return dxf;
  }
  
  /**
   * Add a circle to the DXF
   */
  private addCircle(x: number, y: number, radius: number): string {
    let dxf = `0
CIRCLE
8
0
10
${x}
20
${y}
40
${radius}
`;
    return dxf;
  }
  
  /**
   * Add a rectangle with rounded corners to the DXF
   * Approximates rounded corners with short line segments
   */
  private addRectangleWithRoundedCorners(x: number, y: number, width: number, height: number, radius: number): string {
    const segments = 8; // Number of segments for each corner
    const points: { x: number, y: number }[] = [];
    
    // Ensure radius isn't too large
    radius = Math.min(radius, width / 2, height / 2);
    
    // Create the points for the rounded rectangle
    
    // Bottom-right corner arc
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI / 2;
      points.push({
        x: x + width - radius + radius * Math.cos(angle),
        y: y + radius - radius * Math.sin(angle)
      });
    }
    
    // Top-right corner arc
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI / 2 + Math.PI / 2;
      points.push({
        x: x + width - radius + radius * Math.cos(angle),
        y: y + height - radius - radius * Math.sin(angle)
      });
    }
    
    // Top-left corner arc
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI / 2 + Math.PI;
      points.push({
        x: x + radius + radius * Math.cos(angle),
        y: y + height - radius - radius * Math.sin(angle)
      });
    }
    
    // Bottom-left corner arc
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI / 2 + Math.PI * 3 / 2;
      points.push({
        x: x + radius + radius * Math.cos(angle),
        y: y + radius - radius * Math.sin(angle)
      });
    }
    
    return this.addPolyline(points);
  }
}