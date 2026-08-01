import React, { useState, useRef } from 'react';
import { ShopSettings } from '../types';
import {
  X,
  Store,
  Phone,
  MapPin,
  FileText,
  Save,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';

interface ShopSettingsModalProps {
  settings: ShopSettings;
  onSaveSettings: (newSettings: ShopSettings) => void;
  onClose: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onExportJSON,
  onImportJSON,
  onLoadSampleData,
  onClearAllData,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSuccessMsg('บันทึกการตั้งค่าร้านซ่อมเรียบร้อยแล้ว!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Kanit',sans-serif]">ตั้งค่าร้านซ่อม & สำรองข้อมูล</h2>
              <p className="text-xs text-slate-400">แก้ไขข้อมูลหัวกระดาษใบซ่อม และจัดการไฟล์สำรอง</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh] space-y-5">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Shop Identity */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 text-sm border-b pb-2 border-slate-200">
              ข้อมูลร้านค้า (สำหรับหัวสลิปใบรับซ่อม)
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">ชื่อร้านซ่อม</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">สโลแกน / รายละเอียดบริการ</label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ร้าน</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Line ID / ช่องทางติดต่อ</label>
                  <input
                    type="text"
                    value={formData.lineId}
                    onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ที่อยู่ร้านซ่อม</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: PromptPay & Payment QR Settings */}
          <div className="space-y-3 bg-blue-50/80 p-4 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-950 text-sm border-b pb-2 border-blue-200 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>ตั้งค่า QR Code พร้อมเพย์ และบัญชีธนาคารสำหรับรับโอนเงิน</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-800 mb-1">
                    เบอร์พร้อมเพย์ / เลขผู้เสียภาษี (PromptPay ID)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 0812345678 หรือ 13 หลัก"
                    value={formData.promptPayNumber || ''}
                    onChange={(e) => setFormData({ ...formData, promptPayNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    ระบบจะสร้าง PromptPay QR Code ระบุยอดเงินมัดจำ/คงเหลืออัตโนมัติ
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-slate-800 mb-1">ชื่อบัญชีพร้อมเพย์</label>
                  <input
                    type="text"
                    placeholder="เช่น ศูนย์ซ่อมมือถือรัตภูมิ By ฟู่เฮงโมบาย"
                    value={formData.promptPayName || ''}
                    onChange={(e) => setFormData({ ...formData, promptPayName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-800 mb-1">ธนาคาร</label>
                  <input
                    type="text"
                    placeholder="เช่น กสิกรไทย (K-Bank)"
                    value={formData.bankName || ''}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-800 mb-1">เลขที่บัญชีธนาคาร</label>
                  <input
                    type="text"
                    placeholder="เช่น 123-4-56789-0"
                    value={formData.bankAccountNo || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-800 mb-1">ชื่อบัญชีธนาคาร</label>
                  <input
                    type="text"
                    placeholder="เช่น นายฟู่เฮง"
                    value={formData.bankAccountName || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Custom QR Image */}
              <div className="pt-2 border-t border-blue-200/80">
                <label className="block font-semibold text-slate-800 mb-1 text-xs">
                  แนบรูปภาพ QR Code รับเงินประจำร้าน (Custom QR Code Image - ตัวเลือกเสริม)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-blue-200">
                  {formData.promptPayQrImage ? (
                    <div className="relative group flex-shrink-0">
                      <img
                        src={formData.promptPayQrImage}
                        alt="Custom PromptPay QR"
                        className="w-24 h-24 object-contain rounded-lg border border-slate-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, promptPayQrImage: undefined })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-500 transition-colors"
                        title="ลบรูป QR Code"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>ยังไม่มีรูป</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-600 leading-snug">
                      อัปโหลดป้าย QR Code รับเงินอย่างเป็นทางการของร้าน หรือรูปสแกนจ่ายของธนาคารเพื่อแสดงบนสลิปและหน้าเช็คสถานะ
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>เลือกรูปภาพ QR Code</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (readerEvent) => {
                              const result = readerEvent.target?.result as string;
                              if (result) {
                                setFormData({ ...formData, promptPayQrImage: result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Terms & Slip Text */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 text-sm border-b pb-2 border-slate-200">
              เงื่อนไขการซ่อมและข้อความท้ายสลิป
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">เงื่อนไขการรับประกันและข้อตกลง</label>
                <textarea
                  rows={4}
                  value={formData.warrantyTerms}
                  onChange={(e) => setFormData({ ...formData, warrantyTerms: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อช่างเริ่มต้น</label>
                  <input
                    type="text"
                    value={formData.defaultTechnician}
                    onChange={(e) => setFormData({ ...formData, defaultTechnician: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    รหัส PIN สำหรับร้านค้า/หลังบ้าน (Staff PIN)
                  </label>
                  <input
                    type="password"
                    maxLength={15}
                    placeholder="กรอกรหัส PIN ร้านค้า"
                    value={formData.staffPin || ''}
                    onChange={(e) => setFormData({ ...formData, staffPin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    ใช้สำหรับปลดล็อกเข้าดูข้อมูลหลังบ้าน/สถิติทุนกำไร
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Data Management & Backup/Restore */}
          <div className="space-y-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
            <h3 className="font-semibold text-amber-400 text-sm border-b pb-2 border-slate-800 flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              <span>การบันทึก โหลดข้อมูล และสำรองข้อมูล (Data Backup)</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              ระบบจะบันทึกข้อมูลใบซ่อมทั้งหมดลงในเบราว์เซอร์ของคุณอัตโนมัติ คุณสามารถส่งออกไฟล์ Backup เพื่อย้ายไปเครื่องอื่น หรือโหลดข้อมูลตัวอย่างได้
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Export JSON */}
              <button
                type="button"
                onClick={onExportJSON}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-blue-300"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>สำรองข้อมูล (Export JSON)</span>
              </button>

              {/* Import JSON */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-emerald-300"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>นำเข้าข้อมูล (Import JSON)</span>
              </button>

              {/* Load Sample Data */}
              <button
                type="button"
                onClick={onLoadSampleData}
                className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>โหลดข้อมูลตัวอย่าง (Sample Data)</span>
              </button>

              {/* Clear All */}
              <button
                type="button"
                onClick={onClearAllData}
                className="p-3 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>ล้างข้อมูลทั้งหมด (Clear All)</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs sm:text-sm transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform font-['Kanit',sans-serif]"
            >
              <Save className="w-4 h-4" />
              บันทึกการตั้งค่า
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
