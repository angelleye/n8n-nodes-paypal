import { IExecuteFunctions } from 'n8n-workflow';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

const nodeProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Transaction',
				value: 'transaction',
			},
			{
				name: 'Invoice',
				value: 'invoice',
			},
		],
		default: 'transaction',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Retrieve transaction details within a date range',
				action: 'Get transactions',
			},
		],
		default: 'getTransactions',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createInvoice',
				description: 'Create a new invoice',
				action: 'Create invoice',
			},
			{
				name: 'Get',
				value: 'getInvoice',
				description: 'Retrieve a specific invoice',
				action: 'Get invoice',
			},
			{
				name: 'List',
				value: 'listInvoices',
				description: 'List invoices with optional filters',
				action: 'List invoices',
			},
			{
				name: 'Send',
				value: 'sendInvoice',
				description: 'Send an existing invoice to recipients',
				action: 'Send invoice',
			},
			{
				name: 'Update',
				value: 'updateInvoice',
				description: 'Update an existing invoice using patches',
				action: 'Update invoice',
			},
		],
		default: 'createInvoice',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Include Raw PayPal Data',
				name: 'includeRawData',
				type: 'boolean',
				default: false,
				description:
					'Whether to include raw_request and raw_response in the output data for debugging',
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['transaction', 'invoice'],
				operation: ['getTransactions', 'listInvoices'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['transaction', 'invoice'],
				operation: ['getTransactions', 'listInvoices'],
				returnAll: [false],
			},
		},
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		default: 100, // Transactions default 100; for invoices you can override to 20 in logic if needed
		typeOptions: {
			minValue: 1,
		},
		description: 'Number of results per page (default 100 for transactions, 20 for invoices)',
		displayOptions: {
			show: {
				resource: ['transaction', 'invoice'],
				operation: ['getTransactions', 'listInvoices'],
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Start date for transactions. Must be within the last 3 years.',
		placeholder: 'e.g. 2024-01-01T00:00:00.000Z',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'End date for transactions. Cannot be more than 31 days after start date.',
		placeholder: 'e.g. 2024-01-31T23:59:59.999Z',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'multiOptions',
		options: [
			{ name: 'Account Info', value: 'account_info' },
			{ name: 'All', value: 'all' },
			{ name: 'Auction Info', value: 'auction_info' },
			{ name: 'Cart Info', value: 'cart_info' },
			{ name: 'Incentive Info', value: 'incentive_info' },
			{ name: 'Store Info', value: 'store_info' },
			{ name: 'Transaction Info', value: 'transaction_info' },
		],
		default: ['all'],
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransactions'],
			},
		},
	},
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getInvoice', 'sendInvoice', 'updateInvoice'],
			},
		},
	},
	{
		displayName: 'Invoice',
		name: 'invoice',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The invoice object as JSON',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['createInvoice'],
			},
		},
	},
	{
		displayName: 'Additional Parameters',
		name: 'additionalParams',
		type: 'json',
		default: '{}',
		description: 'Additional send parameters as JSON (subject, note, etc.)',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['sendInvoice'],
			},
		},
	},
	{
		displayName: 'Patches',
		name: 'patches',
		type: 'json',
		default: '[]',
		required: true,
		description: 'Array of patch operations as JSON',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['updateInvoice'],
			},
		},
	},
	{
		displayName: 'Total Required',
		name: 'totalRequired',
		type: 'boolean',
		default: false,
		description: 'Whether to return total_items and total_pages',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fieldsInvoices',
		type: 'string',
		default: '',
		description: 'Comma-separated list of fields to return',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'multiOptions',
		options: [
			{ name: 'Cancelled', value: 'CANCELLED' },
			{ name: 'Draft', value: 'DRAFT' },
			{ name: 'Marked As Paid', value: 'MARKED_AS_PAID' },
			{ name: 'Marked As Refunded', value: 'MARKED_AS_REFUNDED' },
			{ name: 'Paid', value: 'PAID' },
			{ name: 'Partially Refunded', value: 'PARTIALLY_REFUNDED' },
			{ name: 'Payment Pending', value: 'PAYMENT_PENDING' },
			{ name: 'Refunded', value: 'REFUNDED' },
			{ name: 'Scheduled', value: 'SCHEDULED' },
			{ name: 'Sent', value: 'SENT' },
		],
		default: [],
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
	{
		displayName: 'Recipient Email',
		name: 'recipientEmail',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
	{
		displayName: 'Start Invoice Date',
		name: 'startInvoiceDate',
		type: 'dateTime',
		default: '',
		description: 'Start invoice date (YYYY-MM-DD)',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
	{
		displayName: 'End Invoice Date',
		name: 'endInvoiceDate',
		type: 'dateTime',
		default: '',
		description: 'End invoice date (YYYY-MM-DD)',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
	},
];

export class PayPal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PayPal (Angell EYE)',
		name: 'payPal',
		icon: 'file:paypal.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with PayPal API',
		defaults: {
			name: 'PayPal',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'payPalAngellEyeApi',
				required: true,
			},
		],
		properties: nodeProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		const operation = this.getNodeParameter('operation', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;

		const credentials = (await this.getCredentials('payPalAngellEyeApi')) as IDataObject;
		const environment = credentials.environment as string;
		const baseUrl = environment === 'sandbox' ? 'api.sandbox.paypal.com' : 'api.paypal.com';
		const apiUrl = `https://${baseUrl}`;

		const scope =
			resource === 'transaction'
				? 'https://uri.paypal.com/services/reporting/search/read'
				: 'https://uri.paypal.com/services/invoicing';

		const accessToken = await getAccessToken.call(this, credentials, scope);

		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				let operationData: INodeExecutionData[] = [];
				if (operation === 'getTransactions') {
					if (itemIndex > 0) continue; // Run only once
					operationData = await getTransactions.call(this, accessToken, apiUrl);
				} else if (operation === 'createInvoice') {
					operationData = await createInvoice.call(this, itemIndex, accessToken, apiUrl);
				} else if (operation === 'sendInvoice') {
					operationData = await sendInvoice.call(this, itemIndex, accessToken, apiUrl);
				} else if (operation === 'updateInvoice') {
					operationData = await updateInvoice.call(this, itemIndex, accessToken, apiUrl);
				} else if (operation === 'getInvoice') {
					if (itemIndex > 0) continue; // Run only once
					operationData = await getInvoice.call(this, accessToken, apiUrl);
				} else if (operation === 'listInvoices') {
					if (itemIndex > 0) continue; // Run only once
					operationData = await listInvoices.call(this, accessToken, apiUrl);
				}
				returnData.push(...operationData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: itemIndex } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error, { itemIndex });
			}
		}

		return [returnData];
	}
}

