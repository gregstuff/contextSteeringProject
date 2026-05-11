import {Bounds} from '../model/Bounds.js';
import {drawX} from '../util/GraphicsUtils.js';
import {BoidsController} from '../boids/BoidsController.js';
import {GAME_CONFIG} from '../config/GameConfig.js';
import Phaser from "phaser";
import {MOUSE_MODE_LENGTH, MouseMode} from "../constants/MouseMode.ts";
import type {Entity} from "../constants/Util.ts";
import {ObstacleController} from "../obstacles/ObstacleController.ts";
import {BoidEvent} from "../constants/BoidEvent.ts";
import {EngagementController} from "../engagement/EngagementController.ts";
import {EngagementSlotManager} from "../engagement/slotManagement/EngagementSlotManager.ts";

const BOUNDS_BUFFER = 1.2;

export class Start extends Phaser.Scene {

    targetPos: Phaser.Math.Vector2 | undefined;
    mouseMode: MouseMode;
    selectedBoidsControllerIndex: number;
    graphics: Phaser.GameObjects.Graphics | undefined;
    eventEmitters: Record<string, Phaser.Events.EventEmitter>;
    engagementController: EngagementController;
    engagementSlotManager: EngagementSlotManager;
    obstacleEmitter: Phaser.Events.EventEmitter;
    boidsControllers: BoidsController[];
    obstacleController: ObstacleController;
    bounds: Bounds | undefined;
    uiText: Phaser.GameObjects.Text | undefined;
    boidCount: number;

    constructor() {
        super('Start');
        this.targetPos = undefined;
        this.selectedBoidsControllerIndex = 0;
        this.boidCount = 0;
        this.mouseMode = MouseMode.TARGET;
        this.eventEmitters = {};
        this.boidsControllers = [];
        this.obstacleEmitter = new Phaser.Events.EventEmitter();
        this.obstacleController = new ObstacleController(this.obstacleEmitter, GAME_CONFIG.obstacleController);
        this.engagementController = new EngagementController();
        this.engagementSlotManager = new EngagementSlotManager();
    }

    preload(): void {

    }

    create(): void {
        this.graphics = this.add.graphics();
        this.setupInputs();
        this.bounds = new Bounds(this.scale.width, this.scale.height, BOUNDS_BUFFER);
        this.initBoidsControllers();
        this.obstacleController.setGraphics(this.graphics);

        this.uiText = this.add.text(10, 10, '', {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.updateUIText();
    }

    update(): void {
        this.graphics!.clear();
        this.drawTarget();
        const secondsSinceStart = this.time.now / 1000;

        const allEntities: Entity[] = this.getAllEntities();

        for(let i = 0; i < this.boidsControllers.length; ++i) {
            this.boidsControllers[i].tick(allEntities, secondsSinceStart);
        }

        this.obstacleController.tick();

        this.engagementController.tick();
    }

    drawTarget(): void {
        if(!this.targetPos) return;

        const { x, y } = this.targetPos;

        drawX(this.graphics!, x,y);
    }

    setupInputs(): void {

        this.input.keyboard?.on('keydown-Z', () => {
                this.toggleMouseMode();
        });

        this.input.keyboard?.on('keydown-X', () => {
            this.cycleSelectedBoidsController();
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer): void => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const clickPos = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);

            if (this.mouseMode === MouseMode.TARGET) {
                this.targetPos = clickPos;

                Object.values(this.eventEmitters)
                    .forEach(e => e.emit('targetChanged', clickPos));

                return;
            }
            else if (this.mouseMode === MouseMode.SPAWN) {
                const selectedController = this.boidsControllers[this.selectedBoidsControllerIndex];

                const relevantEmitter: Phaser.Events.EventEmitter = this.eventEmitters[selectedController.config.id];
                relevantEmitter.emit('spawn', clickPos);
                ++this.boidCount;

                this.updateUIText();

                return;
            }
            else if(this.mouseMode === MouseMode.OBSTACLE) {
                this.obstacleEmitter.emit('spawn', clickPos);
            }
        });
    }

    toggleMouseMode(): void {
        const nextIndex = (this.mouseMode + 1) % MOUSE_MODE_LENGTH;
        this.mouseMode = nextIndex as MouseMode;
        this.updateUIText();
    }

    cycleSelectedBoidsController(): void {
        this.selectedBoidsControllerIndex =
            (this.selectedBoidsControllerIndex + 1) % this.boidsControllers.length;
        this.updateUIText();
    }


    initBoidsControllers(): void {
        this.boidsControllers = GAME_CONFIG.boidsControllers.map(bc=>
        {
            const relevantEventEmitter = new Phaser.Events.EventEmitter();
            this.eventEmitters[bc.id] = relevantEventEmitter;
            this.boidCount += bc.initialCount;

            relevantEventEmitter.on(BoidEvent.DECREMENT_BOID_COUNT, this.handleDecrementBoidCounter, this);
            
            return new BoidsController(
                this.graphics!,
                this.bounds!,
                bc, relevantEventEmitter,
                this.engagementSlotManager);
        });
    }

    updateUIText(): void {

         const selectedController = this.boidsControllers?.[this.selectedBoidsControllerIndex];

        const controllerLabel = selectedController
            ? selectedController.config.id
            : 'none';

        const label: string = MouseMode[this.mouseMode];

        this.uiText!.setText(
            `Click action: ${label}\nSelected controller: ${controllerLabel}\nBoid Count: ${this.boidCount}`
        );

    }

    getAllEntities(): Entity[] {
        return [...this.boidsControllers.flatMap(controller => controller.boids), ...this.obstacleController.obstacles];
    }

    handleDecrementBoidCounter(): void {
        this.boidCount -= 1;
        this.updateUIText();
    }
    
}
