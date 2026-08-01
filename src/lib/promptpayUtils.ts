/**
 * Utility to generate Thai PromptPay EMVCo QR Payload string
 */

// CRC16 Calculation for EMVCo QR Code
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    let x2 = x ^ (x >> 4);
    crc = ((crc << 8) ^ (x2 << 12) ^ (x2 << 5) ^ x2) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitizePromptPayId(target: string): { type: 'mobile' | 'natid'; id: string } {
  const clean = target.replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('0')) {
    // Thai Mobile Phone: 0812345678 -> 0066812345678
    return { type: 'mobile', id: '0066' + clean.slice(1) };
  } else if (clean.length === 13) {
    // Thai National ID / Tax ID
    return { type: 'natid', id: clean };
  }
  // Default format fallback
  if (clean.length === 10) {
    return { type: 'mobile', id: '0066' + clean.slice(1) };
  }
  return { type: 'natid', id: clean };
}

function formatLength(val: string): string {
  return val.length.toString().padStart(2, '0');
}

/**
 * Generates EMVCo PromptPay QR Code string
 * @param target PromptPay ID (Phone 10 digits or Tax/Citizen ID 13 digits)
 * @param amount Optional amount in THB (number)
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  if (!target) return '';

  const { type, id } = sanitizePromptPayId(target);
  if (!id) return '';

  // Merchant Account Info
  // Aid: A000000677010111
  const aid = 'A000000677010111';
  let targetTag = '';
  if (type === 'mobile') {
    targetTag = `01${formatLength(id)}${id}`;
  } else {
    targetTag = `02${formatLength(id)}${id}`;
  }

  const merchantAccountInfoStr = `0016${aid}${targetTag}`;
  const tag29 = `29${formatLength(merchantAccountInfoStr)}${merchantAccountInfoStr}`;

  // Currency Code: 764 (THB)
  const tag53 = '5303764';

  // Country Code: TH
  const tag58 = '5802TH';

  // Amount
  let tag54 = '';
  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    tag54 = `54${formatLength(formattedAmount)}${formattedAmount}`;
  }

  // Point of Initiation Method: 11 (Static) or 12 (Dynamic with amount)
  const tag01 = amount && amount > 0 ? '010212' : '010211';

  // Raw payload before CRC
  const rawPayload = `000201${tag01}${tag29}${tag53}${tag54}${tag58}6304`;
  const checksum = crc16(rawPayload);

  return `${rawPayload}${checksum}`;
}
