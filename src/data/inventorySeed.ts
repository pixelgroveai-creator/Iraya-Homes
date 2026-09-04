import { InventoryItem, InventoryDailyLog, MonthlyInventorySummary } from '../types';

export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'Dental Kit',
    unit: 'Kits',
    category: 'Toiletries',
    safetyThreshold: 15,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    name: 'Shampoo',
    unit: 'Bottles (50ml)',
    category: 'Toiletries',
    safetyThreshold: 20,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    name: 'Body wash',
    unit: 'Bottles (50ml)',
    category: 'Toiletries',
    safetyThreshold: 20,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    name: 'Towel',
    unit: 'Pcs (Plush Cotton)',
    category: 'Linen & Bedding',
    safetyThreshold: 16,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000005',
    name: 'Bedsheets',
    unit: 'Sets (King/Queen)',
    category: 'Linen & Bedding',
    safetyThreshold: 8,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000006',
    name: 'Pillow Cover',
    unit: 'Pcs',
    category: 'Linen & Bedding',
    safetyThreshold: 18,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000007',
    name: 'Bed Runner',
    unit: 'Pcs (Silk Maroon)',
    category: 'Linen & Bedding',
    safetyThreshold: 6,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000008',
    name: 'Floor Cleaner',
    unit: 'Litres',
    category: 'Cleaning Supplies',
    safetyThreshold: 6,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000009',
    name: 'Glass cleaner',
    unit: 'Bottles (500ml)',
    category: 'Cleaning Supplies',
    safetyThreshold: 4,
    createdAt: '2026-08-01T00:00:00Z'
  }
];

