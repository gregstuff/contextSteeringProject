import Phaser from "phaser";
import type {Faction} from "../constants/Faction.ts";
import type {BoidBlackboard} from "./BoidBlackboard.ts";
import Vector2 = Phaser.Math.Vector2;
import type {Entity} from "../constants/Util.ts";
import {Obstacle} from "../obstacles/Obstacle.ts";

export const CLOSE_DISTANCE = 50;
export const MEDIUM_DISTANCE = 100;
export const FAR_DISTANCE = 150;

export type BoidWithDistance = {
    boid: Boid;
    toThis: Vector2;
}

export type ObstacleWithDistance = {
    obstacle: Obstacle;
    toThis: Vector2;
}

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

    closeDistanceEnemies: BoidWithDistance[];
    mediumDistanceEnemies: BoidWithDistance[];
    farDistanceEnemies: BoidWithDistance[];

    closeDistanceFriendlies: BoidWithDistance[];
    mediumDistanceFriendlies: BoidWithDistance[];
    farDistanceFriendlies: BoidWithDistance[];

    obstacles: ObstacleWithDistance[];

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
            alignmentCacheSeconds: undefined,
            avoidObstaclesCacheSeconds: undefined,
            avoidObstaclesVector: undefined
        };

        this.closeDistanceEnemies = [];
        this.mediumDistanceEnemies = [];
        this.farDistanceEnemies = [];

        this.closeDistanceFriendlies = [];
        this.mediumDistanceFriendlies = [];
        this.farDistanceFriendlies = [];

        this.obstacles = [];
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

    updateCache(allEntities: Entity[]) {
        this.closeDistanceEnemies = [];
        this.mediumDistanceEnemies = [];
        this.farDistanceEnemies = [];

        this.closeDistanceFriendlies = [];
        this.mediumDistanceFriendlies = [];
        this.farDistanceFriendlies = [];

        this.obstacles = [];

        for( let i = 0; i < allEntities.length; ++i ){
            const entity = allEntities[i];

            if(typeof entity === typeof Boid){
                this.handleForBoid(allEntities[i] as Boid);
            }
            else if(typeof entity === typeof Obstacle){
                this.handleForObstacle(allEntities[i] as Obstacle);
            }
        }
    }

    handleForObstacle(obstacle: Obstacle): void{

        const toThis: Vector2 = new Phaser.Math.Vector2()
            .copy(obstacle.pos)
            .subtract(this.pos);

        const obstacleWithDistance: ObstacleWithDistance = {
            obstacle,
            toThis
        }

        this.obstacles.push(obstacleWithDistance)
    }

    handleForBoid(other: Boid): void {
        const isSelf: boolean = other.id === this.id;
        const isEnemy: boolean = other.faction !== this.faction; // might want to make this more nuanced later

        if(isSelf) return;

        const nearDist: BoidWithDistance[] = isEnemy ? this.closeDistanceEnemies : this.closeDistanceFriendlies;
        const mediumDist: BoidWithDistance[] = isEnemy ? this.mediumDistanceEnemies : this.mediumDistanceFriendlies;
        const farDist: BoidWithDistance[] = isEnemy ? this.farDistanceEnemies : this.farDistanceFriendlies;

        const toTarget: Vector2 = new Phaser.Math.Vector2()
            .copy(other.pos)
            .subtract(this.pos);

        const dist: number = toTarget.length();

        const boidWithDistance = {
            boid: other,
            toThis: toTarget
        }

        if(dist <= CLOSE_DISTANCE){
            nearDist.push(boidWithDistance);
        }
        else if(dist <= MEDIUM_DISTANCE){
            mediumDist.push(boidWithDistance);
        }
        else if(dist <= FAR_DISTANCE) {
            farDist.push(boidWithDistance);
        }
    }

}