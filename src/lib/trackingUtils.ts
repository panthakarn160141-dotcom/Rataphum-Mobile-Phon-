import { RepairJob } from '../types';

/**
 * Encodes a RepairJob into a compact Base64 payload string for URL sync across devices
 */
export function encodeJobToUrlPayload(job: RepairJob): string {
  try {
    // Only encode essential non-empty fields to keep the URL payload ultra compact
    const compactJob: Record<string, any> = {
      id: job.id,
      cn: job.customerName,
      db: job.deviceBrand,
      dm: job.deviceModel,
      st: job.status,
      rp: job.repairPrice,
      dp: job.deposit,
    };

    if (job.createdAt) compactJob.ca = job.createdAt;
    if (job.customerPhone) compactJob.cp = job.customerPhone;
    if (job.symptoms) compactJob.sy = job.symptoms;
    if (job.replacedParts) compactJob.pt = job.replacedParts;
    if (job.isClaim) compactJob.ic = 1;
    if (job.claimReason) compactJob.cr = job.claimReason;
    if (job.isDealerJob) compactJob.dj = 1;
    if (job.dealerShopName) compactJob.dn = job.dealerShopName;
    if (job.repairNotes) compactJob.rn = job.repairNotes;

    const jsonStr = JSON.stringify(compactJob);
    // Base64 UTF-8 encoding
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    return encodeURIComponent(b64);
  } catch (e) {
    console.error('Error encoding job to URL payload', e);
    return '';
  }
}

/**
 * Decodes a Base64 URL payload string into a RepairJob object
 */
export function decodeJobFromUrlPayload(payloadStr: string): RepairJob | null {
  try {
    if (!payloadStr) return null;
    const decodedB64 = decodeURIComponent(payloadStr);
    const jsonStr = decodeURIComponent(escape(atob(decodedB64)));
    const c = JSON.parse(jsonStr);
    if (!c || !c.id) return null;

    return {
      id: String(c.id),
      createdAt: c.ca || new Date().toISOString(),
      updatedAt: c.ua || new Date().toISOString(),
      customerName: String(c.cn || 'ลูกค้า'),
      customerPhone: String(c.cp || ''),
      deviceBrand: String(c.db || ''),
      deviceModel: String(c.dm || ''),
      deviceColor: String(c.dc || ''),
      imei: String(c.im || ''),
      symptoms: String(c.sy || ''),
      replacedParts: String(c.pt || ''),
      isClaim: Boolean(c.ic),
      claimReason: String(c.cr || ''),
      isDealerJob: Boolean(c.dj),
      dealerShopName: String(c.dn || ''),
      lockInfo: {
        pinCode: String(c.pin || ''),
        patternSequence: Array.isArray(c.pat) ? c.pat : [],
        hasPattern: Array.isArray(c.pat) && c.pat.length > 0,
      },
      repairPrice: Number(c.rp) || 0,
      partCost: 0,
      deposit: Number(c.dp) || 0,
      profit: (Number(c.rp) || 0) - (Number(c.dp) || 0),
      isPaid: false,
      status: c.st || 'PENDING',
      technicianName: 'ช่างประจำร้าน',
      repairNotes: String(c.rn || ''),
    };
  } catch (e) {
    console.error('Failed to decode job payload from URL', e);
    return null;
  }
}

/**
 * Builds the general shop tracking website URL where customers can check repair status
 */
export function getShopTrackingUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://repair-shop.app/?tab=track';
  }
  return `${window.location.origin}${window.location.pathname}?tab=track`;
}

/**
 * Builds the full tracking URL for a given RepairJob
 * @param job The repair job object
 * @param includePayload Whether to include embedded job payload (defaults to false for clean live online QR tracking)
 */
export function buildTrackingUrl(job: RepairJob, includePayload: boolean = false): string {
  if (typeof window === 'undefined') {
    return `https://repair-shop.app/?track=${encodeURIComponent(job.id)}`;
  }
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  if (includePayload) {
    const payload = encodeJobToUrlPayload(job);
    if (payload) {
      return `${baseUrl}?track=${encodeURIComponent(job.id)}&d=${payload}`;
    }
  }
  return `${baseUrl}?track=${encodeURIComponent(job.id)}`;
}
