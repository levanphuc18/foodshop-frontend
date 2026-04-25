export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: 'ADMIN' | 'CUSTOMER';
  enabled: boolean;
  createdAt: string;
}
