"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDocumentIntelligenceApi = void 0;
class AzureDocumentIntelligenceApi {
    constructor() {
        this.name = 'azureDocumentIntelligenceApi';
        this.displayName = 'Azure Document Intelligence API';
        this.icon = {
            light: 'file:AzureDocumentIntelligenceApi.svg',
            dark: 'file:AzureDocumentIntelligenceApi.svg',
        };
        this.documentationUrl = 'https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/overview';
        this.properties = [
            {
                displayName: 'Endpoint',
                name: 'endpoint',
                type: 'string',
                default: '',
                placeholder: 'https://your-resource.cognitiveservices.azure.com',
                description: 'Your Azure Document Intelligence resource endpoint (without trailing slash)',
            },
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'API key from Azure portal (Keys and Endpoint section)',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'Ocp-Apim-Subscription-Key': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.endpoint}}/documentintelligence',
                url: '/info',
            },
        };
    }
}
exports.AzureDocumentIntelligenceApi = AzureDocumentIntelligenceApi;
//# sourceMappingURL=AzureDocumentIntelligenceApi.credentials.js.map