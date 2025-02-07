export const routingNavigatorState: string[] = $state([]);
export function getCurrentRoute(routingNavigatorState: string[]){
    return routingNavigatorState.length > 0 ? routingNavigatorState[routingNavigatorState.length - 1] : "/";
}
