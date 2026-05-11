import type {BoidModule} from "../BoidModule.ts";
import type {Boid, BoidWithDistance} from "../../Model/Boid.ts";
import type {EngagementSlotManager} from "../../../engagement/slotManagement/EngagementSlotManager.ts";
import type {EngagementSlot} from "../../../engagement/slotManagement/model/EngagementSlot.ts";

export class EngagementModule implements BoidModule {

    engagementSlotManager: EngagementSlotManager;

    constructor(engagementSlotManager: EngagementSlotManager) {
        this.engagementSlotManager = engagementSlotManager;
    }

    onCache(boid: Boid): void {

        const relevantEnemies: BoidWithDistance[] = [...boid.closeDistanceEnemies, ...boid.mediumDistanceEnemies];

        // from close to medium distance, try to get the closest enemies...
        for(let i: number = 0; i < relevantEnemies.length; ++i){
            const engagementSlot: EngagementSlot | undefined =
                this.engagementSlotManager.tryGetSlot(boid, relevantEnemies[i].boid);

            if(engagementSlot) break;
        }

    }

    onTick(boid: Boid): void {



    }

}
