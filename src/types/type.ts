export interface User {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  teacherId?: string;
  age?: number;
}

export interface Cookie {
  httpOnly?: any;
  sameSite?: any;
  path?: any;
}
