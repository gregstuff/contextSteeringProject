import { Boid } from '../model/Boid.js';
import { SteeringController } from '../steering/SteeringController.js';
import { drawBoid } from '../util/GraphicsUtils.js';
import type {Bounds} from "../model/Bounds.ts";
import Vector2 = Phaser.Math.Vector2;
import {BoidsConfig} from "./BoidsConfig.ts";
import type {SteeringContext} from "../steering/model/SteeringContext.ts";
import Phaser from "phaser";
import type {Entity} from "../constants/Util.ts";

const CACHE_UPDATE_SECONDS = 0.2;

export class BoidsController {

    boids: Boid[];
    graphics: Phaser.GameObjects.Graphics;
    bounds: Bounds;
    config: BoidsConfig;
    targetPos: Vector2 | undefined;
    steeringController: SteeringController;
    lastCacheUpdate: number;
    steeringCtx: SteeringContext | undefined;

    constructor(graphics: Phaser.GameObjects.Graphics, bounds: Bounds, config: BoidsConfig) {
        this.graphics = graphics;
        this.bounds = bounds;
        this.config = config;
        this.boids = [];
        this.setupEvents();
        this.initBoids();
        this.targetPos = undefined;
        this.steeringController = new SteeringController(config.steeringBehaviourConfigs);
        this.lastCacheUpdate = Number.MIN_SAFE_INTEGER;
        this.steeringCtx = undefined;
    }

    tick(allEntities: Entity[], secondsSinceStart: number): void {
        this.updateBoidReferences(allEntities, secondsSinceStart);
        this.updateBoids(secondsSinceStart);
        this.drawBoids();
        this.drawDebug();
    }

    initBoids(): void {
        const { initialCount } = this.config;

        for(let i: number  = 0; i < initialCount; ++i){
            const randPos = new Phaser.Math.Vector2(
                Phaser.Math.Between(0, this.bounds.width), 
                Phaser.Math.Between(0, this.bounds.height));
            this.addBoid(randPos);
        }
    }

    drawBoids(): void {
        for(let i: number = 0; i < this.boids.length; ++i){
            const boid: Boid = this.boids[i];
            drawBoid(
                this.graphics,
                boid.pos.x,
                boid.pos.y,
                boid.getRotation(),
                boid.size
            );
        }
    }

    drawDebug(): void {
        if(!this.steeringCtx) return;

        const { debugShapes } = this.steeringCtx
        for(let i: number = 0; i < debugShapes.length; ++i)
            debugShapes[i].drawShape(this.graphics);
    }

     updateBoids(secondsSinceStart:number): void {
        for(let i: number = 0; i < this.boids.length; ++i){
            this.steeringCtx = this.steeringController.updateBoid(this.boids[i], secondsSinceStart, this.targetPos);
            this.wrapAround(this.boids[i]);
        }
    }

    wrapAround(boid: Boid): void {
        let {x, y} = boid.pos;

        const outOfBoundsWidthMin = x < this.bounds.widthBoundsMin;
        const outOfBoundsWidthMax = x > this.bounds.widthBoundsMax;
        const outOfBoundsHeightMin = y < this.bounds.heightBoundsMin;
        const outOfBoundsHeightMax = y > this.bounds.heightBoundsMax;
        
        if(!outOfBoundsWidthMin 
        && !outOfBoundsWidthMax 
        && !outOfBoundsHeightMin
        && !outOfBoundsHeightMax) return;

        x = outOfBoundsWidthMin ? this.bounds.width : outOfBoundsWidthMax ? 0 : x;
        y = outOfBoundsHeightMin ? this.bounds.height : outOfBoundsHeightMax ? 0 : y;

        boid.pos.set(x, y);
    }

    setupEvents(): void {
        this.config.eventEmitter.on('spawn', this.handleSpawn, this);
        this.config.eventEmitter.on('targetChanged', this.handleTargetMoved, this);
    }

    handleSpawn(targetPos: Vector2): void {
        this.addBoid(targetPos);
    }

    handleTargetMoved(targetPos: Vector2): void {
        this.targetPos = targetPos;
    }

    addBoid(startingPos: Vector2): void {
        const { maximumSpeed, size, maximumForce, faction } = this.config;

        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        const startingVelocity = new Phaser.Math.Vector2(
            Math.cos(angle),
            Math.sin(angle)
        ).scale(maximumSpeed);

        this.boids.push(new Boid(startingPos, startingVelocity, size, faction, maximumSpeed, maximumForce));
    }

    updateBoidReferences(allEntities: Entity[], secondsSinceStart: number): void {
        if(this.lastCacheUpdate && this.lastCacheUpdate + CACHE_UPDATE_SECONDS > secondsSinceStart ) return;

        this.lastCacheUpdate = secondsSinceStart;

        for(let i = 0; i < this.boids.length; ++i){
            this.boids[i].updateCache(allEntities);
        }
    }

}