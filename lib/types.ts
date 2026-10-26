export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  costPrice: number;
  totalQuantity?: number;
};

export type Warehouse = {
  id: number;
  name: string;
  location: string;
  totalQuantity?: number;
};

export type StockRow = {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  product?: Product;
  warehouse?: Warehouse;
};

export type Sale = {
  id: number;
  quantity: number;
  unitPrice: number;
  total: number;
  customerName: string;
  createdAt: string;
  product?: Product;
  warehouse?: Warehouse;
};

export type Purchase = {
  id: number;
  quantity: number;
  unitCost: number;
  total: number;
  supplierName: string;
  createdAt: string;
  product?: Product;
  warehouse?: Warehouse;
};

export type DashboardSummary = {
  productCount: number;
  warehouseCount: number;
  unitsOnHand: number;
  lowStockCount: number;
  salesTotal: number;
  purchaseTotal: number;
  lowStock: StockRow[];
  recentSales: Sale[];
  recentPurchases: Purchase[];
};
