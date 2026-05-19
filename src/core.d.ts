export declare const STATUS_MULTIPLIER: Readonly<{
    'not-started': 0;
    blocked: 0;
    'in-progress': 0.45;
    ready: 0.8;
    approved: 1;
}>;
export declare function assertValidConfig(config: any): boolean;
export declare function createInitialState(config: any, now?: string): {
    version: number;
    slug: any;
    createdAt: string;
    updatedAt: string;
    project: {
        clientName: string;
        chapter: string;
        studentLead: string;
        targetUser: any;
        notes: string;
    };
    criteria: any;
    evidence: any[];
    actions: any;
    approvals: {
        studentReview: boolean;
        mentorReview: boolean;
        ownerApproval: boolean;
    };
};
export declare function calculateScore(config: any, state: any): {
    score: number;
    label: string;
    breakdown: any;
};
export declare function scoreLabel(score: any): "Launch-ready" | "Strong, needs polish" | "Promising, needs review" | "At risk" | "Not ready";
export declare function readinessWarnings(config: any, state: any): any[];
export declare function buildMarkdownReport(config: any, state: any): string;
export declare function exportJson(config: any, state: any): string;
export declare function applySampleData(config: any): {
    version: number;
    slug: any;
    createdAt: string;
    updatedAt: string;
    project: {
        clientName: string;
        chapter: string;
        studentLead: string;
        targetUser: any;
        notes: string;
    };
    criteria: any;
    evidence: any[];
    actions: any;
    approvals: {
        studentReview: boolean;
        mentorReview: boolean;
        ownerApproval: boolean;
    };
};
