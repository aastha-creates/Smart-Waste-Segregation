import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Recycle, 
  TreeDeciduous,
  ShieldCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { DashboardStats } from '../types';

interface WasteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DashboardStats;
}

export const WasteReportModal: React.FC<WasteReportModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
      });

      // Simple clean typography for PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('SMART WASTE SEGREGATION', 40, 50);

      doc.setFontSize(14);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text('WASTE ANALYSIS & RECYCLING AUDIT REPORT', 40, 70);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${dateFormatted} | AI Facility Assessment System`, 40, 88);

      doc.setDrawColor(226, 232, 240);
      doc.line(40, 98, 555, 98);

      // 1. Overview Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('1. EXECUTIVE SUMMARY & OVERVIEW', 40, 120);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Total Waste Detections: ${stats.kpis.totalScans.toLocaleString()} items`, 50, 138);
      doc.text(`Dominant Waste Category: ${stats.kpis.mostFrequentCategory}`, 50, 153);
      doc.text(`Average Vision Confidence: ${stats.kpis.avgConfidence}%`, 50, 168);
      doc.text(`Estimated Carbon Offset: ${stats.kpis.co2SavedKg.toLocaleString()} kg CO2e`, 50, 183);
      doc.text(`Visual Contamination Rate: ${stats.kpis.contamination.contaminationRate}% of recyclable items`, 50, 198);
      doc.text(`AI Feedback Agreement Rate: ${(100 - stats.kpis.aiQuality.correctionRate).toFixed(1)}% (${stats.kpis.aiQuality.confirmed} confirmed)`, 50, 213);

      // 2. Category Distribution
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('2. CATEGORY STREAM BREAKDOWN', 40, 245);

      let yPos = 263;
      stats.categoryDistribution.forEach((cat) => {
        const pct = stats.percentages[cat.key] || 0;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• ${cat.name}: ${cat.value} items (${pct}%)`, 50, yPos);
        yPos += 15;
      });

      // 3. Contamination & AI Quality
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('3. QUALITY & CONTAMINATION SUMMARY', 40, yPos);

      yPos += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Clean / No Obvious Contamination: ${stats.kpis.contamination.cleanCount} items`, 50, yPos);
      yPos += 15;
      doc.text(`• Possible Contamination Flagged: ${stats.kpis.contamination.contaminatedCount} items (${stats.kpis.contamination.contaminationRate}%)`, 50, yPos);
      yPos += 15;
      doc.text(`• User Corrections Recorded: ${stats.kpis.aiQuality.corrected} items (Highest in: ${stats.kpis.aiQuality.mostCorrectedCategory})`, 50, yPos);

      // 4. Strategic Recommendations
      yPos += 25;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('4. STRATEGIC RECOMMENDATIONS', 40, yPos);

      yPos += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const recommendations = [
        `1. Pre-Rinse Educational Campaign: ${stats.kpis.contamination.contaminationRate}% of items exhibit food residue. Community rinse guides will decrease sorting downtime.`,
        `2. Focus on ${stats.kpis.mostFrequentCategory}: As the dominant stream, optimize baling and container pickup schedules.`,
        `3. E-Waste & Hazardous Kiosks: Ensure clear digital bin guides for battery & electronics drop-off to keep toxic chemicals out of standard landfill streams.`
      ];

      recommendations.forEach(r => {
        const splitText = doc.splitTextToSize(r, 490);
        doc.text(splitText, 50, yPos);
        yPos += (splitText.length * 14) + 4;
      });

      // Save PDF
      doc.save(`smart_waste_report_${now.toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Smart Waste Analysis Report
              </h3>
              <p className="text-xs text-slate-400">
                Official facility segregation audit & recycling summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div ref={reportRef} className="p-6 sm:p-8 space-y-6 overflow-y-auto text-sm text-slate-700 dark:text-slate-300">
          
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                SMART WASTE SEGREGATION
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                WASTE ANALYSIS & COMPLIANCE REPORT
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Facility ID: MRF-NORTH-BAY-04 • Automated Computer Vision Inspection
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-slate-400">Generated on:</span>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs">{dateFormatted}</p>
            </div>
          </div>

          {/* 1. Overview Grid */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              1. Executive Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Scans</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{stats.kpis.totalScans.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Dominant Stream</span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 truncate">{stats.kpis.mostFrequentCategory}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Confidence</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{stats.kpis.avgConfidence}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimated CO₂ Saved</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">{stats.kpis.co2SavedKg.toLocaleString()} kg</p>
              </div>
            </div>
          </div>

          {/* 2. Category Distribution Table */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              2. Material Stream Distribution
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Waste Stream</th>
                    <th className="py-2.5 px-4">Detected Units</th>
                    <th className="py-2.5 px-4">Proportion %</th>
                    <th className="py-2.5 px-4">Primary Disposition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {stats.categoryDistribution.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono">{item.value}</td>
                      <td className="py-2.5 px-4 font-bold">{stats.percentages[item.key] || 0}%</td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {item.key === 'organic' ? 'Composting' : item.key === 'e_waste' || item.key === 'battery' ? 'Specialized Drop-off' : 'Mechanical Recycling'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Contamination & AI Quality Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Contamination Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Visual Contamination Summary
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">No Obvious Contamination:</span>
                  <span className="font-bold text-emerald-600">{stats.kpis.contamination.cleanCount} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Possible Contamination Flagged:</span>
                  <span className="font-bold text-amber-600">{stats.kpis.contamination.contaminatedCount} items</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold">Contamination Rate:</span>
                  <span className="font-black text-slate-900 dark:text-white">{stats.kpis.contamination.contaminationRate}%</span>
                </div>
              </div>
            </div>

            {/* AI Classification Quality */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                AI Classification Quality Metrics
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">User Confirmed Predictions:</span>
                  <span className="font-bold text-emerald-600">{stats.kpis.aiQuality.confirmed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User Corrected Predictions:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{stats.kpis.aiQuality.corrected}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold">Correction Rate / Most Corrected:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {stats.kpis.aiQuality.correctionRate}% ({stats.kpis.aiQuality.mostCorrectedCategory})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Strategic Recommendations */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Actionable Strategic Recommendations</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">1.</span>
                <span>
                  <strong>Target Pre-Rinse Campaigns:</strong> Contamination was observed in {stats.kpis.contamination.contaminationRate}% of items. Placing clear material stream guides and pre-rinse notices on collection containers will reduce sorting stoppage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">2.</span>
                <span>
                  <strong>Optimize {stats.kpis.mostFrequentCategory} Logistics:</strong> Because {stats.kpis.mostFrequentCategory} is the dominant material stream, increase baling storage capacity to prevent bottlenecking at the MRF.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">3.</span>
                <span>
                  <strong>Specialized Drop-Off Expansion:</strong> Ensure local drop-off kiosks for E-Waste and Batteries remain accessible to avoid lithium-ion fire risks in standard recycling trucks.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
