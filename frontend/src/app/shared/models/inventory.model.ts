export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface ItemResponse {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  description: string;
  unit: string;
  unitPrice: number;
  reorderLevel: number;
  currentStock: number;
  isActive: boolean;
  lowStock: boolean;
  createdAt: string;
}

export interface ItemRequest {
  name: string;
  sku: string;
  categoryId?: string;
  description?: string;
  unit: string;
  unitPrice?: number;
  reorderLevel?: number;
}

export interface StockTransactionResponse {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  categoryName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reference: string;
  note: string;
  transactionDate: string;
  createdAt: string;
}

export interface StockTransactionRequest {
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitPrice?: number;
  reference?: string;
  note?: string;
  transactionDate?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  totalTransactions: number;
}
