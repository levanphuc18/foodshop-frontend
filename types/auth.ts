export interface AuthRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  password?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
  username: string;
  accessToken: string;
  refreshToken: string;
  userId: number;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
}
