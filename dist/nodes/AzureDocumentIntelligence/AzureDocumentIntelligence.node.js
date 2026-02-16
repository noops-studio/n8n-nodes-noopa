"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDocumentIntelligence = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ai_document_intelligence_1 = __importStar(require("@azure-rest/ai-document-intelligence"));
const core_auth_1 = require("@azure/core-auth");
const FEATURE_OPTIONS = [
    { name: 'Key-Value Pairs', value: 'keyValuePairs' },
    { name: 'Style/Font', value: 'styleFont' },
    { name: 'Barcodes', value: 'barcodes' },
    { name: 'Formulas', value: 'formulas' },
    { name: 'Languages', value: 'languages' },
    { name: 'Query Fields', value: 'queryFields' },
    { name: 'OCR High Resolution', value: 'ocrHighResolution' },
];
class AzureDocumentIntelligence {
    constructor() {
        this.description = {
            displayName: 'Azure Document Intelligence',
            name: 'azureDocumentIntelligence',
            icon: { light: 'file:azureDocumentIntelligence.svg', dark: 'file:azureDocumentIntelligence.dark.svg' },
            group: ['transform'],
            version: 1,
            description: 'Analyze documents with Azure Document Intelligence',
            defaults: {
                name: 'Azure Document Intelligence',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
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
                    description: 'Model to use (e.g. prebuilt-layout, prebuilt-invoice, prebuilt-read, or custom model ID)',
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
                    description: 'Whether the model ID refers to a document model or a classifier',
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
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('azureDocumentIntelligenceApi');
        const endpoint = credentials.endpoint.replace(/\/$/, '');
        const client = (0, ai_document_intelligence_1.default)(endpoint, new core_auth_1.AzureKeyCredential(credentials.apiKey));
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const inputSource = this.getNodeParameter('inputSource', itemIndex, 'binary');
                const modelId = this.getNodeParameter('modelId', itemIndex);
                const modelType = this.getNodeParameter('modelType', itemIndex, 'documentModel');
                const outputMode = this.getNodeParameter('outputMode', itemIndex, 'raw');
                const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {});
                const pages = additionalOptions.pages || undefined;
                const locale = additionalOptions.locale || undefined;
                const features = additionalOptions.features || [];
                const queryFieldsStr = additionalOptions.queryFields || '';
                const queryFields = queryFieldsStr
                    ? queryFieldsStr.split(',').map((s) => s.trim())
                    : undefined;
                const outputContentFormat = additionalOptions.outputContentFormat ||
                    'text';
                const pollingInterval = additionalOptions.pollingInterval || 1000;
                const splitDocuments = modelType === 'classifier' &&
                    additionalOptions.splitDocuments;
                let body;
                if (inputSource === 'url') {
                    const documentUrl = this.getNodeParameter('documentUrl', itemIndex);
                    body = { urlSource: documentUrl };
                }
                else {
                    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data');
                    this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
                    const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
                    body = { base64Source: buffer.toString('base64') };
                }
                const queryParameters = {};
                if (pages)
                    queryParameters.pages = pages;
                if (locale)
                    queryParameters.locale = locale;
                if (features.length)
                    queryParameters.features = features;
                if (queryFields === null || queryFields === void 0 ? void 0 : queryFields.length)
                    queryParameters.queryFields = queryFields;
                if (outputContentFormat)
                    queryParameters.outputContentFormat = outputContentFormat;
                if (modelType === 'classifier' && splitDocuments) {
                    queryParameters.split = 'auto';
                }
                let initialResponse;
                if (modelType === 'classifier') {
                    initialResponse = await client
                        .path('/documentClassifiers/{classifierId}:analyze', modelId)
                        .post({
                        contentType: 'application/json',
                        body,
                        queryParameters,
                    });
                }
                else {
                    initialResponse = await client
                        .path('/documentModels/{modelId}:analyze', modelId)
                        .post({
                        contentType: 'application/json',
                        body,
                        queryParameters,
                    });
                }
                if ((0, ai_document_intelligence_1.isUnexpected)(initialResponse)) {
                    const errorBody = initialResponse.body;
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), ((_a = errorBody.error) === null || _a === void 0 ? void 0 : _a.message) || 'Analyze request failed', { itemIndex });
                }
                const poller = (0, ai_document_intelligence_1.getLongRunningPoller)(client, initialResponse, { intervalInMs: pollingInterval });
                const result = (await poller.pollUntilDone()).body;
                const analyzeResult = result.analyzeResult;
                if (!analyzeResult) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No analysis result returned', { itemIndex });
                }
                const documents = analyzeResult.documents || [];
                if (outputMode === 'raw') {
                    returnData.push({
                        json: result,
                        pairedItem: { item: itemIndex },
                    });
                }
                else if (outputMode === 'oneItemPerDocument' && documents.length > 1) {
                    for (const doc of documents) {
                        const simplified = {
                            content: analyzeResult.content,
                            keyValuePairs: doc.fields,
                            tables: analyzeResult.tables,
                            document: doc,
                        };
                        returnData.push({
                            json: simplified,
                            pairedItem: { item: itemIndex },
                        });
                    }
                }
                else {
                    const firstDoc = documents[0];
                    const simplified = {
                        content: analyzeResult.content,
                        keyValuePairs: firstDoc === null || firstDoc === void 0 ? void 0 : firstDoc.fields,
                        tables: analyzeResult.tables,
                    };
                    if (documents.length === 1) {
                        simplified.document = firstDoc;
                    }
                    returnData.push({
                        json: simplified,
                        pairedItem: { item: itemIndex },
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: itemIndex },
                    });
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex,
                    });
                }
            }
        }
        return [returnData];
    }
}
exports.AzureDocumentIntelligence = AzureDocumentIntelligence;
//# sourceMappingURL=AzureDocumentIntelligence.node.js.map