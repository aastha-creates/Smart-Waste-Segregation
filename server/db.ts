import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDemoScans } from './seedData.js';
import { WasteScanRecord, WasteCategory, DashboardStats } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'waste_scans.json');

class WasteDatabase {
  private scans: WasteScanRecord[] = [];
  private initialized = false;

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public init() {
    if (this.initialized) return;
    this.ensureDirectory();

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.scans = parsed;
          this.initialized = true;
          console.log(`[Database] Loaded ${this.scans.length} scans from disk.`);
          return;
        }
      } catch (err) {
        console.error('[Database] Failed to read existing data file, generating fresh demo data.', err);
      }
    }

    // Seed demo data
    this.scans = generateDemoScans();
    this.persist();
    this.initialized = true;
    console.log(`[Database] Initialized and seeded with ${this.scans.length} records.`);
  }

  private persist() {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.scans, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Error persisting data to file:', err);
    }
  }

  public getAll(options: {
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sortOrder?: 'desc' | 'asc';
  } = {}) {
    this.init();
    let result = [...this.scans];

    if (options.userId) {
      result = result.filter(s => s.user_id === options.userId);
    }

    if (options.category && options.category !== 'all') {
      result = result.filter(s => s.category?.toLowerCase() === options.category?.toLowerCase());
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(s =>
        s.item_name?.toLowerCase().includes(q) ||
        s.material?.toLowerCase().includes(q) ||
        s.recommendation?.toLowerCase().includes(q) ||
        s.reason?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
      );
    }

    if (options.startDate) {
      const start = new Date(options.startDate).getTime();
      result = result.filter(s => new Date(s.created_at).getTime() >= start);
    }

    if (options.endDate) {
      const end = new Date(options.endDate).getTime();
      result = result.filter(s => new Date(s.created_at).getTime() <= end);
    }

    // Sort by created_at desc (newest first) by default
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return options.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const total = result.length;
    const page = options.page || 1;
    const limit = options.limit || 12;
    const startIdx = (page - 1) * limit;
    const paginated = result.slice(startIdx, startIdx + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    };
  }

  public addScan(record: Omit<WasteScanRecord, 'id' | 'created_at'>): WasteScanRecord {
    this.init();
    const newRecord: WasteScanRecord = {
      ...record,
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString()
    };

    // Prepend to array
    this.scans.unshift(newRecord);
    this.persist();
    return newRecord;
  }

  public recordFeedback(scanId: string, confirmed: boolean, correction?: string): WasteScanRecord | null {
    this.init();
    const scan = this.scans.find(s => s.id === scanId);
    if (!scan) return null;

    scan.user_confirmed = confirmed;
    scan.user_correction = confirmed ? null : (correction || null);
    if (!scan.ai_prediction) {
      scan.ai_prediction = scan.category;
    }

    this.persist();
    return scan;
  }

  public deleteScan(id: string): boolean {
    this.init();
    const prevLen = this.scans.length;
    this.scans = this.scans.filter(s => s.id !== id);
    if (this.scans.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public resetDemoData() {
    this.scans = generateDemoScans();
    this.persist();
    return this.scans.length;
  }

  public getStatistics(timeRangeDays: number = 30): DashboardStats {
    this.init();
    const now = new Date();
    const cutoffTime = now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000;

    // Filter scans within selected time range for trend charts
    const timeRangeScans = this.scans.filter(s => new Date(s.created_at).getTime() >= cutoffTime);

    // Counts across all 10 categories
    const categoryCounts: Record<string, number> = {
      plastic: 0,
      paper: 0,
      metal: 0,
      organic: 0,
      glass: 0,
      e_waste: 0,
      textile: 0,
      battery: 0,
      hazardous: 0,
      other: 0,
    };

    let totalValid = 0;
    let confidenceSum = 0;

    // Feedback metrics
    let totalFeedback = 0;
    let confirmedCount = 0;
    let correctedCount = 0;
    const correctionCountsByCategory: Record<string, number> = {};

    // Contamination metrics
    let totalContaminationChecked = 0;
    let contaminatedCount = 0;
    let cleanCount = 0;

    for (const scan of this.scans) {
      if (scan.is_waste && scan.category) {
        const catKey = scan.category;
        categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
        totalValid++;
        confidenceSum += (scan.confidence || 0);

        // Contamination count for recyclable/organic streams
        if (scan.contamination_detected !== undefined) {
          totalContaminationChecked++;
          if (scan.contamination_detected) {
            contaminatedCount++;
          } else {
            cleanCount++;
          }
        }
      }

      // Feedback tracking
      if (scan.user_confirmed !== undefined && scan.user_confirmed !== null) {
        totalFeedback++;
        if (scan.user_confirmed) {
          confirmedCount++;
        } else {
          correctedCount++;
          const origCat = scan.ai_prediction || scan.category || 'other';
          correctionCountsByCategory[origCat] = (correctionCountsByCategory[origCat] || 0) + 1;
        }
      }
    }

    const totalScans = this.scans.length;
    const avgConfidence = totalValid > 0 ? (confidenceSum / totalValid) : 0;

    // Determine most frequently detected
    let mostFrequentCategory = 'plastic';
    let maxCount = -1;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentCategory = cat;
      }
    }

    // Most corrected category
    let mostCorrectedCategory = 'paper';
    let maxCorrection = -1;
    for (const [cat, count] of Object.entries(correctionCountsByCategory)) {
      if (count > maxCorrection) {
        maxCorrection = count;
        mostCorrectedCategory = cat;
      }
    }

    const correctionRate = totalFeedback > 0 ? Number(((correctedCount / totalFeedback) * 100).toFixed(1)) : 0;
    const contaminationRate = totalContaminationChecked > 0 ? Number(((contaminatedCount / totalContaminationChecked) * 100).toFixed(1)) : 0;

    // Category distribution for Donut/Pie Chart with icons & standard palette
    const categoryDistribution = [
      { name: 'Plastic', key: 'plastic', value: categoryCounts.plastic || 0, color: '#3B82F6', icon: '♻️' },
      { name: 'Paper & Cardboard', key: 'paper', value: categoryCounts.paper || 0, color: '#F59E0B', icon: '📄' },
      { name: 'Organic', key: 'organic', value: categoryCounts.organic || 0, color: '#10B981', icon: '🍃' },
      { name: 'Metal', key: 'metal', value: categoryCounts.metal || 0, color: '#64748B', icon: '🔩' },
      { name: 'Glass', key: 'glass', value: categoryCounts.glass || 0, color: '#06B6D4', icon: '🍾' },
      { name: 'E-Waste', key: 'e_waste', value: categoryCounts.e_waste || 0, color: '#8B5CF6', icon: '🔌' },
      { name: 'Textile', key: 'textile', value: categoryCounts.textile || 0, color: '#EC4899', icon: '👕' },
      { name: 'Battery', key: 'battery', value: categoryCounts.battery || 0, color: '#EAB308', icon: '🔋' },
      { name: 'Hazardous', key: 'hazardous', value: categoryCounts.hazardous || 0, color: '#EF4444', icon: '⚠️' }
    ].filter(item => item.value > 0);

    // Percentages map
    const percentages: Record<string, number> = {};
    for (const [cat, count] of Object.entries(categoryCounts)) {
      percentages[cat] = totalValid > 0 ? Math.round((count / totalValid) * 100) : 0;
    }

    // Daily waste detection aggregation (sorted by day ascending)
    const dailyMap: Record<string, {
      date: string;
      total: number;
      plastic: number;
      paper: number;
      metal: number;
      organic: number;
      glass: number;
      e_waste: number;
    }> = {};

    for (let d = timeRangeDays - 1; d >= 0; d--) {
      const targetDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const dateKey = targetDate.toISOString().split('T')[0];
      const displayDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dateKey] = {
        date: displayDate,
        total: 0,
        plastic: 0,
        paper: 0,
        metal: 0,
        organic: 0,
        glass: 0,
        e_waste: 0,
      };
    }

    for (const scan of timeRangeScans) {
      const dateKey = scan.created_at.split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].total += 1;
        const c = scan.category;
        if (c && (dailyMap[dateKey] as any)[c] !== undefined) {
          (dailyMap[dateKey] as any)[c] += 1;
        }
      }
    }

    const dailyTrend = Object.values(dailyMap);

    // Monthly aggregation
    const monthlyMap: Record<string, {
      month: string;
      total: number;
      plastic: number;
      paper: number;
      metal: number;
      organic: number;
      glass: number;
      e_waste: number;
    }> = {};

    for (const scan of this.scans) {
      const d = new Date(scan.created_at);
      const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthLabel, total: 0, plastic: 0, paper: 0, metal: 0, organic: 0, glass: 0, e_waste: 0 };
      }
      monthlyMap[monthKey].total += 1;
      const c = scan.category;
      if (c && (monthlyMap[monthKey] as any)[c] !== undefined) {
        (monthlyMap[monthKey] as any)[c] += 1;
      }
    }

    const monthlyStats = Object.keys(monthlyMap)
      .sort()
      .map(k => monthlyMap[k]);

    // Data-grounded dynamic AI insights
    const insights = [];

    if (totalScans < 5) {
      insights.push({
        id: 'ins-insufficient',
        title: 'Initial Phase Notice',
        text: 'More scan data is required to generate reliable insights.',
        type: 'info' as const,
      });
    } else {
      // 1. Most frequent category
      const topPct = percentages[mostFrequentCategory] || 0;
      const cleanTopName = mostFrequentCategory === 'e_waste' ? 'E-Waste' : mostFrequentCategory.charAt(0).toUpperCase() + mostFrequentCategory.slice(1);
      insights.push({
        id: 'ins-top-stream',
        title: `${cleanTopName} is the Dominant Waste Stream`,
        text: `${cleanTopName} represents ${topPct}% of all detected waste items over the selected operating window.`,
        type: 'primary' as const,
      });

      // 2. Contamination rate observation
      if (totalContaminationChecked > 0) {
        insights.push({
          id: 'ins-contamination',
          title: `Contamination Observed in ${contaminationRate}% of Scans`,
          text: `Possible grease, food residue or improper sorting was detected in ${contaminatedCount} of ${totalContaminationChecked} examined items. Clean pre-rinse campaigns can preserve stream quality.`,
          type: contaminationRate > 20 ? 'warning' as const : 'success' as const,
        });
      }

      // 3. E-Waste / Battery observation
      const hazardousVolume = (categoryCounts.e_waste || 0) + (categoryCounts.battery || 0) + (categoryCounts.hazardous || 0);
      if (hazardousVolume > 0) {
        const hazPct = Math.round((hazardousVolume / totalValid) * 100);
        insights.push({
          id: 'ins-special-streams',
          title: `Specialized Hazardous & E-Waste Accounts for ${hazPct}%`,
          text: `${hazardousVolume} scans involve electronics, batteries, or hazardous chemicals requiring dedicated drop-off facilities.`,
          type: 'info' as const,
        });
      }

      // 4. AI Feedback & quality
      if (totalFeedback > 0) {
        const confPct = 100 - correctionRate;
        const cleanCorrectedName = mostCorrectedCategory === 'e_waste' ? 'E-Waste' : mostCorrectedCategory.charAt(0).toUpperCase() + mostCorrectedCategory.slice(1);
        insights.push({
          id: 'ins-ai-quality',
          title: `AI Classification Accuracy at ${confPct.toFixed(1)}%`,
          text: `Users confirmed ${confirmedCount} classifications (${confPct.toFixed(1)}% agreement). Corrections were highest for ${cleanCorrectedName}.`,
          type: 'success' as const,
        });
      }
    }

    // CO2 Saved calculation
    const co2SavedKg = Math.round(
      (categoryCounts.plastic || 0) * 0.8 +
      (categoryCounts.paper || 0) * 0.6 +
      (categoryCounts.metal || 0) * 1.5 +
      (categoryCounts.organic || 0) * 0.45 +
      (categoryCounts.glass || 0) * 0.35 +
      (categoryCounts.e_waste || 0) * 2.2 +
      (categoryCounts.textile || 0) * 1.1 +
      (categoryCounts.battery || 0) * 0.95
    );

    return {
      kpis: {
        totalScans,
        plastic: categoryCounts.plastic || 0,
        paper: categoryCounts.paper || 0,
        metal: categoryCounts.metal || 0,
        organic: categoryCounts.organic || 0,
        glass: categoryCounts.glass || 0,
        e_waste: categoryCounts.e_waste || 0,
        textile: categoryCounts.textile || 0,
        battery: categoryCounts.battery || 0,
        hazardous: categoryCounts.hazardous || 0,
        other: categoryCounts.other || 0,
        mostFrequentCategory: mostFrequentCategory === 'e_waste' ? 'E-Waste' : mostFrequentCategory.charAt(0).toUpperCase() + mostFrequentCategory.slice(1),
        avgConfidence: Math.round(avgConfidence * 100),
        co2SavedKg,
        aiQuality: {
          totalFeedback,
          confirmed: confirmedCount,
          corrected: correctedCount,
          correctionRate,
          mostCorrectedCategory: mostCorrectedCategory === 'e_waste' ? 'E-Waste' : mostCorrectedCategory.charAt(0).toUpperCase() + mostCorrectedCategory.slice(1)
        },
        contamination: {
          totalChecked: totalContaminationChecked,
          contaminatedCount,
          cleanCount,
          contaminationRate
        }
      },
      percentages,
      categoryDistribution,
      dailyTrend,
      monthlyStats,
      insights
    };
  }

  public getUserStatistics(userId: string) {
    this.init();
    const userScans = this.scans.filter(s => s.user_id === userId && s.is_waste);
    const categoryCounts: Record<string, number> = {
      plastic: 0,
      paper: 0,
      metal: 0,
      organic: 0,
      glass: 0,
      e_waste: 0,
      textile: 0,
      battery: 0,
      hazardous: 0,
      other: 0,
    };

    let confidenceSum = 0;
    for (const s of userScans) {
      if (s.category && categoryCounts[s.category] !== undefined) {
        categoryCounts[s.category]++;
      }
      confidenceSum += (s.confidence || 0);
    }

    const totalScans = userScans.length;
    const avgConfidence = totalScans > 0 ? Math.round((confidenceSum / totalScans) * 100) : 0;
    const co2SavedKg = Math.round(
      (categoryCounts.plastic || 0) * 0.8 +
      (categoryCounts.paper || 0) * 0.6 +
      (categoryCounts.metal || 0) * 1.5 +
      (categoryCounts.organic || 0) * 0.45 +
      (categoryCounts.glass || 0) * 0.35 +
      (categoryCounts.e_waste || 0) * 2.2 +
      (categoryCounts.textile || 0) * 1.1 +
      (categoryCounts.battery || 0) * 0.95
    );

    // Eco badge
    let badge = 'Green Initiate';
    if (totalScans >= 30) badge = 'Zero-Waste Master';
    else if (totalScans >= 15) badge = 'Recycling Champion';
    else if (totalScans >= 5) badge = 'Eco Warrior';

    return {
      totalScans,
      categoryCounts,
      avgConfidence,
      co2SavedKg,
      badge
    };
  }
}

export const db = new WasteDatabase();
