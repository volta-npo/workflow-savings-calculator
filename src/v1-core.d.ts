export declare const V1_STATUS: string[];
export declare const V1_MULTIPLIER: Readonly<{
    missing: 0;
    draft: 0.35;
    ready: 0.8;
    approved: 1;
    blocked: 0;
}>;
export declare function createV1State(v1: any, now?: string): {
    version: string;
    createdAt: string;
    updatedAt: string;
    rows: any;
    generatedNotes: string;
    scenario: any;
};
export declare function validateV1Definition(v1: any): boolean;
export declare function calculateV1Metrics(v1: any, state: any): {
    name: any;
    value: number;
    suffix: string;
    detail: string;
}[];
export declare function v1ValidationWarnings(v1: any, state: any): any[];
export declare function buildV1Packet(config: any, v1: any, state: any): string;
export declare function buildV1Csv(v1: any, state: any): string;
export declare function applyV1Sample(v1: any): {
    version: string;
    createdAt: string;
    updatedAt: string;
    rows: any;
    generatedNotes: string;
    scenario: any;
};
