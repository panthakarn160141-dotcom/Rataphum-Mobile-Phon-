export type RepairStatus = 
  | 'PENDING'          // รอซ่อม
  | 'IN_PROGRESS'      // กำลังซ่อม
  | 'WAITING_PARTS'    // รออะไหล่
  | 'READY'            // ซ่อมเสร็จแล้ว (รอรับเครื่อง)
  | 'DELIVERED'        // รับเครื่องแล้ว (ส่งมอบเรียบร้อย)
  | 'CANCELLED'        // ยกเลิก / คืนเครื่อง
  | 'CLAIM_PENDING'    // เพิ่มเคลม / แจ้งเคลม
  | 'CLAIM_IN_PROGRESS'// กำลังซ่อมเคลม
  | 'CLAIM_READY'      // ซ่อมเสร็จแล้วเคลม (รอส่งคืน)
  | 'CLAIM_DELIVERED'; // ส่งคืนเคลมแล้ว

export interface SecurityLockInfo {
  pinCode: string;           // รหัสตัวเลข เช่น 1234 หรือ 987654
  patternSequence: number[]; // ลำดับจุด 9 จุด เช่น [1, 4, 7, 8, 9]
  hasPattern: boolean;
  notes?: string;            // หมายเหตุเพิ่มเติมเกี่ยวกับรหัสผ่าน
}

export interface RepairJob {
  id: string;                // รหัสใบซ่อม เช่น RT-2607-001
  createdAt: string;         // วันเวลาที่รับเครื่อง (ISO string)
  updatedAt: string;         // วันเวลาอัปเดตล่าสุด
  deliveredAt?: string;      // วันเวลาที่ลูกค้ามารับเครื่อง

  // ข้อมูลลูกค้า
  customerName: string;
  customerPhone: string;
  customerLineId?: string;
  customerAddress?: string;

  // ข้อมูลมือถือ
  deviceBrand: string;       // เช่น Apple, Samsung, OPPO, Vivo, Realme, Xiaomi
  deviceModel: string;       // เช่น iPhone 13 Pro Max, Galaxy S22 Ultra
  deviceColor?: string;
  imei: string;              // เลข IMEI หรือ Serial Number (15 หลัก)
  symptoms: string;          // อาการเสีย / รายละเอียดที่ลูกค้าแจ้ง
  accessories?: string;      // อุปกรณ์ที่นำมาด้วย (เคส, ซิม, สายชาร์จ)
  physicalCondition?: string;// สภาพเครื่องก่อนซ่อม

  // ข้อมูลอะไหล่และการเคลม
  replacedParts?: string;    // รายการอะไหล่ที่เปลี่ยน / ใช้อะไหล่อะไรบ้าง
  isClaim?: boolean;         // งานซ่อมเคลมประกันหรือไม่
  claimReason?: string;      // สาเหตุการเคลม

  // ข้อมูลงานซ่อมร้านส่ง (ดีลเลอร์ / ร้านค้าพันธมิตร)
  isDealerJob?: boolean;     // เป็นงานซ่อมส่งจากร้านค้าอื่น / ดีลเลอร์
  dealerShopName?: string;   // ชื่อร้านส่ง (เช่น ร้าน โมบาย เซอร์วิส, ร้านสมชายการช่าง)

  // รหัสล็อกเครื่อง
  lockInfo: SecurityLockInfo;

  // ราคา ทุน กำไร
  repairPrice: number;       // ราคาซ่อมรวม (ค่าบริการ + อะไหล่)
  partCost: number;          // ต้นทุนอะไหล่
  deposit: number;           // เงินมัดจำ
  profit: number;            // กำไร (repairPrice - partCost)
  isPaid: boolean;           // ชำระเงินครบแล้วหรือยัง

  // สถานะและช่าง
  status: RepairStatus;
  technicianName?: string;   // ชื่อช่างผู้ซ่อม
  repairNotes?: string;      // หมายเหตุการซ่อมของช่าง
  receiverName?: string;     // ผู้มารับเครื่อง (กรณีมีผู้รับแทน)
}

export interface ShopSettings {
  shopName: string;
  subTitle: string;
  phone: string;
  lineId: string;
  facebook?: string;
  address: string;
  taxId?: string;
  warrantyTerms: string;
  slipFooterNote: string;
  defaultTechnician: string;
  staffPin?: string; // รหัสผ่านสำหรับเข้าสู่ระบบหลังบ้าน/ช่างซ่อม
  promptPayNumber?: string; // เบอร์พร้อมเพย์หรือเลขผู้เสียภาษี
  promptPayName?: string; // ชื่อบัญชีพร้อมเพย์
  promptPayQrImage?: string; // รูป QR Code สแกนจ่าย (Base64 URL)
  bankName?: string; // ชื่อธนาคาร
  bankAccountNo?: string; // เลขบัญชีธนาคาร
  bankAccountName?: string; // ชื่อบัญชีธนาคาร
}

export type ActiveTab = 'all' | 'pending' | 'dealer' | 'claims' | 'delivered' | 'financials' | 'settings' | 'public_track';
