import landmarkImageUrl from '../../../assets/opealHouse.png';
import Ocean from '../Ocean/Ocean';

class Landmark {
    constructor(canvas, context, offsetX = 0, offsetY = 105) {
        this.canvas = canvas;
        this.context = context;
        this.type = 'landmark';
        this.offsetX = offsetX; // Horizontal offset (positive = right, negative = left)
        this.offsetY = offsetY; // Vertical offset (positive = down, negative = up)

        // Load landmark image
        this.img = new Image();
        this.img.src = landmarkImageUrl;

        // Base dimensions (will be updated when image loads)
        this.baseWidth = 150; // Base width, will scale
        this.baseHeight = 200; // Base height, will scale
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.aspectRatio = this.baseWidth / this.baseHeight;

        // Calculate position - right side, above ocean
        this.updatePosition();

        // Image load handler
        this.img.onload = () => {
            // Get actual image dimensions
            this.baseWidth = this.img.naturalWidth;
            this.baseHeight = this.img.naturalHeight;
            this.aspectRatio = this.baseWidth / this.baseHeight;

            // Scale down if needed (maintain aspect ratio)
            const maxHeight = 400; // Maximum height on canvas
            if (this.baseHeight > maxHeight) {
                this.height = maxHeight;
                this.width = this.height * this.aspectRatio;
            } else {
                // Scale to reasonable size (maintain proportion)
                this.height = this.baseHeight * 0.1; // Scale to 40% of original
                this.width = this.height * this.aspectRatio;
            }

            // Recalculate position with actual dimensions
            this.updatePosition();
        };
    }

    updatePosition() {
        const canvasWidth = this.canvas.width || this.canvas.clientWidth || 948;
        const canvasHeight = this.canvas.height || this.canvas.clientHeight || 350;

        // Use the same ocean height calculation as Ocean.js
        const oceanHeight = canvasHeight * Ocean.OCEAN_HEIGHT_PERCENTAGE;
        const oceanTopY = canvasHeight - oceanHeight;

        // Position on right side with some margin
        const rightMargin = 0; // Margin from right edge
        this.x = canvasWidth - this.width - rightMargin + this.offsetX;

        // Position above ocean (bottom of landmark aligns with top of ocean)
        this.y = oceanTopY - this.height + this.offsetY;

        // Ensure landmark doesn't go above canvas top
        if (this.y < 0) {
            this.y = 0;
        }
    }

    updateCanvasSize(newCanvas) {
        if (newCanvas) {
            this.canvas = newCanvas;
            this.context = newCanvas.getContext('2d');
            // Recalculate position when canvas size changes
            this.updatePosition();
        }
    }

    draw() {
        // Check if image is loaded
        if (!this.img.complete || this.img.naturalWidth === 0) {
            return true; // Keep trying until image loads
        }

        // Update position if canvas size changed
        const canvasWidth = this.canvas.width || this.canvas.clientWidth || 948;
        const canvasHeight = this.canvas.height || this.canvas.clientHeight || 350;
        const oceanHeight = canvasHeight * Ocean.OCEAN_HEIGHT_PERCENTAGE;
        const oceanTopY = canvasHeight - oceanHeight;
        const rightMargin = 0;
        const expectedX = canvasWidth - this.width - rightMargin + this.offsetX;
        const expectedY = oceanTopY - this.height + this.offsetY;

        if (this.x !== expectedX || this.y !== expectedY) {
            this.updatePosition();
        }

        // Draw the landmark
        this.context.save();

        // Draw landmark image
        this.context.drawImage(
            this.img,
            0,
            0,
            this.img.naturalWidth,
            this.img.naturalHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );

        this.context.restore();

        return true; // Keep drawing
    }
}

export default Landmark;

