class Sun {
    constructor(canvas, context, x, y, sunRadius = 50) {
        this.canvas = canvas;
        this.context = context;
        this.x = x;
        this.y = y;
        this.baseSunRadius = sunRadius; // Store base radius for scaling
        this.sunRadius = sunRadius; // Current radius (can change with canvas resize)

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
            this.sunRadius = this.baseSunRadius * sizeRatio;
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
                    this.sunRadius = this.baseSunRadius * sizeRatio;
                }
            }
        }

        // Debug: Check if sun position is valid
        if (!this.x || !this.y || isNaN(this.x) || isNaN(this.y)) {
            console.warn('Sun position invalid:', { x: this.x, y: this.y });
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
        const scaledRadius = this.sunRadius / minStretch;

        // Validate values before drawing to prevent non-finite errors
        if (!isFinite(scaledX) || !isFinite(scaledY) || !isFinite(scaledRadius) ||
            isNaN(scaledX) || isNaN(scaledY) || isNaN(scaledRadius) ||
            scaledRadius <= 0 || minStretch <= 0) {
            console.warn('Sun: Invalid scaled values, skipping draw', { scaledX, scaledY, scaledRadius, minStretch });
            this.context.restore();
            return true;
        }

        // Draw outer glow/halo
        const glowRadius = scaledRadius * 1.3;

        // Validate glow radius before creating gradient
        if (isFinite(glowRadius) && glowRadius > 0 && glowRadius > scaledRadius) {
            this.context.beginPath();
            this.context.arc(scaledX, scaledY, glowRadius, 0, 2 * Math.PI);
            const glowGradient = this.context.createRadialGradient(
                scaledX, scaledY, scaledRadius,
                scaledX, scaledY, glowRadius
            );
            glowGradient.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 220, 100, 0)');
            this.context.fillStyle = glowGradient;
            this.context.fill();
        }

        // Draw sun (bright yellow/orange)
        this.context.beginPath();
        this.context.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);

        // Create radial gradient for sun (bright center, slightly darker edges)
        if (isFinite(scaledRadius) && scaledRadius > 0) {
            const sunGradient = this.context.createRadialGradient(
                scaledX, scaledY, 0,
                scaledX, scaledY, scaledRadius
            );
            sunGradient.addColorStop(0, 'rgba(255, 240, 150, 1)'); // Bright yellow center
            sunGradient.addColorStop(0.7, 'rgba(255, 220, 100, 1)'); // Orange-yellow
            sunGradient.addColorStop(1, 'rgba(255, 200, 80, 1)'); // Orange edge

            this.context.fillStyle = sunGradient;
            this.context.fill();
        }

        // Add a bright outline
        if (isFinite(scaledRadius) && scaledRadius > 0 && isFinite(minStretch) && minStretch > 0) {
            this.context.beginPath();
            this.context.arc(scaledX, scaledY, scaledRadius, 0, 2 * Math.PI);
            this.context.strokeStyle = 'rgba(255, 220, 100, 0.8)';
            this.context.lineWidth = Math.max(0.5, 2 / minStretch);
            this.context.stroke();
        }

        // Restore context state
        this.context.restore();

        return true;
    };
}

export default Sun;

