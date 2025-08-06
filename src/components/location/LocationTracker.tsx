"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useLocationTracking, useGeolocationPermission } from '@/hooks/use-locations'
import { useEmployees } from '@/hooks/use-employees'
import { type Employee } from '@/lib/types'

interface LocationTrackerProps {
  selectedEmployeeId?: string
  onLocationUpdate?: (location: any) => void
}

export function LocationTracker({ 
  selectedEmployeeId, 
  onLocationUpdate 
}: LocationTrackerProps) {
  const [employeeId, setEmployeeId] = useState(selectedEmployeeId || '')
  const { employees, loading: employeesLoading } = useEmployees()
  const { permission, requestPermission, isSupported } = useGeolocationPermission()
  
  const {
    isTracking,
    currentPosition,
    error,
    lastUpdate,
    getCurrentLocation,
    recordCurrentLocation,
    startTracking,
    stopTracking,
    clearError,
  } = useLocationTracking(employeeId)

  useEffect(() => {
    if (selectedEmployeeId) {
      setEmployeeId(selectedEmployeeId)
    }
  }, [selectedEmployeeId])

  const handleGetCurrentLocation = async () => {
    if (!employeeId) {
      alert('Please select an employee first')
      return
    }

    clearError()
    const result = await getCurrentLocation()
    
    if (result.success) {
      // Record the location
      const recordResult = await recordCurrentLocation()
      if (recordResult.success && onLocationUpdate) {
        onLocationUpdate(recordResult.data)
      }
    }
  }

  const handleStartTracking = async () => {
    if (!employeeId) {
      alert('Please select an employee first')
      return
    }

    if (permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        return
      }
    }

    clearError()
    await startTracking(300000) // Track every 5 minutes
  }

  const handleStopTracking = () => {
    stopTracking()
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted', variant: 'default' as const }
      case 'denied':
        return { text: 'Denied', variant: 'destructive' as const }
      case 'prompt':
        return { text: 'Not Requested', variant: 'secondary' as const }
      default:
        return { text: 'Unknown', variant: 'secondary' as const }
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Tracking</CardTitle>
          <CardDescription>Track employee locations in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Geolocation is not supported by this browser. Please use a modern browser with location services.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Location Tracking</CardTitle>
          <CardDescription>
            Track and record employee locations using GPS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee-select">Select Employee</Label>
            <Select
              value={employeeId}
              onValueChange={setEmployeeId}
              disabled={employeesLoading || isTracking}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee to track" />
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

          {/* Permission Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Location Permission</p>
              <p className="text-sm text-muted-foreground">
                Required for GPS tracking
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPermissionStatus().variant}>
                {getPermissionStatus().text}
              </Badge>
              {permission !== 'granted' && (
                <Button size="sm" onClick={requestPermission}>
                  Request
                </Button>
              )}
            </div>
          </div>

          {/* Error Display */}
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

          {/* Current Position */}
          {currentPosition && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">Current Position</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Coordinates:</span>{' '}
                  {formatCoordinates(currentPosition.latitude, currentPosition.longitude)}
                </p>
                <p>
                  <span className="font-medium">Accuracy:</span>{' '}
                  ±{Math.round(currentPosition.accuracy)}m
                </p>
                {lastUpdate && (
                  <p>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatLastUpdate(lastUpdate)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGetCurrentLocation}
              disabled={!employeeId || permission === 'denied'}
              className="flex-1"
            >
              Get Current Location
            </Button>
            
            {!isTracking ? (
              <Button
                onClick={handleStartTracking}
                disabled={!employeeId || permission === 'denied'}
                variant="outline"
                className="flex-1"
              >
                Start Continuous Tracking
              </Button>
            ) : (
              <Button
                onClick={handleStopTracking}
                variant="destructive"
                className="flex-1"
              >
                Stop Tracking
              </Button>
            )}
          </div>

          {/* Tracking Status */}
          {isTracking && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  Location tracking is active
                </p>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Location will be recorded every 5 minutes
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-medium text-foreground">How to use:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Select an employee from the dropdown</li>
              <li>Grant location permission when prompted</li>
              <li>Click "Get Current Location" for a one-time location update</li>
              <li>Use "Start Continuous Tracking" for automatic location updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
