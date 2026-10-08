export interface StudentDocument {
  id: number;
  studentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  majors?: string[];
  createdAt: Date;
  updatedAt?: Date;
}
