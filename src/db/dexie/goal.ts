import type {EntityTable} from "dexie";
import type {GoalCollection} from "@perfice/db/collections";
import type {Goal} from "@perfice/model/goal/goal";

export class DexieGoalCollection implements GoalCollection {

    private table: EntityTable<Goal, "id">;

    constructor(table: EntityTable<Goal, "id">) {
        this.table = table;
    }

    getGoalByVariableId(goalVariableId: string): Promise<Goal | undefined> {
        return this.table.where("variableId").equals(goalVariableId).first();
    }

    async getGoalById(id: string): Promise<Goal | undefined> {
        return this.table.get(id);
    }

    async getGoals(): Promise<Goal[]> {
        return this.table.toArray();
    }

    async createGoal(goal: Goal): Promise<void> {
        await this.table.add(goal);
    }

    async updateGoal(goal: Goal): Promise<void> {
        await this.table.put(goal);
    }

    async deleteGoalById(id: string): Promise<void> {
        await this.table.delete(id);
    }

}
