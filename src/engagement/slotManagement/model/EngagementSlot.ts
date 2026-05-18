import {directionToVector, type EngagementSlotDirection} from "../constants/EngagementSlotDirection.ts";
import type {Boid} from "../../../boids/Model/Boid.ts";
import Phaser from "phaser";
import Vector2 = Phaser.Math.Vector2;

const SLOT_DIST: number = 30;


export class EngagementSlot {
    slotOwner: Boid;
    engagementSlotDirection: EngagementSlotDirection;
    claimedBy: Boid | undefined;

    constructor(slotOwner: Boid, engagementSlotDirection: EngagementSlotDirection) {
        this.slotOwner = slotOwner;
        this.engagementSlotDirection = engagementSlotDirection;
    }

    computePosition(): Vector2 {
        const relevantDirection: Vector2 = directionToVector(this.engagementSlotDirection);
        return this.slotOwner.pos.clone().add(relevantDirection.scale(SLOT_DIST));
    }
}