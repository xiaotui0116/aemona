// faucet.js
export const drawFaucet = (ctx, canvasWidth) => {
    const x = canvasWidth / 2;
    const y = 50; // 水龙头位置

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#e74c3c"; // 水龙头颜色
    
    // 绘制简易水龙头：一个矩形主体 + 一个弯管
    ctx.fillRect(x - 20, 0, 40, 50); // 主体
    ctx.arc(x - 20, 50, 20, 0, Math.PI); // 弯头
    
    ctx.fill();
    ctx.restore();
};