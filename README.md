#  n8n-nodes-noopa

This is an n8n community node package. It provides nodes for Azure Document Intelligence and other integrations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Nodes

### Azure Document Intelligence

Analyze documents using Azure Document Intelligence (formerly Form Recognizer). Extract text, layout, tables, key-value pairs, and structured data from PDFs, images, and Office documents.

**Operations:**
- Analyze documents from binary data or URL
- Support for prebuilt models (layout, invoice, read) and custom models
- Document classification with optional document splitting
- Output modes: raw JSON, simplified (content, key-value pairs, tables), or one item per document

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

### Azure Document Intelligence API

The Azure Document Intelligence node requires:

1. **Endpoint**: Your Azure Document Intelligence resource URL (e.g. `https://your-resource.cognitiveservices.azure.com`)
2. **API Key**: Ocp-Apim-Subscription-Key from the Azure portal (Keys and Endpoint section)

**Prerequisites:**
- An [Azure subscription](https://azure.microsoft.com/free/)
- A [Document Intelligence](https://portal.azure.com/#create/Microsoft.CognitiveServicesFormRecognizer) resource

## Compatibility

- Minimum n8n version: 1.0
- Tested with n8n 1.x

**Note:** This package uses `@azure-rest/ai-document-intelligence` and is not verified for n8n Cloud. For self-hosted n8n, it works out of the box.

## Usage

1. Add the Azure Document Intelligence node to your workflow
2. Create or select Azure Document Intelligence credentials
3. Choose document input: binary data (from a previous node) or document URL
4. Select the model (e.g. `prebuilt-layout`, `prebuilt-invoice`, `prebuilt-read`)
5. Configure optional settings: pages, locale, features, query fields, output format
6. Run the workflow

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Azure Document Intelligence documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
