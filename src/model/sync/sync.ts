export enum UpdateOperation {
    CREATE = 'create',
    PUT = 'put',
    DELETE = 'delete',
    FULL_SYNC = 'fullSync'
}

export interface OutgoingUpdateEntity {
    id: string;
    version: number;
    data: any | null;
}

export interface OutgoingUpdate {
    id: string;
    operation: UpdateOperation;
    entityType: string;
    entityId: string | null;
    timestamp: number;
    entities: OutgoingUpdateEntity[];
}

export type OutgoingUpdateEntityDTO = OutgoingUpdateEntity & {
    data: string | null;
}

export type OutgoingUpdateDTO = OutgoingUpdate & {
    entities: OutgoingUpdateEntityDTO[];
}

export interface IncomingUpdateEntity {
    id: string;
    version: number;
    data: string | null;
}

export interface PreprocessedEntity {
    id: string;
    entityType: string;
    operation: UpdateOperation;
    migrated: boolean;
    data: any | null;
    previous?: any;
}

export interface IncomingUpdate {
    id: string;
    operation: UpdateOperation;
    entityType: string;
    timestamp: number;
    entities: IncomingUpdateEntity[];
}

export interface EncryptionKey {
    id: string;
    key: CryptoKey;
}
