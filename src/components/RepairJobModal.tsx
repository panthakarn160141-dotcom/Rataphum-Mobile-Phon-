import React, { useState, useEffect } from 'react';
import { RepairJob, RepairStatus, SecurityLockInfo, ShopSettings } from '../types';
import { PatternLockDrawer } from './PatternLockDrawer';
import {
  X,
  User,
  Smartphone,
  Shield,
  DollarSign,
  Wrench,
  Sparkles,
  Save,
  Trash2,
  Lock,
  Hash,
  FileText,
  AlertCircle,
  Tag,
  CheckCircle2,
  Store,
} from 'lucide-react';

interface RepairJobModalProps {
  jobToEdit?: RepairJob | null;
  settings: ShopSettings;
  onSave: (job: RepairJob) => void;
  onClose: () => void;
  onDelete?: (jobId: string) => void;
}

const COMMON_BRANDS = ['Apple', 'Samsung', 'OPPO', 'Vivo', 'Realme', 'Xiaomi', 'Infinix', 'iPad'];

export const RepairJobModal: React.FC<RepairJobModalProps> = ({
  jobToEdit,
  settings,
  onSave,
  onClose,
  onDelete,
}) => {
  // Generate ticket ID if new
  const generateTicketId = () => {
    const now = new Date();
    const yearMonth = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `RT-${yearMonth}-${randomNum}`;
  };

  const [id] = useState<string>(jobToEdit?.id || generateTicketId());
  const [createdAt] = useState<string>(jobToEdit?.createdAt || new Date().toISOString());

  // Customer State
  const [customerName, setCustomerName] = useState(jobToEdit?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(jobToEdit?.customerPhone || '');
  const [customerLineId, setCustomerLineId] = useState(jobToEdit?.customerLineId || '');
  const [customerAddress, setCustomerAddress] = useState(jobToEdit?.customerAddress || '');

  // Dealer / Subcontract Job State (งานซ่อมร้านส่ง)
  const [isDealerJob, setIsDealerJob] = useState(jobToEdit?.isDealerJob || false);
  const [dealerShopName, setDealerShopName] = useState(jobToEdit?.dealerShopName || '');

  // Device State
  const [deviceBrand, setDeviceBrand] = useState(jobToEdit?.deviceBrand || 'Apple');
  const [deviceModel, setDeviceModel] = useState(jobToEdit?.deviceModel || '');
  const [deviceColor, setDeviceColor] = useState(jobToEdit?.deviceColor || '');
  const [imei, setImei] = useState(jobToEdit?.imei || '');
  const [symptoms, setSymptoms] = useState(jobToEdit?.symptoms || '');
  const [accessories, setAccessories] = useState(jobToEdit?.accessories || '');
  const [physicalCondition, setPhysicalCondition] = useState(jobToEdit?.physicalCondition || '');

  // Replaced Parts & Warranty Claim State
  const [replacedParts, setReplacedParts] = useState(jobToEdit?.replacedParts || '');
  const [isClaim, setIsClaim] = useState(jobToEdit?.isClaim || false);
  const [claimReason, setClaimReason] = useState(jobToEdit?.claimReason || '');

  // Lock Credentials
  const [pinCode, setPinCode] = useState(jobToEdit?.lockInfo.pinCode || '');
  const [patternSequence, setPatternSequence] = useState<number[]>(
    jobToEdit?.lockInfo.patternSequence || []
  );
  const [lockNotes, setLockNotes] = useState(jobToEdit?.lockInfo.notes || '');

  // Financials
  const [repairPrice, setRepairPrice] = useState<number>(jobToEdit?.repairPrice || 0);
  const [partCost, setPartCost] = useState<number>(jobToEdit?.partCost || 0);
  const [deposit, setDeposit] = useState<number>(jobToEdit?.deposit || 0);
  const [isPaid, setIsPaid] = useState<boolean>(jobToEdit?.isPaid || false);

  // Status & Technician
  const [status, setStatus] = useState<RepairStatus>(jobToEdit?.status || 'PENDING');
  const [technicianName, setTechnicianName] = useState(
    jobToEdit?.technicianName || settings.defaultTechnician
  );
  const [repairNotes, setRepairNotes] = useState(jobToEdit?.repairNotes || '');
  const [receiverName, setReceiverName] = useState(jobToEdit?.receiverName || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profit calculation
  const profit = Math.max(0, repairPrice - partCost);

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อลูกค้า');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ลูกค้า');
      return;
    }
    if (!deviceModel.trim()) {
      setErrorMsg('กรุณากรอกรุ่นมือถือ');
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg('กรุณากรอกอาการเสียของเครื่อง');
      return;
    }

    const lockInfo: SecurityLockInfo = {
      pinCode: pinCode.trim(),
      patternSequence,
      hasPattern: patternSequence.length > 0,
      notes: lockNotes.trim(),
    };

    const savedJob: RepairJob = {
      id,
      createdAt,
      updatedAt: new Date().toISOString(),
      deliveredAt: status === 'DELIVERED' ? (jobToEdit?.deliveredAt || new Date().toISOString()) : undefined,

      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerLineId: customerLineId.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,

      isDealerJob,
      dealerShopName: isDealerJob ? (dealerShopName.trim() || 'ร้านส่งซ่อม') : undefined,

      deviceBrand,
      deviceModel: deviceModel.trim(),
      deviceColor: deviceColor.trim() || undefined,
      imei: imei.trim(),
      symptoms: symptoms.trim(),
      accessories: accessories.trim() || undefined,
      physicalCondition: physicalCondition.trim() || undefined,

      replacedParts: replacedParts.trim() || undefined,
      isClaim,
      claimReason: claimReason.trim() || undefined,

      lockInfo,

      repairPrice,
      partCost,
      deposit,
      profit,
      isPaid: isPaid || deposit >= repairPrice,

      status,
      technicianName: technicianName.trim() || settings.defaultTechnician,
      repairNotes: repairNotes.trim() || undefined,
      receiverName: receiverName.trim() || undefined,
    };

    onSave(savedJob);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Kanit',sans-serif] leading-tight">
                {jobToEdit ? `แก้ไขใบรับซ่อม (${jobToEdit.id})` : 'รับซ่อมใหม่ / ออกใบรับซ่อม'}
              </h2>
              <p className="text-xs text-slate-400">
                {settings.shopName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[82vh] space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b pb-2 border-slate-200">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. ข้อมูลลูกค้า</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  ชื่อลูกค้า <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย ใจดี"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="เช่น 081-234-5678"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Line ID / ช่องทางติดต่อ</label>
                <input
                  type="text"
                  placeholder="@lineid"
                  value={customerLineId}
                  onChange={(e) => setCustomerLineId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dealer Job Toggle (ช่องงานซ่อมร้านส่ง) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDealerJob}
                    onChange={(e) => setIsDealerJob(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                  />
                  <span className="font-bold text-purple-950 text-xs sm:text-sm font-['Kanit',sans-serif] flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-purple-600" />
                    <span>🏪 งานซ่อมร้านส่ง / ร้านค้าพันธมิตร (Dealer Repair Job)</span>
                  </span>
                </label>

                {isDealerJob && (
                  <div className="pt-1 space-y-2 text-xs">
                    <div>
                      <label className="block font-medium text-purple-900 mb-1">
                        ชื่อร้านส่ง / ชื่อร้านค้าพันธมิตร: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น ร้าน นาทวี โมบาย การช่าง, ร้าน สมชาย โมบาย (ส่งซ่อม)"
                        value={dealerShopName}
                        onChange={(e) => setDealerShopName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-purple-950 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Device & Symptoms */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b pb-2 border-slate-200">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>2. ข้อมูลเครื่องที่นำมาซ่อม</span>
            </div>

            {/* Quick Brand Selectors */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">เลือกยี่ห้อด่วน:</label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setDeviceBrand(b)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      deviceBrand === b
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  รุ่นมือถือ / แท็บเล็ต <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น iPhone 13 Pro Max"
                  value={deviceModel}
                  onChange={(e) => {
                    setDeviceModel(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">สีเครื่อง</label>
                <input
                  type="text"
                  placeholder="เช่น สีดำ, Sierra Blue"
                  value={deviceColor}
                  onChange={(e) => setDeviceColor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">เลข IMEI / Serial Number</label>
                <input
                  type="text"
                  placeholder="15 หลัก หรือ S/N"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1 text-xs sm:text-sm">
                อาการเสีย / รายละเอียดที่ต้องซ่อม <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="เช่น จอแตก ทัชไม่ได้, เปลี่ยนแบตเตอรี่, ตกน้ำเปิดไม่ติด, ก้นชาร์จเสีย"
                value={symptoms}
                onChange={(e) => {
                  setSymptoms(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">อุปกรณ์ที่ติดมาด้วย</label>
                <input
                  type="text"
                  placeholder="เช่น เคสใส, ซิมการ์ด AIS, SD Card, สายชาร์จ"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">สภาพเครื่องก่อนซ่อม</label>
                <input
                  type="text"
                  placeholder="เช่น ขอบเครื่องมีรอยถลอก, จออ้า"
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Replaced Parts Box */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs sm:text-sm font-semibold text-blue-900 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>รายการอะไหล่ที่เปลี่ยน / ใช้อะไหล่อะไรบ้าง</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (ระบุยี่ห้อ/เกรดอะไหล่ เช่น จอแท้, แบตเตอรี่ มอก., ชิป IC)
                </span>
              </label>
              <textarea
                rows={2}
                placeholder="เช่น - ชุดจอ OLED เกรดแท้ Original (1 ชิ้น)&#10;- แบตเตอรี่ Dissing มอก. ความจุสูง (1 ชิ้น)&#10;- กาวฝาหลังกันน้ำ B7000"
                value={replacedParts}
                onChange={(e) => setReplacedParts(e.target.value)}
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-sans"
              />
            </div>

            {/* Warranty Claim Box Toggle */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClaim}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsClaim(checked);
                    if (checked && !status.startsWith('CLAIM_')) {
                      setStatus('CLAIM_PENDING');
                    }
                  }}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="font-bold text-amber-900 text-xs sm:text-sm font-['Kanit',sans-serif]">
                  ⚠️ งานนี้เป็นงานซ่อมเคลมประกัน / เครื่องซ่อมซ้ำ (Warranty Claim)
                </span>
              </label>

              {isClaim && (
                <div className="pt-2 space-y-2 text-xs">
                  <div>
                    <label className="block font-medium text-amber-900 mb-1">
                      สาเหตุการเคลม / รายละเอียดประกัน:
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น จอกระตุกหลังใช้งาน 2 สัปดาห์, แบตเสื่อมในระยะประกัน"
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Lock Credentials (Numeric & 9-Dot Pattern) */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>3. รหัสล็อกเครื่อง (สำหรับทดสอบเครื่อง)</span>
              </div>
              <span className="text-xs text-slate-400">ตัวเลข & วาด 9 จุด</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left Column: Numeric PIN Input */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    รหัสล็อกเครื่องแบบตัวเลข (PIN Code)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 1234, 000000 หรือ 'ไม่มีรหัส'"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-amber-300 font-mono text-base font-bold rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">หมายเหตุรหัสผ่านเพิ่มเติม</label>
                  <input
                    type="text"
                    placeholder="เช่น สแกนนิ้วมือ, ล็อคสองชั้น"
                    value={lockNotes}
                    onChange={(e) => setLockNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-slate-400 space-y-1">
                  <p className="text-amber-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    วิธีวาดรหัส 9 จุด:
                  </p>
                  <p>กดหรือลากนิ้วบนจุด 1-9 ในตารางด้านขวาเพื่อบันทึกลำดับการปลดล็อก</p>
                </div>
              </div>

              {/* Right Column: Pattern Lock Drawer (3x3 Grid) */}
              <div className="flex flex-col items-center justify-center bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <PatternLockDrawer
                  patternSequence={patternSequence}
                  onChangePattern={setPatternSequence}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pricing, Capital, Deposit & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b pb-2 border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>4. ราคาซ่อม ทุน กำไร และสถานะการซ่อม</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  ราคาประเมินซ่อม (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairPrice}
                  onChange={(e) => setRepairPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  ต้นทุน / ค่าอะไหล่ (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  value={partCost}
                  onChange={(e) => setPartCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-amber-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  เงินมัดจำ (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Auto Calculated Profit */}
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex flex-col justify-center">
                <span className="text-xs text-emerald-700 font-medium">กำไรสุทธิคาดการณ์</span>
                <span className="text-xl font-extrabold text-emerald-700 font-mono">
                  +{profit.toLocaleString()} ฿
                </span>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                สถานะงานซ่อมทั่วไป (General Repair Status):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                {[
                  { key: 'PENDING', label: '🟡 รอซ่อม', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                  { key: 'IN_PROGRESS', label: '🔵 กำลังซ่อม', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  { key: 'WAITING_PARTS', label: '🟣 รออะไหล่', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                  { key: 'READY', label: '🟢 ซ่อมเสร็จแล้ว', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                  { key: 'DELIVERED', label: '✅ รับเครื่องแล้ว', color: 'bg-slate-800 text-white border-slate-700' },
                  { key: 'CANCELLED', label: '🔴 คืนเครื่อง', color: 'bg-red-100 text-red-800 border-red-300' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setStatus(item.key as RepairStatus);
                      if (isClaim) setIsClaim(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg font-medium border text-center transition-all ${
                      status === item.key
                        ? `${item.color} ring-2 ring-blue-500 font-bold scale-[1.02] shadow-xs`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Warranty Claim Statuses */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
                  <span>🛡️ สถานะการเคลมประกัน (Warranty Claim Statuses):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { key: 'CLAIM_PENDING', label: '🟠 เพิ่มเคลม / แจ้งเคลม', color: 'bg-amber-500 text-white border-amber-600' },
                    { key: 'CLAIM_IN_PROGRESS', label: '🔵 กำลังซ่อมเคลม', color: 'bg-sky-600 text-white border-sky-700' },
                    { key: 'CLAIM_READY', label: '🟢 ซ่อมเสร็จแล้วเคลม', color: 'bg-teal-600 text-white border-teal-700' },
                    { key: 'CLAIM_DELIVERED', label: '✅ ส่งคืนแล้ว (เคลม)', color: 'bg-slate-700 text-white border-slate-800' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setStatus(item.key as RepairStatus);
                        setIsClaim(true);
                      }}
                      className={`py-2 px-2.5 rounded-lg font-medium border text-center transition-all ${
                        status === item.key
                          ? `${item.color} ring-2 ring-amber-400 font-bold scale-[1.02] shadow-md`
                          : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* If Status is DELIVERED, show receiver name */}
            {status === 'DELIVERED' && (
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  ชื่อผู้มารับเครื่อง (กรณีลูกค้ารับเอง หรือตัวแทนรับ)
                </label>
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย (ลูกค้ามารับเอง)"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                />
              </div>
            )}

            {/* Technician & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">ช่างผู้รับซ่อม</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">บันทึกของช่าง (ใช้งานภายใน)</label>
                <input
                  type="text"
                  placeholder="เช่น สั่งอะไหล่ร้าน A, เทสชาร์จแล้วปกติ"
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            {jobToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`คุณต้องการลบข้อมูลใบซ่อมเลขที่ ${jobToEdit.id} หรือไม่?`)) {
                    onDelete(jobToEdit.id);
                  }
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 border border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                ลบข้อมูลใบซ่อมนี้
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform font-['Kanit',sans-serif]"
              >
                <Save className="w-4 h-4" />
                บันทึกใบซ่อม
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
