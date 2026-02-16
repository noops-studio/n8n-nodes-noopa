import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class AzureDocumentIntelligenceApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: {
        light: `file:${string}.svg`;
        dark: `file:${string}.svg`;
    };
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
