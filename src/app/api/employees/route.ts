import { NextRequest, NextResponse } from 'next/server'
import { employeeSchema, type Employee } from '@/lib/types'

// In-memory storage for MVP (replace with database in production)
let employees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    fullName: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    department: 'engineering',
    position: 'Software Engineer',
    salary: 75000,
    joinDate: '2024-01-15',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    employeeId: 'EMP002',
    fullName: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1234567891',
    department: 'marketing',
    position: 'Marketing Manager',
    salary: 65000,
    joinDate: '2024-02-01',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      data: employees,
      message: 'Employees retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = employeeSchema.parse({
      ...body,
      id: undefined, // Let the server generate the ID
      createdAt: undefined,
      updatedAt: undefined,
    })

    // Check if employee ID already exists
    const existingEmployee = employees.find(emp => emp.employeeId === validatedData.employeeId)
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = employees.find(emp => emp.email === validatedData.email)
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create new employee
    const newEmployee: Employee = {
      ...validatedData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    employees.push(newEmployee)

    return NextResponse.json({
      data: newEmployee,
      message: 'Employee created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
