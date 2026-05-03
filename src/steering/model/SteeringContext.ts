import {Direction, DIRECTION_COUNT, DIRECTION_TO_VECTOR, DIRECTIONS} from '../constants/Direction.js';
import Vector2 = Phaser.Math.Vector2;
import type {DebugShape} from "./DebugShape.ts";
import Phaser from "phaser";

export class SteeringContext {

    target: Vector2 | undefined;
    interestMap: number[];
    dangerMap: number[];
    debugShapes: DebugShape[];

    constructor(target?: Vector2){
        this.interestMap = Array(DIRECTION_COUNT).fill(0);
        this.dangerMap = Array(DIRECTION_COUNT).fill(0);
        this.debugShapes = [];

        if(target)
            this.target = target;
    }

    putDangerForVelocity(velocity: Vector2, weight: number) {
        const weightedVelocity = velocity.clone().scale(weight);
        const relevantIndex = this.directionToIndex(weightedVelocity);
        const score = weightedVelocity.length();

        if(this.dangerMap[relevantIndex] <= score)
            this.dangerMap[relevantIndex] = score;
    }

    putInterestForVelocity(velocity: Vector2, weight: number) {
        const weightedVelocity = velocity.clone().scale(weight);
        const relevantIndex = this.directionToIndex(weightedVelocity);
        const score = weightedVelocity.length();

        if(this.interestMap[relevantIndex] <= score)
            this.interestMap[relevantIndex] = score;
    }

    directionToIndex(vector: Vector2) {
        const angle: number = Math.atan2(vector.y, vector.x);

        // Convert from [-PI, PI] to [0, 2PI]
        const normalizedAngle: number = angle < 0 ? angle + Math.PI * 2 : angle;

        // 8 slices around the circle
        const slice: number = Math.PI * 2 / DIRECTION_COUNT;

        return Math.round(normalizedAngle / slice) % DIRECTION_COUNT;
    }

    desiredVelocity(): Vector2 {
        const result = { x: 0, y: 0 };

        for (let i: number = 0; i < DIRECTION_COUNT; i++) {
            const interest = this.interestMap[i];
            const danger = this.dangerMap[i];
            const relevantDirection: Direction = DIRECTIONS[i];

            const score = Math.max(0, interest - danger);

            result.x += DIRECTION_TO_VECTOR[relevantDirection].x * score;
            result.y += DIRECTION_TO_VECTOR[relevantDirection].y * score;
        }

        return new Phaser.Math.Vector2(result.x, result.y);
    }

    pushDebugShape(debugShape: DebugShape): void {
        this.debugShapes.push(debugShape);
    }
}