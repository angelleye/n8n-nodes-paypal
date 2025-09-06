import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PayPalAngellEyeApi implements ICredentialType {
	name = 'payPalAngellEyeApi';
	displayName = 'PayPal (Angell EYE) API';
	documentationUrl = 'https://developer.paypal.com/api/rest/';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
				{
					name: 'Production',
					value: 'production',
				},
			],
			default: 'sandbox',
		},
	];
}
