import type {VariableService} from "@perfice/services/variable/variable";
import type {VariableTypeDef} from "@perfice/model/variable/variable";

export async function updateDependencies(
    variableService: VariableService,
    dependencies: Record<string, string>,
    previousDependencies: Record<string, string>, variableUpdates: Map<string, VariableTypeDef>) {

    for (let [dependencyId, updatedType] of variableUpdates.entries()) {
        const variableId = dependencies[dependencyId];
        if (variableId == undefined) {
            // Update returned a new variable, so we need to create it

            let newId = crypto.randomUUID();
            await variableService.createVariable({
                id: newId,
                name: "",
                type: updatedType,
            })

            dependencies[dependencyId] = newId;
            continue;
        }

        // Remove any dependencies that are still returned by the definition
        delete previousDependencies[dependencyId];

        const variable = variableService.getVariableById(variableId);
        if (variable == undefined) continue;

        variable.type = updatedType;
        await variableService.updateVariable(variable);
    }

    // Dependency is no longer returned by the definition, so we need to delete them
    for (let [_, variableId] of Object.entries(previousDependencies)) {
        await variableService.deleteVariableById(variableId);
    }
}