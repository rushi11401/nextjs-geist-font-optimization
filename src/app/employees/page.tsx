"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmployeeList } from '@/components/employee/EmployeeList'
import { EmployeeForm } from '@/components/employee/EmployeeForm'
import { useEmployees } from '@/hooks/use-employees'
import { type Employee, type EmployeeFormData } from '@/lib/types'

export default function EmployeesPage() {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
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
  } = useEmployees()

  const handleAddEmployee = async (data: EmployeeFormData) => {
    setActionLoading(true)
    setActionError(null)

    const result = await createEmployee(data)
    
    if (result.success) {
      setIsAddDialogOpen(false)
      setActionLoading(false)
      return { success: true }
    } else {
      setActionError(result.error || 'Failed to create employee')
      setActionLoading(false)
      return { success: false, error: result.error }
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsEditDialogOpen(true)
    setActionError(null)
  }

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    if (!editingEmployee?.id) {
      return { success: false, error: 'No employee selected for editing' }
    }

    setActionLoading(true)
    setActionError(null)

    const result = await updateEmployee(editingEmployee.id, data)
    
    if (result.success) {
      setIsEditDialogOpen(false)
      setEditingEmployee(null)
      setActionLoading(false)
      return { success: true }
    } else {
      setActionError(result.error || 'Failed to update employee')
      setActionLoading(false)
      return { success: false, error: result.error }
    }
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!employee.id) return

    const confirmMessage = `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setActionLoading(true)
    const result = await deleteEmployee(employee.id)
    setActionLoading(false)

    if (!result.success) {
      alert(result.error || 'Failed to delete employee')
    }
  }

  const handleEmployeeClick = (employee: Employee) => {
    router.push(`/employees/${employee.id}`)
  }

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false)
    setActionError(null)
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingEmployee(null)
    setActionError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage employee records and information
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              Add New Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            
            {actionError && (
              <Alert variant="destructive">
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            )}
            
            <EmployeeForm
              onSubmit={handleAddEmployee}
              onCancel={handleCloseAddDialog}
              loading={actionLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        loading={loading}
        error={null} // We handle global error above
        onEmployeeClick={handleEmployeeClick}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onSearch={searchEmployees}
        onFilterByStatus={filterByStatus}
        onFilterByDepartment={filterByDepartment}
        onRefresh={refresh}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Employee - {editingEmployee?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          
          {editingEmployee && (
            <EmployeeForm
              initialData={editingEmployee}
              onSubmit={handleUpdateEmployee}
              onCancel={handleCloseEditDialog}
              isEditing={true}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Summary */}
      {employees.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{employees.length}</div>
            <div className="text-sm text-muted-foreground">Total Employees</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(emp => emp.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {employees.filter(emp => emp.status === 'on-leave').length}
            </div>
            <div className="text-sm text-muted-foreground">On Leave</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {employees.filter(emp => emp.status === 'inactive').length}
            </div>
            <div className="text-sm text-muted-foreground">Inactive</div>
          </div>
        </div>
      )}
    </div>
  )
}
