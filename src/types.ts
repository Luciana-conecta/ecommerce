export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  ci_ruc?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category_id: number;
  category_name?: string;
  category?: Category;
  price: number;
  discount_price?: number;
  short_description: string;
  long_description?: string;
  stock_quantity: number;
  is_featured: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  main_image?: string;
  images?: { id: number; url: string; is_main: boolean }[];
  variants?: { id: number; name: string; value: string; additional_price: number; stock_quantity: number }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  shipping_address: string;
  shipping_city: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  customer_name?: string;
}
