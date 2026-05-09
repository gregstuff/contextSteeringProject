import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

export function drawBoid(
    graphics: Phaser.GameObjects.Graphics,
    color: number,
    x: number,
    y: number,
    rotation: number,
    size: number): void {

        graphics.fillStyle(color, 1);

        const points: Vector2[] = [
            new Vector2(size, 0), // nose / forward point
            new Vector2(-size * 0.6, -size * 0.45), // rear left
            new Vector2(-size * 0.6, size * 0.45) // rear right
        ];

        const cos: number = Math.cos(rotation);
        const sin: number = Math.sin(rotation);

        const rotatePoint = (p: Vector2) => {
            return {
                x: x + p.x * cos - p.y * sin,
                y: y + p.x * sin + p.y * cos
            }
        };

        const pointA = rotatePoint(points[0]);
        const pointB = rotatePoint(points[1]);
        const pointC = rotatePoint(points[2]);

        graphics.beginPath();
        graphics.moveTo(pointA.x, pointA.y);
        graphics.lineTo(pointB.x, pointB.y);
        graphics.lineTo(pointC.x, pointC.y);

        graphics.closePath();
        graphics.fillPath();
    }

export function drawX(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size = 20) {
      graphics.lineStyle(2, 0xff0000, 1);

        // top-left to bottom-right
        graphics.lineBetween(
            x - size,
            y - size,
            x + size,
            y + size
        );

        // bottom-left to top-right
        graphics.lineBetween(
            x - size,
            y + size,
            x + size,
            y - size
        );
}

export function drawCircleOutline(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number) {
    graphics.strokeCircle(x, y, radius);
}

export function drawFilledCircle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number): void {
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(x, y, radius);
}