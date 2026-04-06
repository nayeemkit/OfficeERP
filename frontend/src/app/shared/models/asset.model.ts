export interface AssetResponse {
  id: string;
  assetCode: string;
  name: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  serialNumber: string;
  purchaseDate: string | null;
  purchasePrice: number | null;
  warrantyExpiry: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedToCode: string | null;
  assignedDate: string | null;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR' | 'DISPOSED' | 'LOST';
  location: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  createdAt: string;
}

export interface AssetRequest {
  name: string;
  description?: string;
  categoryId?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  location?: string;
  condition?: string;
}

export interface AssignAssetRequest {
  employeeId: string;
  note?: string;
}

export interface AssetHistoryResponse {
  id: string;
  action: string;
  fromEmployeeName: string | null;
  toEmployeeName: string | null;
  note: string;
  performedAt: string;
}

export interface AssetStats {
  totalAssets: number;
  available: number;
  assigned: number;
  underRepair: number;
  disposed: number;
}
