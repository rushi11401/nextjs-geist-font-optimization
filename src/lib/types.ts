import { z } from 'zod'

// Employee Schema
export const employeeSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  salary: z.number().min(0, "Salary must be a positive number"),
  joinDate: z.string().min(1, "Join date is required"),
  status: z.enum(['active', 'inactive', 'on-leave']).default('active'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Location Schema
export const locationSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
  address: z.string().optional(),
  timestamp: z.string().min(1, "Timestamp is required"),
  accuracy: z.number().min(0, "Accuracy must be positive"),
  source: z.enum(['gps', 'manual', 'wifi']).default('gps'),
})

// TypeScript types
export type Employee = z.infer<typeof employeeSchema>
export type Location = z.infer<typeof locationSchema>

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface EmployeeWithLocation extends Employee {
  currentLocation?: Location
  locationHistory?: Location[]
}

// Form types
export type EmployeeFormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
export type LocationFormData = Omit<Location, 'id'>

// Status options
export const employeeStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' },
] as const

export const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'operations', label: 'Operations' },
] as const

export const locationSourceOptions = [
  { value: 'gps', label: 'GPS' },
  { value: 'manual', label: 'Manual' },
  { value: 'wifi', label: 'WiFi' },
] as const
