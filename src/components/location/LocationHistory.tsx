"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEmployeeLocations } from '@/hooks/use-locations'
import { type Location, locationSourceOptions } from '@/lib/types'

interface LocationHistoryProps {
  employeeId: string
  employeeName?: string
  onLocationSelect?: (location: Location) => void
  showControls?: boolean
}

export function LocationHistory({ 
  employeeId, 
  employeeName,
  onLocationSelect,
  showControls = true 
}: LocationHistoryProps) {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [limit, setLimit] = useState('50')

  const {
    currentLocation,
    locationHistory,
    totalRecords,
    loading,
    error,
    deleteLocationRecord,
    clearError,
    fetchWithParams,
  } = useEmployeeLocations(employeeId)

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDateRange = { ...dateRange, [field]: value }
    setDateRange(newDateRange)
    
    // Fetch with new parameters
    fetchWithParams({
      limit: parseInt(limit),
      startDate: newDateRange.startDate || undefined,
      endDate: newDateRange.endDate || undefined,
    })
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(newLimit)
    fetchWithParams({
      limit: parseInt(newLimit),
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    })
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('Are you sure you want to delete this location record?')) {
      const result = await deleteLocationRecord(locationId)
      if (!result.success) {
        alert(result.error || 'Failed to delete location record')
      }
    }
  }

  const handleClearAllLocations = async () => {
    if (confirm('Are you sure you want to delete ALL location records for this employee? This action cannot be undone.')) {
      const result = await deleteLocationRecord()
      if (!result.success) {
        alert(result.error || 'Failed to delete location records')
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'gps':
        return 'default'
      case 'manual':
        return 'secondary'
      case 'wifi':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-green-600'
    if (accuracy <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Location History
          {employeeName && <span className="text-muted-foreground"> - {employeeName}</span>}
        </CardTitle>
        <CardDescription>
          Track and view historical location data
          {totalRecords > 0 && ` (${totalRecords} total records)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        {showControls && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Limit</Label>
                <Select value={limit} onValueChange={handleLimitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 records</SelectItem>
                    <SelectItem value="25">25 records</SelectItem>
                    <SelectItem value="50">50 records</SelectItem>
                    <SelectItem value="100">100 records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {locationHistory.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAllLocations}
                >
                  Clear All Records
                </Button>
              </div>
            )}
          </div>
        )}

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

        {/* Current Location */}
        {currentLocation && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-2">📍 Current Location</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Coordinates:</span>{' '}
                {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
              </p>
              {currentLocation.address && (
                <p>
                  <span className="font-medium">Address:</span> {currentLocation.address}
                </p>
              )}
              <p>
                <span className="font-medium">Updated:</span>{' '}
                {formatDateTime(currentLocation.timestamp)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getSourceBadgeVariant(currentLocation.source)}>
                  {locationSourceOptions.find(s => s.value === currentLocation.source)?.label || currentLocation.source}
                </Badge>
                <span className={`text-xs ${getAccuracyColor(currentLocation.accuracy)}`}>
                  ±{Math.round(currentLocation.accuracy)}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Location History */}
        {locationHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No location history found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Location records will appear here once tracking begins
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium">Location History</h4>
            {locationHistory.map((location, index) => (
              <div
                key={location.id}
                className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                  onLocationSelect ? 'cursor-pointer' : ''
                }`}
                onClick={() => onLocationSelect?.(location)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        #{locationHistory.length - index}
                      </span>
                      <Badge variant={getSourceBadgeVariant(location.source)}>
                        {locationSourceOptions.find(s => s.value === location.source)?.label || location.source}
                      </Badge>
                      <span className={`text-xs ${getAccuracyColor(location.accuracy)}`}>
                        ±{Math.round(location.accuracy)}m
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Coordinates:</span>{' '}
                        {formatCoordinates(location.latitude, location.longitude)}
                      </p>
                      {location.address && (
                        <p>
                          <span className="font-medium">Address:</span> {location.address}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        {formatDateTime(location.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  {showControls && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLocation(location.id!)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {locationHistory.length > 0 && locationHistory.length < totalRecords && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => handleLimitChange(String(parseInt(limit) + 25))}
            >
              Load More ({totalRecords - locationHistory.length} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
