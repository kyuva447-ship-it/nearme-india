export const OWNER_CONTACT_PHONE = process.env.OWNER_CONTACT_PHONE || '';
export const OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER || '';
export const OWNER_CONTACT_EMAIL = process.env.OWNER_CONTACT_EMAIL || 'support@nearme-india.org';
export const DEFAULT_OWNER_PIN = '748599';

export interface PageBreakdownItem {
  pageRange: string;
  departmentOrSection: string;
  lineItemsCount: number;
  billedAmount: number;
  fairBenchmarkAmount: number;
  overchargeStripped: number;
  flagReason: string;
}

export interface IrdaiRebuttalData {
  icd10Codes: string[];
  disallowedConsumablesCount: number;
  recoverableAmountInr: number;
  tpaRebuttalSummary: string;
  legalNoticeText: string;
}

export interface MultiDocAuditResult {
  status: 'success';
  bill_type: string;
  original_amount_inr: number;
  ai_audited_fair_price_inr: number;
  counter_offer_price_inr: number;
  user_savings_inr: number;
  platform_success_fee_inr: number;
  auditFeeInr: number;
  winning_provider_name: string;
  totalPagesAudited: number;
  flaggedPagesCount: number;
  totalLineItemsScanned: number;
  pageBreakdown: PageBreakdownItem[];
  irdaiRebuttal?: IrdaiRebuttalData;
  ai_audit_notes: string;
  usedLiveAI?: boolean;
}

export interface SeededMerchant {
  id: string;
  business_name: string;
  gstin: string;
  category: string;
  city: string;
  pincode: string;
  trust_score: number;
  verified: boolean;
  avg_discount_pct: number;
  phone: string;
  liveCashOrderInr?: number;
}

export interface SeededEscrowRecord {
  id: string;
  buyer_name: string;
  merchant_name: string;
  total_amount_inr: number;
  platform_fee_15_inr: number;
  merchant_payout_85_inr: number;
  msme_43bh_enabled: boolean;
  msme_43bh_fee_3pct_inr: number;
  owner_net_profit_inr: number;
  delivery_otp: string;
  refund_guarantee_hours: number;
  status:
    | 'ESCROW_LOCKED_15_85'
    | 'MILESTONE_VERIFIED'
    | 'RELEASED_TO_MERCHANT'
    | 'REFUNDED_48HR_GUARANTEE';
  created_at: string;
}

export interface ZoneWholesaleBenchmark {
  zone: string;
  pincodesCovered: number;
  hubs: string[];
  benchmarks: Array<{
    item: string;
    retailRate: string;
    nearmeWholesaleRate: string;
    savingsPct: number;
  }>;
}

