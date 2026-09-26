import { describe, it, expect } from 'vitest';
import { buildPaymentUrl, verifyVnpaySignature, signVnpayParams, toVnpayDate, generateTxnRef, generateRefundRef, encodeGatewayRef, decodeGatewayRef } from './vnpay';
import { env } from '../../config/env';

describe('buildPaymentUrl', () => {
  it('produces a URL on VNPAY_PAYMENT_URL carrying vnp_Amount = amount * 100 and a vnp_SecureHash', () => {
    const url = buildPaymentUrl({ txnRef: 'TESTREF1', amount: 250_000, orderInfo: 'Test order', ipAddr: '127.0.0.1' });
    expect(url.startsWith(env.VNPAY_PAYMENT_URL)).toBe(true);
    expect(url).toContain('vnp_Amount=25000000');
    expect(url).toContain('vnp_TxnRef=TESTREF1');
    expect(url).toMatch(/vnp_SecureHash=[0-9a-f]{128}/);
  });
});

describe('verifyVnpaySignature', () => {
  it('accepts a signature computed the same way it was built (round-trip)', () => {
    const params = { vnp_TxnRef: 'ABC123', vnp_ResponseCode: '00', vnp_Amount: '100000' };
    const hash = signVnpayParams(params, env.VNPAY_HASH_SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: hash })).toBe(true);
  });

  it('rejects a tampered field (amount changed after signing)', () => {
    const params = { vnp_TxnRef: 'ABC123', vnp_ResponseCode: '00', vnp_Amount: '100000' };
    const hash = signVnpayParams(params, env.VNPAY_HASH_SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_Amount: '999999', vnp_SecureHash: hash })).toBe(false);
  });

  it('rejects a missing/empty vnp_SecureHash', () => {
    expect(verifyVnpaySignature({ vnp_TxnRef: 'ABC123' })).toBe(false);
  });

  it('ignores vnp_SecureHashType when recomputing (excluded from the signed payload, same as VNPAY)', () => {
    const params = { vnp_TxnRef: 'ABC123' };
    const hash = signVnpayParams(params, env.VNPAY_HASH_SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHashType: 'HmacSHA512', vnp_SecureHash: hash })).toBe(true);
  });
});

describe('toVnpayDate', () => {
  it('formats as 14-digit yyyyMMddHHmmss', () => {
    expect(toVnpayDate(new Date('2026-01-15T10:00:00.000Z'))).toMatch(/^\d{14}$/);
  });
});

describe('generateTxnRef / generateRefundRef', () => {
  it('are prefixed, unique-per-call, and fit VARCHAR(100)/VARCHAR(20)-ish limits', () => {
    const a = generateTxnRef();
    const b = generateTxnRef();
    expect(a).toMatch(/^PAY/);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThan(30);

    const r = generateRefundRef();
    expect(r).toMatch(/^RF/);
    expect(r.length).toBeLessThan(30);
  });
});

describe('encodeGatewayRef / decodeGatewayRef', () => {
  it('round-trips txnRef + transactionNo + payDate', () => {
    const packed = encodeGatewayRef('PAYXYZ', '14123456', '20260115100000');
    const decoded = decodeGatewayRef(packed);
    expect(decoded).toEqual({ txnRef: 'PAYXYZ', transactionNo: '14123456', payDate: '20260115100000' });
  });

  it('with only a txnRef (payment not yet confirmed), decodes with null transactionNo/payDate', () => {
    const decoded = decodeGatewayRef(encodeGatewayRef('PAYXYZ'));
    expect(decoded).toEqual({ txnRef: 'PAYXYZ', transactionNo: null, payDate: null });
  });
});
