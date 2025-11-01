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




// /** ==========================
//  *  天文与视觉建模常量（全部命名）
//  *  ==========================
//  */

// // 暮光阶段的角度界限：±6° 为民用暮光边界
// const 民用暮光角度边界度数 = 6;

// // 平滑区间宽度（从 -6° 到 +6° 共 12°）
// const 暮光平滑角度范围度数 = 民用暮光角度边界度数 * 2;

// // 暖色与冷色基础色
// const 暖色起点十六进制 = "#FFA34D"; // 橙
// const 暖色终点十六进制 = "#FF3B2E"; // 红
// const 冷色起点十六进制 = "#6FB8FF"; // 天蓝
// const 冷色终点十六进制 = "#5A4BFF"; // 靛紫

// // ===== 红光（暖色）相关权重 =====
// const 红光_低太阳权重 = 0.65;      // 低太阳角度对红色增强的主导因子
// const 红光_湿度权重 = 0.25;        // 湿度对红色强化的比例（潮湿空气增强散射）
// const 红光_气溶胶暖色权重 = 0.35; // 气溶胶在中等浓度时增强暖色的经验值
// const 红光_火山增强权重 = 0.10;    // 火山气溶胶引起的额外红/紫边缘增强

// // ===== 蓝光（冷色）相关权重 =====
// const 蓝光_暮光权重 = 0.50;        // 暮光因子对蓝光的主导作用
// const 蓝光_高云权重 = 0.30;        // 高层云承光对蓝紫散射的贡献
// const 蓝光_空气清洁度权重 = 0.20;  // 空气越干净，蓝紫色越纯
// const 蓝光_火山增强权重 = 0.05;    // 火山气溶胶对蓝光尾部的微增益

// // ===== 空气清洁度经验参数 =====
// const 雨后空气清洁度增益 = 1.15; // 雨后大气更清洁，蓝光增强比例
// const 气溶胶_暖色增强峰值 = 0.4;  // 气溶胶浓度在约 0.4 时增强暖色最显著
// const 气溶胶_暖色增强宽度 = 0.35; // 高斯分布的宽度控制暖色增强的范围

// /** ==========================
//  *  类型定义
//  *  ==========================
//  */
// type 天空输入参数 = {
//   太阳高度角度: number;
//   高层云覆盖率: number;
//   气溶胶浓度: number;
//   相对湿度: number;
//   是否雨后: boolean;
//   是否存在火山气溶胶: boolean;
// };

// type 天空颜色结果 = {
//   十六进制颜色: string;
//   颜色描述: string;
// };

// /** ==========================
//  *  工具函数
//  *  ==========================
//  */
// function 限制范围到单位区间(值: number): number {
//   return Math.max(0, Math.min(1, 值));
// }

// function 混合十六进制颜色(颜色A: string, 颜色B: string, 比例0到1: number): string {
//   const 整数A = parseInt(颜色A.slice(1), 16);
//   const 整数B = parseInt(颜色B.slice(1), 16);

//   const 红A = (整数A >> 16) & 255;
//   const 绿A = (整数A >> 8) & 255;
//   const 蓝A = 整数A & 255;

//   const 红B = (整数B >> 16) & 255;
//   const 绿B = (整数B >> 8) & 255;
//   const 蓝B = 整数B & 255;

//   const 混合红 = Math.round(红A + (红B - 红A) * 比例0到1);
//   const 混合绿 = Math.round(绿A + (绿B - 绿A) * 比例0到1);
//   const 混合蓝 = Math.round(蓝A + (蓝B - 蓝A) * 比例0到1);

//   return "#" + ((1 << 24) + (混合红 << 16) + (混合绿 << 8) + 混合蓝).toString(16).slice(1);
// }

// /** ==========================
//  *  因子计算函数
//  *  ==========================
//  */
// function 计算暮光因子(太阳高度角度: number): number {
//   const 原始比例 = 1 - Math.abs(太阳高度角度) / 民用暮光角度边界度数;
//   return 限制范围到单位区间(原始比例);
// }

