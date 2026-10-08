export type UserRole =
  'SUPER_ADMIN' | 'ADMIN' | 'PRESIDENT' | 'TEACHER' | 'STUDENT';

export interface UserDocument {
  _id?: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  email: string;
  createdAt: Date;
}
