import {Obstacle} from "./Obstacle.ts";
import Vector2 = Phaser.Math.Vector2;
import type {ObstacleConfig} from "../config/GameConfig.ts";
import {drawFilledCircle} from "../util/GraphicsUtils.ts";
import Phaser from "phaser";

export class ObstacleController {

    obstacles: Obstacle[];
    config: ObstacleConfig;
    graphics: Phaser.GameObjects.Graphics | undefined;
    eventEmitter: Phaser.Events.EventEmitter;

    constructor(eventEmitter: Phaser.Events.EventEmitter, config: ObstacleConfig) {
        this.obstacles = [];
        this.config = config;
        this.graphics = undefined;
        this.eventEmitter = eventEmitter;
        this.setupEvents();
    }

    tick(): void {
        this.drawObstacles();
    }

    setGraphics(graphics: Phaser.GameObjects.Graphics): void{
        this.graphics = graphics;
    }

    addObstacle(targetPos: Vector2): void {
        const obstacle = new Obstacle(targetPos, this.config.size);
        this.obstacles.push(obstacle);
    }

    drawObstacles(): void {
        for(let i: number = 0; i < this.obstacles.length; ++i){
            const obstacle = this.obstacles[i];
            drawFilledCircle(this.graphics!, obstacle.pos.x, obstacle.pos.y, this.config.size);
        }
    }

    setupEvents(): void {
        this.eventEmitter.on('spawn', this.addObstacle, this);
    }

}