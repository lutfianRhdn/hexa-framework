/**
 * @hexa-framework/adapter-midtrans
 * Midtrans payment adapter for Hexa Framework
 * by lutfian.rhdn
 */

import { IPaymentAdapter, PaymentRequest, PaymentResult, PaymentStatus } from '@hexa-framework/common';
// @ts-ignore
import midtransClient from 'midtrans-client';

export interface MidtransAdapterConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
}

export class MidtransAdapter implements IPaymentAdapter {
    readonly name = 'midtrans';
    private snap: any;
    private core: any;

    constructor(private config: MidtransAdapterConfig) {
        this.snap = new midtransClient.Snap({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey,
        });

        this.core = new midtransClient.CoreApi({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
            clientKey: config.clientKey,
        });
    }

    async createTransaction(request: PaymentRequest): Promise<PaymentResult> {
        const parameter = {
            transaction_details: {
                order_id: request.orderId,
                gross_amount: request.amount,
            },
            credit_card: {
                secure: true,
            },
            item_details: request.items?.map(item => ({
                id: item.id,
                price: item.price,
                quantity: item.quantity,
                name: item.name,
                brand: item.brand,
                category: item.category,
                merchant_name: 'Hexa Store'
            })),
            customer_details: request.customer ? {
                first_name: request.customer.firstName,
                last_name: request.customer.lastName,
                email: request.customer.email,
                phone: request.customer.phone,
                billing_address: request.customer.billingAddress ? this.mapAddress(request.customer.billingAddress) : undefined,
                shipping_address: request.customer.shippingAddress ? this.mapAddress(request.customer.shippingAddress) : undefined,
            } : undefined,
            callbacks: {
                finish: request.returnUrl || undefined,
            }
        };

        try {
            const transaction = await this.snap.createTransaction(parameter);

            return {
                transactionId: request.orderId, // Midtrans uses order_id as key
                status: 'pending',
                redirectUrl: transaction.redirect_url,
                token: transaction.token,
                raw: transaction,
            };
        } catch (error: any) {
            console.error('Midtrans Create Transaction Error:', error);
            throw new Error(`Midtrans Error: ${error.message}`);
        }
    }

    async checkStatus(transactionId: string): Promise<PaymentStatus> {
        try {
            const statusResponse = await this.snap.transaction.status(transactionId);
            return this.mapStatus(statusResponse.transaction_status);
        } catch (error: any) {
            // Fallback to core api if snap fails or for specific transaction types
            try {
                const statusResponse = await this.core.transaction.status(transactionId);
                return this.mapStatus(statusResponse.transaction_status);
            } catch (coreError: any) {
                throw new Error(`Midtrans Status Error: ${coreError.message}`);
            }
        }
    }

    async verifyNotification(payload: unknown): Promise<{
        orderId: string;
        transactionId: string;
        status: PaymentStatus;
        raw: unknown;
    }> {
        // Midtrans notification verification usually involves checking signature or just trusting post body if IP whitelisted
        // The SDK provides a helper to handle notification
        try {
            const statusResponse = await this.snap.transaction.notification(payload);
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            let status: PaymentStatus = this.mapStatus(transactionStatus);

            if (transactionStatus == 'capture') {
                if (fraudStatus == 'challenge') {
                    status = 'pending'; // Changed to 'challenge' if we had that status
                } else if (fraudStatus == 'accept') {
                    status = 'success';
                }
            } else if (transactionStatus == 'settlement') {
                status = 'success';
            } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
                status = 'failed';
            } else if (transactionStatus == 'pending') {
                status = 'pending';
            }

            return {
                orderId: orderId,
                transactionId: statusResponse.transaction_id,
                status: status,
                raw: statusResponse
            };
        } catch (error: any) {
            throw new Error(`Midtrans Notification Error: ${error.message}`);
        }
    }

    private mapStatus(midtransStatus: string): PaymentStatus {
        switch (midtransStatus) {
            case 'capture':
            case 'settlement':
                return 'success';
            case 'deny':
            case 'cancel':
            case 'expire':
            case 'failure':
                return 'failed';
            case 'pending':
                return 'pending';
            default:
                return 'pending';
        }
    }

    private mapAddress(addr: any) {
        return {
            first_name: addr.firstName,
            last_name: addr.lastName,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            postal_code: addr.postalCode,
            country_code: addr.countryCode || 'IDN'
        };
    }
}

export function createMidtransAdapter(config: MidtransAdapterConfig): MidtransAdapter {
    return new MidtransAdapter(config);
}
