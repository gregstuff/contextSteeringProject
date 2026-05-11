import {EngagementSlot} from "./model/EngagementSlot.ts";
import {DIRECTIONS} from "./constants/EngagementSlotDirection.ts";
import type {Boid} from "../../boids/Model/Boid.ts";

const DISTANCE_BUFFER: number = 30;

export class EngagementSlotManager {

        agentSlots: Record<string, EngagementSlot[]>;

        constructor() {
            this.agentSlots = {} as Record<string, EngagementSlot[]>;
        }

        tryGetSlot(self: Boid, target: Boid): EngagementSlot | undefined {
            let agentSlots: EngagementSlot[] = this.agentSlots[target.id];

            if(!agentSlots){
                agentSlots = this.initAgentSlots(target);
            }

            let selectedSlot: EngagementSlot | undefined = undefined;

            const sortedByDist: EngagementSlot[] = [...agentSlots].sort((a,b)=>
                a.computePosition().distanceSq(self.pos) > b.computePosition().distanceSq(self.pos) ? 1 : -1);

            for(let i: number = 0; i < sortedByDist.length; ++i) {
                // no agent has claimed this slot, happy path
                const relevantEngagementSlot: EngagementSlot = sortedByDist[i];
                if(!relevantEngagementSlot.claimedBy){
                    selectedSlot = sortedByDist[i];
                    this.claimSlot(self, selectedSlot);
                    break;
                }
                // this means another agent has it, we should only take it if
                else {
                    // need to determine if we can take the slot
                    const computedPos = relevantEngagementSlot.computePosition();
                    const selfDist = self.pos.distanceSq(computedPos);
                    // consider buffer to prevent flip-flopping
                    const otherDist: number
                        = relevantEngagementSlot.claimedBy.pos.distanceSq(computedPos) - DISTANCE_BUFFER;

                    if(otherDist < selfDist) continue; // not close enough to steal it

                    this.stealSlot(self, target, relevantEngagementSlot);
                    selectedSlot = relevantEngagementSlot;
                    break;
                }
            }
            return selectedSlot;
        }

        stealSlot(self: Boid, target: Boid, slot: EngagementSlot): void {
            slot.claimedBy = self;
            self.blackboard.engagementCache.reservedSlot = slot;
            target.blackboard.engagementCache.reservedSlot = undefined;
        }

        claimSlot(self: Boid, slot: EngagementSlot): void{
            slot.claimedBy = self;
            self.blackboard.engagementCache.reservedSlot = slot;
        }

        initAgentSlots(target: Boid): EngagementSlot[] {

            const targetSlots: EngagementSlot[] = [];

            for(let i: number = 0; i < DIRECTIONS.length; ++i){
                targetSlots.push(new EngagementSlot(target, DIRECTIONS[i]));
            }

            this.agentSlots[target.id] = targetSlots;

            return targetSlots;
        }

}