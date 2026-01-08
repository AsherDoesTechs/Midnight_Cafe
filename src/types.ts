export type CartItem = {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
};

// Example usage:
const cart: CartItem[] = [];

const id = 1;
const name = "Coffee";
const price = 100;
const quantity = 2;

const item: CartItem = { menu_item_id: id, name, price, quantity };
cart.push(item);

/* ===================== SHARED SCHEMAS ===================== */

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

/* ===================== BOOKING TYPES ===================== */

export interface BookingData {
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number | string;
}

/* ===================== ANALYTICS TYPES ===================== */

export interface AnalyticsData {
  month: string;
  revenue: number;
  sales: number;
}

export interface SupabaseOrderResponse {
  created_at: string;
  total_amount: number | null;
  status: string | null;
  payment_status: string | null;
}

/* ===================== CUSTOM IDEAS TYPES ===================== */

export type IdeaStatus = "Draft" | "Submitted" | "Processing";

export interface CustomIdea {
  id: number;
  title: string;
  date: string;
  status: IdeaStatus;
  details: string;
}

export interface CustomIdeaRow {
  id: number;
  title: string;
  details: string;
  status: IdeaStatus;
  created_at: string;
  user_id: string;
}

/* ===================== FAVORITES TYPES ===================== */

export type FavoriteItem = MenuItem;

export interface SupabaseFavoriteResponse {
  menu_items: MenuItem | null;
}
