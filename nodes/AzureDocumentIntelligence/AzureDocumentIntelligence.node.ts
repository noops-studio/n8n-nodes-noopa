import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import DocumentIntelligence, {
	getLongRunningPoller,
	isUnexpected,
	type AnalyzeOperationOutput,
} from '@azure-rest/ai-document-intelligence';
import { AzureKeyCredential } from '@azure/core-auth';

const FEATURE_OPTIONS = [
	{ name: 'Key-Value Pairs', value: 'keyValuePairs' },
	{ name: 'Style/Font', value: 'styleFont' },
	{ name: 'Barcodes', value: 'barcodes' },
	{ name: 'Formulas', value: 'formulas' },
	{ name: 'Languages', value: 'languages' },
	{ name: 'Query Fields', value: 'queryFields' },
	{ name: 'OCR High Resolution', value: 'ocrHighResolution' },
] as const;

export class AzureDocumentIntelligence implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Azure Document Intelligence',
		name: 'azureDocumentIntelligence',
		icon: { light: 'file:azureDocumentIntelligence.svg', dark: 'file:azureDocumentIntelligence.dark.svg' },
		group: ['transform'],
		version: 1,
		description: 'Analyze documents with Azure Document Intelligence',
		defaults: {
			name: 'Azure Document Intelligence',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'azureDocumentIntelligenceApi' }],
		properties: [
			{
				displayName: 'Input Source',
				name: 'inputSource',
				type: 'options',
				options: [
					{ name: 'Binary Data', value: 'binary' },
					{ name: 'Document URL', value: 'url' },
				],
				default: 'binary',
				description: 'Source of the document to analyze',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: { show: { inputSource: ['binary'] } },
				description: 'Name of the binary property containing the document',
			},
			{
				displayName: 'Document URL',
				name: 'documentUrl',
				type: 'string',
				default: '',
				displayOptions: { show: { inputSource: ['url'] } },
				description: 'URL of the document to analyze (must be publicly accessible)',
			},
			{
				displayName: 'Model ID',
				name: 'modelId',
				type: 'string',
				default: 'prebuilt-layout',
				description:
					'Model to use (e.g. prebuilt-layout, prebuilt-invoice, prebuilt-read, or custom model ID)',
			},
			{
				displayName: 'Model Type',
				name: 'modelType',
				type: 'options',
				options: [
					{ name: 'Document Model', value: 'documentModel' },
					{ name: 'Classifier', value: 'classifier' },
				],
				default: 'documentModel',
				description:
					'Whether the model ID refers to a document model or a classifier',
			},
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				options: [
					{ name: 'Raw (Full JSON)', value: 'raw' },
					{ name: 'Simplified', value: 'simplified' },
					{ name: 'One Item Per Document', value: 'oneItemPerDocument' },
				],
				default: 'raw',
				description: 'Format of the output',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Features',
						name: 'features',
						type: 'multiOptions',
						options: [...FEATURE_OPTIONS],
						default: [],
						description: 'Analysis features to enable',
					},
					{
						displayName: 'Locale',
						name: 'locale',
						type: 'string',
						default: '',
						placeholder: 'e.g. en or en-US',
						description: 'Locale hint for text recognition',
					},
					{
						displayName: 'Output Content Format',
						name: 'outputContentFormat',
						type: 'options',
						options: [
							{ name: 'Markdown', value: 'markdown' },
							{ name: 'Text', value: 'text' },
						],
						default: 'text',
						description: 'Format of the content in the result',
					},
					{
						displayName: 'Pages',
						name: 'pages',
						type: 'string',
						default: '',
						placeholder: 'e.g. 1-3,5,7',
						description: '1-based page numbers to analyze',
					},
					{
						displayName: 'Polling Interval (Ms)',
						name: 'pollingInterval',
						type: 'number',
						default: 1000,
						description: 'Interval between poll attempts in milliseconds',
					},
					{
						displayName: 'Query Fields',
						name: 'queryFields',
						type: 'string',
						default: '',
						placeholder: 'e.g. Field1,Field2',
						description: 'Comma-separated field labels for custom extraction (requires queryFields feature)',
					},
					{
						displayName: 'Split Documents',
						name: 'splitDocuments',
						type: 'boolean',
						default: false,
						displayOptions: {
							show: {
								'/modelType': ['classifier'],
							},
						},
						description: 'Whether to split multi-document files into separate documents',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('azureDocumentIntelligenceApi');
		const endpoint = (credentials.endpoint as string).replace(/\/$/, '');
		const client = DocumentIntelligence(
			endpoint,
			new AzureKeyCredential(credentials.apiKey as string),
		);

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const inputSource = this.getNodeParameter(
					'inputSource',
					itemIndex,
					'binary',
				) as string;
				const modelId = this.getNodeParameter('modelId', itemIndex) as string;
				const modelType = this.getNodeParameter(
					'modelType',
					itemIndex,
					'documentModel',
				) as string;
				const outputMode = this.getNodeParameter(
					'outputMode',
					itemIndex,
					'raw',
				) as string;
				const additionalOptions = this.getNodeParameter(
					'additionalOptions',
					itemIndex,
					{},
				) as Record<string, unknown>;

				const pages = (additionalOptions.pages as string) || undefined;
				const locale = (additionalOptions.locale as string) || undefined;
				const features = (additionalOptions.features as string[]) || [];
				const queryFieldsStr = (additionalOptions.queryFields as string) || '';
				const queryFields = queryFieldsStr
					? queryFieldsStr.split(',').map((s) => s.trim())
					: undefined;
				const outputContentFormat =
					(additionalOptions.outputContentFormat as 'text' | 'markdown') ||
					'text';
				const pollingInterval = (additionalOptions.pollingInterval as number) || 1000;
				const splitDocuments =
					modelType === 'classifier' &&
					(additionalOptions.splitDocuments as boolean);

				let body: { urlSource?: string; base64Source?: string };
				if (inputSource === 'url') {
					const documentUrl = this.getNodeParameter(
						'documentUrl',
						itemIndex,
					) as string;
					body = { urlSource: documentUrl };
				} else {
					const binaryPropertyName = this.getNodeParameter(
						'binaryPropertyName',
						itemIndex,
						'data',
					) as string;
					this.helpers.assertBinaryData(
						itemIndex,
						binaryPropertyName,
					);
					const buffer = await this.helpers.getBinaryDataBuffer(
						itemIndex,
						binaryPropertyName,
					);
					body = { base64Source: buffer.toString('base64') };
				}

				const queryParameters: Record<string, unknown> = {};
				if (pages) queryParameters.pages = pages;
				if (locale) queryParameters.locale = locale;
				if (features.length) queryParameters.features = features;
				if (queryFields?.length) queryParameters.queryFields = queryFields;
				if (outputContentFormat)
					queryParameters.outputContentFormat = outputContentFormat;
				if (modelType === 'classifier' && splitDocuments) {
					queryParameters.split = 'auto';
				}

				let initialResponse;
				if (modelType === 'classifier') {
					initialResponse = await client
						.path(
							'/documentClassifiers/{classifierId}:analyze',
							modelId,
						)
						.post({
							contentType: 'application/json',
							body,
							queryParameters,
						});
				} else {
					initialResponse = await client
						.path('/documentModels/{modelId}:analyze', modelId)
						.post({
							contentType: 'application/json',
							body,
							queryParameters,
						});
				}

				if (isUnexpected(initialResponse)) {
					const errorBody = initialResponse.body as { error?: { message?: string } };
					throw new NodeOperationError(
						this.getNode(),
						errorBody.error?.message || 'Analyze request failed',
						{ itemIndex },
					);
				}

				const poller = getLongRunningPoller(
					client,
					initialResponse as Parameters<typeof getLongRunningPoller>[1],
					{ intervalInMs: pollingInterval },
				);
				const result = (await poller.pollUntilDone()).body as AnalyzeOperationOutput;

				const analyzeResult = result.analyzeResult;
				if (!analyzeResult) {
					throw new NodeOperationError(
						this.getNode(),
						'No analysis result returned',
						{ itemIndex },
					);
				}

				const documents = analyzeResult.documents || [];

				if (outputMode === 'raw') {
					returnData.push({
						json: result as unknown as IDataObject,
						pairedItem: { item: itemIndex },
					});
				} else if (outputMode === 'oneItemPerDocument' && documents.length > 1) {
					for (const doc of documents) {
						const simplified: IDataObject = {
							content: analyzeResult.content,
							keyValuePairs: doc.fields as unknown as IDataObject,
							tables: analyzeResult.tables as unknown as IDataObject[],
							document: doc as unknown as IDataObject,
						};
						returnData.push({
							json: simplified,
							pairedItem: { item: itemIndex },
						});
					}
				} else {
					const firstDoc = documents[0];
					const simplified: IDataObject = {
						content: analyzeResult.content,
						keyValuePairs: firstDoc?.fields as unknown as IDataObject | undefined,
						tables: analyzeResult.tables as unknown as IDataObject[] | undefined,
					};
					if (documents.length === 1) {
						simplified.document = firstDoc as unknown as IDataObject;
					}
					returnData.push({
						json: simplified,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
