import React, { useState, useEffect } from 'react';
import { RepairJob, RepairStatus, ShopSettings, ActiveTab } from './types';
import { SAMPLE_REPAIR_JOBS, DEFAULT_SHOP_SETTINGS } from './data/sampleJobs';
import { PatternLockDrawer } from './components/PatternLockDrawer';
import { RepairJobModal } from './components/RepairJobModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { DeliveredJobsView } from './components/DeliveredJobsView';
import { FinancialSummaryView } from './components/FinancialSummaryView';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { CustomerTrackingView } from './components/CustomerTrackingView';
import { QRCodeSVG } from 'qrcode.react';
import { buildTrackingUrl, decodeJobFromUrlPayload } from './lib/trackingUtils';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Phone,
  Printer,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Store,
  Layers,
  Sparkles,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  Eye,
  EyeOff,
  ChevronRight,
  UserX,
  AlertCircle,
  Download,
  Tag,
  QrCode,
  Share2,
  X,
  Copy,
  Check,
} from 'lucide-react';

const LOCAL_STORAGE_JOBS_KEY = 'fuheng_mobile_repair_jobs_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'fuheng_mobile_shop_settings_v1';

export default function App() {
  // Check URL params for direct tracking link
  const [initialTrackCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const track = params.get('track') || params.get('jobId');
      if (track) return track;

      const payload = params.get('d') || params.get('payload');
      if (payload) {
        const decodedJob = decodeJobFromUrlPayload(payload);
        if (decodedJob?.id) return decodedJob.id;
      }
    }
    return '';
  });

  // Load initial settings & jobs from localStorage or fallback to samples
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If localStorage has outdated demo phone or address, update with new defaults
        if (parsed.phone?.includes('081-234-5678') || parsed.address?.includes('123/4 หมู่ 1')) {
          return {
            ...DEFAULT_SHOP_SETTINGS,
            ...parsed,
            shopName: DEFAULT_SHOP_SETTINGS.shopName,
            subTitle: DEFAULT_SHOP_SETTINGS.subTitle,
            phone: DEFAULT_SHOP_SETTINGS.phone,
            lineId: DEFAULT_SHOP_SETTINGS.lineId,
            address: DEFAULT_SHOP_SETTINGS.address,
            promptPayNumber: DEFAULT_SHOP_SETTINGS.promptPayNumber,
          };
        }
        return { ...DEFAULT_SHOP_SETTINGS, ...parsed };
      }
      return DEFAULT_SHOP_SETTINGS;
    } catch {
      return DEFAULT_SHOP_SETTINGS;
    }
  });

  const [jobs, setJobs] = useState<RepairJob[]>(() => {
    let initialJobs: RepairJob[] = [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
      initialJobs = saved ? JSON.parse(saved) : SAMPLE_REPAIR_JOBS;
    } catch {
      initialJobs = SAMPLE_REPAIR_JOBS;
    }

    // Immediately decode URL payload if present (cross-device scanning)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const payload = params.get('d') || params.get('payload');
      if (payload) {
        const decodedJob = decodeJobFromUrlPayload(payload);
        if (decodedJob && decodedJob.id) {
          const index = initialJobs.findIndex((j) => j.id.toLowerCase() === decodedJob.id.toLowerCase());
          if (index >= 0) {
            // Live online data in system takes priority over URL payload snapshot
            initialJobs[index] = { ...decodedJob, ...initialJobs[index] };
          } else {
            initialJobs = [decodedJob, ...initialJobs];
          }
        }
      }
    }

    return initialJobs;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error('Error saving jobs', e);
    }
  }, [jobs]);

  // Read URL payload if scanned on another device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const payload = params.get('d') || params.get('payload');
      if (payload) {
        const decodedJob = decodeJobFromUrlPayload(payload);
        if (decodedJob && decodedJob.id) {
          setJobs((prev) => {
            const exists = prev.some((j) => j.id.toLowerCase() === decodedJob.id.toLowerCase());
            if (exists) {
              return prev.map((j) => (j.id.toLowerCase() === decodedJob.id.toLowerCase() ? { ...decodedJob, ...j } : j));
            }
            return [decodedJob, ...prev];
          });
        }
      }
    }
  }, []);

  // Active UI View Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('track') || params.get('jobId') || params.get('d') || params.get('payload')) {
        return 'public_track';
      }
    }
    return 'all';
  });

  // Staff Admin Mode vs Customer View Mode State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('track') || params.get('jobId') || params.get('d') || params.get('payload')) {
        return false; // Customer mode when coming from tracking link
      }
    }
    return true; // Default admin mode
  });

  // PIN Auth Modal State
  const [showPinAuthModal, setShowPinAuthModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingTabSwitch, setPendingTabSwitch] = useState<ActiveTab | null>(null);
  const [pendingAction, setPendingAction] = useState<'create_job' | 'open_settings' | null>(null);

  // QR Modal
  const [qrModalJob, setQrModalJob] = useState<RepairJob | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<RepairJob | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingJob, setPrintingJob] = useState<RepairJob | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Customer Deletion Modal
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Protected Actions & Tab Switching
  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'public_track') {
      setActiveTab('public_track');
      return;
    }
    if (!isAdminMode) {
      setPendingTabSwitch(tab);
      setShowPinAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleProtectedCreateJob = () => {
    if (!isAdminMode) {
      setPendingAction('create_job');
      setShowPinAuthModal(true);
      return;
    }
    handleCreateNewJob();
  };

  const handleProtectedOpenSettings = () => {
    if (!isAdminMode) {
      setPendingAction('open_settings');
      setShowPinAuthModal(true);
      return;
    }
    setIsSettingsModalOpen(true);
  };

  const handleVerifyStaffPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.staffPin || '1601415788';
    if (pinInput.trim() === correctPin.trim()) {
      setIsAdminMode(true);
      setShowPinAuthModal(false);
      setPinInput('');
      setPinError('');
      if (pendingTabSwitch) {
        setActiveTab(pendingTabSwitch);
        setPendingTabSwitch(null);
      }
      if (pendingAction === 'create_job') {
        handleCreateNewJob();
        setPendingAction(null);
      }
      if (pendingAction === 'open_settings') {
        setIsSettingsModalOpen(true);
        setPendingAction(null);
      }
    } else {
      setPinError('รหัส PIN ร้านค้าไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Handlers
  const handleCreateNewJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: RepairJob) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handlePrintSlip = (job: RepairJob) => {
    setPrintingJob(job);
    setIsPrintModalOpen(true);
  };

  const handleSaveJob = (savedJob: RepairJob) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === savedJob.id);
      if (exists) {
        return prev.map((j) => (j.id === savedJob.id ? savedJob : j));
      } else {
        return [savedJob, ...prev];
      }
    });
    setIsJobModalOpen(false);
    setEditingJob(null);
  };

  const handleDeleteCustomerJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setDeletingJobId(null);
    setIsJobModalOpen(false);
  };

  // Quick deliver status change
  const handleQuickDeliver = (job: RepairJob) => {
    const updated: RepairJob = {
      ...job,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaid: true,
      receiverName: job.receiverName || `${job.customerName} (ลูกค้ารับเอง)`,
    };
    handleSaveJob(updated);
  };

  // Backup & Import
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ settings, jobs }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fuheng_mobile_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    let csv = 'Job_ID,Customer_Name,Phone,Brand,Model,IMEI,Symptoms,Repair_Price,Part_Cost,Profit,Status,Created_At\n';
    jobs.forEach((j) => {
      csv += `"${j.id}","${j.customerName}","${j.customerPhone}","${j.deviceBrand}","${j.deviceModel}","${j.imei}","${j.symptoms.replace(/"/g, '""')}",${j.repairPrice},${j.partCost},${j.profit},"${j.status}","${j.createdAt}"\n`;
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repair_jobs_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.jobs && Array.isArray(parsed.jobs)) {
          setJobs(parsed.jobs);
        }
        if (parsed.settings) {
          setSettings(parsed.settings);
        }
        alert('นำเข้าข้อมูลเรียบร้อยแล้ว!');
        setIsSettingsModalOpen(false);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ JSON กรุณาตรวจสอบรูปแบบไฟล์');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    if (confirm('คุณต้องการโหลดข้อมูลตัวอย่างงานซ่อมกลับมาหรือไม่?')) {
      setJobs(SAMPLE_REPAIR_JOBS);
      setSettings(DEFAULT_SHOP_SETTINGS);
      setIsSettingsModalOpen(false);
    }
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ คำเตือน: คุณต้องการล้างข้อมูลใบซ่อมทั้งหมดใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้')) {
      setJobs([]);
      setIsSettingsModalOpen(false);
    }
  };

  // Filtered Jobs List based on tab, search & status filter
  const filteredJobs = jobs.filter((j) => {
    // Search matching
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      j.customerName.toLowerCase().includes(search) ||
      j.customerPhone.includes(search) ||
      j.deviceModel.toLowerCase().includes(search) ||
      j.deviceBrand.toLowerCase().includes(search) ||
      j.imei.toLowerCase().includes(search) ||
      j.id.toLowerCase().includes(search) ||
      (j.dealerShopName && j.dealerShopName.toLowerCase().includes(search)) ||
      (j.isDealerJob && ('ร้านส่ง'.includes(search) || 'ดีลเลอร์'.includes(search)));

    // Tab filter
    if (activeTab === 'pending') {
      if (j.status === 'DELIVERED' || j.status === 'CLAIM_DELIVERED' || j.status === 'CANCELLED') return false;
    } else if (activeTab === 'dealer') {
      if (!j.isDealerJob) return false;
    } else if (activeTab === 'delivered') {
      if (j.status !== 'DELIVERED' && j.status !== 'CLAIM_DELIVERED') return false;
    } else if (activeTab === 'claims') {
      if (!j.isClaim && !j.status.startsWith('CLAIM_')) return false;
    }

    // Status chip filter
    if (selectedStatusFilter !== 'ALL' && j.status !== selectedStatusFilter) {
      return false;
    }

    // Brand filter
    if (selectedBrandFilter !== 'ALL' && j.deviceBrand !== selectedBrandFilter) {
      return false;
    }

    return matchesSearch;
  });

  // Unique Brands for Filter
  const availableBrands = Array.from(new Set(jobs.map((j) => j.deviceBrand))).filter(Boolean);

  // Quick Header Stats
  const activeJobsCount = jobs.filter((j) => j.status !== 'DELIVERED' && j.status !== 'CLAIM_DELIVERED' && j.status !== 'CANCELLED').length;
  const readyJobsCount = jobs.filter((j) => j.status === 'READY' || j.status === 'CLAIM_READY').length;
  const deliveredJobsCount = jobs.filter((j) => j.status === 'DELIVERED' || j.status === 'CLAIM_DELIVERED').length;
  const claimJobsCount = jobs.filter((j) => j.isClaim || j.status.startsWith('CLAIM_')).length;
  const dealerJobsCount = jobs.filter((j) => j.isDealerJob).length;
  const totalProfitAll = jobs.reduce((sum, j) => sum + j.profit, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-['Prompt',sans-serif] pb-24 md:pb-12">
      
      {/* APP TOP HEADER */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Shop Title & Slogan */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-2xl shadow-md border border-blue-400/40 text-white flex-shrink-0">
                <Wrench className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-['Kanit',sans-serif] tracking-tight leading-snug bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  {settings.shopName}
                </h1>
                <p className="text-[11px] sm:text-xs text-blue-300 font-medium">
                  {isAdminMode ? 'ระบบออกใบซ่อม • รหัสวาด 9 จุด • รายงานทุน-กำไร' : 'ระบบเช็คสถานะการซ่อมสำหรับลูกค้า (Read-Only)'}
                </p>
              </div>
            </div>

            {/* Mobile Settings Icon */}
            {isAdminMode && (
              <button
                onClick={handleProtectedOpenSettings}
                className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
                title="ตั้งค่าร้านซ่อม"
              >
                <Store className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
            
            {/* Mode Switch Badge Button */}
            <button
              onClick={() => {
                if (isAdminMode) {
                  setIsAdminMode(false);
                  setActiveTab('public_track');
                } else {
                  setShowPinAuthModal(true);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-xs ${
                isAdminMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title={isAdminMode ? 'อยู่ในโหมดร้านค้า (คลิกเพื่อสลับเป็นโหมดลูกค้า)' : 'อยู่ในโหมดลูกค้า (คลิกเพื่อปลดล็อกเข้าโหมดช่าง)'}
            >
              {isAdminMode ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>โหมดร้านค้า (Admin)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>โหมดลูกค้า (Read-Only)</span>
                </>
              )}
            </button>

            {isAdminMode && (
              <div className="hidden lg:flex items-center gap-2 text-xs font-medium">
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>กำลังซ่อม: <strong>{activeJobsCount}</strong></span>
                </div>
                <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>พร้อมส่งมอบ: <strong>{readyJobsCount}</strong></span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isAdminMode ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleProtectedOpenSettings}
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
                >
                  <Store className="w-4 h-4 text-blue-400" />
                  <span>ตั้งค่าร้าน</span>
                </button>

                <button
                  onClick={handleProtectedCreateJob}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform font-['Kanit',sans-serif]"
                >
                  <Plus className="w-5 h-5" />
                  <span>เปิดใบซ่อมใหม่</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinAuthModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors font-['Kanit',sans-serif]"
              >
                <Key className="w-4 h-4" />
                <span>ปลดล็อกโหมดช่าง</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        
        {/* Customer Protection Banner */}
        {!isAdminMode && (
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-blue-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-sm font-bold text-amber-300 block font-['Kanit',sans-serif]">
                  🔒 โหมดเช็คสถานะซ่อมสำหรับลูกค้า (ปิดข้อมูลหลังบ้านอย่างปลอดภัย)
                </strong>
                <p className="text-slate-300 text-xs mt-0.5">
                  ซ่อนสถิติต้นทุน อัตรากำไร บันทึกภายในของช่าง และป้องกันการแก้ไข/ลบข้อมูลซ่อมโดยตรง
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPinAuthModal(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap font-['Kanit',sans-serif]"
            >
              <Key className="w-4 h-4" />
              <span>🔑 เข้าสู่ระบบร้านค้า/ช่างซ่อม</span>
            </button>
          </div>
        )}

        {/* NAVIGATION TABS BAR (Desktop & Tablet) */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => handleTabClick('public_track')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'public_track'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Search className="w-4 h-4 text-sky-300" />
              <span>🔍 เช็คสถานะซ่อม (ลูกค้า)</span>
            </button>

            <button
              onClick={() => handleTabClick('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>งานซ่อมทั้งหมด</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>รอซ่อม/กำลังซ่อม</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {activeJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('dealer')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'dealer'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <Store className="w-4 h-4 text-purple-400" />
              <span>งานซ่อมร้านส่ง</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {dealerJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('claims')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'claims'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>งานเคลมประกัน</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {claimJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('delivered')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'delivered'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>รับเครื่องแล้ว</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {deliveredJobsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('financials')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'financials'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>สรุปรายได้ ทุน/กำไร</span>
              {!isAdminMode && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>
          </div>

          {/* Quick Total Profit Badge (Only visible in Admin Mode) */}
          {isAdminMode && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>กำไรสะสมรวม: +{totalProfitAll.toLocaleString()} ฿</span>
            </div>
          )}

        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'public_track' ? (
          <CustomerTrackingView jobs={jobs} settings={settings} initialSearchQuery={initialTrackCode} />
        ) : activeTab === 'financials' ? (
          <FinancialSummaryView
            jobs={jobs}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        ) : activeTab === 'delivered' ? (
          <DeliveredJobsView
            jobs={jobs}
            settings={settings}
            onViewJob={handleEditJob}
            onPrintSlip={handlePrintSlip}
          />
        ) : (
          /* REPAIR JOBS LIST VIEW (ALL or PENDING) */
          <div className="space-y-4">
            
            {/* Search and Filters Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ยี่ห้อ, รุ่นมือถือ, เลข IMEI หรือเลขใบซ่อม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">สถานะงานทั้งหมด</option>
                    <option value="PENDING">🟡 รอซ่อม</option>
                    <option value="IN_PROGRESS">🔵 กำลังซ่อม</option>
                    <option value="WAITING_PARTS">🟣 รออะไหล่</option>
                    <option value="READY">🟢 ซ่อมเสร็จแล้ว</option>
                    <option value="DELIVERED">✅ รับเครื่องแล้ว</option>
                    <option value="CANCELLED">🔴 คืนเครื่อง</option>
                    <option value="CLAIM_PENDING">🟠 แจ้งเคลมประกัน</option>
                    <option value="CLAIM_IN_PROGRESS">🔵 กำลังซ่อมเคลม</option>
                    <option value="CLAIM_READY">🟢 ซ่อมเสร็จแล้วเคลม</option>
                    <option value="CLAIM_DELIVERED">✅ ส่งคืนแล้ว (เคลม)</option>
                  </select>

                  {/* Brand Filter */}
                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">ยี่ห้อทั้งหมด</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* JOBS GRID CARDS */}
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-500 my-4 space-y-3">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-base">ไม่พบข้อมูลงานซ่อมตามเงื่อนไขที่เลือก</p>
                <p className="text-xs text-slate-500">
                  ลองเปลี่ยนคำค้นหา หรือคลิกปุ่มด้านล่างเพื่อเปิดใบซ่อมใหม่
                </p>
                <button
                  onClick={handleCreateNewJob}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มใบรับซ่อมใหม่</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => {
                  const isReady = job.status === 'READY';
                  const isDelivered = job.status === 'DELIVERED';

                  return (
                    <div
                      key={job.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-4 space-y-3.5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                        isReady
                          ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                          : isDelivered
                          ? 'border-slate-200 opacity-90'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div>
                        {/* Top Header Row */}
                        <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              {job.id}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(job.createdAt).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                                job.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : job.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : job.status === 'WAITING_PARTS'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : job.status === 'READY'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                                  : job.status === 'DELIVERED'
                                  ? 'bg-slate-800 text-white border-slate-700'
                                  : job.status === 'CLAIM_PENDING'
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : job.status === 'CLAIM_IN_PROGRESS'
                                  ? 'bg-sky-600 text-white border-sky-700'
                                  : job.status === 'CLAIM_READY'
                                  ? 'bg-teal-600 text-white border-teal-700'
                                  : job.status === 'CLAIM_DELIVERED'
                                  ? 'bg-slate-700 text-white border-slate-800'
                                  : 'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              {job.status === 'PENDING' && '🟡 รอซ่อม'}
                              {job.status === 'IN_PROGRESS' && '🔵 กำลังซ่อม'}
                              {job.status === 'WAITING_PARTS' && '🟣 รออะไหล่'}
                              {job.status === 'READY' && '🟢 ซ่อมเสร็จแล้ว'}
                              {job.status === 'DELIVERED' && '✅ รับเครื่องแล้ว'}
                              {job.status === 'CANCELLED' && '🔴 คืนเครื่อง'}
                              {job.status === 'CLAIM_PENDING' && '🟠 แจ้งเคลม'}
                              {job.status === 'CLAIM_IN_PROGRESS' && '🔵 ซ่อมเคลม'}
                              {job.status === 'CLAIM_READY' && '🟢 เคลมเสร็จแล้ว'}
                              {job.status === 'CLAIM_DELIVERED' && '✅ ส่งคืนเคลม'}
                            </span>
                            {job.isClaim && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                <ShieldCheck className="w-3 h-3 text-amber-600" />
                                <span>เคลมประกัน</span>
                              </span>
                            )}
                            {job.isDealerJob && (
                              <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                <Store className="w-3 h-3 text-purple-600" />
                                <span>ร้านส่ง: {job.dealerShopName || 'ดีลเลอร์'}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mt-2.5 flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 text-base font-['Kanit',sans-serif]">
                              {job.customerName}
                            </div>
                            <a
                              href={`tel:${job.customerPhone}`}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono font-medium mt-0.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{job.customerPhone}</span>
                            </a>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">ช่างผู้ซ่อม</span>
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {job.technicianName || 'ช่างฟู่'}
                            </span>
                          </div>
                        </div>

                        {/* Device Info & Symptoms */}
                        <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-900 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-blue-600" />
                              <span>
                                {job.deviceBrand} {job.deviceModel}
                              </span>
                            </span>
                            {job.deviceColor && (
                              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border">
                                {job.deviceColor}
                              </span>
                            )}
                          </div>

                          <div className="text-slate-500 font-mono text-[11px]">
                            IMEI: {job.imei || 'ไม่ได้ระบุ'}
                          </div>

                          <div className="text-slate-700 font-medium pt-1 border-t border-slate-200">
                            <span className="text-amber-800 font-semibold">อาการ:</span> {job.symptoms}
                          </div>

                          {/* Replaced Parts */}
                          {job.replacedParts && (
                            <div className="text-slate-800 font-medium pt-1 border-t border-slate-200 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                              <span className="text-blue-900 font-bold flex items-center gap-1 mb-0.5">
                                <Tag className="w-3 h-3 text-blue-600" />
                                อะไหล่ที่เปลี่ยน:
                              </span>
                              <p className="text-[11px] text-slate-700 leading-snug whitespace-pre-line">
                                {job.replacedParts}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Security Lock Code & 9-Dot Pattern Graphic */}
                        <div className="mt-3 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-400" />
                              รหัสล็อกเครื่อง
                            </span>
                            <div className="font-mono text-sm font-bold text-amber-300">
                              PIN: {job.lockInfo.pinCode || 'ไม่มีรหัส'}
                            </div>
                            {job.lockInfo.patternSequence.length > 0 && (
                              <div className="text-[10px] text-blue-300 font-mono">
                                วาด 9 จุด: {job.lockInfo.patternSequence.join('➔')}
                              </div>
                            )}
                          </div>

                          {/* Pattern lock miniature */}
                          {job.lockInfo.patternSequence.length > 0 && (
                            <div className="flex-shrink-0 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
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

                      {/* Pricing, Deposit & Profit */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 text-[11px]">ราคาซ่อม: </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {job.repairPrice.toLocaleString()} ฿
                            </strong>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-500 text-[11px]">มัดจำ: </span>
                            <span className="font-semibold text-blue-700 font-mono">
                              {job.deposit.toLocaleString()} ฿
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              กำไร +{job.profit.toLocaleString()} ฿
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-1 flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {/* Print Slip */}
                            <button
                              onClick={() => handlePrintSlip(job)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-600" />
                              <span>สลิปใบซ่อม</span>
                            </button>

                            {/* Show QR Code */}
                            <button
                              onClick={() => setQrModalJob(job)}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="เปิด QR Code ให้ลูกค้าสแกนเช็คสถานะซ่อม"
                            >
                              <QrCode className="w-3.5 h-3.5 text-sky-600" />
                              <span>QR เช็คสถานะ</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Quick Deliver button if ready */}
                            {!isDelivered && (
                              <button
                                onClick={() => handleQuickDeliver(job)}
                                title="เปลี่ยนสถานะเป็นรับเครื่องแล้ว"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>ส่งมอบ</span>
                              </button>
                            )}

                            {/* Edit Job */}
                            <button
                              onClick={() => handleEditJob(job)}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors border border-blue-200"
                              title="ดู / แก้ไขข้อมูลใบซ่อม"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Customer Job */}
                            <button
                              onClick={() => setDeletingJobId(job.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                              title="ลบข้อมูลลูกค้ารายนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-white border-t border-slate-800 md:hidden px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleTabClick('public_track')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium ${
            activeTab === 'public_track' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>เช็คสถานะ</span>
        </button>

        <button
          onClick={() => handleTabClick('pending')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium ${
            activeTab === 'pending' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>รอซ่อม {!isAdminMode && '🔒'}</span>
        </button>

        <button
          onClick={handleProtectedCreateJob}
          className="flex flex-col items-center justify-center bg-blue-600 text-white p-3 rounded-full -mt-6 shadow-xl border-4 border-slate-900 active:scale-90 transition-transform"
          title="เปิดใบซ่อมใหม่"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleTabClick('delivered')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium ${
            activeTab === 'delivered' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span>ส่งมอบ {!isAdminMode && '🔒'}</span>
        </button>

        <button
          onClick={() => handleTabClick('financials')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium ${
            activeTab === 'financials' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>สรุปเงิน {!isAdminMode && '🔒'}</span>
        </button>
      </nav>

      {/* STAFF PIN AUTHENTICATION MODAL */}
      {showPinAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-['Kanit',sans-serif]">
                    เข้าสู่ระบบช่างซ่อม/หลังบ้าน
                  </h3>
                  <p className="text-xs text-slate-500">
                    ใส่รหัส PIN ร้านค้าเพื่อดูข้อมูลหลังบ้าน
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPinAuthModal(false);
                  setPinInput('');
                  setPinError('');
                  setPendingTabSwitch(null);
                  setPendingAction(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyStaffPin} className="space-y-4 pt-1">
              {pinError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัส PIN ร้านค้า (Staff PIN)
                </label>
                <input
                  type="password"
                  autoFocus
                  maxLength={15}
                  placeholder="กรอกรหัส PIN ร้านค้า"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1.5 block text-center">
                  🔒 รหัส PIN ร้านค้าสำหรับปลดล็อกโหมดช่างซ่อม (ตั้งค่า/เปลี่ยนรหัสได้ในเมนูตั้งค่าร้าน)
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinAuthModal(false);
                    setPinInput('');
                    setPinError('');
                    setPendingTabSwitch(null);
                    setPendingAction(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all font-['Kanit',sans-serif]"
                >
                  ยืนยันปลดล็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isJobModalOpen && (
        <RepairJobModal
          jobToEdit={editingJob}
          settings={settings}
          onSave={handleSaveJob}
          onClose={() => {
            setIsJobModalOpen(false);
            setEditingJob(null);
          }}
          onDelete={handleDeleteCustomerJob}
        />
      )}

      {isPrintModalOpen && printingJob && (
        <PrintSlipModal
          job={printingJob}
          settings={settings}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintingJob(null);
          }}
        />
      )}

      {isSettingsModalOpen && (
        <ShopSettingsModal
          settings={settings}
          onSaveSettings={(newSet) => setSettings(newSet)}
          onClose={() => setIsSettingsModalOpen(false)}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onLoadSampleData={handleLoadSampleData}
          onClearAllData={handleClearAllData}
        />
      )}

      {/* CUSTOMER DELETION CONFIRMATION MODAL */}
      {deletingJobId && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-['Kanit',sans-serif] text-slate-900">
                  ยืนยันการลบข้อมูลลูกค้า
                </h3>
                <p className="text-xs text-slate-500">
                  รหัสใบซ่อม: <strong className="font-mono text-red-600">{deletingJobId}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200">
              คุณต้องการลบข้อมูลลูกค้ารายนี้ออกจากระบบใช่หรือไม่? ข้อมูลประวัติการซ่อมและสถิติรายได้ของใบซ่อมนี้จะถูกลบถาวร
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingJobId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteCustomerJob(deletingJobId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบข้อมูล</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK QR CODE POPUP MODAL */}
      {qrModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-['Kanit',sans-serif]">
                    QR Code เช็คสถานะซ่อม
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NO: {qrModalJob.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQrModalJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large QR Code Container */}
            <div className="bg-gradient-to-b from-blue-50/80 to-indigo-50/80 p-5 rounded-2xl border border-blue-200 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-900">
                <QRCodeSVG
                  value={buildTrackingUrl(qrModalJob)}
                  size={220}
                  level="M"
                  marginSize={2}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>

              <div>
                <strong className="text-slate-900 text-sm font-semibold block font-['Kanit',sans-serif]">
                  {qrModalJob.customerName} - {qrModalJob.deviceBrand} {qrModalJob.deviceModel}
                </strong>
                <div className="mt-1.5 inline-block bg-white text-blue-900 border border-blue-300 font-mono text-xs font-bold px-3 py-0.5 rounded-lg shadow-2xs">
                  เลขที่ใบรับซ่อม: {qrModalJob.id}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  เปิดกล้องมือถือ หรือ LINE สแกนเพื่อเช็คสถานะได้ทันที
                </p>
              </div>
            </div>

            {/* Copy Link & Print Slip Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  const url = buildTrackingUrl(qrModalJob);
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform font-['Kanit',sans-serif]"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จ!' : 'คัดลอกลิงก์สำหรับส่งให้ลูกค้า'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const targetJob = qrModalJob;
                    setQrModalJob(null);
                    handlePrintSlip(targetJob);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>พิมพ์สลิป</span>
                </button>
                <button
                  onClick={() => setQrModalJob(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
