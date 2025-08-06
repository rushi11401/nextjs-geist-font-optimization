"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeForm } from '@/components/employee/EmployeeForm'
import { LocationHistory } from '@/components/location/LocationHistory'
import { LocationTracker } from '@/components/location/LocationTracker'
import { useEmployee } from '@/hooks/use-employees'
import { type EmployeeFormData, departmentOptions } from '@/lib/types'

interface EmployeeDetailPageProps {
  params: {
    id: string
  }
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    employee,
    loading,
    error,
    updateEmployee,
    deleteEmployee,
    clearError,
    refresh,
  } = useEmployee(params.id)

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    setActionLoading(true)
    setActionError(null)

    const result = await updateEmployee(data)
    
    if (result.success) {
      setIsEditDialogOpen(false)
      setActionLoading(false)
      return { success: true }
    } else {
      setActionError(result.error || 'Failed to update employee')
      setActionLoading(false)
      return { success: false, error: result.error }
    }
  }

  const handleDeleteEmployee = async () => {
    if (!employee) return

    const confirmMessage = `Are you sure you want to delete ${employee.fullName}? This action cannot be undone and will also delete all location history.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    setActionLoading(true)
    const result = await deleteEmployee()
    setActionLoading(false)

    if (result.success) {
      router.push('/employees')
    } else {
      alert(result.error || 'Failed to delete employee')
    }
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'on-leave':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getDepartmentLabel = (department: string) => {
    return departmentOptions.find(d => d.value === department)?.label || department
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Employee Not Found</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={clearError}>
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/employees')}>
                Back to Employees
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Employee Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">The requested employee could not be found.</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/employees')}
              className="mt-4"
            >
              Back to Employees
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{employee.fullName}</h1>
            <p className="text-muted-foreground">
              {employee.position} • {getDepartmentLabel(employee.department)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={actionLoading}
          >
            Edit Employee
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteEmployee}
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting...' : 'Delete Employee'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Employee Information
                <Badge variant={getStatusBadgeVariant(employee.status)}>
                  {employee.status.replace('-', ' ')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                <p className="font-mono">{employee.employeeId}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{employee.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{employee.phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p>{getDepartmentLabel(employee.department)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p>{employee.position}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salary</p>
                <p className="text-lg font-semibold text-primary">
                  {formatSalary(employee.salary)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Join Date</p>
                <p>{formatDate(employee.joinDate)}</p>
              </div>
              
              {employee.createdAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record Created</p>
                  <p className="text-sm">{formatDate(employee.createdAt.toString())}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="location-history" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="location-history">Location History</TabsTrigger>
              <TabsTrigger value="location-tracker">Location Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="location-history" className="space-y-4">
              <LocationHistory
                employeeId={employee.id!}
                employeeName={employee.fullName}
              />
            </TabsContent>
            
            <TabsContent value="location-tracker" className="space-y-4">
              <LocationTracker
                selectedEmployeeId={employee.id!}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee - {employee.fullName}</DialogTitle>
          </DialogHeader>
          
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}
          
          <EmployeeForm
            initialData={employee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing={true}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
