const INITIAL_DB = {
  inventory: [
    { id: "RM-LEAD", name: "Lead Alloy", code: "LA-001", category: "RAW_MATERIAL", supplier: "Global Metals", batch: "GM-001", qty: 25000, reservedQty: 0, minStock: 2000, reorderLevel: 5000, warehouse: "Raw Hub", rack: "L1", grn: "GRN-R-01", date: "2024-05-01", price: 180, unit: "Kg", qcStatus: "APPROVED" },
    { id: "RM-OXIDE", name: "Lead Oxide", code: "LO-002", category: "RAW_MATERIAL", supplier: "Global Metals", batch: "GM-002", qty: 12000, reservedQty: 0, minStock: 1000, reorderLevel: 2500, warehouse: "Raw Hub", rack: "L2", grn: "GRN-R-02", date: "2024-05-01", price: 210, unit: "Kg", qcStatus: "APPROVED" },
    { id: "RM-ACID", name: "Sulfuric Acid", code: "SA-092", category: "RAW_MATERIAL", supplier: "Chemical Ltd", batch: "CH-92", qty: 10000, reservedQty: 0, minStock: 800, reorderLevel: 1500, warehouse: "Raw Hub", rack: "A1", grn: "GRN-R-03", date: "2024-05-02", price: 45, unit: "Ltr", qcStatus: "APPROVED" },
    { id: "RM-SEP-PE", name: "Separator (PE)", code: "SPE-01", category: "RAW_MATERIAL", supplier: "PlateTech", batch: "PT-01", qty: 15000, reservedQty: 0, minStock: 1000, reorderLevel: 3000, warehouse: "Raw Hub", rack: "S1", grn: "GRN-R-04", date: "2024-05-03", price: 8, unit: "Pcs", qcStatus: "APPROVED" },
    { id: "RM-CELLS", name: "Lithium Cells (3.7V 3Ah)", code: "CELL-3.7", category: "Cells", supplier: "Energy Plus", batch: "EP-2024", qty: 50000, reservedQty: 0, minStock: 5000, reorderLevel: 10000, warehouse: "Raw Hub", rack: "C1", grn: "GRN-R-14", date: "2024-05-18", price: 250, unit: "Pcs", qcStatus: "APPROVED" },
    { id: "RM-BMS-72V", name: "Smart BMS (72V 50A)", code: "BMS-72S", category: "Electronics", supplier: "TechCircuit", batch: "TC-72", qty: 1000, reservedQty: 0, minStock: 50, reorderLevel: 100, warehouse: "Raw Hub", rack: "B1", grn: "GRN-R-15", date: "2024-05-18", price: 2500, unit: "Pcs", qcStatus: "APPROVED" },
  ],
  gradedInventory: [
    { id: "g1", serial: "CELL-A-001", name: "3.2V 102Ah", supplier: "Energy Plus", grade: "A", voltage: 3.32, ir: 6.2, capacity: 6100, cycleCount: 0, temp: 24.5, date: "2024-05-18", engineer: "Suresh P.", usage: "Premium Products" },
    { id: "g2", serial: "CELL-B-002", name: "3.2V 102Ah", supplier: "Energy Plus", grade: "B", voltage: 3.28, ir: 7.1, capacity: 5800, cycleCount: 0, temp: 25.0, date: "2024-05-18", engineer: "Suresh P.", usage: "Economy Products" },
  ],
  wipInventory: [
    { id: "wip-01", name: "Cell Pack Assembly", type: "Semi-Finished", qty: 12, stage: "WELDING", lastUpdate: "2024-05-18", components: [{ matId: "RM-CELLS", qty: 2400 }] },
    { id: "wip-02", name: "BMS Mounted Pack", type: "Semi-Finished", qty: 5, stage: "BMS_MOUNTING", lastUpdate: "2024-05-18", components: [{ matId: "RM-CELLS", qty: 1000 }, { matId: "RM-BMS-72V", qty: 5 }] },
  ],
  wipStages: ["WELDING", "BMS_MOUNTING", "TESTING", "CASING", "GRADING", "QUALITY_CHECK"],
  processingLogs: [] as any[],
  production: [] as any[],
  productionPlans: [] as any[],
  finishedGoods: [
    { id: "fg1", model: "72V30A", serial: "ARC-72V30A-2024-000101", batch: "BATCH-A1", warehouse: "Ahmedabad Warehouse", rack: "BIN-01", date: "2024-05-10", status: "READY" },
    { id: "fg2", model: "72V30A", serial: "ARC-72V30A-2024-000102", batch: "BATCH-A1", warehouse: "Main Warehouse", rack: "BIN-01", date: "2024-05-11", status: "READY" },
    { id: "fg3", model: "72V30A", serial: "ARC-72V30A-2024-000103", batch: "BATCH-A1", warehouse: "Main Warehouse", rack: "BIN-10", date: "2024-05-12", status: "HOLD" },
    { id: "fg4", model: "72V30A", serial: "ARC-72V30A-2024-000104", batch: "BATCH-A2", warehouse: "Ahmedabad Warehouse", rack: "BIN-15", date: "2024-05-13", status: "DAMAGED" },
    { id: "fg5", model: "72V30A", serial: "ARC-72V30A-2024-000105", batch: "BATCH-A2", warehouse: "Service Warehouse", rack: "S-01", date: "2024-05-14", status: "RETURNED" },
    { id: "fg6", model: "BAT-AUTO-35", serial: "ARC-AUTO-2024-112233", batch: "BATCH-B1", warehouse: "Main Warehouse", rack: "BIN-05", date: "2024-05-15", status: "DISPATCH_READY" },
    { id: "fg7", model: "BAT-INV-150", serial: "ARC-INV-2024-445566", batch: "BATCH-C1", warehouse: "Main Warehouse", rack: "BIN-06", date: "2024-05-16", status: "READY" },
    { id: "fg8", model: "BAT-VRLA-100", serial: "ARC-VRLA-2024-778899", batch: "BATCH-D1", warehouse: "Ahmedabad Warehouse", rack: "BIN-20", date: "2024-05-17", status: "READY" },
  ],
  productionHistory: [
    { id: "ph1", model: "72V30A", qty: 2, serials: ["ARC-72V30A-2024-000101", "ARC-72V30A-2024-000102"], date: "2024-05-10", status: "COMPLETED" }
  ],
  warehouses: ["Main Warehouse", "Ahmedabad Warehouse", "Dealer Warehouse", "Service Warehouse", "Raw Hub"],
  notifications: [
    { id: "n1", type: "FOLLOW_UP", title: "Upcoming Follow-up", message: "Dealer: Green Motors Ahmedabad at 11:00 AM", date: new Date().toISOString(), status: "UNREAD", channel: "WHATSAPP" },
    { id: "n2", type: "LOW_STOCK", title: "Low Stock Alert: Cells", message: "Current stock: 450 units. Reorder point: 1000.", date: new Date().toISOString(), status: "UNREAD", channel: "SYSTEM" }
  ],
  leads: [
    { id: "l1", company: "Green Motors Ahmedabad", category: "Dealer", location: "Ahmedabad, GJ", contactPerson: "Rajesh Shah", phone: "9876543210", leadSource: "Website", requirement: "72V Battery Packs x 50", status: "QUOTATION_SENT", followUpDate: "2024-05-20", followUpTime: "11:00", notes: "Negotiating on bulk discount." },
    { id: "l2", company: "EV Solutions Delhi", category: "Distributor", location: "New Delhi, DL", contactPerson: "Aman Varma", phone: "9123456789", leadSource: "Exhibition", requirement: "Li-ion Cells Bulk Purchase", status: "INTERESTED", followUpDate: "2024-05-18", followUpTime: "15:30", notes: "Interested in the new smart BMS feature." },
  ],
  dealers: [
    { id: "D-101", company: "Elite Power Ahmedabad", category: "Tier 1 Dealer", gstin: "24AAAAA0000A1Z5", phone: "9988776655", email: "contact@elitepower.com", location: "Navrangpura", city: "Ahmedabad", state: "Gujarat", region: "West", contactPerson: "Amit Mehta", status: "ACTIVE", bankDetails: "HDFC A/C: 50100234...", rankingScore: 92, joinDate: "2023-01-15" },
    { id: "D-102", company: "Spark EV Rajkot", category: "Certified Service Center", gstin: "24BBBBB1111B1Z2", phone: "9900112233", email: "info@sparkev.in", location: "Metoda GIDC", city: "Rajkot", state: "Gujarat", region: "West", contactPerson: "Suresh Bhai", status: "ACTIVE", bankDetails: "ICICI A/C: 0023101...", rankingScore: 85, joinDate: "2023-03-20" },
    { id: "D-103", company: "Metro Batteries Delhi", category: "Tier 1 Dealer", gstin: "07AAAAA0000A1Z5", phone: "9811223344", email: "delhi@metro.com", location: "Okhla Industrial Area", city: "New Delhi", state: "Delhi", region: "North", contactPerson: "Vikram Singh", status: "ACTIVE", bankDetails: "SBI A/C: 334455...", rankingScore: 78, joinDate: "2023-06-10" },
    { id: "D-104", company: "South Solar Chennai", category: "Tier 2 Dealer", gstin: "33AAAAA0000A1Z5", phone: "9844556677", email: "sales@southsolar.com", location: "Adyar", city: "Chennai", state: "Tamil Nadu", region: "South", contactPerson: "Karthik R.", status: "ACTIVE", bankDetails: "Axis A/C: 998877...", rankingScore: 88, joinDate: "2023-02-05" },
    { id: "D-105", company: "East Energy Kolkata", category: "Distributor", gstin: "19AAAAA0000A1Z5", phone: "9833445566", email: "info@eastenergy.com", location: "Salt Lake", city: "Kolkata", state: "West Bengal", region: "East", contactPerson: "Pranab M.", status: "ACTIVE", bankDetails: "HDFC A/C: 112233...", rankingScore: 72, joinDate: "2023-11-25" },
  ],
  engagement: {
    stats: {
      activeAppUsers: 4280,
      qrScans30d: 12450,
      claimRequests: 142,
      avgRating: 4.8
    },
    funnel: [
      { label: "Unique QR Scans", value: 45200, percentage: 100 },
      { label: "App Download", value: 32400, percentage: 71 },
      { label: "Product Registration", value: 28800, percentage: 63 },
      { label: "Recurring Engagement", value: 12100, percentage: 26 }
    ],
    recentScans: [
      { id: "s1", model: "BAT-INV-150", user: "Ravi K.", location: "Mumbai", time: "2 mins ago" },
      { id: "s2", model: "BAT-AUTO-35", user: "Anonymous", location: "Pune", time: "5 mins ago" },
      { id: "s3", model: "BAT-VRLA-100", user: "Sonal S.", location: "Delhi", time: "12 mins ago" }
    ]
  },
  invoices: [
    { id: "INV-1001", date: "2024-05-12", dealerId: "l1", items: [{ model: "72V30A", qty: 1, serials: ["ARC-72V30A-2024-000101"], price: 35000 }], total: 41300, status: "PAID", tax: 6300 },
    { id: "INV-1002", date: "2024-05-13", dealerId: "D-101", items: [{ model: "BAT-INV-150", qty: 5, serials: [], price: 18500 }], total: 109150, status: "UNPAID", tax: 16650 },
    { id: "INV-1003", date: "2024-05-14", dealerId: "D-102", items: [{ model: "72V30A", qty: 10, serials: [], price: 45000 }], total: 531000, status: "UNPAID", tax: 81000 },
    { id: "INV-1004", date: "2024-05-15", dealerId: "l1", items: [{ model: "BAT-AUTO-35", qty: 20, serials: [], price: 4500 }], total: 106200, status: "PAID", tax: 16200 },
  ],
  warranty: [
    { id: "w1", serial: "ARC-72V30A-2024-000101", dealerId: "l1", startDate: "2024-05-12", durationMonths: 36, status: "ACTIVE", history: [] },
    { id: "w2", serial: "ARC-72V30A-2024-000102", dealerId: "l1", startDate: "2024-05-12", durationMonths: 36, status: "ACTIVE", history: [] },
  ],
  complaints: [
    { id: "C-1001", serial: "ARC-72V30A-2024-000101", type: "Low Range", stage: "CLOSED", status: "RESOLVED", date: "2024-05-10", resolvedDate: "2024-05-14", notes: "BMS firmware updated.", rootCause: "BMS Failure", engineer: "Suresh P.", inspectionResult: "Firmware drift detected" },
    { id: "C-1002", serial: "ARC-72V30A-2024-000102", type: "Dead on Arrival", stage: "REGISTERED", status: "OPEN", date: "2024-05-15", resolvedDate: "", notes: "Unit not turning on.", engineer: "Unassigned" },
    { id: "C-1003", serial: "ARC-72V30A-2024-000103", type: "Voltage Drop", stage: "UNDER_INSPECTION", status: "OPEN", date: "2024-05-16", resolvedDate: "", notes: "Sudden power cut.", engineer: "Ramesh K." },
    { id: "C-1004", serial: "ARC-AUTO-2024-112233", type: "No Backup", stage: "READY_FOR_DISPATCH", status: "OPEN", date: "2024-05-14", resolvedDate: "", notes: "Aging cells.", engineer: "Suresh P.", rootCause: "Cell Failure" },
    { id: "C-1005", serial: "ARC-INV-2024-445566", type: "High Temp", stage: "REPAIR_STARTED", status: "OPEN", date: "2024-05-12", resolvedDate: "", notes: "Fan not working.", engineer: "Anita D." },
    { id: "C-1006", serial: "OLD-GEN-BATT-9900", type: "Water Damage", stage: "CLOSED", status: "RESOLVED", date: "2024-05-08", resolvedDate: "2024-05-11", notes: "Seal leaked.", engineer: "Ramesh K.", rootCause: "Water Damage" },
  ],
  engineers: [
    { id: "E1", name: "Suresh P.", casesSolved: 42, avgTat: 3.2, rating: 4.8 },
    { id: "E2", name: "Ramesh K.", casesSolved: 38, avgTat: 4.1, rating: 4.5 },
    { id: "E3", name: "Anita D.", casesSolved: 25, avgTat: 3.8, rating: 4.9 },
    { id: "E4", name: "Vikram R.", casesSolved: 12, avgTat: 5.5, rating: 4.2 },
  ],
  serviceStages: [
    "REGISTERED", "RECEIVED", "UNDER_INSPECTION", "REPAIR_STARTED", "WAITING_FOR_PARTS", "TESTING", "QC_PASSED", "READY_FOR_DISPATCH", "DELIVERED", "CLOSED"
  ],
  failureCategories: ["Cell Failure", "BMS Failure", "Charger Failure", "Water Damage", "Voltage Drop"],
  products: [
    {
      id: "72V30A",
      name: "E-Rickshaw Batteries",
      category: "CATEGORY 1 — EV BATTERY INVENTORY",
      type: "EV Battery Pack",
      price: 45000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 200, unit: "Pcs", wastage: 1, subBom: [
          { name: "Cathode Active Material", qty: 0.5, unit: "kg" },
          { name: "Anode Active Material", qty: 0.3, unit: "kg" },
          { name: "Electrolyte", qty: 0.1, unit: "L" },
          { name: "Separator", qty: 2, unit: "m2" }
        ]},
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "BAT-AUTO-35",
      name: "Scooter Batteries",
      category: "CATEGORY 1 — EV BATTERY INVENTORY",
      type: "EV Battery Pack",
      price: 32000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 150, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-EV-BIKE",
      name: "Bike Batteries",
      category: "CATEGORY 1 — EV BATTERY INVENTORY",
      type: "EV Battery Pack",
      price: 38000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 180, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "BAT-VRLA-100",
      name: "12V 100Ah",
      category: "CATEGORY 2 — SOLAR / INVERTER BATTERY INVENTORY",
      type: "Solar Battery",
      price: 14000,
      bom: [
        { matId: "RM-LEAD", name: "Lead Calcium Alloy", qty: 14.00, unit: "Kg", wastage: 2 },
        { matId: "RM-OXIDE", name: "Lead Oxide", qty: 5.00, unit: "Kg", wastage: 2 },
        { matId: "RM-ACID", name: "Sulfuric Acid", qty: 4.20, unit: "Ltr", wastage: 1 }
      ]
    },
    {
      id: "BAT-INV-150",
      name: "24V 150Ah",
      category: "CATEGORY 2 — SOLAR / INVERTER BATTERY INVENTORY",
      type: "Tubular Battery",
      price: 18500,
      bom: [
        { matId: "RM-LEAD", name: "Lead Alloy", qty: 18.00, unit: "Kg", wastage: 2 },
        { matId: "RM-OXIDE", name: "Lead Oxide", qty: 6.50, unit: "Kg", wastage: 2 },
        { matId: "RM-ACID", name: "Sulfuric Acid", qty: 5.50, unit: "Ltr", wastage: 1 }
      ]
    },
    {
      id: "PROD-SOLAR-48VESS",
      name: "48V ESS Packs",
      category: "CATEGORY 2 — SOLAR / INVERTER BATTERY INVENTORY",
      type: "ESS Battery Pack",
      price: 75000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 320, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ESS-TELECOM",
      name: "Telecom Batteries",
      category: "CATEGORY 3 — ESS / INDUSTRIAL BATTERY INVENTORY",
      type: "Industrial Pack",
      price: 85000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 400, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 2, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ESS-RACK",
      name: "Rack ESS",
      category: "CATEGORY 3 — ESS / INDUSTRIAL BATTERY INVENTORY",
      type: "Industrial Pack",
      price: 120000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 500, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 2, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ESS-UPS",
      name: "Industrial UPS",
      category: "CATEGORY 3 — ESS / INDUSTRIAL BATTERY INVENTORY",
      type: "Industrial Pack",
      price: 150000,
      bom: [
        { matId: "RM-CELLS", name: "Lithium Cells", qty: 600, unit: "Pcs", wastage: 1 },
        { matId: "RM-BMS-72V", name: "BMS", qty: 3, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ACC-CHARGER",
      name: "Chargers",
      category: "CATEGORY 4 — ACCESSORIES INVENTORY",
      type: "Accessory",
      price: 3500,
      bom: [
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ACC-BMS",
      name: "BMS",
      category: "CATEGORY 4 — ACCESSORIES INVENTORY",
      type: "Accessory",
      price: 2500,
      bom: [
        { matId: "RM-BMS-72V", name: "BMS", qty: 1, unit: "Pcs", wastage: 0 }
      ]
    },
    {
      id: "PROD-ACC-CONNECTOR",
      name: "Connectors",
      category: "CATEGORY 4 — ACCESSORIES INVENTORY",
      type: "Accessory",
      price: 500,
      bom: []
    },
    {
      id: "PROD-ACC-ADAPTER",
      name: "Adapters",
      category: "CATEGORY 4 — ACCESSORIES INVENTORY",
      type: "Accessory",
      price: 1200,
      bom: []
    }
  ],
  productCategories: [
    "CATEGORY 1 — EV BATTERY INVENTORY",
    "CATEGORY 2 — SOLAR / INVERTER BATTERY INVENTORY",
    "CATEGORY 3 — ESS / INDUSTRIAL BATTERY INVENTORY",
    "CATEGORY 4 — ACCESSORIES INVENTORY"
  ],
  businessProfile: {
    companyName: "Arcenol Energy Solutions Private Limited",
    shortName: "ARCENOL",
    establishedYear: "2018",
    industrySector: "B2B Energy Storage & Power Infrastructure",
    contactEmail: "ops-admin@arcenol.com",
    phone: "+91 79 4028 9200",
    website: "www.arcenol.com",
    cin: "U31900GJ2018PTC102145",
    gstin: "24AAHCA9192M1ZP",
    address: "Arcenol Tower, Block G, GIDC Electron City, Gandhinagar, Gujarat - 382025",
    manufacturingCapacity: "12,000 MWh / Year",
    leadAcidOutput: "260,000 Metric Tons / Year",
    depotsCount: 5,
    primaryRegion: "WEST_SOUTH",
    complianceOfficer: "Dr. Ananya Sharma, Ph.D.",
    nodePassphrase: "ARC-NODE-SECURE",
    logo: ""
  }
};

function getLocalDB() {
  if (typeof window === 'undefined') return INITIAL_DB;
  const stored = localStorage.getItem('arcenol_db');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.wipStages) {
        parsed.wipStages = ["WELDING", "BMS_MOUNTING", "TESTING", "CASING", "GRADING", "QUALITY_CHECK"];
        localStorage.setItem('arcenol_db', JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error("Error reading arcenol_db from localstorage, resetting:", e);
    }
  }
  localStorage.setItem('arcenol_db', JSON.stringify(INITIAL_DB));
  return INITIAL_DB;
}

function saveLocalDB(db: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('arcenol_db', JSON.stringify(db));
}

async function handleMockRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const db = getLocalDB();
  const options = init || {};
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : null;

  let responseData: any = { success: true };
  let status = 200;

  try {
    if (urlStr.includes('/api/data')) {
      responseData = db;
    } else if (urlStr.includes('/api/business-profile')) {
      if (method === 'GET') {
        responseData = db.businessProfile;
      } else {
        db.businessProfile = { ...db.businessProfile, ...body };
        saveLocalDB(db);
        responseData = db.businessProfile;
      }
    } else if (urlStr.includes('/api/notifications/clear')) {
      db.notifications = db.notifications.map((n: any) => ({ ...n, status: 'READ' }));
      saveLocalDB(db);
    } else if (urlStr.includes('/api/leads/convert/')) {
      const id = urlStr.split('/api/leads/convert/')[1];
      const lead = db.leads.find((l: any) => l.id === id);
      if (lead) {
        lead.status = 'CONVERTED';
        const dealerId = `D-${Date.now()}`;
        db.dealers.push({
          id: dealerId,
          company: lead.company,
          category: 'Tier 1 Dealer',
          gstin: '24GSTIN' + Math.floor(100000 + Math.random() * 900000) + 'A1Z5',
          phone: lead.phone,
          email: `${lead.contactPerson.toLowerCase().replace(/\s+/g, '')}@${lead.company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          location: lead.location,
          city: lead.location.split(',')[0] || lead.location,
          state: lead.location.split(',')[1]?.trim() || 'Gujarat',
          region: 'West',
          contactPerson: lead.contactPerson,
          status: 'ACTIVE',
          bankDetails: 'N/A',
          rankingScore: 80,
          joinDate: new Date().toISOString().split('T')[0]
        });
        saveLocalDB(db);
      }
    } else if (urlStr.includes('/api/leads/')) {
      const id = urlStr.split('/api/leads/')[1];
      if (method === 'DELETE') {
        db.leads = db.leads.filter((l: any) => l.id !== id);
      } else if (method === 'PUT' && body) {
        db.leads = db.leads.map((l: any) => l.id === id ? { ...l, ...body } : l);
      }
      saveLocalDB(db);
    } else if (urlStr.includes('/api/leads')) {
      if (method === 'POST' && body) {
        const newLead = { ...body, id: `l-${Date.now()}` };
        db.leads.push(newLead);
        saveLocalDB(db);
        responseData = newLead;
      }
    } else if (urlStr.includes('/api/dealers/')) {
      const id = urlStr.split('/api/dealers/')[1];
      if (method === 'DELETE') {
        db.dealers = db.dealers.filter((d: any) => d.id !== id);
      } else if (method === 'PUT' && body) {
        db.dealers = db.dealers.map((d: any) => d.id === id ? { ...d, ...body } : d);
      }
      saveLocalDB(db);
    } else if (urlStr.includes('/api/dealers')) {
      if (method === 'POST' && body) {
        const newDealer = { 
          ...body, 
          id: `D-${Date.now()}`,
          rankingScore: 75,
          joinDate: new Date().toISOString().split('T')[0]
        };
        db.dealers.push(newDealer);
        saveLocalDB(db);
        responseData = newDealer;
      }
    } else if (urlStr.includes('/api/invoices')) {
      if (method === 'POST' && body) {
        const total = body.items.reduce((acc: number, item: any) => acc + (item.qty * item.price), 0);
        const newInvoice = {
          id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          dealerId: body.dealerId,
          items: body.items,
          total: total,
          status: 'UNPAID',
          tax: Math.round(total * 0.18)
        };
        db.invoices.push(newInvoice);
        saveLocalDB(db);
        responseData = newInvoice;
      }
    } else if (urlStr.includes('/api/inventory/bulk-reorder')) {
      if (method === 'POST' && body) {
        const { orders } = body;
        let updatedCount = 0;
        if (orders && Array.isArray(orders)) {
          orders.forEach((ord: any) => {
            const item = db.inventory.find((i: any) => i.id === ord.id);
            if (item) {
              item.qty += Number(ord.reorderQty || 0);
              updatedCount++;
            }
          });
        }
        if (!db.notifications) db.notifications = [];
        db.notifications.push({
          id: `n-${Date.now()}`,
          type: "BULK_REORDER",
          title: "Bulk Reorder Dispatched",
          message: `Authorized replenishment of ${updatedCount} low-stock material nodes. Raw ledger balances adjusted.`,
          date: new Date().toISOString(),
          status: "UNREAD",
          channel: "SYSTEM"
        });
        saveLocalDB(db);
        responseData = { success: true, updatedItemsCount: updatedCount };
      }
    } else if (urlStr.includes('/api/inventory/')) {
      const id = urlStr.split('/api/inventory/')[1];
      if (method === 'DELETE') {
        const index = db.inventory.findIndex((i: any) => i.id === id);
        if (index !== -1) {
          db.inventory.splice(index, 1);
          saveLocalDB(db);
          responseData = { success: true };
        } else {
          responseData = { error: "NOT_FOUND" };
        }
      }
    } else if (urlStr.includes('/api/inventory')) {
      if (method === 'POST' && body) {
        const { existingItemId, name, code, category, supplier, batch, qty, minStock, reorderLevel, warehouse, rack, grn, price, unit } = body;
        let item: any;
        if (existingItemId) {
          item = db.inventory.find((i: any) => i.id === existingItemId);
          if (item) {
            item.qty += Number(qty || 0);
            if (supplier) item.supplier = supplier;
            if (batch) item.batch = batch;
            if (grn) item.grn = grn;
            if (typeof price !== 'undefined') item.price = Number(price);
            if (warehouse) item.warehouse = warehouse;
            if (rack) item.rack = rack;
          }
        } else {
          const safeId = "RM-" + (name || Date.now().toString()).toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 15);
          item = {
            id: safeId,
            name,
            code: code || `CD-${Math.floor(100 + Math.random() * 900)}`,
            category: category || "RAW_MATERIAL",
            supplier: supplier || "Generic Supplier",
            batch: batch || `B-${Math.floor(100 + Math.random() * 900)}`,
            qty: Number(qty || 0),
            reservedQty: 0,
            minStock: Number(minStock || 100),
            reorderLevel: Number(reorderLevel || 250),
            warehouse: warehouse || "Raw Hub",
            rack: rack || "A1",
            grn: grn || `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toISOString().split('T')[0],
            price: Number(price || 0),
            unit: unit || "Kg",
            qcStatus: "APPROVED"
          };
          db.inventory.push(item);
        }

        if (item && item.qty < item.minStock) {
          db.notifications.push({
            id: `n-${Date.now()}`,
            type: "LOW_STOCK",
            title: `Low Stock Alert: ${item?.name}`,
            message: `Current inventory level for ${item?.name} is ${item?.qty}. Need reorder.`,
            date: new Date().toISOString(),
            status: "UNREAD",
            channel: "SYSTEM"
          });
        }

        saveLocalDB(db);
        responseData = item || { error: "NOT_FOUND" };
      }
    } else if (urlStr.includes('/api/complaints/')) {
      const id = urlStr.split('/api/complaints/')[1];
      if (method === 'PUT' && body) {
        db.complaints = db.complaints.map((c: any) => c.id === id ? { ...c, ...body } : c);
        saveLocalDB(db);
      }
    } else if (urlStr.includes('/api/complaints')) {
      if (method === 'POST' && body) {
        const newComplaint = {
          ...body,
          id: `C-${Math.floor(1001 + Math.random() * 8999)}`,
          status: 'OPEN',
          stage: 'REGISTERED',
          date: new Date().toISOString().split('T')[0],
          resolvedDate: '',
          engineer: 'Unassigned'
        };
        db.complaints.push(newComplaint);
        saveLocalDB(db);
        responseData = newComplaint;
      }
    } else if (urlStr.includes('/api/production/wip/stages')) {
      if (method === 'GET') {
        responseData = db.wipStages || ["WELDING", "BMS_MOUNTING", "TESTING", "CASING", "GRADING", "QUALITY_CHECK"];
      } else if (method === 'POST' && body) {
        const { stage } = body;
        if (stage) {
          const normalStage = String(stage).toUpperCase().trim().replace(/\s+/g, '_');
          if (!db.wipStages) {
            db.wipStages = ["WELDING", "BMS_MOUNTING", "TESTING", "CASING", "GRADING", "QUALITY_CHECK"];
          }
          if (!db.wipStages.includes(normalStage)) {
            db.wipStages.push(normalStage);
            saveLocalDB(db);
          }
          responseData = { success: true, stage: normalStage, stages: db.wipStages };
        }
      }
    } else if (urlStr.includes('/api/production/wip/update-stage')) {
      if (method === 'POST' && body) {
        const { wipId, stage } = body;
        const wipItem = db.wipInventory?.find((w: any) => w.id === wipId);
        if (wipItem) {
          wipItem.stage = stage;
          wipItem.lastUpdate = new Date().toISOString().split('T')[0];
          saveLocalDB(db);
          responseData = wipItem;
        } else {
          status = 404;
          responseData = { error: "NOT_FOUND", message: "WIP Process item not found" };
        }
      }
    } else if (urlStr.includes('/api/production/wip/start')) {
      if (method === 'POST' && body) {
        const { planId, name, qty, components, stage } = body;
        if (planId) {
          const plan = db.productionPlans.find((p: any) => p.id === planId);
          if (plan) {
            plan.status = 'STARTED';
            saveLocalDB(db);
            responseData = plan;
          }
        } else {
          // Deduct ingredients from raw inventory count safely 
          if (components && Array.isArray(components)) {
            components.forEach((comp: any) => {
              const invItem = db.inventory.find((i: any) => i.id === comp.matId);
              if (invItem) {
                invItem.qty = Math.max(0, invItem.qty - (comp.qty || 0));
              }
            });
          }
          const defaultStage = stage || (db.wipStages && db.wipStages[0]) || "WELDING";
          const newWip = {
            id: `wip-${Math.floor(100 + Math.random() * 899 + 100)}`,
            name: name || "Cell Pack Assembly",
            type: "Semi-Finished",
            qty: Number(qty) || 1,
            stage: defaultStage,
            lastUpdate: new Date().toISOString().split('T')[0],
            components: components || []
          };
          if (!db.wipInventory) {
            db.wipInventory = [];
          }
          db.wipInventory.push(newWip);
          saveLocalDB(db);
          responseData = newWip;
        }
      }
    } else if (urlStr.includes('/api/production/complete')) {
      if (method === 'POST' && body) {
        const { planId, warehouse, rack } = body;
        const plan = db.productionPlans.find((p: any) => p.id === planId);
        if (plan && plan.status !== 'COMPLETED') {
          // Consume items if in RESERVE mode
          if (plan.allocationMode === 'RESERVE') {
            plan.materials.forEach((reqm: any) => {
              const invItem = db.inventory.find((i: any) => i.id === reqm.matId);
              if (invItem) {
                invItem.reservedQty = Math.max(0, invItem.reservedQty - reqm.total);
                invItem.qty = Math.max(0, invItem.qty - reqm.total);
              }
            });
          }
          const serials: string[] = [];
          for (let i = 0; i < plan.qty; i++) {
            const serial = `ARC-${plan.modelId}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
            serials.push(serial);
            db.finishedGoods.push({
              id: `fg-${Date.now()}-${i}`,
              model: plan.modelId,
              serial,
              batch: `BATCH-${plan.id}`,
              warehouse: warehouse || 'Main Warehouse',
              rack: rack || 'BIN-01',
              date: new Date().toISOString().split('T')[0],
              status: "READY"
            });
          }
          plan.status = 'COMPLETED';
          db.productionHistory.push({
            id: `ph-${Date.now()}`,
            model: plan.modelId,
            qty: plan.qty,
            serials,
            date: new Date().toISOString().split('T')[0],
            status: "COMPLETED"
          });
          saveLocalDB(db);
          responseData = plan;
        }
      }
    } else if (urlStr.includes('/api/processing')) {
      if (method === 'POST' && body) {
        const { inputId, outputBatches, processingDegree } = body;
        db.processingLogs.push({
          id: `log-${Date.now()}`,
          inputId,
          outputBatches,
          processingDegree,
          timestamp: new Date().toISOString()
        });
        saveLocalDB(db);
      }
    } else if (urlStr.includes('/api/products/duplicate')) {
      if (method === 'POST' && body) {
        const { sourceId, newId, newName } = body;
        const source = db.products.find((p: any) => p.id === sourceId);
        if (source) {
          const clone = JSON.parse(JSON.stringify(source));
          clone.id = newId;
          clone.name = newName;
          db.products.push(clone);
          saveLocalDB(db);
          responseData = clone;
        }
      }
    } else if (urlStr.includes('/api/mrp/calculate')) {
      const url = new URL(urlStr, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const modelId = url.searchParams.get('modelId');
      const qty = url.searchParams.get('qty');
      const product = db.products.find((p: any) => p.id === modelId);
      if (!product) {
        status = 404;
        responseData = { error: "Product not found" };
      } else {
        const multiplier = Number(qty || 0);
        const requirements = (product.bom || []).map((item: any) => {
          const perUnit = item.qty * (1 + ((item.wastage || 0) / 100));
          const total = perUnit * multiplier;
          const invItem = db.inventory.find((i: any) => i.id === item.matId);
          return {
            ...item,
            perUnit,
            requiredTotal: total,
            available: invItem ? invItem.qty - invItem.reservedQty : 0,
            deficient: Math.max(0, total - (invItem ? invItem.qty - invItem.reservedQty : 0))
          };
        });
        responseData = { modelId, modelName: product.name, qty: multiplier, requirements };
      }
    } else if (urlStr.includes('/api/products/')) {
      const parts = urlStr.split('/api/products/');
      const id = parts[parts.length - 1];
      if (method === 'PUT' && body) {
        const index = db.products.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          db.products[index] = { ...db.products[index], ...body, id };
          saveLocalDB(db);
          responseData = db.products[index];
        } else {
          status = 404;
          responseData = { error: "Product not found" };
        }
      } else if (method === 'DELETE') {
        db.products = db.products.filter((p: any) => p.id !== id);
        saveLocalDB(db);
        responseData = { success: true };
      }
    } else if (urlStr.includes('/api/products')) {
      if (method === 'POST' && body) {
        const { id, name, category, type, price, bom } = body;
        if (db.products.find((p: any) => p.id === id)) {
          status = 400;
          responseData = { error: "Product ID already exists" };
        } else {
          const newProduct = { id, name, category: category || "Uncategorized Blueprints", type: type || "Battery", price, bom: bom || [] };
          db.products.push(newProduct);
          saveLocalDB(db);
          responseData = newProduct;
        }
      }
    } else if (urlStr.includes('/api/categories/')) {
      const parts = urlStr.split('/api/categories/');
      const name = parts[parts.length - 1];
      if (method === 'DELETE') {
        if (!db.productCategories) {
          db.productCategories = [];
        }
        const decodedName = decodeURIComponent(name);
        const idx = db.productCategories.indexOf(decodedName);
        if (idx !== -1) {
          db.productCategories.splice(idx, 1);
          db.products.forEach((p: any) => {
            if (p.category === decodedName) {
              p.category = "Uncategorized Blueprints";
            }
          });
          saveLocalDB(db);
          responseData = { success: true, categories: db.productCategories };
        } else {
          status = 404;
          responseData = { error: "Category not found" };
        }
      }
    } else if (urlStr.includes('/api/categories')) {
      if (!db.productCategories) {
        db.productCategories = [];
      }
      if (method === 'POST' && body) {
        const { name } = body;
        if (!name) {
          status = 400;
          responseData = { error: "Category name is required" };
        } else if (db.productCategories.includes(name)) {
          status = 400;
          responseData = { error: "Category already exists" };
        } else {
          db.productCategories.push(name);
          saveLocalDB(db);
          responseData = { success: true, categories: db.productCategories };
        }
      } else if (method === 'PUT' && body) {
        const { oldName, newName } = body;
        if (!oldName || !newName) {
          status = 400;
          responseData = { error: "Both old and new names are required" };
        } else {
          const idx = db.productCategories.indexOf(oldName);
          if (idx !== -1) {
            if (db.productCategories.includes(newName) && oldName !== newName) {
              status = 400;
              responseData = { error: "New category name already exists" };
            } else {
              db.productCategories[idx] = newName;
              db.products.forEach((p: any) => {
                if (p.category === oldName) {
                  p.category = newName;
                }
              });
              saveLocalDB(db);
              responseData = { success: true, categories: db.productCategories };
            }
          } else {
            status = 404;
            responseData = { error: "Category not found" };
          }
        }
      }
    } else if (urlStr.includes('/api/mrp/plan')) {
      if (method === 'POST' && body) {
        const { modelId, qty, mode } = body;
        const product = db.products.find((p: any) => p.id === modelId);
        if (product) {
          const multiplier = Number(qty);
          const requirements = product.bom.map((item: any) => ({
            ...item,
            total: item.qty * (1 + ((item.wastage || 0) / 100)) * multiplier
          }));

          // Deduct from inventory
          requirements.forEach((reqm: any) => {
            const invItem = db.inventory.find((i: any) => i.id === reqm.matId);
            if (invItem) {
              if (mode === 'CONSUME') {
                invItem.qty = Math.max(0, invItem.qty - reqm.total);
              } else {
                invItem.reservedQty += reqm.total;
              }
            }
          });

          const plan = {
            id: `PLAN-${Date.now()}`,
            modelId,
            modelName: product.name,
            qty: multiplier,
            status: mode === 'CONSUME' ? 'STARTED' : 'PLANNED',
            allocationMode: mode,
            materials: requirements,
            date: new Date().toISOString()
          };
          db.productionPlans.push(plan);
          saveLocalDB(db);
          responseData = plan;
        }
      }
    }
  } catch (error) {
    console.error("Local mock server error handling request:", error);
    status = 500;
    responseData = { error: "MOCK_SERVER_ERR", message: String(error) };
  }

  return new Response(JSON.stringify(responseData), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
// Automatically intercept standard fetches in browser environments
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  // Check if we are on a static host with NO backend server (like Vercel, Netlify, GitHub Pages)
  const isStaticHosting = 
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('surge.sh') ||
    // If the hostname is not GCP Cloud Run (*.run.app) and not local development
    (!window.location.hostname.includes('run.app') && 
     !window.location.hostname.includes('localhost') && 
     !window.location.hostname.includes('127.0.0.1') && 
     !window.location.port);

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
    if (urlStr.includes('/api/')) {
      // If on static hosting, bypass network entirely to avoid latency or HTML fallbacks (Index.html 404 overrides)
      if (isStaticHosting) {
        return await handleMockRequest(urlStr, init);
      }

      try {
        const response = await originalFetch(input, init);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && !contentType.includes('text/html')) {
          if (urlStr.includes('/api/data') && !urlStr.includes('/api/data/')) {
            try {
              const clone = response.clone();
              const data = await clone.json();
              localStorage.setItem('arcenol_db', JSON.stringify(data));
            } catch (err) {
              // Ignore json parse error of clone
            }
          }
          return response;
        }
        // If it returns an error (404, etc.) or HTML layout fallback, use client interceptor
        return await handleMockRequest(urlStr, init);
      } catch (err) {
        return await handleMockRequest(urlStr, init);
      }
    }
    return originalFetch(input, init);
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true
    });
  } catch (err) {
    console.error("Failed to redefine window.fetch with Object.defineProperty, trying on Window.prototype", err);
    try {
      Object.defineProperty(Window.prototype, 'fetch', {
        value: customFetch,
        configurable: true,
        writable: true
      });
    } catch (errProto) {
      console.error("Failed to redefine on Window.prototype too, falling back to assignment", errProto);
      try {
        (window as any).fetch = customFetch;
      } catch (errAssign) {
        console.error("Failed standard assignment, using globalThis", errAssign);
        try {
          (globalThis as any).fetch = customFetch;
        } catch (errGlobal) {
          console.error("Failed globalThis configuration", errGlobal);
        }
      }
    }
  }
}

export {};
