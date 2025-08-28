# n8n-nodes-paypal

This is an n8n community node. It lets you use PayPal in your n8n workflows.

PayPal is a leading digital payment platform that enables online money transfers, payments, and invoicing for businesses and individuals.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Get Transactions: Retrieve transaction details within a specified date range and/or transaction ID.
- Create Invoice: Generate a new invoice with custom details.
- Send Invoice: Send an existing invoice to recipients.
- Update Invoice: Modify an existing invoice using patch operations.
- Get Invoice: Fetch details of a specific invoice.
- List Invoices: Retrieve a list of invoices with optional filters like status or date range.

## Credentials

This node uses OAuth2 authentication with PayPal. To set it up:

1. Sign up for a PayPal developer account at [developer.paypal.com](https://developer.paypal.com) and create a REST API app to obtain your Client ID and Client Secret.
2. In n8n, create a new credential of type "PayPal API (Angell EYE)".
3. Enter your Client ID and Client Secret.
4. Select the Environment: Sandbox for testing or Production for live use.
5. Save the credential and connect it to the PayPal node in your workflow.

## Compatibility

Compatible with n8n version 1.0.0 and above. Tested against n8n 1.108.1. No known incompatibility issues.

## Usage

After installing the node, add it to your workflow by searching for "PayPal (Angell EYE)" in the nodes panel. Select an operation from the dropdown, configure parameters (e.g., dates for Get Transactions or JSON body for Create Invoice), and connect your credentials.

For example:
- To get transactions: Set Start Date and End Date (required, in YYYY-MM-DDTHH:MM:SSZ format), and optionally filter by Transaction ID or Fields.
- To create an invoice: Provide a JSON object in the Invoice parameter, following PayPal's invoice schema (e.g., { "detail": { "invoice_number": "INV001" }, ... }).

If you're new to n8n, refer to the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [PayPal Developer Documentation](https://developer.paypal.com/api/rest/)

## Version history

- 0.1.0: Initial release supporting transactions and invoicing operations (Get Transactions, Create/Send/Update/Get/List Invoices).
