/**
 * VNPAY Sandbox integration helpers (M6). Pure functions only — no I/O, no
 * DB — so signature building/verification can be unit-tested without a
 * network call or a real merchant account (see vnpay.test.ts).
 *
 * Signing algorithm mirrors VNPAY's own reference implementation exactly
 * (sort params by key, URL-encode each value with `%20` normalized to `+`,
 * join as `k=v&k=v...`, HMAC-SHA512 with the merchant hash secret) — this is
 * not a guess, it is the documented VNPAY checksum format, so a real
 * merchant account can be dropped in by only changing env vars.
 */
import { createHmac } from 'node:crypto';
import { randomBytes } from 'node:crypto';
import { env } from '../../config/env';

export type VnpayParams = Record<string, string | number>;

/** Sorts keys and %20→+ normalizes values exactly like VNPAY's sample `sortObject`. */
const encodeValue = (value: string | number): string =>
  encodeURIComponent(String(value)).replace(/%20/g, '+');

const buildSignData = (params: VnpayParams): string => {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${encodeURIComponent(k)}=${encodeValue(params[k])}`).join('&');
};

export const signVnpayParams = (params: VnpayParams, hashSecret: string): string => {
  const signData = buildSignData(params);
  return createHmac('sha512', hashSecret).update(Buffer.from(signData, 'utf-8')).digest('hex');
};

/** yyyyMMddHHmmss in Vietnam local time (UTC+7), as VNPAY requires. */
export const toVnpayDate = (date: Date): string => {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${vn.getUTCFullYear()}${pad(vn.getUTCMonth() + 1)}${pad(vn.getUTCDate())}${pad(vn.getUTCHours())}${pad(vn.getUTCMinutes())}${pad(vn.getUTCSeconds())}`;
};

export const generateTxnRef = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `PAY${stamp}${rand}`; // well under THANH_TOAN.MaGiaoDichDoiTac VARCHAR(100)
};

export const generateRefundRef = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `RF${stamp}${rand}`; // well under HOAN_TIEN.MaGiaoDichDoiTac VARCHAR(100)
};

export interface BuildPaymentUrlInput {
  txnRef: string;
  /** VND, already the final charge amount — caller must have derived this from DAT_PHONG, never from the client. */
  amount: number;
  orderInfo: string;
  ipAddr: string;
  createDate?: Date;
}

/** Builds the full VNPAY-hosted payment page URL, including vnp_SecureHash. */
export const buildPaymentUrl = (input: BuildPaymentUrlInput): string => {
  const params: VnpayParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.VNPAY_TMN_CODE,
    vnp_Amount: Math.round(input.amount * 100), // VNPAY amount is VND × 100
    vnp_CurrCode: 'VND',
    vnp_TxnRef: input.txnRef,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: env.VNPAY_RETURN_URL,
    vnp_IpAddr: input.ipAddr,
    vnp_CreateDate: toVnpayDate(input.createDate ?? new Date()),
  };
  const secureHash = signVnpayParams(params, env.VNPAY_HASH_SECRET);
  const query = Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeValue(params[k])}`)
    .concat(`vnp_SecureHash=${secureHash}`)
    .join('&');
  return `${env.VNPAY_PAYMENT_URL}?${query}`;
};

/**
 * Verifies vnp_SecureHash against every other vnp_ param in the callback
 * (return URL redirect or IPN), recomputed with our own hash secret. Both
 * callback endpoints must call this before trusting anything else in the
 * query — an unsigned/tampered callback must never move money or state.
 */
export const verifyVnpaySignature = (query: Record<string, unknown>): boolean => {
  const receivedHash = String(query.vnp_SecureHash ?? '');
  if (!receivedHash) return false;

  const params: VnpayParams = {};
  for (const [key, value] of Object.entries(query)) {
    if (key === 'vnp_SecureHash' || key === 'vnp_SecureHashType') continue;
    if (value === undefined) continue;
    params[key] = Array.isArray(value) ? String(value[0]) : String(value);
  }
  const expectedHash = signVnpayParams(params, env.VNPAY_HASH_SECRET);
  return expectedHash.toLowerCase() === receivedHash.toLowerCase();
};

/** VNPAY IPN response codes (fixed vocabulary defined by VNPAY, not ours). */
export const VNPAY_IPN_CODE = {
  SUCCESS: '00',
  ORDER_NOT_FOUND: '01',
  ORDER_ALREADY_CONFIRMED: '02',
  INVALID_AMOUNT: '04',
  INVALID_SIGNATURE: '97',
  UNKNOWN_ERROR: '99',
} as const;

/**
 * THANH_TOAN.MaGiaoDichDoiTac (VARCHAR(100)) doubles as storage for both our
 * own vnp_TxnRef (set when the payment is created) and, once VNPAY confirms
 * it, their vnp_TransactionNo + vnp_PayDate too — packed as
 * `txnRef:transactionNo:payDate` — so a later refund call has everything
 * VNPAY's refund API needs without a schema change (no spare column for it).
 */
export const encodeGatewayRef = (txnRef: string, transactionNo?: string, payDate?: string): string =>
  transactionNo ? `${txnRef}:${transactionNo}:${payDate ?? ''}` : txnRef;

export const decodeGatewayRef = (raw: string): { txnRef: string; transactionNo: string | null; payDate: string | null } => {
  const [txnRef, transactionNo, payDate] = raw.split(':');
  return { txnRef, transactionNo: transactionNo || null, payDate: payDate || null };
};
