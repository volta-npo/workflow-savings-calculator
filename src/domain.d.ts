export declare const domain: {
    kind: string;
    title: string;
    purpose: string;
    inputTitle: string;
    previewTitle: string;
    tableTitle: string;
    metricLabels: string[];
    fields: ({
        id: string;
        label: string;
        type: string;
        sample: number;
        placeholder: string;
    } | {
        id: string;
        label: string;
        type: string;
        sample: string;
        placeholder: string;
    })[];
    rows: string[];
    artifacts: string[];
    checks: string[];
    sampleClient: string;
    modules: {
        name: string;
        description: string;
    }[];
    saas: {
        customerSegments: string[];
        pricingTiers: string[];
        onboardingChecklist: string[];
        successMetrics: string[];
        dashboards: string[];
        dataModel: string[];
        permissions: string[];
        compliance: string[];
        lifecycle: string[];
        retentionSignals: string[];
        exportChannels: string[];
        playbooks: string[];
        automations: string[];
        revenueModel: string;
        integrationTargets: string[];
    };
};
