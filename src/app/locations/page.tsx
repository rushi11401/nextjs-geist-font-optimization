"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LocationTracker } from '@/components/location/LocationTracker'
import { LocationHistory } from '@/components/location/LocationHistory'
import { useEmployees } from '@/hooks/use-employees'
import { useLocations } from '@/hooks/use-locations'
import { type Employee, type Location } from '@/lib/types'

export default function LocationsPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [recentLocations, setRecentLocations] = useState<Location[]>([])

  const { employees, loading: employeesLoading, error: employeesError } = useEmployees()
  const { locations, loading: locationsLoading, error: locationsError, refresh } = useLocations()

  const handleLocationUpdate = (location: Location) => {
    setRecentLocations(prev => [location, ...prev.slice(0, 4)]) // Keep last 5 updates
    refresh() // Refresh all locations
  }

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId)

  const getRecentLocationsByEmployee = () => {
    const employeeLocations = new Map<string, Location>()
    
    // Get the most recent location for each employee
    locations.forEach(location => {
      const existing = employeeLocations.get(location.employeeId)
      if (!existing || new Date(location.timestamp) > new Date(existing.timestamp)) {
        employeeLocations.set(location.employeeId, location)
      }
    })
    
    return Array.from(employeeLocations.values())
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Location Tracking</h1>
        <p className="text-muted-foreground">
          Track and monitor employee locations in real-time
        </p>
      </div>

      {/* Errors */}
      {employeesError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load employees: {employeesError}
          </AlertDescription>
        </Alert>
      )}

      {locationsError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load locations: {locationsError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls and Recent Updates */}
        <div className="space-y-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Employee</CardTitle>
              <CardDescription>
                Choose an employee to track or view history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="employee-select">Employee</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  disabled={employeesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee: Employee) => (
                      <SelectItem key={employee.id} value={employee.id!}>
                        {employee.fullName} ({employee.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recent Location Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>
                Latest location updates from tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent updates
                </p>
              ) : (
                <div className="space-y-3">
                  {recentLocations.map((location, index) => {
                    const employee = employees.find(emp => emp.id === location.employeeId)
                    return (
                      <div key={`${location.id}-${index}`} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {employee?.fullName || 'Unknown Employee'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCoordinates(location.latitude, location.longitude)}
                            </p>
                            {location.address && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {location.address}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(location.timestamp)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Locations Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Locations</CardTitle>
              <CardDescription>
                Most recent location for each employee
              </CardDescription>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading locations...
                </p>
              ) : (
                <div className="space-y-3">
                  {getRecentLocationsByEmployee().map((location) => {
                    const employee = employees.find(emp => emp.id === location.employeeId)
                    return (
                      <div 
                        key={location.id} 
                        className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setSelectedEmployeeId(location.employeeId)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {employee?.fullName || 'Unknown Employee'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(location.timestamp)}
                          </p>
                          {location.address && (
                            <p className="text-xs text-muted-foreground">
                              {location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {getRecentLocationsByEmployee().length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No location data available
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2">
          {selectedEmployeeId ? (
            <Tabs defaultValue="tracker" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tracker">Location Tracker</TabsTrigger>
                <TabsTrigger value="history">Location History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tracker">
                <LocationTracker
                  selectedEmployeeId={selectedEmployeeId}
                  onLocationUpdate={handleLocationUpdate}
                />
              </TabsContent>
              
              <TabsContent value="history">
                <LocationHistory
                  employeeId={selectedEmployeeId}
                  employeeName={selectedEmployee?.fullName}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Select an Employee</h3>
                  <p className="text-muted-foreground">
                    Choose an employee from the dropdown to start tracking their location or view their location history.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      {locations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{locations.length}</div>
            <div className="text-sm text-muted-foreground">Total Records</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {getRecentLocationsByEmployee().length}
            </div>
            <div className="text-sm text-muted-foreground">Active Employees</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {locations.filter(loc => loc.source === 'gps').length}
            </div>
            <div className="text-sm text-muted-foreground">GPS Records</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {locations.filter(loc => 
                new Date(loc.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-sm text-muted-foreground">Last 24 Hours</div>
          </div>
        </div>
      )}
    </div>
  )
}
