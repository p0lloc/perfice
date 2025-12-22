export interface NativeIntegrationUpdate {
  id: string;
  identifier: string;
  integrationId: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface NativeIntegration {
  id: string;
  integrationType: string;
  entityType: string;
  formId: string;
  fields: Record<string, string>;
  options: Record<string, any>;
}

export interface PerficePlugin {
  promptPermissions(): Promise<{ result: boolean }>;
  getUpdates(): Promise<{ updates: NativeIntegrationUpdate[] }>;
  syncIntegrations(integrations: { integrations: NativeIntegration[] }): Promise<void>;
  fetchHistorical(request: {id: string}): Promise<void>;
}
