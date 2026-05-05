import Phaser from "phaser";
import type {Faction} from "../constants/Faction.ts";
import type {BoidBlackboard} from "./BoidBlackboard.ts";

export const CLOSE_DISTANCE = 50;
export const MEDIUM_DISTANCE = 100;
export const FAR_DISTANCE = 150;

export class Boid {

    id: string;
    pos: Phaser.Math.Vector2;
    velocity: Phaser.Math.Vector2;
    size: number;
    faction: Faction;
    maximumSpeed: number;
    maximumForce: number;
    target: Phaser.Math.Vector2 | undefined;
    blackboard: BoidBlackboard;

    closeDistanceEnemies: Boid[];
    mediumDistanceEnemies: Boid[];
    farDistanceEnemies: Boid[];

    closeDistanceFriendlies: Boid[];
    mediumDistanceFriendlies: Boid[];
    farDistanceFriendlies: Boid[];

    constructor(pos: Phaser.Math.Vector2,
                startingVelocity: Phaser.Math.Vector2,
                size: number,
                faction: Faction,
                maximumSpeed: number,
                maximumForce: number) {

        this.id = crypto.randomUUID();
        this.pos = pos;
        this.velocity = startingVelocity;
        this.size = size;
        this.faction = faction;
        this.maximumSpeed = maximumSpeed;
        this.maximumForce = maximumForce;
        this.target = undefined;

        this.blackboard = {
            wanderAngle: Math.random() * Math.PI * 2,
            selfFactionSeekPoint: undefined,
            selfFactionSeekLastCacheSeconds: undefined,
            selfFactionFleeLastCacheSeconds: undefined,
            selfFactionFleePoint: undefined,
            alignmentVector: undefined,
            alignmentCacheSeconds: undefined
        };

        this.closeDistanceEnemies = [];
        this.mediumDistanceEnemies = [];
        this.farDistanceEnemies = [];

        this.closeDistanceFriendlies = [];
        this.mediumDistanceFriendlies = [];
        this.farDistanceFriendlies = [];
    }
    
    move(newVelocity: Phaser.Math.Vector2) {
        this.velocity = newVelocity;
        this.pos.add(this.velocity);
    }

    getRotation() {
        return Phaser.Math.Angle.Between(
            0,
            0,
            this.velocity.x,
            this.velocity.y
        );
    }

    updateCache(allBoids: Boid[]) {
        this.closeDistanceEnemies = [];
        this.mediumDistanceEnemies = [];
        this.farDistanceEnemies = [];

        this.closeDistanceFriendlies = [];
        this.mediumDistanceFriendlies = [];
        this.farDistanceFriendlies = [];

        for( let i = 0; i < allBoids.length; ++i ){
            const isSelf = allBoids[i].id === this.id;
            const isEnemy = allBoids[i].faction !== this.faction; // might want to make this more nuanced later

            if(isSelf) continue;

            const other = allBoids[i];

            const nearDist = isEnemy ? this.closeDistanceEnemies : this.closeDistanceFriendlies;
            const mediumDist = isEnemy ? this.mediumDistanceEnemies : this.mediumDistanceFriendlies;
            const farDist = isEnemy ? this.farDistanceEnemies : this.farDistanceFriendlies;

            const toTarget = new Phaser.Math.Vector2()
                .copy(other.pos)
                .subtract(this.pos);

            const dist = toTarget.length();

            if(dist <= CLOSE_DISTANCE){
                nearDist.push(other);
            }
            else if(dist <= MEDIUM_DISTANCE){
                mediumDist.push(other);
            }
            else if(dist <= FAR_DISTANCE) {
                farDist.push(other);
            }
        }
    }

}