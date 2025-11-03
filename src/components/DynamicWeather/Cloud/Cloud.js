import randomRange from '../Utility';
import cloudImageUrl from '../../../assets/cloud.png';

class Cloud {
  constructor(options, canvas, context, windSpeed, imageAssets) {
    this.windSpeed = windSpeed;
    this.canvas = canvas;
    this.context = context;
    this.options = options;

    this.type = 'cloud';

    // Create Image object from imported URL
    this.img = new Image();
    this.img.src = cloudImageUrl;

    // Support scaling - default scale is 1.0
    this.baseScale = options.scale || 1.0; // Store base scale
    this.scale = this.baseScale; // Current scale (can change with canvas resize)

    // Store initial canvas width for responsive scaling
    // Use clientWidth (rendered size) not canvas.width (internal resolution)
    this.initialCanvasWidth = canvas.clientWidth || canvas.width;

    // Base dimensions will be set from image natural size
    // We'll calculate scaled dimensions when image loads
    this.baseWidth = null;
    this.baseHeight = null;
    this.aspectRatio = null; // Store aspect ratio to maintain it always
    this.width = 100; // Temporary default, will update on load
    this.height = 50; // Temporary default, will update on load

    // Update dimensions when image loads
    this._onloadHandler = () => {
      this.baseWidth = 714 * 1.75;
      this.baseHeight = 213 * 1.75;
      // Calculate and store aspect ratio
      this.aspectRatio = this.baseWidth / this.baseHeight;
      // Calculate scaled dimensions maintaining aspect ratio
      this.calculateScaledDimensions();
    };
    this.img.onload = this._onloadHandler;

    const max = 10;
    this.xVelocity = (windSpeed - randomRange(0, max)) / 60;
    this.yVelocity = 0;

    this.x = options.x || randomRange(-100, canvas.width + 100);
    // Spawn clouds within visible canvas area (adjust Y based on canvas height)
    // Use a percentage of canvas height to position clouds in the upper portion
    const maxY = canvas.height * 0.3; // Top 30% of canvas
    this.y = options.y !== undefined ? options.y : randomRange(0, maxY);
  }

  // Calculate scaled dimensions maintaining aspect ratio
  calculateScaledDimensions() {
    if (this.baseWidth && this.baseHeight) {
      // Ensure aspect ratio is calculated and stored
      if (!this.aspectRatio) {
        this.aspectRatio = this.baseWidth / this.baseHeight;
      }

      // Always scale from width to maintain perfect aspect ratio
      // This ensures width/height always equals the original aspect ratio
      this.width = this.baseWidth * this.scale;
      this.height = this.width / this.aspectRatio;

      // Verify: height should equal baseHeight * scale
      // height = (baseWidth * scale) / (baseWidth / baseHeight) = baseHeight * scale ✓
    }
  }

  // Update canvas reference and scale based on canvas width changes (responsive scaling)
  updateCanvasSize(newCanvas) {
    if (newCanvas) {
      // Update canvas reference
      this.canvas = newCanvas;
      this.context = newCanvas.getContext('2d');
    }

    // Use clientWidth (rendered size) for scaling calculations
    const currentWidth = this.canvas ? (this.canvas.clientWidth || this.canvas.width) : 0;

    if (this.initialCanvasWidth && currentWidth && currentWidth !== this.initialCanvasWidth) {
      // Calculate scale ratio based on canvas width change
      const widthRatio = currentWidth / this.initialCanvasWidth;
      this.scale = this.baseScale * widthRatio;

      // Recalculate dimensions with new scale
      this.calculateScaledDimensions();
    }
  }

  draw = function () {
    // Update scale if canvas width changed (check on every frame)
    // This ensures clouds scale proportionally when window resizes
    // Use clientWidth (actual rendered size) not canvas.width (internal resolution)
    if (this.canvas && this.initialCanvasWidth) {
      const currentWidth = this.canvas.clientWidth || this.canvas.width;

      // Only recalculate if width actually changed (to avoid unnecessary calculations)
      if (currentWidth && currentWidth !== this.initialCanvasWidth) {
        const widthRatio = currentWidth / this.initialCanvasWidth;
        this.scale = this.baseScale * widthRatio;

        // Recalculate dimensions with new scale (maintains aspect ratio)
        if (this.baseWidth && this.baseHeight) {
          this.calculateScaledDimensions();
        }
      }
    }

    this.x += this.xVelocity;

    // Only draw if image is loaded
    if (this.img.complete && this.img.naturalWidth > 0) {
      // Update base dimensions on first load if not already set
      if (!this.baseWidth || !this.baseHeight) {
        this.baseWidth = this.img.naturalWidth;
        this.baseHeight = this.img.naturalHeight;
        // Calculate and store aspect ratio
        this.aspectRatio = this.baseWidth / this.baseHeight;
      }

      // Always calculate scaled dimensions maintaining aspect ratio
      this.calculateScaledDimensions();

      // Draw scaled image maintaining aspect ratio
      this.context.drawImage(
        this.img,
        0,
        0,
        this.img.naturalWidth,
        this.img.naturalHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }

    if (this.xVelocity > 0) {
      // Moving right
      if (this.x > this.canvas.width) {
        this.x = 0 - this.width;
      }
    } else {
      // Moving left
      if (this.x < 0 - this.width) {
        this.x = this.canvas.width;
      }
    }

    return true;
  };

  // Cleanup method to remove image handlers
  cleanup() {
    if (this.img && this._onloadHandler) {
      this.img.onload = null;
      this._onloadHandler = null;
    }
  }
}

export default Cloud;
