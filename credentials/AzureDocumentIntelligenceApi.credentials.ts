import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AzureDocumentIntelligenceApi implements ICredentialType {
	name = 'azureDocumentIntelligenceApi';

	displayName = 'Azure Document Intelligence API';

	icon = {
		light: 'file:AzureDocumentIntelligenceApi.svg',
		dark: 'file:AzureDocumentIntelligenceApi.svg',
	} as { light: `file:${string}.svg`; dark: `file:${string}.svg` };

	documentationUrl =
		'https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/overview';

	properties: INodeProperties[] = [
		{
			displayName: 'Endpoint',
			name: 'endpoint',
			type: 'string',
			default: '',
			placeholder: 'https://your-resource.cognitiveservices.azure.com',
			description:
				'Your Azure Document Intelligence resource endpoint (without trailing slash)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'API key from Azure portal (Keys and Endpoint section)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Ocp-Apim-Subscription-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.endpoint}}/documentintelligence',
			url: '/info',
		},
	};
}
