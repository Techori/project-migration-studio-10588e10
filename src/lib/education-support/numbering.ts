import { indianStates } from './catalog';

export const stateCodes = indianStates.map((name, index) => ({ name, code: String(index + 1).padStart(2, '0') }));
export function formatAcknowledgement(dateYYMMDD: string, stateCode: string, districtCode: string, serial: number) {
  if (!/^\d{6}$/.test(dateYYMMDD) || !/^(0[1-9]|[12]\d|3[0-6])$/.test(stateCode) || !/^(0[1-9]|[1-9]\d)$/.test(districtCode) || !Number.isInteger(serial) || serial < 1 || serial > 99999) throw new Error('Invalid acknowledgement values');
  return dateYYMMDD + stateCode + districtCode + String(serial).padStart(5, '0');
}
export function canApprove(paymentStatus: string) { return paymentStatus === 'paid'; }