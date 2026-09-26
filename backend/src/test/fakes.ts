import type { RefundGateway, RefundRequestInput, RefundResult } from '../modules/payments/refund-gateway';

/**
 * Injected via the same constructor-DI pattern as BookingsRepository
 * (BookingsService(repository, refundGateway)) so refund idempotency/cap
 * tests never make a real network call to VNPAY sandbox — see M6 report
 * §6 for why the real VnpayRefundGateway is deliberately excluded from the
 * automated test suite (no live merchant credentials, and a live suite
 * must not depend on network reachability).
 */
export class FakeRefundGateway implements RefundGateway {
  public calls: RefundRequestInput[] = [];
  constructor(private readonly result: RefundResult = { success: true, message: 'OK (fake)' }) {}

  async requestRefund(input: RefundRequestInput): Promise<RefundResult> {
    this.calls.push(input);
    return this.result;
  }
}
