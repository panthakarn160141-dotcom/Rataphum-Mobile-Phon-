import React, { useState } from 'react';
import { RepairJob, ShopSettings } from '../types';
import {
  CheckCircle,
  Search,
  Printer,
  Eye,
  Calendar,
  UserCheck,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Smartphone,
  Phone,
} from 'lucide-react';

interface DeliveredJobsViewProps {
  jobs: RepairJob[];
  settings: ShopSettings;
  onViewJob: (job: RepairJob) => void;
  onPrintSlip: (job: RepairJob) => void;
}

export const DeliveredJobsView: React.FC<DeliveredJobsViewProps> = ({
  jobs,
  settings,
  onViewJob,
  onPrintSlip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter delivered jobs
  const deliveredJobs = jobs.filter(
    (j) =>
      j.status === 'DELIVERED' &&
      (j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.customerPhone.includes(searchTerm) ||
        j.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.imei.includes(searchTerm) ||
        j.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Financial totals for delivered jobs
  const totalRevenue = deliveredJobs.reduce((acc, j) => acc + j.repairPrice, 0);
  const totalCost = deliveredJobs.reduce((acc, j) => acc + j.partCost, 0);
  const totalProfit = deliveredJobs.reduce((acc, j) => acc + j.profit, 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Kanit',sans-serif]">
                รายการรับเครื่องแล้ว / ประวัติส่งมอบงานซ่อม
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              รวบรวมประวัติการส่งคืนเครื่องมือถือให้ลูกค้า ชำระเงินเรียบร้อยแล้ว
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs text-slate-400 block">จำนวนเครื่องที่ส่งมอบแล้ว</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {deliveredJobs.length} <span className="text-xs font-normal text-slate-300">เครื่อง</span>
            </span>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              รายได้รวมรับคืน
            </span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">
              {totalRevenue.toLocaleString()} ฿
            </span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              ต้นทุนอะไหล่รวม
            </span>
            <span className="text-lg font-bold text-amber-300 font-mono mt-0.5 block">
              {totalCost.toLocaleString()} ฿
            </span>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              กำไรสุทธิรวม
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
              +{totalProfit.toLocaleString()} ฿
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="ค้นหารายการรับเครื่องแล้ว (ชื่อลูกค้า, เบอร์โทร, รุ่นมือถือ, IMEI, เลขใบซ่อม)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-lg"
          >
            ล้างคำค้น
          </button>
        )}
      </div>

      {/* Jobs List */}
      {deliveredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 my-4 space-y-2">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-medium text-slate-700">ยังไม่มีรายการรับเครื่องแล้วตามเงื่อนไขที่ค้นหา</p>
          <p className="text-xs">
            เมื่อคุณเปลี่ยนสถานะใบซ่อมเป็น "รับเครื่องแล้ว" รายการจะมาปรากฏอยู่ในหน้านี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveredJobs.map((job) => {
            const deliveredDateFormatted = job.deliveredAt
              ? new Date(job.deliveredAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'เรียบร้อย';

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {job.id}
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      รับเครื่องแล้ว
                    </span>
                  </div>

                  {/* Customer & Phone */}
                  <div className="mt-2.5 space-y-1">
                    <div className="font-bold text-slate-900 text-base font-['Kanit',sans-serif]">
                      {job.customerName}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{job.customerPhone}</span>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {job.deviceBrand} {job.deviceModel}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono">
                      IMEI: {job.imei || 'ไม่ได้ระบุ'}
                    </div>
                    <div className="text-slate-600 pt-1 border-t border-slate-200/60 line-clamp-2">
                      <span className="font-medium text-slate-700">อาการ:</span> {job.symptoms}
                    </div>
                    {job.replacedParts && (
                      <div className="text-blue-900 pt-1 border-t border-slate-200/60 line-clamp-2">
                        <span className="font-semibold text-blue-700">อะไหล่ที่เปลี่ยน:</span> {job.replacedParts}
                      </div>
                    )}
                  </div>

                  {/* Delivery details */}
                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {deliveredDateFormatted}
                    </span>
                    {job.receiverName && (
                      <span className="text-slate-700 font-medium truncate max-w-[140px]">
                        ผู้รับ: {job.receiverName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ราคาบริการ</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {job.repairPrice.toLocaleString()} ฿
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">
                      กำไร +{job.profit.toLocaleString()} ฿
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPrintSlip(job)}
                      title="พิมพ์สลิป/ใบเสร็จ"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                      <span>สลิป</span>
                    </button>
                    <button
                      onClick={() => onViewJob(job)}
                      title="ดูรายละเอียด"
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>ดูข้อมูล</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
