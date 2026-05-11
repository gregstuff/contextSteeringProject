import {Boid} from "../../boids/Model/Boid.ts";
import type {Faction} from "../../constants/Faction.ts";

type ActiveBoid = {
    boid: Boid;
    isActive: boolean;
};

export class Engagement {
    id: string;
    participantsByFaction: Partial<Record<Faction, ActiveBoid[]>>;
    participantSet: Set<string>;
    isStale: boolean;

    constructor(initiator: Boid, target: Boid) {
        this.participantsByFaction = {} as Record<Faction, ActiveBoid[]>;
        this.participantSet = new Set<string>();
        this.isStale = false;
        this.id = crypto.randomUUID();

        this.addAgent(initiator);
        this.addAgent(target, false); // add target as inactive, we don't know what their target is
    }

    // 1vMany allowed, 2v2 and up not allowed
    tryJoin(engagementCandidate: Boid): boolean {

        // if already in this engagement, ensure active
        if(this.participantSet.has(engagementCandidate.id)){
            const particpants: ActiveBoid[] | undefined = this.participantsByFaction[engagementCandidate.faction];

            if(!particpants) throw new Error("[Engagement][tryJoin] Factions participants in invalid state, faction");

            const self: ActiveBoid | undefined =
                particpants.find((p: ActiveBoid)=>p.boid.id === engagementCandidate.id);

            if(!self) throw new Error("[Engagement][tryJoin] Factions participants in invalid state, self");

            self.isActive = true;

            return true;
        }

        const relevantFactions: Faction[] = Object.keys(this.participantsByFaction) as Faction[];

        const noFactionsYet = relevantFactions.length === 0;
        const oneOrZeroFactions = relevantFactions.length <= 1;
        const twoFactionsAndExists = relevantFactions.length === 2 && !!this.participantsByFaction[engagementCandidate.faction];
        const oneSideOnlyHasOneAgent = relevantFactions
            .map(rf=>this.participantsByFaction[rf]?.length)
            .some(numAgents=>numAgents == 1);


        // at least one faction should only have one agent
        const canJoin: boolean = (oneSideOnlyHasOneAgent || noFactionsYet)  && (oneOrZeroFactions || twoFactionsAndExists);

        if(!canJoin) return false;

        this.addAgent(engagementCandidate);

        return true;
    }

    addAgent(agent: Boid, isActive: boolean = true): void {
        if(!this.participantsByFaction[agent.faction])
            this.participantsByFaction[agent.faction] = [];

        const activeCandidate: ActiveBoid = {
            boid: agent,
            isActive
        }

        this.participantsByFaction[agent.faction]?.push(activeCandidate);
        this.participantSet.add(agent.id);

        this.checkForStale();
    }

    removeAgent(toRemove: Boid): void {
        const selfID: string = toRemove.id;
        const relevantArr: ActiveBoid[] | undefined = this.participantsByFaction[toRemove.faction];

        if(!this.participantSet.has(selfID)) return;

        this.participantSet.delete(selfID);

        // should not happen
        if(!relevantArr || relevantArr.length == 0) return;

        const relevantIndex: number = relevantArr.findIndex(agent=>agent.boid.id === selfID);

        if(relevantIndex === -1) return;

        if(relevantArr.length == 1){
            // only one, just get rid of arr
            this.participantsByFaction[toRemove.faction] = undefined;
            return;
        }

        // need to build arr again without agent
        const resolvedArr =
            [...relevantArr.slice(0, relevantIndex), ...relevantArr.slice(relevantIndex+1, relevantArr.length)];

        this.participantsByFaction[toRemove.faction] = resolvedArr;

        this.checkForStale();
    }

    setAgentActivity(agent: Boid, isActive: boolean = true): void {
        if(!this.participantSet.has(agent.id)) return;

        const factionAgents: ActiveBoid[] | undefined = this.participantsByFaction[agent.faction];

        // shouldn't happen
        if(!factionAgents) throw new Error("Participant set not in sync with particpants by faction");

        const relevantFactionAgent = factionAgents.find(fa=>fa.boid.id === agent.id)

        if(!relevantFactionAgent) return;

        relevantFactionAgent.isActive = isActive;

        this.checkForStale();
    }

    checkForStale(): void {
        const keys = Object.keys(this.participantsByFaction) as Faction[];

        for(let i: number = 0; i < keys.length; ++i){

            const relevantParticipants: ActiveBoid[] | undefined = this.participantsByFaction[keys[i]];

            if(!relevantParticipants || relevantParticipants.length == 0) continue;

            const hasActive: boolean = relevantParticipants.some(rp=>rp.isActive);

            if(hasActive) return; // if there's at least one active, it's not stale
        }

        this.isStale = true;
    }

}