export type Role = 'buyer' | 'seller' | 'admin';

export interface User {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  isVerified: boolean;
}

export interface Listing {
  id: number;
  seller_id: number;
  seller_name: string;
  seller_verified: boolean;
  title: string;
  description: string;
  category: string;
  quality: string;
  quality_notes: string;
  price_type: 'fixed' | 'bidding';
  price: number;
  quantity: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'pending' | 'sold' | 'deactivated';
  is_verified: boolean;
  verification_notes?: string;
  created_at: string;
  images: string[];
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}
