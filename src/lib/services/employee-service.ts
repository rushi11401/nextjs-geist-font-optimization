import { Employee, EmployeeFormData, ApiResponse } from '@/lib/types'

const API_BASE = '/api/employees'

export class EmployeeService {
  static async getAll(): Promise<ApiResponse<Employee[]>> {
    try {
      const response = await fetch(API_BASE)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employees')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch employees'
      }
    }
  }

  static async getById(id: string): Promise<ApiResponse<Employee>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employee')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch employee'
      }
    }
  }

  static async create(employeeData: EmployeeFormData): Promise<ApiResponse<Employee>> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create employee')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to create employee'
      }
    }
  }

  static async update(id: string, employeeData: EmployeeFormData): Promise<ApiResponse<Employee>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update employee')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update employee'
      }
    }
  }

  static async delete(id: string): Promise<ApiResponse<Employee>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete employee')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to delete employee'
      }
    }
  }

  static async search(query: string): Promise<ApiResponse<Employee[]>> {
    try {
      const allEmployees = await this.getAll()
      
      if (allEmployees.error || !allEmployees.data) {
        return allEmployees
      }
      
      const filteredEmployees = allEmployees.data.filter(employee =>
        employee.fullName.toLowerCase().includes(query.toLowerCase()) ||
        employee.email.toLowerCase().includes(query.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(query.toLowerCase()) ||
        employee.department.toLowerCase().includes(query.toLowerCase()) ||
        employee.position.toLowerCase().includes(query.toLowerCase())
      )
      
      return {
        data: filteredEmployees,
        message: 'Search completed successfully'
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Search failed'
      }
    }
  }

  static async filterByStatus(status: string): Promise<ApiResponse<Employee[]>> {
    try {
      const allEmployees = await this.getAll()
      
      if (allEmployees.error || !allEmployees.data) {
        return allEmployees
      }
      
      const filteredEmployees = allEmployees.data.filter(employee =>
        employee.status === status
      )
      
      return {
        data: filteredEmployees,
        message: 'Filter applied successfully'
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Filter failed'
      }
    }
  }

  static async filterByDepartment(department: string): Promise<ApiResponse<Employee[]>> {
    try {
      const allEmployees = await this.getAll()
      
      if (allEmployees.error || !allEmployees.data) {
        return allEmployees
      }
      
      const filteredEmployees = allEmployees.data.filter(employee =>
        employee.department === department
      )
      
      return {
        data: filteredEmployees,
        message: 'Filter applied successfully'
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Filter failed'
      }
    }
  }
}
