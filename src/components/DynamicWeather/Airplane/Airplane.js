import planeImageUrl from '../../../assets/plane.png';

class Airplane {
    constructor(canvas, context, startX = null, startY = null) {
        this.canvas = canvas;
        this.context = context;
        this.type = 'airplane';

        // Load plane image
        this.img = new Image();
        this.img.src = planeImageUrl;

        // Base dimensions (will be updated when image loads)
        this.baseWidth = 80; // Base width, will scale down further
        this.baseHeight = 32; // Base height, will scale down further
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.aspectRatio = this.baseWidth / this.baseHeight;

        // Animation properties
        this.duration = 100000; // 10 seconds in milliseconds
        this.startTime = Date.now();
        this.totalDistance = 0; // Will be calculated
        this.speed = 0; // Will be calculated

        // Position - start at left offscreen
        const canvasWidth = canvas.width || canvas.clientWidth || 948;
        const canvasHeight = canvas.height || canvas.clientHeight || 350;

        // Start position: left offscreen
        this.startX = startX !== null ? startX : -this.width;

        // Y position: middle-upper portion of sky (around 20-30% from top)
        this.y = startY !== null ? startY : canvasHeight * 0.25;

        this.x = this.startX;

        // Calculate distance to travel (from left offscreen to right offscreen)
        this.totalDistance = canvasWidth + (this.width * 2); // Full width + plane width on both sides

        // Calculate speed (pixels per millisecond)
        this.speed = this.totalDistance / this.duration;

        // Image load handler
        this.img.onload = () => {
            // Get actual image dimensions
            this.baseWidth = this.img.naturalWidth;
            this.baseHeight = this.img.naturalHeight;
            this.aspectRatio = this.baseWidth / this.baseHeight;

            // Scale down if needed (maintain aspect ratio)
            const maxWidth = 80; // Maximum width on canvas (scaled down)
            if (this.baseWidth > maxWidth) {
                this.width = maxWidth;
                this.height = this.width / this.aspectRatio;
            } else {
                // Even if base is smaller, scale it down more
                this.width = this.baseWidth * 0.3; // Scale to 30% of original
                this.height = this.width / this.aspectRatio;
            }

            // Recalculate distance and speed with actual dimensions
            const canvasWidth = this.canvas.width || this.canvas.clientWidth || 948;
            this.totalDistance = canvasWidth + (this.width * 2);
            this.speed = this.totalDistance / this.duration;

            // Reset start position with actual width (left offscreen)
            this.startX = -this.width;
            this.x = this.startX;
        };
    }

    draw() {
        // Check if image is loaded
        if (!this.img.complete || this.img.naturalWidth === 0) {
            return true; // Keep trying until image loads
        }

        // Calculate elapsed time
        const elapsed = Date.now() - this.startTime;

        // Check if animation is complete (after 10 seconds)
        if (elapsed >= this.duration) {
            return false; // Remove from assets (plane has flown offscreen right)
        }

        // Calculate current position (linear movement from left to right)
        const distanceTraveled = elapsed * this.speed;
        this.x = this.startX + distanceTraveled;

        // Draw the plane
        this.context.save();

        // Draw plane image
        this.context.drawImage(
            this.img,
            0,
            0,
            this.img.naturalWidth,
            this.img.naturalHeight,
            this.x,
            this.y - this.height / 2, // Center vertically on y position
            this.width,
            this.height
        );

        this.context.restore();

        return true; // Keep drawing
    }

    updateCanvasSize(newCanvas) {
        if (newCanvas) {
            this.canvas = newCanvas;
            this.context = newCanvas.getContext('2d');
        }
    }
}

export default Airplane;