// Seed Daily Logs for August and September 2026
export const SEED_INVENTORY_DAILY_LOGS: InventoryDailyLog[] = [
  // --- August 30, 2026 ---
  {
    id: 'b1000000-0000-4000-8000-000000000001',
    itemId: 'a1000000-0000-4000-8000-000000000001',
    logDate: '2026-08-30',
    openingStock: 50,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 42,
    notes: 'Standard 4-suite guest checkout turnover',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000002',
    itemId: 'a1000000-0000-4000-8000-000000000002',
    logDate: '2026-08-30',
    openingStock: 45,
    addedStock: 0,
    usedCount: 6,
    remainingStock: 39,
    notes: 'Bathrooms replenishment',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000003',
    itemId: 'a1000000-0000-4000-8000-000000000003',
    logDate: '2026-08-30',
    openingStock: 40,
    addedStock: 0,
    usedCount: 6,
    remainingStock: 34,
    notes: 'Bathrooms replenishment',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000004',
    itemId: 'a1000000-0000-4000-8000-000000000004',
    logDate: '2026-08-30',
    openingStock: 32,
    addedStock: 0,
    usedCount: 12,
    remainingStock: 20,
    notes: 'Pool deck & bathroom towel exchange',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000005',
    itemId: 'a1000000-0000-4000-8000-000000000005',
    logDate: '2026-08-30',
    openingStock: 18,
    addedStock: 0,
    usedCount: 4,
    remainingStock: 14,
    notes: 'Suite 1 & Suite 2 changeover',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000006',
    itemId: 'a1000000-0000-4000-8000-000000000006',
    logDate: '2026-08-30',
    openingStock: 36,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 28,
    notes: 'Pillows dressing for all suites',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000007',
    itemId: 'a1000000-0000-4000-8000-000000000007',
    logDate: '2026-08-30',
    openingStock: 12,
    addedStock: 0,
    usedCount: 2,
    remainingStock: 10,
    notes: 'Sent to dry clean',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000008',
    itemId: 'a1000000-0000-4000-8000-000000000008',
    logDate: '2026-08-30',
    openingStock: 14,
    addedStock: 0,
    usedCount: 2,
    remainingStock: 12,
    notes: 'Lounge and hallway mopping',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000009',
    itemId: 'a1000000-0000-4000-8000-000000000009',
    logDate: '2026-08-30',
    openingStock: 8,
    addedStock: 0,
    usedCount: 1,
    remainingStock: 7,
    notes: 'Pool deck glass balustrades wipe',
    createdAt: '2026-08-30T10:00:00Z'
  },

  // --- August 31, 2026 (Restock shipment received) ---
  {
    id: 'b1000000-0000-4000-8000-000000000011',
    itemId: 'a1000000-0000-4000-8000-000000000001',
    logDate: '2026-08-31',
    openingStock: 42,
    addedStock: 25,
    usedCount: 4,
    remainingStock: 63,
    notes: 'Received fresh bulk box of 25 dental kits from supplier',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000012',
    itemId: 'a1000000-0000-4000-8000-000000000002',
    logDate: '2026-08-31',
    openingStock: 39,
    addedStock: 20,
    usedCount: 5,
    remainingStock: 54,
    notes: 'Supplier shipment',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000013',
    itemId: 'a1000000-0000-4000-8000-000000000003',
    logDate: '2026-08-31',
    openingStock: 34,
    addedStock: 20,
    usedCount: 4,
    remainingStock: 50,
    notes: 'Supplier shipment',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000014',
    itemId: 'a1000000-0000-4000-8000-000000000004',
    logDate: '2026-08-31',
    openingStock: 20,
    addedStock: 16,
    usedCount: 8,
    remainingStock: 28,
    notes: 'Returned from professional laundry service',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000015',
    itemId: 'a1000000-0000-4000-8000-000000000005',
    logDate: '2026-08-31',
    openingStock: 14,
    addedStock: 6,
    usedCount: 2,
    remainingStock: 18,
    notes: 'Laundry delivery',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000016',
    itemId: 'a1000000-0000-4000-8000-000000000006',
    logDate: '2026-08-31',
    openingStock: 28,
    addedStock: 12,
    usedCount: 6,
    remainingStock: 34,
    notes: 'Laundry delivery',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000017',
    itemId: 'a1000000-0000-4000-8000-000000000007',
    logDate: '2026-08-31',
    openingStock: 10,
    addedStock: 4,
    usedCount: 1,
    remainingStock: 13,
    notes: 'Dry cleaning returned',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000018',
    itemId: 'a1000000-0000-4000-8000-000000000008',
    logDate: '2026-08-31',
    openingStock: 12,
    addedStock: 10,
    usedCount: 2,
    remainingStock: 20,
    notes: 'Restocked 10L commercial concentrate',
    createdAt: '2026-08-31T09:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000019',
    itemId: 'a1000000-0000-4000-8000-000000000009',
    logDate: '2026-08-31',
    openingStock: 7,
    addedStock: 5,
    usedCount: 1,
    remainingStock: 11,
    notes: 'Restocked spray bottles',
    createdAt: '2026-08-31T09:30:00Z'
  },

  // --- September 01, 2026 ---
  {
    id: 'b1000000-0000-4000-8000-000000000021',
    itemId: 'a1000000-0000-4000-8000-000000000001',
    logDate: '2026-09-01',
    openingStock: 63,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 55,
    notes: 'Full villa check-in welcome kit deployment',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000022',
    itemId: 'a1000000-0000-4000-8000-000000000002',
    logDate: '2026-09-01',
    openingStock: 54,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 46,
    notes: 'Placed 2 bottles per ensuite washroom',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000023',
    itemId: 'a1000000-0000-4000-8000-000000000003',
    logDate: '2026-09-01',
    openingStock: 50,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 42,
    notes: 'Placed 2 bottles per ensuite washroom',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000024',
    itemId: 'a1000000-0000-4000-8000-000000000004',
    logDate: '2026-09-01',
    openingStock: 28,
    addedStock: 0,
    usedCount: 10,
    remainingStock: 18,
    notes: 'Pool towels basket and suite setup',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000025',
    itemId: 'a1000000-0000-4000-8000-000000000005',
    logDate: '2026-09-01',
    openingStock: 18,
    addedStock: 0,
    usedCount: 4,
    remainingStock: 14,
    notes: 'Fresh 400-TC Egyptian cotton dressed',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000026',
    itemId: 'a1000000-0000-4000-8000-000000000006',
    logDate: '2026-09-01',
    openingStock: 34,
    addedStock: 0,
    usedCount: 8,
    remainingStock: 26,
    notes: '4 double beds dressing',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000027',
    itemId: 'a1000000-0000-4000-8000-000000000007',
    logDate: '2026-09-01',
    openingStock: 13,
    addedStock: 0,
    usedCount: 4,
    remainingStock: 9,
    notes: 'Maroon runners dressed on all beds',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000028',
    itemId: 'a1000000-0000-4000-8000-000000000008',
    logDate: '2026-09-01',
    openingStock: 20,
    addedStock: 0,
    usedCount: 2,
    remainingStock: 18,
    notes: 'Entire ground & first floor deep mop',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000029',
    itemId: 'a1000000-0000-4000-8000-000000000009',
    logDate: '2026-09-01',
    openingStock: 11,
    addedStock: 0,
    usedCount: 1,
    remainingStock: 10,
    notes: 'Terrace & bathroom glass cleaning',
    createdAt: '2026-09-01T08:00:00Z'
  },

  // --- September 02, 2026 (Yesterday) ---
  {
    id: 'b1000000-0000-4000-8000-000000000031',
    itemId: 'a1000000-0000-4000-8000-000000000001',
    logDate: '2026-09-02',
    openingStock: 55,
    addedStock: 0,
    usedCount: 4,
    remainingStock: 51,
    notes: 'Mid-stay replacement requested by guests in Suite 2',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000032',
    itemId: 'a1000000-0000-4000-8000-000000000002',
    logDate: '2026-09-02',
    openingStock: 46,
    addedStock: 0,
    usedCount: 3,
    remainingStock: 43,
    notes: 'Housekeeping round refill',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000033',
    itemId: 'a1000000-0000-4000-8000-000000000003',
    logDate: '2026-09-02',
    openingStock: 42,
    addedStock: 0,
    usedCount: 3,
    remainingStock: 39,
    notes: 'Housekeeping round refill',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000034',
    itemId: 'a1000000-0000-4000-8000-000000000004',
    logDate: '2026-09-02',
    openingStock: 18,
    addedStock: 12,
    usedCount: 6,
    remainingStock: 24,
    notes: 'Received 12 clean towels from laundry; 6 extra pool towels used',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000035',
    itemId: 'a1000000-0000-4000-8000-000000000005',
    logDate: '2026-09-02',
    openingStock: 14,
    addedStock: 0,
    usedCount: 1,
    remainingStock: 13,
    notes: 'Suite 3 spill replacement',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000036',
    itemId: 'a1000000-0000-4000-8000-000000000006',
    logDate: '2026-09-02',
    openingStock: 26,
    addedStock: 0,
    usedCount: 2,
    remainingStock: 24,
    notes: 'Extra pillows requested for master suite',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000037',
    itemId: 'a1000000-0000-4000-8000-000000000007',
    logDate: '2026-09-02',
    openingStock: 9,
    addedStock: 0,
    usedCount: 0,
    remainingStock: 9,
    notes: 'No runner changes needed',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000038',
    itemId: 'a1000000-0000-4000-8000-000000000008',
    logDate: '2026-09-02',
    openingStock: 18,
    addedStock: 0,
    usedCount: 1,
    remainingStock: 17,
    notes: 'Kitchen & poolside sanitization',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'b1000000-0000-4000-8000-000000000039',
    itemId: 'a1000000-0000-4000-8000-000000000009',
    logDate: '2026-09-02',
    openingStock: 10,
    addedStock: 0,
    usedCount: 1,
    remainingStock: 9,
    notes: 'Dining table & sliding door glass wipe',
    createdAt: '2026-09-02T08:30:00Z'
  }
];

