import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

export class Obstacle {
    pos: Vector2;
    size: number;

    constructor(pos: Vector2, size: number) {
        this.pos = pos;
        this.size = size;
    }

}