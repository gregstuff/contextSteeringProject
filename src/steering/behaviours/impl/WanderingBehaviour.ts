import type {SteeringContext} from "../../model/SteeringContext.ts";
import type {Boid} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import {DebugCircle} from "../../model/DebugShape.ts";
import {Colors} from "../../../constants/Colour.ts";
import Phaser from "phaser";

const PROJECTED_POINT_BULLSEYE_RADIUS = 5;
const PROJECTED_WANDER_POINT_DEBUG_RADIUS = 15;
const WANDER_JITTER = 0.5;

const WANDER_RADIUS = 50;
const LOOK_AHEAD_DIST = 100;

export class WanderingBehaviour implements SteeringBehaviour {

    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart: number, weight: number, debugOutput: boolean){

        const boidPos: Vector2 = boid.pos;
        const dir: Vector2 = boid.velocity.clone().normalize();
        const projectedPoint: Vector2 = boidPos.clone().add(dir.scale(LOOK_AHEAD_DIST));

        boid.blackboard.wanderAngle += (Math.random() - 0.5) * WANDER_JITTER;

        const maxOffset = Math.PI / 2;
        const seed = boid.pos.x * 0.01 + boid.pos.y * 0.01;

        const theta = boid.velocity.angle() + boid.blackboard.wanderAngle;

        const wanderX: number = WANDER_RADIUS * Math.cos(theta);
        const wanderY: number = WANDER_RADIUS * Math.sin(theta);

        const projectedWanderPoint = new Vector2(wanderX + projectedPoint.x, wanderY + projectedPoint.y);

        const steeringVelocity: Vector2 = projectedWanderPoint.clone().subtract(boidPos); // steering force

        if(debugOutput){
            steeringContext.pushDebugShape(new DebugCircle(Colors.RED, PROJECTED_WANDER_POINT_DEBUG_RADIUS, projectedPoint))
            steeringContext.pushDebugShape(new DebugCircle(Colors.WHITE, WANDER_RADIUS, projectedPoint));
            steeringContext.pushDebugShape(new DebugCircle(Colors.GREEN, PROJECTED_WANDER_POINT_DEBUG_RADIUS, projectedWanderPoint));
        }

        steeringContext.putInterestForVelocity(steeringVelocity, weight);
    }

}