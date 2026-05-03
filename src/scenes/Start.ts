import { Bounds } from '../model/Bounds.js';
import { drawX } from '../util/GraphicsUtils.js';
import { BoidsController } from '../boids/BoidsController.js';
import { BoidsConfig } from '../boids/BoidsConfig.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import Phaser from "phaser";
import {MouseMode} from "../constants/MouseMode.ts";

const BOUNDS_BUFFER = 1.2;

export class Start extends Phaser.Scene {

    targetPos: Phaser.Math.Vector2 | undefined;
    mouseMode: MouseMode;
    selectedBoidsControllerIndex: number;
    graphics: Phaser.GameObjects.Graphics | undefined;
    eventEmitters: Record<string, Phaser.Events.EventEmitter>;
    boidsControllers: BoidsController[];
    bounds: Bounds | undefined;
    uiText: Phaser.GameObjects.Text | undefined;

    constructor() {
        super('Start');
        this.targetPos = undefined;
        this.selectedBoidsControllerIndex = 0;
        this.mouseMode = MouseMode.TARGET;
        this.eventEmitters = {};
        this.boidsControllers = [];
    }

    preload() {

    }

    create() {
        this.graphics = this.add.graphics();
        this.setupInputs();
        this.bounds = new Bounds(this.scale.width, this.scale.height, BOUNDS_BUFFER);
        this.initBoidsControllers();

        this.uiText = this.add.text(10, 10, '', {
            fontSize: '20px',
            color: '#ffffff'
        });

        this.updateUIText();
    }

    update() {
        this.graphics!.clear();
        this.drawTarget();
        const secondsSinceStart = this.time.now / 1000;

        const allBoids = this.getAllBoids();

        for(let i = 0; i < this.boidsControllers.length; ++i) {
            this.boidsControllers[i].tick(allBoids, secondsSinceStart);
        }
    }

    drawTarget() {
        if(!this.targetPos) return;

        const { x, y } = this.targetPos;

        drawX(this.graphics!, x,y);
    }

    setupInputs() {

        this.input.keyboard?.on('keydown-Z', () => {
                this.toggleMouseMode();
        });

        this.input.keyboard?.on('keydown-X', () => {
            this.cycleSelectedBoidsController();
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const clickPos = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);

            if (this.mouseMode === MouseMode.TARGET) {
                this.targetPos = clickPos;

                Object.values(this.eventEmitters)
                    .forEach(e => e.emit('targetChanged', clickPos));

                return;
            }
                if (this.mouseMode === MouseMode.SPAWN) {
                const selectedController = this.boidsControllers[this.selectedBoidsControllerIndex];
                selectedController.config.eventEmitter.emit('spawn', clickPos);
                return;
            }
        });
    }

    toggleMouseMode(): void {
        this.mouseMode =
            this.mouseMode === MouseMode.TARGET
                ? MouseMode.SPAWN
                : MouseMode.TARGET;
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
            const { initialCount, steeringBehaviourConfigs, maximumForce, maximumSpeed, id, size, faction } = bc;
            const relevantEventEmitter = new Phaser.Events.EventEmitter();
            this.eventEmitters[id] = relevantEventEmitter;
            const config = new BoidsConfig(
                id, 
                initialCount, 
                size, 
                faction,
                maximumSpeed, 
                maximumForce,
                steeringBehaviourConfigs,
                relevantEventEmitter);
            
            return new BoidsController(this.graphics!, this.bounds!, config);
        });
    }

    updateUIText() {

         const selectedController = this.boidsControllers?.[this.selectedBoidsControllerIndex];

        const controllerLabel = selectedController
            ? selectedController.config.id
            : 'none';

        const modeLabel = this.mouseMode === MouseMode.TARGET
            ? 'Target'
            : 'Spawn';

        this.uiText!.setText(
            `Click action: ${modeLabel}\nSelected controller: ${controllerLabel}`
        );

    }

    getAllBoids() {
        return this.boidsControllers.flatMap(controller => controller.boids);
    }
    
}
