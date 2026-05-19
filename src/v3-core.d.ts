export declare const V3_STATUSES: string[];
export declare const V3_MULTIPLIER: Readonly<{
    missing: 0;
    draft: 0.35;
    verified: 0.85;
    certified: 1;
    blocked: 0;
}>;
export declare function stableStringify(value: any): any;
export declare function integrityHash(value: any): string;
export declare function validateV3Definition(v3: any): boolean;
export declare function createV3State(v3: any, now?: string): {
    version: string;
    createdAt: string;
    updatedAt: string;
    releaseName: string;
    checklist: any;
    incidents: any[];
    changelog: {
        version: string;
        date: string;
        notes: string;
    }[];
    decisions: any[];
};
export declare function calculateV3Certification(v3: any, state: any): {
    certification: number;
    status: string;
    certified: any;
    verified: any;
    blocked: any;
    criticalOpen: any;
    evidenceScore: number;
    total: any;
    hash: string;
};
export declare function v3Warnings(v3: any, state: any): any[];
export declare function certifyAllV3(v3: any, state: any): any;
export declare function exportV3Bundle(config: any, v3: any, state: any): {
    exportedAt: string;
    product: {
        slug: any;
        title: any;
        version: string;
    };
    certification: {
        certification: number;
        status: string;
        certified: any;
        verified: any;
        blocked: any;
        criticalOpen: any;
        evidenceScore: number;
        total: any;
        hash: string;
    };
    v3: any;
    state: any;
    warnings: any[];
};
export declare function importV3Bundle(config: any, v3: any, bundle: any): any;
export declare function buildV3Markdown(config: any, v3: any, state: any): string;
export declare function buildV3Csv(v3: any, state: any): string;
export declare function runV3SelfAudit(config: any, v3: any, state: any): {
    definition: boolean;
    certification: {
        certification: number;
        status: string;
        certified: any;
        verified: any;
        blocked: any;
        criticalOpen: any;
        evidenceScore: number;
        total: any;
        hash: string;
    };
    warnings: any[];
    markdownBytes: number;
    csvRows: number;
    bundleHash: string;
};
