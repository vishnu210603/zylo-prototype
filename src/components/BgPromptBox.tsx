'use client';

import { useEffect, useRef } from 'react';
import LinkedInPostForm from './LinkedInPostForm';

export default function BgPromptBox() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = 350;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const squareSize = 62;
        const diag = Math.sqrt(2) * squareSize;
        const horizGap = 25;
        const vertGap = 0;

        const cols = Math.ceil(canvas.width / (diag + horizGap)) + 2;
        const rows = Math.ceil(canvas.height / (diag + vertGap)) + 2;

        const mouse = { x: -1000, y: -1000 };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineJoin = 'round';

            const centers: { x: number; y: number; corners: any[]; isHovered: boolean }[] = [];

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const centerX = col * (diag + horizGap);
                    const centerY = row * (diag + vertGap);

                    const offset = squareSize / Math.sqrt(2);
                    const corners = [
                        { x: centerX, y: centerY - offset },
                        { x: centerX + offset, y: centerY },
                        { x: centerX, y: centerY + offset },
                        { x: centerX - offset, y: centerY },
                    ];

                    const dx = mouse.x - centerX;
                    const dy = mouse.y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const isHovered = dist < squareSize;

                    centers.push({ x: centerX, y: centerY, corners, isHovered });

                    ctx.lineWidth = 15;
                    ctx.strokeStyle = isHovered
                        ? 'rgba(255,255,255,0.25)'
                        : 'rgba(255,255,255,0.10)';

                    ctx.beginPath();
                    ctx.moveTo(corners[0].x, corners[0].y);
                    for (let i = 1; i < corners.length; i++) {
                        ctx.lineTo(corners[i].x, corners[i].y);
                    }
                    ctx.closePath();
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(corners[3].x, corners[3].y);
                    ctx.lineTo(corners[1].x, corners[1].y);
                    ctx.stroke();
                }
            }

            ctx.lineWidth = 10;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            const horizontalLines = new Set<number>();
            centers.forEach(({ corners }) => {
                horizontalLines.add(Math.round(corners[0].y));
                horizontalLines.add(Math.round(corners[2].y));
            });
            horizontalLines.forEach((y) => {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            });

            requestAnimationFrame(draw);
        };

        draw();

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="relative w-full h-[350px] overflow-hidden rounded-xl flex justify-center items-center px-4 mt-4">
            {/* Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute max-w-[96%] h-full rounded-xl"
                style={{
                    background: 'linear-gradient(to bottom, #73DFE7, #0063F7)',
                }}
            />

            {/* LinkedIn Post Form Component */}
            <LinkedInPostForm />
        </div>
    );
}
