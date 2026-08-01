import React, { useState, useEffect } from 'react';
import { RepairJob, ShopSettings, RepairStatus } from '../types';
import { PatternLockDrawer } from './PatternLockDrawer';
import { QRCodeSVG } from 'qrcode.react';
import { buildTrackingUrl, decodeJobFromUrlPayload } from '../lib/trackingUtils';
import {
  Search,
  Smartphone,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Tag,
  Store,
  ChevronRight,
  Sparkles,
  MapPin,
  HelpCircle,
  QrCode,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

interface CustomerTrackingViewProps {
  jobs: RepairJob[];
  settings: ShopSettings;
  initialSearchQuery?: string;
}

export const CustomerTrackingView: React.FC<CustomerTrackingViewProps> = ({ jobs, settings, initialSearchQuery = '' }) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [searchJobId, setSearchJobId] = useState('');
  const [searchedKey, setSearchedKey] = useState(initialSearchQuery);
  const [showPatternMap, setShowPatternMap] = useState<{ [id: string]: boolean }>({});
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const [copiedShopUrl, setCopiedShopUrl] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) {
      if (/^\d{8,12}$/.test(initialSearchQuery.replace(/[- ]/g, ''))) {
        setSearchPhone(initialSearchQuery);
      } else {
        setSearchJobId(initialSearchQuery);
      }
      setSearchedKey(initialSearchQuery);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get('track') || params.get('jobId') || params.get('phone');
      if (trackParam) {
        if (/^\d{8,12}$/.test(trackParam.replace(/[- ]/g, ''))) {
          setSearchPhone(trackParam);
        } else {
          setSearchJobId(trackParam);
        }
        setSearchedKey(trackParam);
      } else {
        const payload = params.get('d') || params.get('payload');
        if (payload) {
          const decoded = decodeJobFromUrlPayload(payload);
          if (decoded?.id) {
            setSearchJobId(decoded.id);
            setSearchedKey(decoded.id);
          }
        }
      }
    }
  }, [initialSearchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneClean = searchPhone.trim();
    const idClean = searchJobId.trim();
    const query = phoneClean || idClean;
    setSearchedKey(query);
  };

  // Current current shop tracking web page URL
  const shopTrackingPageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?tab=track`
    : 'https://repair-shop.app/?tab=track';

  const lineContactUrl = settings.lineId
    ? `https://line.me/R/ti/p/${settings.lineId.startsWith('@') ? settings.lineId : '@' + settings.lineId}`
    : `tel:${settings.phone.split(',')[0]}`;

  // Find matching jobs using either phone, job ID, or both
  const cleanPhone = searchPhone.trim().toLowerCase().replace(/[- #_]/g, '');
  const cleanJobId = searchJobId.trim().toLowerCase().replace(/[- #_]/g, '');
  const cleanSearchedKey = searchedKey.trim().toLowerCase().replace(/[- #_]/g, '');

  const matchedJobs = searchedKey
    ? jobs.filter((j) => {
        const jPhone = j.customerPhone.toLowerCase().replace(/[- #_]/g, '');
        const jId = j.id.toLowerCase().replace(/[- #_]/g, '');
        const jImei = j.imei ? j.imei.toLowerCase().replace(/[- #_]/g, '') : '';
        const jName = j.customerName ? j.customerName.toLowerCase().replace(/[- #_]/g, '') : '';

        // If user typed in specific phone field or job ID field
        if (cleanPhone && cleanJobId) {
          return (jPhone.includes(cleanPhone) || cleanPhone.includes(jPhone)) &&
                 (jId.includes(cleanJobId) || cleanJobId.includes(jId));
        }
        if (cleanPhone) {
          return jPhone.includes(cleanPhone) || cleanPhone.includes(jPhone);
        }
        if (cleanJobId) {
          return jId.includes(cleanJobId) || cleanJobId.includes(jId);
        }

        // Fallback for general query
        return (
          jId.includes(cleanSearchedKey) ||
          cleanSearchedKey.includes(jId) ||
          jPhone.includes(cleanSearchedKey) ||
          cleanSearchedKey.includes(jPhone) ||
          (jImei && jImei.includes(cleanSearchedKey)) ||
          (jName && jName.includes(cleanSearchedKey))
        );
      })
    : [];

  const togglePatternVisibility = (jobId: string) => {
    setShowPatternMap((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  // Helper to determine step index (0-3)
  const getStepProgress = (status: RepairStatus) => {
    switch (status) {
      case 'PENDING':
      case 'CLAIM_PENDING':
        return 0; // Step 1: Received
      case 'IN_PROGRESS':
      case 'WAITING_PARTS':
      case 'CLAIM_IN_PROGRESS':
        return 1; // Step 2: In Progress / Parts
      case 'READY':
      case 'CLAIM_READY':
        return 2; // Step 3: Ready
      case 'DELIVERED':
      case 'CLAIM_DELIVERED':
        return 3; // Step 4: Delivered
      case 'CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  // Helper for status label text & color
  const getStatusText = (status: RepairStatus, isClaim?: boolean) => {
    switch (status) {
      case 'PENDING':
        return { label: 'รอคิวซ่อม', color: 'bg-amber-500 text-white', icon: Clock };
      case 'IN_PROGRESS':
        return { label: 'กำลังซ่อมเครื่อง', color: 'bg-blue-600 text-white', icon: Wrench };
      case 'WAITING_PARTS':
        return { label: 'กำลังรออะไหล่', color: 'bg-purple-600 text-white', icon: Clock };
      case 'READY':
        return { label: 'ซ่อมเสร็จแล้ว (พร้อมรับเครื่อง)', color: 'bg-emerald-600 text-white', icon: CheckCircle2 };
      case 'DELIVERED':
        return { label: 'รับเครื่องกลับแล้ว', color: 'bg-slate-800 text-white', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'ยกเลิก / คืนเครื่อง', color: 'bg-red-600 text-white', icon: AlertCircle };
      case 'CLAIM_PENDING':
        return { label: 'แจ้งเคลม / รับเรื่องเคลมแล้ว', color: 'bg-amber-600 text-white', icon: ShieldCheck };
      case 'CLAIM_IN_PROGRESS':
        return { label: 'กำลังดำเนินการซ่อมเคลม', color: 'bg-sky-600 text-white', icon: Wrench };
      case 'CLAIM_READY':
        return { label: 'ซ่อมเคลมเสร็จแล้ว (พร้อมส่งคืน)', color: 'bg-teal-600 text-white', icon: CheckCircle2 };
      case 'CLAIM_DELIVERED':
        return { label: 'ส่งคืนเครื่องเคลมเรียบร้อย', color: 'bg-slate-700 text-white', icon: ShieldCheck };
      default:
        return { label: status, color: 'bg-slate-600 text-white', icon: Clock };
    }
  };

  // Mask IMEI for privacy (e.g. 35689*****8475)
  const maskImei = (imei: string) => {
    if (!imei || imei.length < 8) return imei || 'ไม่ได้ระบุ';
    return imei.slice(0, 5) + '*****' + imei.slice(-4);
  };

  return (
    <div className="space-y-6">
      
      {/* PUBLIC HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ระบบเช็คสถานะการซ่อมมือถือสาธารณะ (Online Tracking)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-['Kanit',sans-serif] tracking-tight">
            ติดตามสถานะการซ่อมมือถือออนไลน์
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            กรอก <strong className="text-amber-300 font-mono">เบอร์โทรศัพท์</strong> หรือ <strong className="text-blue-300 font-mono">เลขใบรับซ่อม</strong> เพื่อตรวจสอบขั้นตอนการซ่อม ประวัติอะไหล่ และสถานะการรับประกันได้ตลอด 24 ชั่วโมง
          </p>

          {/* Dual Search Form (Phone Number & Job ID) */}
          <form onSubmit={handleSearch} className="pt-2 space-y-3 max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1 font-['Kanit',sans-serif]">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. กรอกเบอร์โทรศัพท์มือถือ:</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="เช่น 093-741-3471"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500 font-mono shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1 font-['Kanit',sans-serif]">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>2. กรอกเลขใบรับซ่อม:</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="เช่น RT-2607-001"
                    value={searchJobId}
                    onChange={(e) => setSearchJobId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 font-mono shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 font-['Kanit',sans-serif]"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาข้อมูลการซ่อม</span>
              </button>
              {(searchPhone || searchJobId || searchedKey) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPhone('');
                    setSearchJobId('');
                    setSearchedKey('');
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  ล้างคำค้นหา
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* SEARCH RESULT CONTENT */}
      {searchedKey ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold font-['Kanit',sans-serif] text-slate-900 flex items-center gap-2">
              <span>ผลการค้นหาสำหรับ:</span>
              <span className="font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                "{searchedKey}"
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              พบ {matchedJobs.length} รายการ
            </span>
          </div>

          {matchedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-slate-200 shadow-xs space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-lg font-['Kanit',sans-serif]">
                  ไม่พบข้อมูลการซ่อมในระบบสำหรับ "{searchedKey}"
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  กรุณาตรวจสอบเลขใบซ่อม (เช่น RT-2607-001) หรือเบอร์โทรศัพท์มือถือที่ใช้แจ้งซ่อมอีกครั้ง
                </p>
              </div>

              {/* Sample job quick buttons */}
              {jobs.length > 0 && (
                <div className="pt-3 border-t border-slate-100 max-w-lg mx-auto space-y-2">
                  <span className="text-xs font-semibold text-slate-600 block">
                    หรือคลิกทดสอบค้นหาจากรายการในระบบ ({jobs.length} เครื่อง):
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {jobs.slice(0, 6).map((j) => (
                      <button
                        key={j.id}
                        onClick={() => {
                          setSearchJobId(j.id);
                          setSearchPhone('');
                          setSearchedKey(j.id);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-mono font-medium transition-colors"
                      >
                        {j.id} ({j.customerName})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {matchedJobs.map((job) => {
                const stepIdx = getStepProgress(job.status);
                const statusInfo = getStatusText(job.status, job.isClaim);
                const StatusIcon = statusInfo.icon;
                const balanceDue = Math.max(0, job.repairPrice - job.deposit);
                const isShowingPattern = showPatternMap[job.id];

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden transition-all hover:border-blue-300"
                  >
                    {/* Header Bar */}
                    <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                            ใบซ่อม: {job.id}
                          </span>
                          {job.isClaim && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              เคลมประกัน
                            </span>
                          )}
                          {job.isDealerJob && (
                            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              ร้านส่ง: {job.dealerShopName || 'ร้านค้าพันธมิตร'}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-slate-100 mt-1 font-['Kanit',sans-serif]">
                          {job.deviceBrand} {job.deviceModel}
                          {job.deviceColor && <span className="text-xs text-slate-400 font-normal ml-2">({job.deviceColor})</span>}
                        </h4>
                      </div>

                      {/* Current Status Badge */}
                      <div className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-6">
                      
                      {/* Step Progress Tracker Bar */}
                      {job.status !== 'CANCELLED' && (
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            ลำดับขั้นตอนการซ่อม (Repair Timeline Progress):
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
                            {[
                              { label: '1. รับเครื่อง / รับเคลม', desc: 'ลงทะเบียนรับซ่อม' },
                              { label: '2. กำลังซ่อม / อะไหล่', desc: 'ตรวจเช็คและถอดเปลี่ยน' },
                              { label: '3. ซ่อมเสร็จแล้ว', desc: 'ผ่านการ QC พร้อมรับ' },
                              { label: '4. ส่งมอบเรียบร้อย', desc: 'ลูกค้ารับเครื่องคืน' },
                            ].map((step, idx) => {
                              const isPassed = stepIdx >= idx;
                              const isCurrent = stepIdx === idx;

                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-xl border transition-all text-center space-y-1 ${
                                    isCurrent
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 font-bold'
                                      : isPassed
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                      : 'bg-white text-slate-400 border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1 text-xs">
                                    {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                    <span>{step.label}</span>
                                  </div>
                                  <p className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {step.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Main Job Detail Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                        
                        {/* Device & Symptom Info Card */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                          <h5 className="font-bold text-slate-900 border-b pb-1.5 border-slate-200 flex items-center gap-1.5 text-xs text-blue-900">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                            ข้อมูลอุปกรณ์ & อาการเสีย
                          </h5>

                          <div className="space-y-1 text-slate-700">
                            <div><span className="text-slate-400">เจ้าของเครื่อง:</span> <strong>{job.customerName}</strong></div>
                            <div><span className="text-slate-400">เลข IMEI:</span> <span className="font-mono font-medium">{maskImei(job.imei)}</span></div>
                            <div><span className="text-slate-400">วันที่รับซ่อม:</span> {new Date(job.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div><span className="text-slate-400">อุปกรณ์ที่นำมาด้วย:</span> {job.accessories || 'เครื่องเปล่า'}</div>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <span className="font-bold text-amber-900 block mb-0.5">อาการเสียที่แจ้ง:</span>
                            <p className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                              {job.symptoms}
                            </p>
                          </div>

                          {/* Replaced Parts Box */}
                          {job.replacedParts && (
                            <div className="pt-1">
                              <span className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                                <Tag className="w-3.5 h-3.5 text-blue-600" />
                                รายการอะไหล่ที่เปลี่ยน/ใช้ซ่อม:
                              </span>
                              <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                                {job.replacedParts}
                              </div>
                            </div>
                          )}

                          {job.claimReason && (
                            <div className="pt-1">
                              <span className="font-bold text-amber-900 block mb-1">สาเหตุการเคลม:</span>
                              <p className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900">
                                {job.claimReason}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Financials & Security Pin/Pattern Card */}
                        <div className="space-y-4">
                          
                          {/* Financial Box */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                            <h5 className="font-bold text-slate-900 border-b pb-1.5 border-slate-200 text-xs text-emerald-900">
                              💰 สรุปยอดค่าบริการ & ชำระเงิน
                            </h5>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-slate-600">
                                <span>ราคาประเมินซ่อมรวม:</span>
                                <strong className="font-mono text-slate-900">{job.repairPrice.toLocaleString()} ฿</strong>
                              </div>

                              <div className="flex justify-between items-center text-slate-600">
                                <span>เงินมัดจำแล้ว:</span>
                                <span className="font-mono text-blue-700 font-semibold">-{job.deposit.toLocaleString()} ฿</span>
                              </div>

                              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-base font-bold text-slate-900">
                                <span className="text-xs text-slate-700 font-semibold">ยอดคงเหลือต้องชำระวันรับเครื่อง:</span>
                                <span className="font-mono text-emerald-700 text-lg">
                                  {balanceDue === 0 ? 'ชำระครบแล้ว ✅' : `${balanceDue.toLocaleString()} ฿`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Lock Info Box (Security PIN & 9-Dot Pattern) */}
                          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                <Lock className="w-4 h-4" />
                                <span>รหัสล็อกเครื่องของคุณ</span>
                              </div>
                              <button
                                onClick={() => togglePatternVisibility(job.id)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium text-slate-300 flex items-center gap-1 border border-slate-700"
                              >
                                {isShowingPattern ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                <span>{isShowingPattern ? 'ซ่อนรหัส' : 'แสดงรหัส'}</span>
                              </button>
                            </div>

                            {isShowingPattern ? (
                              <div className="pt-2 space-y-3">
                                <div className="font-mono text-base font-bold text-amber-300 bg-slate-800 p-2 rounded-xl border border-slate-700 text-center">
                                  PIN Code: {job.lockInfo.pinCode || 'ไม่มีรหัสตัวเลข'}
                                </div>

                                {job.lockInfo.patternSequence.length > 0 && (
                                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-blue-300 font-mono mb-1">
                                      รหัสวาด 9 จุด: {job.lockInfo.patternSequence.join('➔')}
                                    </span>
                                    <PatternLockDrawer
                                      patternSequence={job.lockInfo.patternSequence}
                                      onChangePattern={() => {}}
                                      readOnly={true}
                                      size="sm"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 text-center">
                                กดปุ่ม "แสดงรหัส" ด้านบนเพื่อตรวจสอบรหัส PIN หรือรูปวาด 9 จุด
                              </p>
                            )}
                          </div>

                          {/* Digital Large QR Code & Direct Link Box */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                            <div className="space-y-2 text-center sm:text-left flex-1">
                              <span className="font-bold text-blue-950 text-sm flex items-center justify-center sm:justify-start gap-1.5 font-['Kanit',sans-serif]">
                                <QrCode className="w-5 h-5 text-blue-600" />
                                QR Code เช็คสถานะการซ่อมออนไลน์
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                สามารถเปิดกล้องมือถือ หรือ LINE สแกนรูปนี้ หรือส่งลิงก์ให้ญาติติดตามสถานะงานซ่อมได้ตลอด 24 ชม.
                              </p>
                              <button
                                onClick={() => {
                                  const url = buildTrackingUrl(job);
                                  navigator.clipboard.writeText(url);
                                  setCopiedJobId(job.id);
                                  setTimeout(() => setCopiedJobId(null), 2500);
                                }}
                                className="px-3.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                {copiedJobId === job.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                                <span>{copiedJobId === job.id ? 'คัดลอกลิงก์สถานะสำเร็จ!' : 'คัดลอกลิงก์หน้าติดตามซ่อม'}</span>
                              </button>
                            </div>
                            <div className="p-2 bg-white rounded-2xl border-2 border-blue-300 shadow-sm flex-shrink-0">
                              <QRCodeSVG
                                value={buildTrackingUrl(job)}
                                size={120}
                                level="M"
                                marginSize={2}
                                fgColor="#000000"
                                bgColor="#FFFFFF"
                              />
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Warranty & Shop Call Footer */}
                      <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Store className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>สอบถามเพิ่มเติม หรือต้องการติดต่อร้าน: <strong>{settings.shopName}</strong></span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <a
                            href={`tel:${settings.phone.split(',')[0]}`}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>โทรหาร้าน</span>
                          </a>
                          {settings.lineId && (
                            <a
                              href={`https://line.me/R/ti/p/${settings.lineId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>แอด Line</span>
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* IDLE / PROMOTIONAL QUICK SEARCH GUIDE */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl w-fit font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-['Kanit',sans-serif]">ค้นหาได้ทุกที่ทุกเวลา</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              เพียงป้อนเบอร์โทรศัพท์มือถือที่แจ้งไว้ตอนฝากซ่อมเพื่อดูสถานะแบบเรียลไทม์
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl w-fit font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-['Kanit',sans-serif]">ตรวจสอบงานเคลมประกัน</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ติดตามขั้นตอนการซ่อมเคลม สาเหตุการเปลี่ยน และประวัติอะไหล่ได้อย่างโปร่งใส
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl w-fit font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-['Kanit',sans-serif]">แจ้งเตือนเมื่อพร้อมรับ</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              เมื่อสถานะเปลี่ยนเป็น "ซ่อมเสร็จแล้ว" สามารถมารับเครื่องคืนได้ทันที ณ ศูนย์ซ่อม
            </p>
          </div>
        </div>
      )}

      {/* SHOP ONLINE TRACKING & CONTACT QR CODE BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-400/30">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>คิวอาร์โค้ดประจำร้านซ่อม (Shop Online Tracking QR)</span>
            </div>
            <h3 className="text-xl font-bold font-['Kanit',sans-serif] text-white">
              {settings.shopName}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              สแกน QR Code นี้ด้วยกล้องมือถือหรือแอป LINE เพื่อบันทึกหน้าเช็คสถานะการซ่อมออนไลน์ของร้านไว้ในโทรศัพท์ หรือแอดไลน์ติดต่อช่างได้ทันทีตลอด 24 ชม.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shopTrackingPageUrl);
                  setCopiedShopUrl(true);
                  setTimeout(() => setCopiedShopUrl(false), 2500);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                {copiedShopUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShopUrl ? 'คัดลอกลิงก์ร้านสำเร็จ!' : 'คัดลอกลิงก์หน้าร้านเช็คสถานะ'}</span>
              </button>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.split(',')[0]}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>โทร: {settings.phone.split(',')[0]}</span>
                </a>
              )}
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/80 flex-shrink-0">
            {/* Tracking Web Page QR */}
            <div className="text-center space-y-1.5">
              <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 inline-block">
                <QRCodeSVG
                  value={shopTrackingPageUrl}
                  size={105}
                  level="M"
                  marginSize={2}
                  fgColor="#0f172a"
                  bgColor="#FFFFFF"
                />
              </div>
              <span className="text-[10px] text-blue-300 font-bold block font-['Kanit',sans-serif]">
                QR เช็คสถานะซ่อม
              </span>
            </div>

            {/* LINE Contact QR */}
            {settings.lineId && (
              <div className="text-center space-y-1.5">
                <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 inline-block">
                  <QRCodeSVG
                    value={lineContactUrl}
                    size={105}
                    level="M"
                    marginSize={2}
                    fgColor="#06c755"
                    bgColor="#FFFFFF"
                  />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block font-['Kanit',sans-serif]">
                  QR LINE: {settings.lineId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