async function getTransactions(
	this: IExecuteFunctions,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
	let pageSize = (this.getNodeParameter('pageSize', 0) as number) || 100;
	pageSize = Math.min(pageSize, 500);
	const startDate = this.getNodeParameter('startDate', 0) as string;
	const endDate = this.getNodeParameter('endDate', 0) as string;
	const transactionId = this.getNodeParameter('transactionId', 0) as string;
	const fields = this.getNodeParameter('fields', 0) as string[];
	const page = returnAll ? 1 : (this.getNodeParameter('page', 0) as number);

	const qs: IDataObject = {
		start_date: startDate.endsWith('Z') ? startDate : `${startDate}Z`,
		fields: fields.join(','),
		page_size: pageSize.toString(),
	};
	if (endDate) qs.end_date = endDate.endsWith('Z') ? endDate : `${endDate}Z`;
	if (transactionId) qs.transaction_id = transactionId;
	if (!returnAll) qs.page = page.toString();

	let url = `/v1/reporting/transactions?${new URLSearchParams(qs as any).toString()}`;
	let results: any[] = [];

	let firstResponse: any;
	let firstRequest: any;
	const options = this.getNodeParameter('options', 0) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	do {
		const { response, request } = await requestWithRetry.call(this, {
			method: 'GET',
			url: `${apiUrl}${url}`,
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!firstResponse) {
			firstResponse = response;
			firstRequest = request;
		}

		results = results.concat(response.transaction_details || []);
		const nextLink = response.links?.find((l: any) => l.rel === 'next');
		url = nextLink ? nextLink.href : null;
	} while (returnAll && url);

	const returnData: INodeExecutionData[] = [];
	for (const detail of results) {
		const responseData: any = { ...detail };
		if (includeRawData) {
			responseData.raw_request = firstRequest;
			responseData.raw_response = firstResponse;
		}
		returnData.push({ json: responseData });
	}

	if (returnData.length === 0 && firstResponse) {
		const responseData: any = { ...firstResponse };
		if (includeRawData) {
			responseData.raw_request = firstRequest;
			responseData.raw_response = firstResponse;
		}
		returnData.push({ json: responseData });
	}

	return returnData;
}

async function createInvoice(
	this: IExecuteFunctions,
	itemIndex: number,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const invoiceJson = this.getNodeParameter('invoice', itemIndex) as string;
	let body: IDataObject;
	try {
		body = JSON.parse(invoiceJson);
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid JSON for invoice', { itemIndex });
	}
	const { response, request } = await requestWithRetry.call(this, {
		method: 'POST',
		url: `${apiUrl}/v2/invoicing/invoices`,
		body,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const options = this.getNodeParameter('options', itemIndex) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	const responseData: any = { ...response };
	if (includeRawData) {
		responseData.raw_request = request;
		responseData.raw_response = response;
	}

	return [{ json: responseData }];
}

async function sendInvoice(
	this: IExecuteFunctions,
	itemIndex: number,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const invoiceId = this.getNodeParameter('invoiceId', itemIndex) as string;
	const additionalParamsJson = this.getNodeParameter('additionalParams', itemIndex) as string;
	let body: IDataObject = {};
	try {
		body = JSON.parse(additionalParamsJson);
	} catch {
		// Empty body if JSON parsing fails
	}
	const { response, request } = await requestWithRetry.call(this, {
		method: 'POST',
		url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}/send`,
		body,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const options = this.getNodeParameter('options', itemIndex) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	const responseData: any = { ...response };
	if (includeRawData) {
		responseData.raw_request = request;
		responseData.raw_response = response;
	}

	return [{ json: responseData }];
}

async function updateInvoice(
	this: IExecuteFunctions,
	itemIndex: number,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const invoiceId = this.getNodeParameter('invoiceId', itemIndex) as string;
	const patchesJson = this.getNodeParameter('patches', itemIndex) as string;
	let body: any[];
	try {
		body = JSON.parse(patchesJson);
	} catch {
		throw new NodeOperationError(this.getNode(), 'Invalid JSON for patches', { itemIndex });
	}
	const { response, request } = await requestWithRetry.call(this, {
		method: 'PATCH',
		url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}`,
		body,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const options = this.getNodeParameter('options', itemIndex) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	const responseData: any = {
		success: true,
		invoice_id: invoiceId,
	};

	if (includeRawData) {
		responseData.raw_request = request;
		responseData.raw_response = response;
	}

	return [{ json: responseData }];
}

async function getInvoice(
	this: IExecuteFunctions,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const invoiceId = this.getNodeParameter('invoiceId', 0) as string;
	const { response, request } = await requestWithRetry.call(this, {
		method: 'GET',
		url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}`,
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	const options = this.getNodeParameter('options', 0) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	const responseData: any = { ...response };
	if (includeRawData) {
		responseData.raw_request = request;
		responseData.raw_response = response;
	}

	return [{ json: responseData }];
}

async function listInvoices(
	this: IExecuteFunctions,
	accessToken: string,
	apiUrl: string,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
	let pageSize = (this.getNodeParameter('pageSize', 0) as number) || 20;
	pageSize = Math.min(pageSize, 100);
	const page = returnAll ? 1 : (this.getNodeParameter('page', 0) as number);
	const totalRequired = this.getNodeParameter('totalRequired', 0) as boolean;
	const fieldsInvoices = this.getNodeParameter('fieldsInvoices', 0) as string;
	const status = this.getNodeParameter('status', 0) as string[];
	const recipientEmail = this.getNodeParameter('recipientEmail', 0) as string;
	const startInvoiceDate = this.getNodeParameter('startInvoiceDate', 0) as string;
	const endInvoiceDate = this.getNodeParameter('endInvoiceDate', 0) as string;

	const qs: IDataObject = {
		page_size: pageSize.toString(),
		total_required: totalRequired.toString(),
	};
	if (fieldsInvoices) qs.fields = fieldsInvoices;
	if (status.length) qs.status = status.join(',');
	if (recipientEmail) qs.recipient_email = recipientEmail;
	if (startInvoiceDate) qs.start_invoice_date = startInvoiceDate.split('T')[0];
	if (endInvoiceDate) qs.end_invoice_date = endInvoiceDate.split('T')[0];
	if (!returnAll) qs.page = page.toString();

	let url = `/v2/invoicing/invoices?${new URLSearchParams(qs as any).toString()}`;
	let results: any[] = [];

	let firstResponse: any;
	let firstRequest: any;
	do {
		const { response, request } = await requestWithRetry.call(this, {
			method: 'GET',
			url: `${apiUrl}${url}`,
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!firstResponse) {
			firstResponse = response;
			firstRequest = request;
		}

		results = results.concat(response.items || []);
		const nextLink = response.links?.find((l: any) => l.rel === 'next');
		url = nextLink ? nextLink.href : null;
	} while (returnAll && url);

	const options = this.getNodeParameter('options', 0) as IDataObject;
	const includeRawData = options.includeRawData as boolean;

	const returnData: INodeExecutionData[] = [];
	for (const item of results) {
		const responseData: any = { ...item };
		if (includeRawData) {
			responseData.raw_request = firstRequest;
			responseData.raw_response = firstResponse;
		}
		returnData.push({ json: responseData });
	}

	return returnData;
}

async function getAccessToken(
	this: IExecuteFunctions,
	credentials: IDataObject,
	scope: string,
): Promise<string> {
	const environment = credentials.environment as string;
	const baseUrl = environment === 'sandbox' ? 'api.sandbox.paypal.com' : 'api.paypal.com';
	const apiUrl = `https://${baseUrl}`;

	try {
		const tokenOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${apiUrl}/v1/oauth2/token`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				'Partner-Attribution-Id': 'ANGELLFREEInc_SP_n8n',
			},
			auth: {
				username: credentials.clientId as string,
				password: credentials.clientSecret as string,
			},
			body: `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
		};
		const tokenResponse = await this.helpers.httpRequest(tokenOptions);
		return tokenResponse.access_token;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

async function requestWithRetry(
	this: IExecuteFunctions,
	options: IHttpRequestOptions,
	retries = 3,
): Promise<{ response: any; request: any }> {
	const requestInfo = {
		method: options.method,
		url: options.url,
		headers: { ...options.headers },
		body: options.body,
	};

	// Remove sensitive auth header from logged request
	if (requestInfo.headers.Authorization) {
		requestInfo.headers.Authorization = '[REDACTED]';
	}

	try {
		const response = await this.helpers.httpRequest(options);
		return {
			response,
			request: requestInfo,
		};
	} catch (error) {
		if (error.response?.status === 429 && retries > 0) {
			const backoff = Math.pow(2, 4 - retries) * 1000;
			await new Promise((resolve) => setTimeout(resolve, backoff));
			return requestWithRetry.call(this, options, retries - 1);
		}
		throw error;
	}
}