// Utility: Compute monthly summary strictly mirroring Postgres view v_monthly_inventory_summary
export function computeMonthlySummaryFromLogs(
  items: InventoryItem[],
  logs: InventoryDailyLog[],
  targetMonth: string // YYYY-MM
): MonthlyInventorySummary[] {
  // Filter logs for this month
  const monthLogs = logs.filter(l => l.logDate.startsWith(targetMonth));

  return items.map(item => {
    const itemLogs = monthLogs
      .filter(l => l.itemId === item.id)
      .sort((a, b) => a.logDate.localeCompare(b.logDate));

    const totalUsed = itemLogs.reduce((acc, cur) => acc + (cur.usedCount || 0), 0);
    const totalAdded = itemLogs.reduce((acc, cur) => acc + (cur.addedStock || 0), 0);

    // Month opening stock is earliest logged opening_stock
    const monthOpeningStock = itemLogs.length > 0 ? itemLogs[0].openingStock : 0;
    // Month closing stock is latest logged remaining_stock
    const monthClosingStock = itemLogs.length > 0 ? itemLogs[itemLogs.length - 1].remainingStock : 0;

    return {
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      summaryMonth: targetMonth,
      totalUsed,
      totalAdded,
      monthOpeningStock,
      monthClosingStock
    };
  });
}
