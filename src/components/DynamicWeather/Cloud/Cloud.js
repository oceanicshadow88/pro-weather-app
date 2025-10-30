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
    this.scale = options.scale || 1.0;

    // Base dimensions will be set from image natural size
    // We'll calculate scaled dimensions when image loads
    this.baseWidth = null;
    this.baseHeight = null;
    this.width = 100; // Temporary default, will update on load
    this.height = 50; // Temporary default, will update on load

    // Update dimensions when image loads
    this.img.onload = () => {
      this.baseWidth = this.img.naturalWidth;
      this.baseHeight = this.img.naturalHeight;
      this.width = this.baseWidth * this.scale;
      this.height = this.baseHeight * this.scale;
    };

    const max = 10;
    this.xVelocity = (windSpeed - randomRange(0, max)) / 60;
    this.yVelocity = 0;

    this.x = options.x || randomRange(-100, canvas.width + 100);
    this.y = randomRange(0 - this.height / 2, -60);
  }

  draw = function () {
    this.x += this.xVelocity;

    // Only draw if image is loaded
    if (this.img.complete && this.img.naturalWidth > 0) {
      // Update base dimensions on first load
      if (!this.baseWidth) {
        this.baseWidth = this.img.naturalWidth;
        this.baseHeight = this.img.naturalHeight;
      }

      // Always calculate scaled dimensions from base size
      this.width = this.baseWidth * this.scale;
      this.height = this.baseHeight * this.scale;

      // Draw scaled image
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
}

export default Cloud;
