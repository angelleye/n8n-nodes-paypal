import { IExecuteFunctions } from 'n8n-workflow';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class PayPal implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'PayPal (Angell EYE)',
        name: 'payPal',
        icon: 'file:paypal.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
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
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Create Invoice',
                        value: 'createInvoice',
                    },
                    {
                        name: 'Get Invoice',
                        value: 'getInvoice',
                    },
                    {
                        name: 'Get Transactions',
                        value: 'getTransactions',
                    },
                    {
                        name: 'List Invoices',
                        value: 'listInvoices',
                    },
                    {
                        name: 'Send Invoice',
                        value: 'sendInvoice',
                    },
                    {
                        name: 'Update Invoice',
                        value: 'updateInvoice',
                    },
                ],
                default: 'getTransactions',
            },
            {
                displayName: 'Return All',
                name: 'returnAll',
                type: 'boolean',
                default: false,
                description: 'Whether to return all results or only up to a given limit',
                displayOptions: {
                    show: {
                        operation: [
                            'getTransactions',
                            'listInvoices',
                        ],
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
                        operation: [
                            'getTransactions',
                            'listInvoices',
                        ],
                        returnAll: [
                            false,
                        ],
                    },
                },
            },
            {
                displayName: 'Page Size',
                name: 'pageSize',
                type: 'number',
                default: '',
                typeOptions: {
                    minValue: 1,
                },
                description: 'Number of results per page (default 100 for transactions, 20 for invoices)',
                displayOptions: {
                    show: {
                        operation: [
                            'getTransactions',
                            'listInvoices',
                        ],
                    },
                },
            },
            {
                displayName: 'Start Date',
                name: 'startDate',
                type: 'dateTime',
                required: true,
                default: '',
                description: 'Start date for transactions (YYYY-MM-DD)',
                displayOptions: {
                    show: {
                        operation: [
                            'getTransactions',
                        ],
                    },
                },
            },
            {
                displayName: 'End Date',
                name: 'endDate',
                type: 'dateTime',
							  required: true,
                default: '',
                description: 'End date for transactions (YYYY-MM-DD)',
                displayOptions: {
                    show: {
                        operation: [
                            'getTransactions',
                        ],
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
                        operation: [
                            'getTransactions',
                        ],
                    },
                },
            },
            {
                displayName: 'Fields',
                name: 'fields',
                type: 'multiOptions',
								options: [
									{
										name: 'Account Info',
										value: 'account_info',
									},
									{
										name: 'All',
										value: 'all',
									},
									{
										name: 'Auction Info',
										value: 'auction_info',
									},
									{
										name: 'Cart Info',
										value: 'cart_info',
									},
									{
										name: 'Incentive Info',
										value: 'incentive_info',
									},
									{
										name: 'Store Info',
										value: 'store_info',
									},
									{
										name: 'Transaction Info',
										value: 'transaction_info',
									},
								],
                default: [
                    'all',
                ],
                displayOptions: {
                    show: {
                        operation: [
                            'getTransactions',
                        ],
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
                        operation: [
                            'getInvoice',
                            'sendInvoice',
                            'updateInvoice',
                        ],
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
                        operation: [
                            'createInvoice',
                        ],
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
                        operation: [
                            'sendInvoice',
                        ],
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
                        operation: [
                            'updateInvoice',
                        ],
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
                        operation: [
                            'listInvoices',
                        ],
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
                        operation: [
                            'listInvoices',
                        ],
                    },
                },
            },
            {
                displayName: 'Status',
                name: 'status',
                type: 'multiOptions',
								options: [
									{
										name: 'Cancelled',
										value: 'CANCELLED',
									},
									{
										name: 'Draft',
										value: 'DRAFT',
									},
									{
										name: 'Marked As Paid',
										value: 'MARKED_AS_PAID',
									},
									{
										name: 'Marked As Refunded',
										value: 'MARKED_AS_REFUNDED',
									},
									{
										name: 'Paid',
										value: 'PAID',
									},
									{
										name: 'Partially Refunded',
										value: 'PARTIALLY_REFUNDED',
									},
									{
										name: 'Payment Pending',
										value: 'PAYMENT_PENDING',
									},
									{
										name: 'Refunded',
										value: 'REFUNDED',
									},
									{
										name: 'Scheduled',
										value: 'SCHEDULED',
									},
									{
										name: 'Sent',
										value: 'SENT',
									},
								],
                default: [],
                displayOptions: {
                    show: {
                        operation: [
                            'listInvoices',
                        ],
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
                        operation: [
                            'listInvoices',
                        ],
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
                        operation: [
                            'listInvoices',
                        ],
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
                        operation: [
                            'listInvoices',
                        ],
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const length = items.length;
        const operation = this.getNodeParameter('operation', 0) as string;

        const credentials = await this.getCredentials('payPalAngellEyeApi') as IDataObject;
        const environment = credentials.environment as string;
        const baseUrl = environment === 'sandbox' ? 'api.sandbox.paypal.com' : 'api.paypal.com';
        const apiUrl = `https://${baseUrl}`;

        const scope = operation === 'getTransactions' ? 'https://uri.paypal.com/services/reporting/search/read' : 'https://uri.paypal.com/services/invoicing';

        let accessToken;
        try {
					const tokenOptions: IHttpRequestOptions = {
                method: 'POST',
                url: `${apiUrl}/v1/oauth2/token`,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
									  'Partner-Attribution-Id': 'ANGELLFREEInc_SP',
                },
                auth: {
                    username: credentials.clientId as string,
                    password: credentials.clientSecret as string,
                },
                body: `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
            };
            const tokenResponse = await this.helpers.httpRequest(tokenOptions);
            accessToken = tokenResponse.access_token;
        } catch (error) {
            throw new NodeApiError(this.getNode(), error);
        }

        for (let itemIndex = 0; itemIndex < length; itemIndex++) {
            if (['getTransactions', 'listInvoices', 'getInvoice'].includes(operation) && itemIndex > 0) {
                continue; // Run list/get operations only once
            }
            try {
                if (operation === 'getTransactions') {
                    const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
                    let pageSize = this.getNodeParameter('pageSize', 0) as number || 100;
                    pageSize = Math.min(pageSize, 500);
                    const startDate = this.getNodeParameter('startDate', 0) as string;
                    const endDate = this.getNodeParameter('endDate', 0) as string;
                    const transactionId = this.getNodeParameter('transactionId', 0) as string;
                    const fields = this.getNodeParameter('fields', 0) as string[];
                    const page = returnAll ? 1 : this.getNodeParameter('page', 0) as number;

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
									do {

										/**
										 * TEMP DEBUG LOG
										 */
										console.log('PayPal Get Transactions Request:', { url: `${apiUrl}${url}`, headers: { Authorization: `Bearer ${accessToken}` } });

										const response = await requestWithRetry.call(this, {
                            method: 'GET',
                            url: `${apiUrl}${url}`,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });

										/**
										 * TEMP DEBUG LOG
										 */
										console.log('PayPal Get Transactions Response:', response);

										if (!firstResponse) firstResponse = response;

										results = results.concat(response.transaction_details || []);
                        const nextLink = response.links?.find((l: any) => l.rel === 'next');
                        url = nextLink ? nextLink.href : null;
                    } while (returnAll && url);

                    for (const detail of results) {
                        returnData.push({ json: detail });
                    }

										if (returnData.length === 0 && firstResponse) {
											returnData.push({ json: firstResponse });
										}
                } else if (operation === 'createInvoice') {
                    const invoiceJson = this.getNodeParameter('invoice', itemIndex) as string;
                    let body: IDataObject;
                    try {
                        body = JSON.parse(invoiceJson);
                    } catch {
                        throw new NodeOperationError(this.getNode(), 'Invalid JSON for invoice', { itemIndex });
                    }
                    const response = await requestWithRetry.call(this, {
                        method: 'POST',
                        url: `${apiUrl}/v2/invoicing/invoices`,
                        body,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    returnData.push({ json: response });
                } else if (operation === 'sendInvoice') {
                    const invoiceId = this.getNodeParameter('invoiceId', itemIndex) as string;
                    const additionalParamsJson = this.getNodeParameter('additionalParams', itemIndex) as string;
                    let body: IDataObject = {};
                    try {
                        body = JSON.parse(additionalParamsJson);
                    } catch {}
                    const response = await requestWithRetry.call(this, {
                        method: 'POST',
                        url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}/send`,
                        body,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    returnData.push({ json: response });
                } else if (operation === 'updateInvoice') {
                    const invoiceId = this.getNodeParameter('invoiceId', itemIndex) as string;
                    const patchesJson = this.getNodeParameter('patches', itemIndex) as string;
                    let body: any[];
                    try {
                        body = JSON.parse(patchesJson);
                    } catch {
                        throw new NodeOperationError(this.getNode(), 'Invalid JSON for patches', { itemIndex });
                    }
                    await requestWithRetry.call(this, {
                        method: 'PATCH',
                        url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}`,
                        body,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    returnData.push({ json: { success: true, invoice_id: invoiceId } });
                } else if (operation === 'getInvoice') {
                    const invoiceId = this.getNodeParameter('invoiceId', 0) as string;
                    const response = await requestWithRetry.call(this, {
                        method: 'GET',
                        url: `${apiUrl}/v2/invoicing/invoices/${invoiceId}`,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    returnData.push({ json: response });
                } else if (operation === 'listInvoices') {
                    const returnAll = this.getNodeParameter('returnAll', 0) as boolean;
                    let pageSize = this.getNodeParameter('pageSize', 0) as number || 20;
                    pageSize = Math.min(pageSize, 100);
                    const page = returnAll ? 1 : this.getNodeParameter('page', 0) as number;
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
                    do {
                        const response = await requestWithRetry.call(this, {
                            method: 'GET',
                            url: `${apiUrl}${url}`,
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                        results = results.concat(response.items || []);
                        const nextLink = response.links?.find((l: any) => l.rel === 'next');
                        url = nextLink ? nextLink.href : null;
                    } while (returnAll && url);

                    for (const item of results) {
                        returnData.push({ json: item });
                    }
                }
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

async function requestWithRetry(this: IExecuteFunctions, options: IHttpRequestOptions, retries = 3): Promise<any> {
    try {
        return await this.helpers.httpRequest(options);
    } catch (error) {
        if (error.response?.status === 429 && retries > 0) {
            const backoff = Math.pow(2, 4 - retries) * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoff));
            return requestWithRetry.call(this, options, retries - 1);
        }
        throw error;
    }
}
