export interface User {
  id: string;
  name: string;

  email: string;
  passwordHash: string;

  avatarUrl?: string | null;
  emailVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}
