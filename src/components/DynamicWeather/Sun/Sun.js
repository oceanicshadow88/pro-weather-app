class Sun {
  constructor(canvas, context, y) {
    this.canvas = canvas;
    this.context = context;
    this.y = y;
    this.yVelocity = 5;
    this.moonRadius = 50;
    this.x = canvas.width / 2; // Center horizontally
  }

  draw = function () {
    if (this.y > 0) {
      this.y -= this.yVelocity;
    }

    const centerX = this.x;
    const centerY = this.y;

    // Calculate ring sizes relative to moonRadius (all values scale proportionally)
    const outerRingRadius = this.moonRadius * 1.6;
    const middleRingRadius = this.moonRadius * 1.4;
    const innerRingRadius = this.moonRadius * 1.2;

    // Draw outer aura rings (darkest to lightest, outermost to innermost)
    // Outer ring (dark blue)
    this.context.beginPath();
    this.context.arc(centerX, centerY, outerRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(30, 40, 80, 0.6)';
    this.context.fill();

    // Middle ring (medium dark blue)
    this.context.beginPath();
    this.context.arc(centerX, centerY, middleRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(50, 70, 120, 0.5)';
    this.context.fill();

    // Inner ring (medium blue)
    this.context.beginPath();
    this.context.arc(centerX, centerY, innerRingRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(80, 120, 160, 0.4)';
    this.context.fill();

    // Draw moon (light blue/cyan)
    this.context.beginPath();
    this.context.arc(centerX, centerY, this.moonRadius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(173, 216, 230, 1)'; // Light blue/cyan
    this.context.fill();

    // Draw craters (positions and sizes scale relative to moonRadius)
    // Crater 1
    const crater1X = centerX - (this.moonRadius * 0.3);
    const crater1Y = centerY - (this.moonRadius * 0.2);
    const crater1Radius = this.moonRadius * 0.15;
    this.context.beginPath();
    this.context.arc(crater1X, crater1Y, crater1Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    // Crater 2
    const crater2X = centerX + (this.moonRadius * 0.25);
    const crater2Y = centerY + (this.moonRadius * 0.15);
    const crater2Radius = this.moonRadius * 0.12;
    this.context.beginPath();
    this.context.arc(crater2X, crater2Y, crater2Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    // Crater 3
    const crater3X = centerX + (this.moonRadius * 0.1);
    const crater3Y = centerY - (this.moonRadius * 0.3);
    const crater3Radius = this.moonRadius * 0.1;
    this.context.beginPath();
    this.context.arc(crater3X, crater3Y, crater3Radius, 0, 2 * Math.PI);
    this.context.fillStyle = 'rgba(140, 180, 200, 0.8)';
    this.context.fill();

    return true;
  };
}

export default Sun;
