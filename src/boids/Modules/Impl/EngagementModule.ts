import type {BoidModule} from "../BoidModule.ts";
import type {Boid} from "../../Model/Boid.ts";
import type {EngagementSlotManager} from "../../../engagement/slotManagement/EngagementSlotManager.ts";

export class EngagementModule implements BoidModule {

    engagementSlotManager: EngagementSlotManager;

    constructor(engagementSlotManager: EngagementSlotManager) {
        this.engagementSlotManager = engagementSlotManager;
    }

    onCache(boid: Boid): void {

    }

    onTick(boid: Boid): void {

    }

}
