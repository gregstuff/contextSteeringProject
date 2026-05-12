import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import  {type SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type BoidWithDistance, FAR_DISTANCE} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const MAX_SPEED_DIST = 30;
const CACHE_DURATION_SECONDS = 0.1;

export class OtherFactionSeekingBehaviour implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart: number, weight: number, debugOutput: boolean): void {
    }

}