export const ZONE_WHOLESALE_INDEX: ZoneWholesaleBenchmark[] = [
  {
    zone: 'South Zone (KA, TN, AP, TS, KL)',
    pincodesCovered: 4820,
    hubs: ['Bengaluru 560001', 'Hyderabad 500081', 'Chennai 600001', 'Madanapalle 517325'],
    benchmarks: [
      { item: 'ICU Bed + Ventilator Tariff / Day', retailRate: '₹24,500', nearmeWholesaleRate: '₹14,800', savingsPct: 40 },
      { item: 'ISI Drip Lateral 16mm (1000m)', retailRate: '₹14,200', nearmeWholesaleRate: '₹9,600', savingsPct: 32 },
    ],
  },
  {
    zone: 'North Zone (DL, HR, UP, PB, RJ)',
    pincodesCovered: 5140,
    hubs: ['Delhi NCR 110001', 'Gurugram 122001', 'Jaipur 302001', 'Lucknow 226001'],
    benchmarks: [
      { item: 'OPC-53 Cement (50kg Bag, Direct Rake)', retailRate: '₹435', nearmeWholesaleRate: '₹358', savingsPct: 18 },
      { item: 'Fe-550D TMT Rebar / MT', retailRate: '₹68,500', nearmeWholesaleRate: '₹57,900', savingsPct: 15 },
    ],
  },
  {
    zone: 'West Zone (MH, GJ, GA)',
    pincodesCovered: 3490,
    hubs: ['Mumbai 400002', 'Pune 411001', 'Ahmedabad 380001', 'Surat 395003'],
    benchmarks: [
      { item: '22K Hallmarked Making Charges', retailRate: '18.0%', nearmeWholesaleRate: '8.2%', savingsPct: 54 },
      { item: 'Industrial Copper Winding Wire / kg', retailRate: '₹940', nearmeWholesaleRate: '₹795', savingsPct: 15 },
    ],
  },
  {
    zone: 'East Zone (WB, OR, BR, JH)',
    pincodesCovered: 2980,
    hubs: ['Kolkata 700001', 'Bhubaneswar 751001', 'Patna 800001', 'Ranchi 834001'],
    benchmarks: [
      { item: 'Generic Cardiac / Diabetes 90-Day Rx', retailRate: '₹18,400', nearmeWholesaleRate: '₹9,800', savingsPct: 47 },
      { item: 'Cold-Storage Compressors 5TR', retailRate: '₹1,45,000', nearmeWholesaleRate: '₹1,12,000', savingsPct: 23 },
    ],
  },
  {
    zone: 'Central Zone (MP, CG)',
    pincodesCovered: 1690,
    hubs: ['Indore 452001', 'Bhopal 462001', 'Raipur 492001'],
    benchmarks: [
      { item: 'HDPE Water Mainline Pipe 90mm / m', retailRate: '₹285', nearmeWholesaleRate: '₹212', savingsPct: 26 },
      { item: 'NPPA Drug-Eluting Cardiac Stent', retailRate: '₹62,000', nearmeWholesaleRate: '₹38,233', savingsPct: 38 },
    ],
  },
  {
    zone: 'North-East Zone (AS, MN, ML, TR)',
    pincodesCovered: 1180,
    hubs: ['Guwahati 781001', 'Shillong 793001', 'Agartala 799001'],
    benchmarks: [
      { item: 'Solar Inverter 5kVA Hybrid', retailRate: '₹78,000', nearmeWholesaleRate: '₹59,500', savingsPct: 24 },
      { item: 'Full-Body MRI + Pathology Package', retailRate: '₹14,500', nearmeWholesaleRate: '₹7,900', savingsPct: 46 },
    ],
  },
];

export const SEEDED_MERCHANTS: SeededMerchant[] = [
  {
    id: 'm-blr-001',
    business_name: 'Sri Sai Multi-Specialty & Jan Aushadhi Diagnostics',
    gstin: '29AABCS1429B1ZQ',
    category: 'Medical & Diagnostics',
    city: 'Bengaluru',
    pincode: '560001',
    trust_score: 96,
    verified: true,
    avg_discount_pct: 38,
    phone: '',
    liveCashOrderInr: 42500,
  },
  {
    id: 'm-del-002',
    business_name: 'NCR Infra & TMT Cement Syndicate',
    gstin: '07AAFCN4812D1ZS',
    category: 'Construction & Wholesale BOQ',
    city: 'Delhi NCR',
    pincode: '110001',
    trust_score: 94,
    verified: true,
    avg_discount_pct: 24,
    phone: '',
    liveCashOrderInr: 185000,
  },
  {
    id: 'm-mum-003',
    business_name: 'Zaveri Verified Bullion & Jewellery Hub',
    gstin: '27AAACZ8819K1ZP',
    category: 'Gold & Bullion',
    city: 'Mumbai',
    pincode: '400002',
    trust_score: 98,
    verified: true,
    avg_discount_pct: 42,
    phone: '',
    liveCashOrderInr: 96000,
  },
  {
    id: 'm-ap-004',
    business_name: 'Madanapalle Kisan Drip & Agri Depot',
    gstin: '37AABCM9201H1ZL',
    category: 'Agri Inputs & Irrigation',
    city: 'Madanapalle',
    pincode: '517325',
    trust_score: 95,
    verified: true,
    avg_discount_pct: 29,
    phone: '',
    liveCashOrderInr: 68000,
  },
  {
    id: 'm-hyd-005',
    business_name: 'Deccan Cold-Chain & HVAC Engineering',
    gstin: '36AABCD4410M1ZS',
    category: 'AC & Industrial Cooling',
    city: 'Hyderabad',
    pincode: '500081',
    trust_score: 92,
    verified: true,
    avg_discount_pct: 34,
    phone: '',
    liveCashOrderInr: 31500,
  },
];

export const SEEDED_ESCROWS: SeededEscrowRecord[] = [];

