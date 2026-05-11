import {Engagement} from "../boids/Modules/Domain/Engagement.ts";
import {Boid} from "../boids/Model/Boid.ts";
import {TurnCalculator} from "./domain/TurnCalculator.ts";
import {EngagementSlotManager} from "./slotManagement/EngagementSlotManager.ts";

export class EngagementController {

    engagements: Engagement[];
    agentEngagements: Record<string, Engagement[]>;
    turnCalculator: TurnCalculator;

    constructor() {
        this.engagements = [];
        this.agentEngagements = {} as Record<string, Engagement[]>;
        this.turnCalculator = new TurnCalculator();
    }

    joinEngagementForTarget(self: Boid, target: Boid): void {
        // are we already in an engagement? We prefer to leave if targeting an enemy not in our engagement
        const selfID: string = self.id;
        const targetID: string = target.id;

        const selfEngagements: Engagement[] = this.agentEngagements[selfID];
        const targetEngagements: Engagement[] = this.agentEngagements[targetID];

        if(!!selfEngagements && selfEngagements.length > 0) {

            const engagementWithTarget: Engagement | undefined
                = selfEngagements.find(e=> e.participantSet.has(targetID));

            // already in an engagement with this target, just ensure that we are active there
            // and pending elsewhere
            if(engagementWithTarget){
                this.setActiveInEngagement(self, engagementWithTarget);
                return;
            }
        }

        // is the target in an engagement we can join?
        if(!!targetEngagements && targetEngagements.length > 0) {

            for(let i: number = 0; i < targetEngagements.length; ++i) {
                const canJoin = targetEngagements[i].tryJoin(self);
                if(canJoin){
                    this.joinEngagement(self, targetEngagements[i]);
                    return;
                }
            }

        }

        // we are neither in an engagement with the target
        // nor are we able to join one of the target's engagements
        // therefore, create new engagement

        this.createEngagement(self, target);
    }

    joinEngagement(agent: Boid, engagement: Engagement): void {
        if(engagement.participantSet.has(agent.id)) return;
        if(!this.agentEngagements[agent.id]) this.agentEngagements[agent.id] = [];

        this.agentEngagements[agent.id].push(engagement);
    }

    createEngagement(self: Boid, target: Boid): void {
        const engagement: Engagement = new Engagement(self, target);
        this.engagements.push(engagement);

        this.joinEngagement(self, engagement);
        this.joinEngagement(target, engagement);
    }

    setActiveInEngagement(self: Boid, engagement: Engagement): void {
        const relevantEngagements: Engagement[] = this.agentEngagements[self.id];

        if(!relevantEngagements || !engagement.participantSet.has(self.id)) return;

        for(let i = 0; i < relevantEngagements.length; ++i){
            relevantEngagements[i].setAgentActivity(self, false);
        }

        engagement.setAgentActivity(self, true);
    }

    tick(): void {
        for(let i = 0; i < this.engagements.length; ++i){
            const engagement: Engagement = this.engagements[i];

            if(engagement.isStale) this.removeEngagement(engagement);

            this.turnCalculator.handleTurnForEngagement(this.engagements[i]);
        }
    }

    removeEngagement(engagement: Engagement): void {
        const relevantIndex: number =
            this.engagements.findIndex(e=>e.id === engagement.id);

        if(relevantIndex === -1) throw new Error("");

        this.engagements =
            [...this.engagements.slice(0,relevantIndex),
                ...this.engagements.slice(relevantIndex+1,this.engagements.length)];
    }

}