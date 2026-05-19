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
};
