"use client"

import { useState, useEffect, useCallback } from 'react'
import { Employee, EmployeeFormData } from '@/lib/types'
import { EmployeeService } from '@/lib/services/employee-service'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await EmployeeService.getAll()
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmployees(result.data)
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const createEmployee = useCallback(async (employeeData: EmployeeFormData) => {
    const result = await EmployeeService.create(employeeData)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else if (result.data) {
      setEmployees(prev => [...prev, result.data!])
      return { success: true, data: result.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }, [])

  const updateEmployee = useCallback(async (id: string, employeeData: EmployeeFormData) => {
    const result = await EmployeeService.update(id, employeeData)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else if (result.data) {
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? result.data! : emp)
      )
      return { success: true, data: result.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    const result = await EmployeeService.delete(id)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else {
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      return { success: true }
    }
  }, [])

  const searchEmployees = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchEmployees()
      return
    }
    
    setLoading(true)
    const result = await EmployeeService.search(query)
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmployees(result.data)
    }
    
    setLoading(false)
  }, [fetchEmployees])

  const filterByStatus = useCallback(async (status: string) => {
    setLoading(true)
    const result = await EmployeeService.filterByStatus(status)
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmployees(result.data)
    }
    
    setLoading(false)
  }, [])

  const filterByDepartment = useCallback(async (department: string) => {
    setLoading(true)
    const result = await EmployeeService.filterByDepartment(department)
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmployees(result.data)
    }
    
    setLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refresh = useCallback(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployees,
    filterByStatus,
    filterByDepartment,
    clearError,
    refresh,
  }
}

export function useEmployee(id: string) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployee = useCallback(async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    const result = await EmployeeService.getById(id)
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setEmployee(result.data)
    }
    
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchEmployee()
  }, [fetchEmployee])

  const updateEmployee = useCallback(async (employeeData: EmployeeFormData) => {
    if (!id) return { success: false, error: 'No employee ID provided' }
    
    const result = await EmployeeService.update(id, employeeData)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else if (result.data) {
      setEmployee(result.data)
      return { success: true, data: result.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }, [id])

  const deleteEmployee = useCallback(async () => {
    if (!id) return { success: false, error: 'No employee ID provided' }
    
    const result = await EmployeeService.delete(id)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else {
      setEmployee(null)
      return { success: true }
    }
  }, [id])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refresh = useCallback(() => {
    fetchEmployee()
  }, [fetchEmployee])

  return {
    employee,
    loading,
    error,
    updateEmployee,
    deleteEmployee,
    clearError,
    refresh,
  }
}
