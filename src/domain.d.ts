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
        sample: string;
        placeholder: string;
    } | {
        id: string;
        label: string;
        type: string;
        sample: number;
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
        playbooks: string[];
        automations: string[];
        revenueModel: string;
        integrationTargets: string[];
    };
};
