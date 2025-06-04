import type {GoalCollection} from "@perfice/db/collections";
import type {Goal} from "@perfice/model/goal/goal";
import type {SyncedTable} from "@perfice/services/sync/sync";

export class DexieGoalCollection implements GoalCollection {

    private table: SyncedTable<Goal>;

    constructor(table: SyncedTable<Goal>) {
        this.table = table;
    }

    getGoalByVariableId(goalVariableId: string): Promise<Goal | undefined> {
        return this.table.where("variableId").equals(goalVariableId).first();
    }

    async getGoalById(id: string): Promise<Goal | undefined> {
        return this.table.getById(id);
    }

    async getGoals(): Promise<Goal[]> {
        return this.table.getAll();
    }

    async createGoal(goal: Goal): Promise<void> {
        await this.table.put(goal);
    }

    async updateGoal(goal: Goal): Promise<void> {
        await this.table.put(goal);
    }

    async deleteGoalById(id: string): Promise<void> {
        await this.table.deleteById(id);
    }

}
