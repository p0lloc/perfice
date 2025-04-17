import type {Variable} from "@perfice/model/variable/variable";
import type {VariableService} from "@perfice/services/variable/variable";

export async function updateDependencies(
    variableService: VariableService,
    dependencies: Record<string, string>,
    previousDependencies: Record<string, string>,
    variableUpdates: Map<string, Variable>) {

    for (let [dependencyId, newVariable] of variableUpdates.entries()) {
        const variableId = previousDependencies[dependencyId];
        if (variableId == undefined) {
            // Update returned a new variable, so we need to create it
            await variableService.createVariable(newVariable);
            dependencies[dependencyId] = newVariable.id;
            continue;
        }

        // Remove any dependencies that are still returned by the definition
        delete previousDependencies[dependencyId];

        const variable = variableService.getVariableById(variableId);
        if (variable == undefined) {
            continue;
        }

        // We ignore if the id of the variable changed
        variable.type = newVariable.type;
        await variableService.updateVariable(variable);
    }

    // Dependency is no longer returned by the definition, so we need to delete them
    for (let [dependencyId, variableId] of Object.entries(previousDependencies)) {
        await variableService.deleteVariableById(variableId);
        delete dependencies[dependencyId];
    }
}