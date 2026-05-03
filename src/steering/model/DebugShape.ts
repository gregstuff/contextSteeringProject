import Phaser from "phaser";
import Vector2 = Phaser.Math.Vector2;

const DEFAULT_THICKNESS = 2;
const OPAQUE = 1;

export class DebugShape {
    drawShape(graphics: Phaser.GameObjects.Graphics): void {
        throw new Error('need to call subclass drawShape');
    }
}

export class DebugCircle extends DebugShape {

    color: number;
    pos: Vector2;
    radius: number;

    constructor(color: number, radius: number, pos: Phaser.Math.Vector2) {
        super();
        this.color = color;
        this.pos = pos;
        this.radius = radius;
    }

    drawShape(graphics: Phaser.GameObjects.Graphics): void {
        const { x, y } = this.pos; 

        graphics.lineStyle(DEFAULT_THICKNESS, this.color, OPAQUE);
        graphics.strokeCircle(x, y, this.radius);
    }

}

export class DebugLine extends DebugShape {

    color: number;
    startPos: Vector2;
    endPos: Vector2;

    constructor(color: number, startPos: Vector2, endPos: Vector2) {
        super();
        this.color = color;
        this.startPos = startPos;
        this.endPos = endPos;
    }

    drawShape(graphics: Phaser.GameObjects.Graphics): void {
        graphics.lineStyle(DEFAULT_THICKNESS, this.color, OPAQUE);
        graphics.lineBetween(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
    }

}

export class DebugSquare extends DebugShape {

    color: number;
    pos: Vector2;
    size: number;

    constructor(color: number, pos: Vector2, size: number) {
        super();
        this.color = color;
        this.pos = pos;
        this.size = size;
    }

    drawShape(graphics: Phaser.GameObjects.Graphics): void {
        const { x, y } = this.pos; 

        graphics.lineStyle(DEFAULT_THICKNESS, this.color, OPAQUE);

        graphics.strokeRect(x, y, this.size, this.size);
    }

}