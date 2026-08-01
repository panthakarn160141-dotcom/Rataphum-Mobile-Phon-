import React, { useState } from 'react';
import { RepairJob } from '../types';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  Filter,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface FinancialSummaryViewProps {
  jobs: RepairJob[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const FinancialSummaryView: React.FC<FinancialSummaryViewProps> = ({
  jobs,
  onExportCSV,
  onExportJSON,
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly' | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter jobs by timeframe
  const filteredJobs = jobs.filter((job) => {
    const jobDate = new Date(job.createdAt);
    const selected = new Date(selectedDate);

    if (timeframe === 'daily') {
      return (
        jobDate.getFullYear() === selected.getFullYear() &&
        jobDate.getMonth() === selected.getMonth() &&
        jobDate.getDate() === selected.getDate()
      );
    } else if (timeframe === 'monthly') {
      return (
        jobDate.getFullYear() === selected.getFullYear() &&
        jobDate.getMonth() === selected.getMonth()
      );
    } else if (timeframe === 'yearly') {
      return jobDate.getFullYear() === selected.getFullYear();
    }
    return true; // 'all'
  });

  // Calculate stats
  const totalJobs = filteredJobs.length;
  const completedJobs = filteredJobs.filter((j) => j.status === 'DELIVERED' || j.status === 'READY').length;
  const totalRevenue = filteredJobs.reduce((sum, j) => sum + j.repairPrice, 0);
  const totalPartCost = filteredJobs.reduce((sum, j) => sum + j.partCost, 0);
  const totalProfit = filteredJobs.reduce((sum, j) => sum + j.profit, 0);
  const totalDeposit = filteredJobs.reduce((sum, j) => sum + j.deposit, 0);
  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Group by brand for chart
  const brandStats: Record<string, { count: number; profit: number }> = {};
  filteredJobs.forEach((j) => {
    const b = j.deviceBrand || 'อื่นๆ';
    if (!brandStats[b]) {
      brandStats[b] = { count: 0, profit: 0 };
    }
    brandStats[b].count += 1;
    brandStats[b].profit += j.profit;
  });

  const sortedBrands = Object.entries(brandStats).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Kanit',sans-serif]">
              รายงานสรุปรายได้ ทุน และกำไร
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            วิเคราะห์ผลการดำเนินงาน รายได้ ต้นทุนอะไหล่ และกำไรสุทธิสำหรับร้านซ่อมมือถือ
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก CSV / Excel</span>
          </button>
          <button
            onClick={onExportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>สำรองข้อมูล JSON</span>
          </button>
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ภาพรวมทั้งหมด
          </button>
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === 'daily'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประจำวัน
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === 'monthly'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประจำเดือน
          </button>
          <button
            onClick={() => setTimeframe('yearly')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeframe === 'yearly'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประจำปี
          </button>
        </div>

        {timeframe !== 'all' && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 font-medium">เลือกวันที่อ้างอิง:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium"
            />
          </div>
        )}
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">รายได้รวม (Revenue)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {totalRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-500">฿</span>
          </div>
          <p className="text-[11px] text-slate-500">
            ยอดเงินมัดจำล่วงหน้า: <span className="font-semibold text-blue-700">{totalDeposit.toLocaleString()} ฿</span>
          </p>
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 rounded-r-2xl" />
        </div>

        {/* Total Cost / Capital */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">ต้นทุนอะไหล่ (Part Cost)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
            {totalPartCost.toLocaleString()} <span className="text-sm font-normal text-slate-500">฿</span>
          </div>
          <p className="text-[11px] text-slate-500">
            สัดส่วนต้นทุนคิดเป็น: {totalRevenue > 0 ? Math.round((totalPartCost / totalRevenue) * 100) : 0}% ของรายได้
          </p>
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 rounded-r-2xl" />
        </div>

        {/* Net Profit */}
        <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-900 shadow-md space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium">กำไรสุทธิ (Net Profit)</span>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            +{totalProfit.toLocaleString()} <span className="text-sm font-normal text-emerald-200">฿</span>
          </div>
          <p className="text-[11px] text-emerald-300 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            อัตรากำไร (Margin): {profitMargin}%
          </p>
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 rounded-r-2xl" />
        </div>

        {/* Total Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">งานซ่อมทั้งหมด (Jobs)</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {totalJobs} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
          </div>
          <p className="text-[11px] text-slate-500">
            ซ่อมเสร็จ/ส่งมอบแล้ว: <span className="font-semibold text-emerald-600">{completedJobs} เครื่อง</span>
          </p>
          <div className="absolute top-0 right-0 w-2 h-full bg-purple-500 rounded-r-2xl" />
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-base font-['Kanit',sans-serif] flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>สถิติงานซ่อมแยกตามยี่ห้อ</span>
            </h3>
            <span className="text-xs text-slate-500">จำนวน & กำไร</span>
          </div>

          <div className="space-y-3">
            {sortedBrands.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">ไม่มีข้อมูลงานซ่อมในเวลานี้</p>
            ) : (
              sortedBrands.map(([brand, data]) => {
                const percentage = totalJobs > 0 ? Math.round((data.count / totalJobs) * 100) : 0;
                return (
                  <div key={brand} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-semibold">{brand}</span>
                      <span className="text-slate-600">
                        {data.count} เครื่อง ({percentage}%) | กำไร +{data.profit.toLocaleString()} ฿
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status Breakdown & Financial Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h3 className="font-bold text-slate-900 text-base font-['Kanit',sans-serif] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>สรุปสถานะงานและกระแสเงินสด</span>
            </h3>
            <span className="text-xs text-slate-500">สถานะล่าสุด</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-amber-800 font-medium block">อยู่ระหว่างการซ่อม</span>
              <span className="text-xl font-bold text-amber-900 font-mono mt-1 block">
                {jobs.filter((j) => j.status === 'PENDING' || j.status === 'IN_PROGRESS' || j.status === 'WAITING_PARTS').length} เครื่อง
              </span>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 font-medium block">ซ่อมเสร็จรอรับเครื่อง</span>
              <span className="text-xl font-bold text-emerald-900 font-mono mt-1 block">
                {jobs.filter((j) => j.status === 'READY').length} เครื่อง
              </span>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <span className="text-blue-800 font-medium block">รับเครื่องส่งมอบแล้ว</span>
              <span className="text-xl font-bold text-blue-900 font-mono mt-1 block">
                {jobs.filter((j) => j.status === 'DELIVERED').length} เครื่อง
              </span>
            </div>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200">
              <span className="text-red-800 font-medium block">ยกเลิก/คืนเครื่อง</span>
              <span className="text-xl font-bold text-red-900 font-mono mt-1 block">
                {jobs.filter((j) => j.status === 'CANCELLED').length} เครื่อง
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">💡 ข้อแนะนำสำหรับการบริหารร้าน:</div>
            <p>
              ต้นทุนอะไหล่เฉลี่ยอยู่ที่ประมาณ {totalJobs > 0 ? Math.round(totalPartCost / totalJobs).toLocaleString() : 0} บาทต่อเครื่อง
              และได้กำไรเฉลี่ยประมาณ {totalJobs > 0 ? Math.round(totalProfit / totalJobs).toLocaleString() : 0} บาทต่อเครื่อง
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