// function 计算低太阳因子(太阳高度角度: number): number {
//   const 钳制角度 = Math.max(-民用暮光角度边界度数, Math.min(民用暮光角度边界度数, 太阳高度角度));
//   const 原始比例 = (民用暮光角度边界度数 - 钳制角度) / 暮光平滑角度范围度数;
//   return 限制范围到单位区间(原始比例);
// }

// /** ==========================
//  *  主函数：理想晴朗版天空颜色
//  *  ==========================
//  */
// export function 计算天空颜色_理想晴朗版(输入: 天空输入参数): 天空颜色结果 {
//   const {
//     太阳高度角度,
//     高层云覆盖率,
//     气溶胶浓度,
//     相对湿度,
//     是否雨后,
//     是否存在火山气溶胶
//   } = 输入;

//   // 计算暮光与低太阳两大核心几何因子
//   const 暮光因子 = 计算暮光因子(太阳高度角度);
//   const 低太阳因子 = 计算低太阳因子(太阳高度角度);

//   // 气溶胶暖色增强高斯分布
//   const 气溶胶暖色增强因子 = Math.exp(
//     -Math.pow((气溶胶浓度 - 气溶胶_暖色增强峰值) / 气溶胶_暖色增强宽度, 2)
//   );

//   // === 红光强度 ===
//   let 红光强度 =
//     红光_低太阳权重 * 低太阳因子 +
//     红光_湿度权重 * 相对湿度 +
//     红光_气溶胶暖色权重 * 气溶胶暖色增强因子;

//   if (是否存在火山气溶胶) {
//     红光强度 += 红光_火山增强权重 * 暮光因子;
//   }

//   // === 蓝光强度 ===
//   const 空气清洁度因子 =
//     限制范围到单位区间(1 - 气溶胶浓度) *
//     (是否雨后 ? 雨后空气清洁度增益 : 1);

//   let 蓝光强度 =
//     蓝光_暮光权重 * 暮光因子 +
//     蓝光_高云权重 * 高层云覆盖率 +
//     蓝光_空气清洁度权重 * 空气清洁度因子;

//   if (是否存在火山气溶胶) {
//     蓝光强度 += 蓝光_火山增强权重 * 暮光因子;
//   }

//   // === 红蓝比例混合 ===
//   const 总光强度 = 红光强度 + 蓝光强度 + 1e-6;
//   const 蓝色占比 = 蓝光强度 / 总光强度;

//   const 暖色基础 = 混合十六进制颜色(
//     暖色起点十六进制,
//     暖色终点十六进制,
//     限制范围到单位区间(低太阳因子)
//   );
//   const 冷色基础 = 混合十六进制颜色(
//     冷色起点十六进制,
//     冷色终点十六进制,
//     限制范围到单位区间(暮光因子)
//   );

//   const 合成颜色十六进制 = 混合十六进制颜色(
//     暖色基础,
//     冷色基础,
//     限制范围到单位区间(蓝色占比)
//   );

//   // === 颜色描述 ===
//   const 紫色显著性指标 = Math.min(红光强度, 蓝光强度) * 2;
//   let 颜色描述 = "理想暮光色";

//   if (紫色显著性指标 > 0.75 && 暮光因子 > 0.6) {
//     颜色描述 = "浓烈紫色";
//   } else if (紫色显著性指标 > 0.5 && 暮光因子 > 0.4) {
//     颜色描述 = "紫红色调";
//   } else if (红光强度 > 蓝光强度) {
//     颜色描述 = "暖色主导（橙红/粉橙）";
//   } else {
//     颜色描述 = "冷色主导（蓝紫/靛紫）";
//   }

//   return { 十六进制颜色: 合成颜色十六进制, 颜色描述 };
// }
