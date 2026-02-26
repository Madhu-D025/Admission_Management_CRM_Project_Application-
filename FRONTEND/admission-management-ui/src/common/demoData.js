
export const PURCHASE_ORDERS = [
  {
    code: "PO10001",
    vendor: "Tata Steel",
    date: "01-Jan-2025",
     warehouse: "Main Warehouse",
    materials: [
      { code: "MAT101", name: "Steel Rod", qty: 100 },
      { code: "MAT102", name: "Iron Sheets", qty: 50 },
    ],
  }
];

export const WAREHOUSES = [
  { code: "WH1", name: "Main WH" },
  { code: "WH2", name: "Backup WH" }
];


export const GATE_ENTRIES = [];


export const STOCK = [
  {
    materialCode: "10001234",
    materialName: "Laptop Dell",
    bin: "A1-B1",
    qty: 50,
  },
  {
    materialCode: "10004567",
    materialName: "HP Printer",
    bin: "A1-B3",
    qty: 20,
  },
];

export const GRNS = [
  {
    grnNo: "GRN-1",
    poCode: "PO10001",
    warehouse: "Main Warehouse", 
    materials: [
      { code: "MAT101", name: "Steel Rod", qty: 100 },
      { code: "MAT102", name: "Iron Sheets", qty: 50 },
    ]
  }
];


// src/common/demoData.js
export const SALES_ORDERS = [
  {
    soNo: "SO50001",
    customer: "L&T",
    date: "2025-01-20",
    items: [
      {
        materialCode: "MAT101",
        materialName: "Steel Rod",
        requiredQty: 500,
        bin: "A-01-01"
      },
      {
        materialCode: "MAT102",
        materialName: "Plastic Gran",
        requiredQty: 480,
        bin: "B-02-01"
      }
    ]
  },
  {
    soNo: "SO50002",
    customer: "Tata Motors",
    date: "2025-02-10",
    items: [
      {
        materialCode: "MAT201",
        materialName: "Alu Sheet",
        requiredQty: 120,
        bin: "A-02-01"
      }
    ]
  }
];

export const BINS = [
  { code: "A-01-01" },
  { code: "A-02-01" },
  { code: "B-01-01" },
  { code: "B-02-01" }
];

// In-memory "tables" (demo)
export const PICKINGS = [];   // populated after picking
export const PACKAGES = [    // simulate an existing package optionally
  // { packageNo: "PKG0001", soNo: "SO50001", totalPicked: 500, createdAt: "..." }
];
export const DISPATCHES = []; // populated after dispatch




