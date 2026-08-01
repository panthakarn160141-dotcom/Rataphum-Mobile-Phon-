import React, { useState } from 'react';
import { RepairJob, ShopSettings } from '../types';
import { PatternLockDrawer } from './PatternLockDrawer';
import { Printer, X, FileText, Smartphone, User, DollarSign, ShieldAlert, CheckCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildTrackingUrl, getShopTrackingUrl } from '../lib/trackingUtils';

interface PrintSlipModalProps {
  job: RepairJob;
  settings: ShopSettings;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ job, settings, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'standard'>('standard');

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(job.createdAt).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const trackingUrl = buildTrackingUrl(job);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-200">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-lg">พิมพ์ใบรับซ่อม / สลิป</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle buttons */}
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('standard')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'standard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ใบรับซ่อม (A5/A4)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                สลิปความร้อน (80mm)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <Printer className="w-4 h-4" />
              พิมพ์สลิป
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh] print-container">
          {printFormat === 'standard' ? (
            /* STANDARD FULL RECEIPT (A5/A4 style) */
            <div className="border border-slate-300 rounded-xl p-5 bg-white text-slate-800 space-y-4 shadow-sm">
              {/* Header */}
              <div className="text-center border-b pb-4 border-slate-200">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Kanit',sans-serif]">
                  {settings.shopName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">{settings.subTitle}</p>
                <div className="mt-2 text-xs text-slate-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                  <span>โทร: {settings.phone}</span>
                  <span>Line: {settings.lineId}</span>
                  <span>FB: {settings.facebook}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
              </div>

              {/* Title & Ticket ID Banner */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-lg text-sm">
                <div>
                  <span className="font-bold text-blue-900 block text-base font-['Kanit',sans-serif]">
                    ใบรับซ่อมมือถือ / REPAIR TICKET
                  </span>
                  <span className="text-xs text-slate-600">วันที่รับเครื่อง: {formattedDate}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">เลขที่ใบซ่อม</div>
                  <div className="text-lg font-bold font-mono text-blue-700">{job.id}</div>
                </div>
              </div>

              {/* Grid: Customer & Device Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* Customer Box */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>ข้อมูลลูกค้า</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500">ชื่อลูกค้า:</span>{' '}
                      <strong className="text-slate-800 text-sm">{job.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">เบอร์โทรศัพท์:</span>{' '}
                      <strong className="text-blue-700">{job.customerPhone}</strong>
                    </div>
                    {job.customerLineId && (
                      <div>
                        <span className="text-slate-500">Line ID:</span> {job.customerLineId}
                      </div>
                    )}
                    {job.customerAddress && (
                      <div>
                        <span className="text-slate-500">ที่อยู่/หมายเหตุ:</span> {job.customerAddress}
                      </div>
                    )}
                    {job.isDealerJob && (
                      <div className="mt-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1">
                        <span>🏪 งานซ่อมร้านส่ง:</span>
                        <span>{job.dealerShopName || 'ร้านส่งซ่อม'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Box */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-200">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>ข้อมูลเครื่องที่ซ่อม</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500">ยี่ห้อ / รุ่น:</span>{' '}
                      <strong className="text-slate-900 text-sm">
                        {job.deviceBrand} {job.deviceModel}
                      </strong>
                    </div>
                    {job.deviceColor && (
                      <div>
                        <span className="text-slate-500">สีเครื่อง:</span> {job.deviceColor}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">IMEI / S/N:</span>{' '}
                      <span className="font-mono text-slate-800 font-semibold">{job.imei || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">สภาพ/อุปกรณ์:</span>{' '}
                      {job.accessories || 'เครื่องเปล่า'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms & Security Lock Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="md:col-span-2 bg-amber-50/70 p-3.5 rounded-lg border border-amber-200">
                  <div className="font-semibold text-amber-900 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>อาการเสียที่แจ้ง / รายละเอียดการซ่อม</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {job.symptoms}
                  </p>
                  {job.replacedParts && (
                    <div className="mt-2 pt-2 border-t border-amber-200/80">
                      <span className="font-bold text-blue-900 block text-xs">รายการอะไหล่ที่เปลี่ยน/ใช้ซ่อม:</span>
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-line">
                        {job.replacedParts}
                      </p>
                    </div>
                  )}
                  {job.physicalCondition && (
                    <p className="text-[11px] text-amber-800 mt-1 border-t border-amber-200/60 pt-1">
                      สภาพก่อนซ่อม: {job.physicalCondition}
                    </p>
                  )}
                </div>

                {/* Security Lock Box */}
                <div className="bg-slate-900 text-white p-3 rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-semibold text-slate-300 mb-1">
                    รหัสล็อกเครื่อง (Pin Code)
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                    {job.lockInfo.pinCode || 'ไม่มีรหัส'}
                  </div>
                  {job.lockInfo.patternSequence.length > 0 && (
                    <div className="mt-2 text-center">
                      <span className="text-[10px] text-slate-400 block mb-1">รหัสแบบวาด 9 จุด:</span>
                      <PatternLockDrawer
                        patternSequence={job.lockInfo.patternSequence}
                        onChangePattern={() => {}}
                        readOnly={true}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-slate-500">ช่างผู้รับซ่อม:</span>{' '}
                    <strong className="text-slate-800">{job.technicianName || 'ช่างประจำร้าน'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">สถานะปัจจุบัน:</span>{' '}
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                      {job.status === 'PENDING' && 'รอซ่อม'}
                      {job.status === 'IN_PROGRESS' && 'กำลังซ่อม'}
                      {job.status === 'WAITING_PARTS' && 'รออะไหล่'}
                      {job.status === 'READY' && 'ซ่อมเสร็จแล้ว (รอรับเครื่อง)'}
                      {job.status === 'DELIVERED' && 'รับเครื่องแล้ว'}
                      {job.status === 'CANCELLED' && 'คืนเครื่อง/ซ่อมไม่ได้'}
                    </span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-600">
                    ราคาประเมินซ่อม: <strong className="text-slate-900 text-base">{job.repairPrice.toLocaleString()} ฿</strong>
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">
                    มัดจำแล้ว: <strong>{job.deposit.toLocaleString()} ฿</strong>
                  </div>
                  <div className="text-sm font-bold text-blue-800 pt-1 border-t border-slate-300">
                    คงเหลือชำระวันรับเครื่อง: {(job.repairPrice - job.deposit).toLocaleString()} บาท
                  </div>
                </div>
              </div>

              {/* Extra Large Tracking QR Code Box for Standard Slip */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="space-y-2 flex-1 text-left">
                  <div className="font-bold text-blue-950 text-base flex items-center gap-2 font-['Kanit',sans-serif]">
                    <QrCode className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span>สแกน QR Code เข้าเว็บไซต์เช็คสถานะซ่อม</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    ใช้กล้องมือถือหรือแอป LINE สแกน QR Code นี้เพื่อเข้าสู่เว็บเช็คสถานะการซ่อมของทางร้าน แล้วกรอกเบอร์โทรศัพท์มือถือ หรือเลขใบรับซ่อม เพื่อเช็คสถานะซ่อมได้ตลอด 24 ชม.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                    <span className="bg-white px-3 py-1 rounded-lg border border-blue-300 text-blue-900 shadow-2xs">
                      เลขที่ใบรับซ่อม: {job.id}
                    </span>
                    <span className="bg-amber-50 px-3 py-1 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                      เบอร์โทร: {job.customerPhone}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md flex-shrink-0 text-center space-y-1">
                  <QRCodeSVG
                    value={getShopTrackingUrl()}
                    size={175}
                    level="M"
                    marginSize={2}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                  <span className="text-[10px] text-blue-800 font-bold block font-['Kanit',sans-serif]">
                    เว็บเช็คสถานะของร้าน
                  </span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="text-[10px] text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700">เงื่อนไขและข้อตกลงการรับซ่อม:</div>
                <div className="whitespace-pre-line leading-relaxed">{settings.warrantyTerms}</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div className="mt-1 font-medium text-slate-700">ลงชื่อผู้ส่งซ่อม (ลูกค้า)</div>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <div className="mt-1 font-medium text-slate-700">ลงชื่อผู้รับซ่อม (ทางร้าน)</div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 italic pt-2">
                {settings.slipFooterNote}
              </div>
            </div>
          ) : (
            /* THERMAL SLIP 80mm FORMAT */
            <div className="mx-auto max-w-[320px] bg-white text-slate-900 p-4 border border-slate-300 font-mono text-xs shadow-sm space-y-3">
              {/* Header */}
              <div className="text-center border-b pb-2 border-slate-300">
                <h2 className="font-bold text-sm text-slate-900 font-['Kanit',sans-serif]">
                  {settings.shopName}
                </h2>
                <p className="text-[10px] text-slate-600">{settings.phone}</p>
                <p className="text-[10px] text-slate-500">{settings.address}</p>
              </div>

              {/* Slip Info */}
              <div className="text-center border-b pb-2 border-slate-300">
                <div className="font-bold text-sm">ใบรับซ่อมมือถือ</div>
                <div className="text-[11px] font-bold text-blue-700">NO: {job.id}</div>
                <div className="text-[10px] text-slate-500">{formattedDate}</div>
              </div>

              {/* Details */}
              <div className="space-y-1 text-[11px] border-b pb-2 border-slate-300">
                {job.isDealerJob && (
                  <div className="bg-purple-100 text-purple-900 border border-purple-300 p-1 rounded text-center font-bold text-[11px]">
                    🏪 [งานซ่อมร้านส่ง]: {job.dealerShopName || 'ร้านส่งซ่อม'}
                  </div>
                )}
                <div>ลูกค้า: <strong>{job.customerName}</strong></div>
                <div>โทร: <strong>{job.customerPhone}</strong></div>
                <div>รุ่น: <strong>{job.deviceBrand} {job.deviceModel}</strong></div>
                <div>IMEI: {job.imei || '-'}</div>
                <div>อาการ: <span className="underline">{job.symptoms}</span></div>
                <div>PIN: <strong className="bg-slate-100 px-1">{job.lockInfo.pinCode || '-'}</strong></div>
                {job.lockInfo.patternSequence.length > 0 && (
                  <div>
                    วาดจุด: <span className="font-bold text-blue-700">{job.lockInfo.patternSequence.join('-')}</span>
                  </div>
                )}
              </div>

              {/* Pattern Lock Canvas for Thermal */}
              {job.lockInfo.patternSequence.length > 0 && (
                <div className="flex flex-col items-center py-1 border-b border-slate-300">
                  <div className="text-[9px] text-slate-500 mb-1">แผนผังรหัสวาด 9 จุด:</div>
                  <PatternLockDrawer
                    patternSequence={job.lockInfo.patternSequence}
                    onChangePattern={() => {}}
                    readOnly={true}
                    size="sm"
                  />
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-1 text-right text-[11px] border-b pb-2 border-slate-300">
                <div>ราคาประเมิน: <strong>{job.repairPrice.toLocaleString()} ฿</strong></div>
                <div>มัดจำ: <strong>{job.deposit.toLocaleString()} ฿</strong></div>
                <div className="font-bold text-sm text-slate-900 pt-1">
                  คงเหลือ: {(job.repairPrice - job.deposit).toLocaleString()} ฿
                </div>
              </div>

              {/* Extra Large QR Code Section for Thermal Slip */}
              <div className="border-b-2 border-slate-900 pb-3 pt-1">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border-2 border-slate-900 rounded-2xl space-y-2 text-center">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-['Kanit',sans-serif]">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <span>[ สแกน QR Code เข้าเว็บเช็คสถานะซ่อม ]</span>
                  </div>
                  <div className="p-2.5 bg-white border-2 border-slate-900 rounded-xl shadow-xs">
                    <QRCodeSVG
                      value={getShopTrackingUrl()}
                      size={185}
                      level="M"
                      marginSize={2}
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <div className="text-[10px] font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-300">
                    กรอกเบอร์โทร ({job.customerPhone}) หรือเลขใบซ่อม ({job.id})
                  </div>
                  <div className="text-xs text-slate-900 font-bold font-['Kanit',sans-serif]">
                    สแกนเพื่อเข้าเว็บไซต์ร้าน ตรวจสอบสถานะซ่อมมือถือออนไลน์ได้ตลอด 24 ชม.
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="text-[9px] text-center text-slate-500 space-y-1 pt-1">
                <p>* กรุณานำใบซ่อมมารับเครื่องภายใน 30 วัน *</p>
                <p>ขอบคุณที่ใช้บริการครับ</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>* พิมพ์ใบซ่อมโดยตรงจากเว็บบราวเซอร์ของคุณ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
