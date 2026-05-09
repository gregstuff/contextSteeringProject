import type { BoidBlackboard } from "../../Model/BoidBlackboard.ts";
import type {BoidModule} from "../BoidModule.ts";
import type {Boid, BoidWithDistance} from "../../Model/Boid.ts";

const KILL_DISTANCE: number = 40;

export class PredatorModule implements BoidModule {

    onTick(boid: Boid): void {
        const target: BoidWithDistance | undefined = boid.blackboard.targetBoid;

        if(!target || !target.boid.isAlive) return;

        const dist = target.toThis.length();

        if(dist <= KILL_DISTANCE){
            target.boid.destroy(); // kill the boid
        }
    }

    onCache(boid: Boid): void {
        const blackboard: BoidBlackboard = boid.blackboard;

        const resolveTarget = (boids: BoidWithDistance[]): void => {
                let minDist: number = Number.MAX_SAFE_INTEGER;
            let targetBoid: BoidWithDistance | undefined = undefined;
                for(let i: number = 0; i < boids.length; ++i){
                    const dist: number = boids[i].toThis.length();
                    if(boids[i].boid.isAlive && dist < minDist){
                        minDist = dist;
                        targetBoid = boids[i];
                    }
                }
                blackboard.targetBoid = targetBoid;
        };

        if(boid.closeDistanceEnemies.filter(e=>e.boid.isAlive).length > 0){
            resolveTarget(boid.closeDistanceEnemies);
        }
        else if(boid.mediumDistanceEnemies.filter(e=>e.boid.isAlive).length > 0){
            resolveTarget(boid.mediumDistanceEnemies);
        }
        else if(boid.farDistanceEnemies.filter(e=>e.boid.isAlive).length > 0){
            resolveTarget(boid.farDistanceEnemies);
        }

    }
}