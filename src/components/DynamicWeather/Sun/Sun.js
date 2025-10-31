class Sun {
  constructor(canvas, context, x, y, moonRadius = 50) {
    this.canvas = canvas;
    this.context = context;
    this.x = x;
    this.y = y;
    this.baseMoonRadius = moonRadius; // Store base radius for scaling
    this.moonRadius = moonRadius; // Current radius (can change with canvas resize)

    // Store initial canvas dimensions for responsive scaling
    // Use clientWidth/clientHeight (rendered size) not canvas.width/height (internal resolution)
    this.initialCanvasWidth = (canvas && (canvas.clientWidth || canvas.width)) || 948;
    this.initialCanvasHeight = (canvas && (canvas.clientHeight || canvas.height)) || 350;

    // Store actual canvas dimensions (internal resolution) vs rendered size (CSS)
    // This helps compensate for canvas stretching
    this.canvasActualWidth = canvas ? canvas.width : 948;
    this.canvasActualHeight = canvas ? canvas.height : 350;

    // Calculate aspect ratio to compensate for CSS stretching
    this.canvasAspectRatio = this.canvasActualWidth / this.canvasActualHeight;
    this.renderedAspectRatio = this.initialCanvasWidth / this.initialCanvasHeight;

    // Store initial size for scaling
    this.initialCanvasSize = Math.min(this.initialCanvasWidth, this.initialCanvasHeight);
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  // Update scale based on canvas size changes (responsive scaling)
  updateCanvasSize(newCanvas) {
    if (newCanvas) {
      // Update canvas reference
      this.canvas = newCanvas;
      this.context = newCanvas.getContext('2d');

      // Update actual canvas dimensions
      this.canvasActualWidth = newCanvas.width;
      this.canvasActualHeight = newCanvas.height;
    }

    // Use clientWidth/clientHeight (rendered size) for scaling calculations
    const currentWidth = this.canvas ? (this.canvas.clientWidth || this.canvas.width) : 0;
    const currentHeight = this.canvas ? (this.canvas.clientHeight || this.canvas.height) : 0;

    if (this.canvas) {
      this.canvasActualWidth = this.canvas.width;
      this.canvasActualHeight = this.canvas.height;
      // Recalculate aspect ratios
      this.canvasAspectRatio = this.canvasActualWidth / this.canvasActualHeight;
      this.renderedAspectRatio = currentWidth / currentHeight;
    }

    if (this.initialCanvasSize && currentWidth && currentHeight) {
      // Use the smaller dimension to maintain circular shape
      // This prevents stretching when width and height scale differently
      const currentCanvasSize = Math.min(currentWidth, currentHeight);
      const sizeRatio = currentCanvasSize / this.initialCanvasSize;
      this.moonRadius = this.baseMoonRadius * sizeRatio;
    }
  }

  draw = function () {
    // Update scale if canvas size changed (check on every frame)
    // Use clientWidth/clientHeight (actual rendered size) not canvas.width/height (internal resolution)
    if (this.canvas && this.initialCanvasSize) {
      const currentWidth = this.canvas.clientWidth || this.canvas.width;
      const currentHeight = this.canvas.clientHeight || this.canvas.height;

      // Only recalculate if size actually changed (to avoid unnecessary calculations)
      if (currentWidth && currentHeight) {
        // Use the smaller dimension to maintain circular shape
        const currentCanvasSize = Math.min(currentWidth, currentHeight);
        if (currentCanvasSize !== this.initialCanvasSize) {
          const sizeRatio = currentCanvasSize / this.initialCanvasSize;
          this.moonRadius = this.baseMoonRadius * sizeRatio;
        }
      }
    }

    // Debug: Check if moon position is valid
    if (!this.x || !this.y || isNaN(this.x) || isNaN(this.y)) {
      console.warn('Moon position invalid:', { x: this.x, y: this.y });
      return true; // Return true to keep it in assets
    }

    const centerX = this.x;
    const centerY = this.y;

    // Calculate scale factors to compensate for canvas CSS stretching
    // Canvas has internal resolution (width/height) and rendered size (clientWidth/clientHeight)
    // When canvas is stretched by CSS, we need to compensate to draw perfect circles
    const renderedWidth = this.canvas.clientWidth || this.canvas.width;
    const renderedHeight = this.canvas.clientHeight || this.canvas.height;

    // Calculate how much the canvas is stretched by CSS
    const stretchX = renderedWidth / this.canvasActualWidth;
    const stretchY = renderedHeight / this.canvasActualHeight;

    // To draw a perfect circle when canvas is stretched, we need to compensate
    // If X is stretched 2x, we need to scale X coordinates by 0.5 to make it appear normal
    // Use the smaller stretch factor to keep it circular
    const minStretch = Math.min(stretchX, stretchY);
    const scaleX = minStretch / stretchX;
    const scaleY = minStretch / stretchY;

    // Save context state
    this.context.save();

    // Apply inverse scaling to compensate for CSS stretching
    // This ensures circles appear circular even when canvas is stretched
    this.context.scale(scaleX, scaleY);

    // Adjust center position and radius for scaling
    const scaledX = centerX / scaleX;
    const scaledY = centerY / scaleY;
    // Radius should be scaled by the smaller factor to maintain circular shape
    const scaledRadius = this.moonRadius / minStretch;

    // Make moon much more visible - brighter colors and larger
    // Calculate ring sizes relative to moonRadius (all values scale proportionally)
    const outerRingRadius = scaledRadius * 1.6;
    const middleRingRadius = scaledRadius * 1.4;
    const innerRingRadius = scaledRadius * 1.2;

    // Draw outer aura rings (brighter for visibility)
    // Outer ring (lighter blue with higher opacity)
    this.context.beginPath();
    this.context.arc(scaledX, scaledY, outerRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(150, 180, 220, 0.8)'; // Brighter, more opaque
    this.context.fill();

    // Middle ring
    this.context.beginPath();
    this.context.arc(scaledX, scaledY, middleRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(180, 200, 240, 0.7)';
    this.context.fill();

    // Inner ring
    this.context.beginPath();
    this.context.arc(scaledX, scaledY, innerRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(200, 220, 255, 0.6)';
    this.context.fill();

    // Draw moon (very bright white/cyan for maximum visibility)
    this.context.beginPath();
    this.context.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(255, 255, 255, 1)'; // Pure white for visibility
    this.context.fill();

    // Add a bright outline for extra visibility
    this.context.beginPath();
    this.context.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
    this.context.strokeStyle = 'rgba(255, 255, 255, 1)';
    this.context.lineWidth = 3 / minStretch;
    this.context.stroke();

    // Draw craters (positions and sizes scale relative to moonRadius)
    // Crater 1
    const crater1X = scaledX - (scaledRadius * 0.3);
    const crater1Y = scaledY - (scaledRadius * 0.2);
    const crater1Radius = scaledRadius * 0.15;
    this.context.beginPath();
    this.context.arc(crater1X, crater1Y, crater1Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    // Crater 2
    const crater2X = scaledX + (scaledRadius * 0.25);
    const crater2Y = scaledY + (scaledRadius * 0.15);
    const crater2Radius = scaledRadius * 0.12;
    this.context.beginPath();
    this.context.arc(crater2X, crater2Y, crater2Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    // Crater 3
    const crater3X = scaledX + (scaledRadius * 0.1);
    const crater3Y = scaledY - (scaledRadius * 0.3);
    const crater3Radius = scaledRadius * 0.1;
    this.context.beginPath();
    this.context.arc(crater3X, crater3Y, crater3Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    // Restore context state
    this.context.restore();

    return true;
  };
}

export default Sun;
