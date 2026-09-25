/**
 * VNPAY Sandbox Integration Module - Interface definition for Phase 2 (Payment Phase)
 * Note: Payment implementation is planned for later phase as per TECH-0 specification.
 */

export interface CreatePaymentUrlParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
}

export interface VerifyPaymentReturnParams {
  [key: string]: string | number | undefined;
}

export interface PaymentVerifyResult {
  isSuccess: boolean;
  orderId: string;
  transactionNo: string;
  responseCode: string;
  message: string;
}

export class VNPayIntegration {
  static createPaymentUrl(_params: CreatePaymentUrlParams): string {
    throw new Error('VNPAY payment processing is planned for later phase (Phase 2).');
  }

  static verifyReturnUrl(_params: VerifyPaymentReturnParams): PaymentVerifyResult {
    throw new Error('VNPAY return verification is planned for later phase (Phase 2).');
  }
}