export function validateGstinMod36(rawGstin: string): {
  gstin: string;
  syntaxValid: boolean;
  checksumValid: boolean;
} {
  const gstin = rawGstin.trim().toUpperCase();
  const syntaxValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
  if (!syntaxValid) {
    return { gstin, syntaxValid: false, checksumValid: false };
  }

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 2;
  let sum = 0;
  for (let i = 13; i >= 0; i--) {
    const codePoint = chars.indexOf(gstin[i]);
    if (codePoint === -1) return { gstin, syntaxValid: true, checksumValid: false };
    const digit = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    sum += Math.floor(digit / 36) + (digit % 36);
  }
  const checkCodePoint = (36 - (sum % 36)) % 36;
  const expectedChar = chars[checkCodePoint];
  return {
    gstin,
    syntaxValid: true,
    checksumValid: gstin[14] === expectedChar,
  };
}

export interface AuditPreset {
  id: string;
  label: string;
  badge: string;
  fileName: string;
  mimeType: string;
  pageCount: number;
  city: string;
  pincode: string;
  sampleText: string;
  simulatedResult: MultiDocAuditResult;
}

export const AUDIT_PRESETS: AuditPreset[] = [
  {
    id: 'hospital-icu-112',
    label: '112-Page Corporate Hospital & ICU Master Bill + TPA Claim File (PDF)',
    badge: '112 Pages • Hospital + IRDAI TPA',
    fileName: 'Corporate_Hospital_ICU_112Pages_TPA_Claim.pdf',
    mimeType: 'application/pdf',
    pageCount: 112,
    city: 'Bengaluru',
    pincode: '560001',
    sampleText: `MASTER INPATIENT HOSPITAL & ICU BILL + TPA CLAIM FILE (112 PAGES)
Pages 1-14: Admission, Bed & ICU Critical Care Tariff (14 Days ICU + Isolation + Unbundled RMO/Intensivist Visits) -> Total Rs 4,48,000
Pages 15-48: Inpatient Pharmacy & Surgical Consumables (720 pairs sterile gloves, infusion sets, Meropenem/Linezolid vials, PPE kits vs NPPA & Jan Aushadhi Cap) -> Total Rs 5,12,000
Pages 49-86: Diagnostics, Implants & Ventilator Charges (Repeat daily ABG/CBC/CRP, Cardiac Stent & Ventilator Circuit billed over NPPA ceiling) -> Total Rs 4,18,000
Pages 87-112: Final Settlement, ICD-10 Coding & TPA Disallowance Audit (Non-medical admin surcharges, biomedical waste, diet & record charges) -> Total Rs 1,64,000
GRAND TOTAL BILLED: Rs 15,42,000`,
    simulatedResult: {
      status: 'success',
      bill_type: '112-Page Corporate Hospital & ICU Master Bill + TPA Claim File',
      original_amount_inr: 1542000,
      ai_audited_fair_price_inr: 986500,
      counter_offer_price_inr: 986500,
      user_savings_inr: 555500,
      platform_success_fee_inr: 83325,
      auditFeeInr: 199,
      winning_provider_name: 'NearMe Med-Audit & CGHS/NPPA Institutional Benchmark',
      totalPagesAudited: 112,
      flaggedPagesCount: 84,
      totalLineItemsScanned: 1428,
      pageBreakdown: [
        {
          pageRange: 'Pages 1–14',
          departmentOrSection: 'Admission & ICU Tariff',
          lineItemsCount: 168,
          billedAmount: 448000,
          fairBenchmarkAmount: 312000,
          overchargeStripped: 136000,
          flagReason: 'Unbundled RMO/intensivist rounding & above-CGHS ICU bed tariff',
        },
        {
          pageRange: 'Pages 15–48',
          departmentOrSection: 'Pharmacy & Consumables vs NPPA/Jan Aushadhi Cap',
          lineItemsCount: 540,
          billedAmount: 512000,
          fairBenchmarkAmount: 274500,
          overchargeStripped: 237500,
          flagReason: '320% markup on sterile gloves/syringes & branded antibiotics vs Jan Aushadhi',
        },
        {
          pageRange: 'Pages 49–86',
          departmentOrSection: 'Diagnostics, Implants & Ventilator Charges',
          lineItemsCount: 486,
          billedAmount: 418000,
          fairBenchmarkAmount: 286000,
          overchargeStripped: 132000,
          flagReason: 'Duplicate daily ABG/CBC panels & stent/ventilator circuit over NPPA cap',
        },
        {
          pageRange: 'Pages 87–112',
          departmentOrSection: 'Final Settlement & Coding Audit',
          lineItemsCount: 234,
          billedAmount: 164000,
          fairBenchmarkAmount: 114000,
          overchargeStripped: 50000,
          flagReason: 'IRDAI Schedule-I non-payable admin, diet & biomedical waste surcharges',
        },
      ],
      irdaiRebuttal: {
        icd10Codes: ['J96.01 (Acute Respiratory Failure)', 'I21.4 (NSTEMI Cardiac Care)', 'A41.9 (Sepsis Monitoring)'],
        disallowedConsumablesCount: 94,
        recoverableAmountInr: 419500,
        tpaRebuttalSummary:
          'Cross-checked 112 pages against IRDAI Master Circular on Health Insurance (Non-Payable Items) & NPPA Ceiling Schedule. Reclassified 94 bundled ICU consumables as payable inpatient procedure costs.',
        legalNoticeText: `OFFICIAL IRDAI / TPA CLAIM REBUTTAL & OMBUDSMAN LEGAL NOTICE
To: Claims Head / Third-Party Administrator (TPA) & Hospital Billing Superintendent
Subject: Mandatory Reversal of Arbitrary Deductions & NPPA Overcharge Rectification (112-Page Master Bill)
ICD-10 Verified Codes: J96.01, I21.4, A41.9
Total Billed: ₹15,42,000 | Audited Fair Benchmark: ₹9,86,500 | Excess Stripped: ₹5,55,500
Grounds:
1. Per IRDAI Guidelines on Standardization in Health Insurance, routine ICU monitoring, ventilator tubing, and bundled nursing procedures cannot be arbitrarily billed separately or disallowed without item-level clinical justification.
2. Coronary stents and critical consumables exceed NPPA statutory ceiling caps across Pages 15–86.
3. Duplicate pathology panels and non-medical admin documentation surcharges (Pages 87–112) must be refunded/waived within 7 working days, failing which an Insurance Ombudsman & e-Daakhil Consumer Forum complaint will be escalated.`,
      },
      ai_audit_notes:
        'Stream-audited all 112 pages (1,428 line items) across 4 hospital departments. Stripped ₹5,55,500 in NPPA ceiling breaches, Jan Aushadhi antibiotic markups, duplicate lab panels, and IRDAI disallowed fees.',
    },
  },
  {
    id: 'delhi-cement',
    label: 'Delhi Cement & TMT BOQ',
    badge: '12 Pages • B2B Infra',
    fileName: 'Delhi_NCR_Contractor_BOQ_12Pages.pdf',
    mimeType: 'application/pdf',
    pageCount: 12,
    city: 'Delhi NCR',
    pincode: '110001',
    sampleText: `DELHI NCR CONTRACTOR BOQ (12 PAGES): 450 Bags OPC-53 Cement @ Rs 435/bag (Rs 1,95,750), 8.5 MT Fe-550D TMT Steel @ Rs 68,500/MT (Rs 5,82,250), Ready-Mix M25 & Transport Surcharge (Rs 1,42,000). Total: Rs 9,20,000`,
    simulatedResult: {
      status: 'success',
      bill_type: '12-Page Contractor Wholesale BOQ',
      original_amount_inr: 920000,
      ai_audited_fair_price_inr: 768000,
      counter_offer_price_inr: 768000,
      user_savings_inr: 152000,
      platform_success_fee_inr: 22800,
      auditFeeInr: 199,
      winning_provider_name: 'NCR Infra & TMT Cement Syndicate',
      totalPagesAudited: 12,
      flaggedPagesCount: 8,
      totalLineItemsScanned: 146,
      pageBreakdown: [
        {
          pageRange: 'Pages 1–4',
          departmentOrSection: 'OPC-53 Cement Bulk Lot',
          lineItemsCount: 42,
          billedAmount: 195750,
          fairBenchmarkAmount: 164250,
          overchargeStripped: 31500,
          flagReason: 'Retail bag rate billed instead of direct factory rake price (₹365/bag)',
        },
        {
          pageRange: 'Pages 5–9',
          departmentOrSection: 'Fe-550D TMT Rebar',
          lineItemsCount: 64,
          billedAmount: 582250,
          fairBenchmarkAmount: 493000,
          overchargeStripped: 89250,
          flagReason: 'Middleman steel trader margin of ₹10,500/MT stripped',
        },
        {
          pageRange: 'Pages 10–12',
          departmentOrSection: 'RMC & Unloading Logistics',
          lineItemsCount: 40,
          billedAmount: 142000,
          fairBenchmarkAmount: 110750,
          overchargeStripped: 31250,
          flagReason: 'Double-counted transit mixer detention & unloading surcharges',
        },
      ],
      ai_audit_notes:
        'Audited 12-page NCR contractor BOQ against primary mill dispatch prices. Saved ₹1,52,000 with direct 15/85 escrow lock.',
    },
  },
  {
    id: 'bengaluru-rx',
    label: 'Bengaluru Chronic Rx',
    badge: '4 Pages • Pharmacy',
    fileName: 'Bengaluru_Chronic_Care_Rx_Pack.pdf',
    mimeType: 'application/pdf',
    pageCount: 4,
    city: 'Bengaluru',
    pincode: '560034',
    sampleText: `BENGALURU 90-DAY CHRONIC RX PACK (4 PAGES): Cardiac & Diabetes Branded Refill Total MRP: Rs 18,400`,
    simulatedResult: {
      status: 'success',
      bill_type: '4-Page Chronic Pharmacy Prescription',
      original_amount_inr: 18400,
      ai_audited_fair_price_inr: 10250,
      counter_offer_price_inr: 10250,
      user_savings_inr: 8150,
      platform_success_fee_inr: 1223,
      auditFeeInr: 199,
      winning_provider_name: 'Sri Sai Multi-Specialty & Jan Aushadhi Diagnostics',
      totalPagesAudited: 4,
      flaggedPagesCount: 3,
      totalLineItemsScanned: 38,
      pageBreakdown: [
        {
          pageRange: 'Pages 1–2',
          departmentOrSection: 'Cardiology & Lipid Statins',
          lineItemsCount: 22,
          billedAmount: 10200,
          fairBenchmarkAmount: 5100,
          overchargeStripped: 5100,
          flagReason: 'Branded molecules matched to identical WHO-GMP Jan Aushadhi generics',
        },
        {
          pageRange: 'Pages 3–4',
          departmentOrSection: 'Diabetology & Insulin Consumables',
          lineItemsCount: 16,
          billedAmount: 8200,
          fairBenchmarkAmount: 5150,
          overchargeStripped: 3050,
          flagReason: 'Full-MRP needle/lancet pack substituted with wholesale pharmacy rate',
        },
      ],
      ai_audit_notes:
        'Matched all 4 prescription pages to equivalent WHO-GMP generic formulations and wholesale cold-chain insulin pricing.',
    },
  },
  {
    id: 'mumbai-gold',
    label: 'Mumbai Gold Making',
    badge: '3 Pages • Bullion',
    fileName: 'Zaveri_Bazaar_22K_Estimate.pdf',
    mimeType: 'application/pdf',
    pageCount: 3,
    city: 'Mumbai',
    pincode: '400002',
    sampleText: `MUMBAI 22K HALLMARKED JEWELLERY ESTIMATE (3 PAGES): 48g 22K Gold + 18% Making Charges. Total: Rs 4,39,000`,
    simulatedResult: {
      status: 'success',
      bill_type: '3-Page Jewellery & Making Charges Estimate',
      original_amount_inr: 439000,
      ai_audited_fair_price_inr: 381200,
      counter_offer_price_inr: 381200,
      user_savings_inr: 57800,
      platform_success_fee_inr: 8670,
      auditFeeInr: 199,
      winning_provider_name: 'Zaveri Verified Bullion & Jewellery Hub',
      totalPagesAudited: 3,
      flaggedPagesCount: 3,
      totalLineItemsScanned: 24,
      pageBreakdown: [
        {
          pageRange: 'Page 1',
          departmentOrSection: '22K Bullion Base Rate',
          lineItemsCount: 8,
          billedAmount: 348000,
          fairBenchmarkAmount: 339600,
          overchargeStripped: 8400,
          flagReason: 'Showroom spread ₹175/g above IBJA Mumbai spot benchmark',
        },
        {
          pageRange: 'Pages 2–3',
          departmentOrSection: 'Making Charges & Stone Deduction',
          lineItemsCount: 16,
          billedAmount: 91000,
          fairBenchmarkAmount: 41600,
          overchargeStripped: 49400,
          flagReason: '18% making + unverified wastage reduced to 8.5% Zaveri karigar cap',
        },
      ],
      ai_audit_notes:
        'Stripped ₹57,800 in inflated making charges, gold-weight stone inclusion, and showroom spot markup.',
    },
  },
  {
    id: 'madanapalle-agri',
    label: 'Madanapalle Agri Invoice',
    badge: '6 Pages • Agri & Drip',
    fileName: 'Madanapalle_Drip_Irrigation_Quote.csv',
    mimeType: 'text/csv',
    pageCount: 6,
    city: 'Madanapalle',
    pincode: '517325',
    sampleText: `MADANAPALLE DRIP IRRIGATION & FERTILIZER QUOTE (6 PAGES): Total Rs 1,48,000`,
    simulatedResult: {
      status: 'success',
      bill_type: '6-Page Agri Drip & Input Invoice',
      original_amount_inr: 148000,
      ai_audited_fair_price_inr: 109500,
      counter_offer_price_inr: 109500,
      user_savings_inr: 38500,
      platform_success_fee_inr: 5775,
      auditFeeInr: 199,
      winning_provider_name: 'Madanapalle Kisan Drip & Agri Depot',
      totalPagesAudited: 6,
      flaggedPagesCount: 5,
      totalLineItemsScanned: 62,
      pageBreakdown: [
        {
          pageRange: 'Pages 1–3',
          departmentOrSection: 'ISI Drip Laterals & HDPE Mainline',
          lineItemsCount: 34,
          billedAmount: 96000,
          fairBenchmarkAmount: 71000,
          overchargeStripped: 25000,
          flagReason: 'Priced above APMIP subsidy-eligible manufacturer rate card',
        },
        {
          pageRange: 'Pages 4–6',
          departmentOrSection: 'Water-Soluble NPK & Micronutrients',
          lineItemsCount: 28,
          billedAmount: 52000,
          fairBenchmarkAmount: 38500,
          overchargeStripped: 13500,
          flagReason: 'Retail dealer markup stripped via FPO cooperative bulk pool',
        },
      ],
      ai_audit_notes:
        'Benchmarked 6-page agri quote against APMIP schedule rates and Madanapalle FPO cooperative pricing.',
    },
  },
  {
    id: 'ecourt-builder',
    label: 'e-Court Builder Delay & Escalation',
    badge: '18 Pages • e-Court Notice',
    fileName: 'RERA_Builder_Cost_Escalation_18Pages.pdf',
    mimeType: 'application/pdf',
    pageCount: 18,
    city: 'Pune',
    pincode: '411001',
    sampleText: `BUILDER POSSESSION DELAY & ILLEGAL ESCALATION DEMAND (18 PAGES): Extra Flooring/Clubhouse/GST Escalation Demand Rs 6,40,000`,
    simulatedResult: {
      status: 'success',
      bill_type: '18-Page Builder Escalation & RERA Audit',
      original_amount_inr: 640000,
      ai_audited_fair_price_inr: 210000,
      counter_offer_price_inr: 210000,
      user_savings_inr: 430000,
      platform_success_fee_inr: 64500,
      auditFeeInr: 199,
      winning_provider_name: 'NearMe e-Court & RERA Consumer Shield',
      totalPagesAudited: 18,
      flaggedPagesCount: 14,
      totalLineItemsScanned: 192,
      pageBreakdown: [
        {
          pageRange: 'Pages 1–7',
          departmentOrSection: 'Unilateral Steel/Cement Escalation Demand',
          lineItemsCount: 84,
          billedAmount: 340000,
          fairBenchmarkAmount: 120000,
          overchargeStripped: 220000,
          flagReason: 'Violates fixed-price RERA Agreement to Sell escalation cap',
        },
        {
          pageRange: 'Pages 8–18',
          departmentOrSection: 'Parking, Society & Legal Admin Demands',
          lineItemsCount: 108,
          billedAmount: 300000,
          fairBenchmarkAmount: 90000,
          overchargeStripped: 210000,
          flagReason: 'Open parking & double-charged GST input credit disallowed under RERA/CPA 2019',
        },
      ],
      ai_audit_notes:
        'Flagged ₹4,30,000 in illegal builder escalation & open-parking charges under RERA & Consumer Protection Act 2019.',
    },
  },
];
