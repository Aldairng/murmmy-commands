export interface Table {
  id: number;
  name: string;
  position_row: number;
  position_col: number;
  notes: string;
}

export interface Cereal {
  id: number;
  name: string;
  category: 'especial' | 'clasico';
  sort_order: number;
}

export interface Topping {
  id: number;
  name: string;
  sort_order: number;
}

export interface Syrup {
  id: number;
  name: string;
  sort_order: number;
}

export interface Favorite {
  id: number;
  name: string;
  cereal_ids: number[] | string;
  topping_ids: number[] | string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  type: 'icecream' | 'milkshake' | 'water';
  cereal_ids: number[];
  topping_ids: number[];
  syrup_id: number | null;
  favorite_id: number | null;
  notes: string;
  created_at: string;
  cereal_names: string[];
  topping_names: string[];
  syrup_name: string | null;
  favorite_name: string | null;
  prep_status: 'new' | 'making' | 'completed';
  prep_started_at: string | null;
  prep_completed_at: string | null;
}

export interface Order {
  id: number;
  table_id: number;
  status: 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
  table_name: string;
  table_notes: string;
  items: OrderItem[];
}

export type ModuleType = 'creator' | 'viewer' | 'settings' | 'history';

export interface SSEEvent {
  type: string;
  data?: unknown;
}
