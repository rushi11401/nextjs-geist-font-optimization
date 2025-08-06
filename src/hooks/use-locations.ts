"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Location, LocationFormData } from '@/lib/types'
import { LocationService } from '@/lib/services/location-service'

export function useLocations(employeeId?: string) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await LocationService.getAll({ employeeId })
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setLocations(result.data)
    }
    
    setLoading(false)
  }, [employeeId])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const recordLocation = useCallback(async (locationData: LocationFormData) => {
    const result = await LocationService.create(locationData)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else if (result.data) {
      setLocations(prev => [result.data!, ...prev])
      return { success: true, data: result.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refresh = useCallback(() => {
    fetchLocations()
  }, [fetchLocations])

  return {
    locations,
    loading,
    error,
    recordLocation,
    clearError,
    refresh,
  }
}

export function useEmployeeLocations(employeeId: string) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [locationHistory, setLocationHistory] = useState<Location[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployeeLocations = useCallback(async (params?: {
    limit?: number
    startDate?: string
    endDate?: string
  }) => {
    if (!employeeId) return
    
    setLoading(true)
    setError(null)
    
    const result = await LocationService.getByEmployeeId(employeeId, params)
    
    if (result.error) {
      setError(result.error)
    } else if (result.data) {
      setCurrentLocation(result.data.currentLocation)
      setLocationHistory(result.data.locationHistory)
      setTotalRecords(result.data.totalRecords)
    }
    
    setLoading(false)
  }, [employeeId])

  useEffect(() => {
    fetchEmployeeLocations()
  }, [fetchEmployeeLocations])

  const deleteLocationRecord = useCallback(async (locationId?: string) => {
    const result = await LocationService.deleteEmployeeLocations(employeeId, locationId)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else {
      // Refresh the data after deletion
      await fetchEmployeeLocations()
      return { success: true }
    }
  }, [employeeId, fetchEmployeeLocations])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refresh = useCallback(() => {
    fetchEmployeeLocations()
  }, [fetchEmployeeLocations])

  return {
    currentLocation,
    locationHistory,
    totalRecords,
    loading,
    error,
    deleteLocationRecord,
    clearError,
    refresh,
    fetchWithParams: fetchEmployeeLocations,
  }
}

export function useLocationTracking(employeeId: string) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  const watchIdRef = useRef<number>(-1)

  const getCurrentLocation = useCallback(async () => {
    setError(null)
    
    try {
      const position = await LocationService.getCurrentPosition()
      setCurrentPosition(position)
      return { success: true, data: position }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const recordCurrentLocation = useCallback(async () => {
    setError(null)
    
    const result = await LocationService.recordCurrentLocation(employeeId)
    
    if (result.error) {
      setError(result.error)
      return { success: false, error: result.error }
    } else if (result.data) {
      setLastUpdate(new Date())
      return { success: true, data: result.data }
    }
    
    return { success: false, error: 'Unknown error occurred' }
  }, [employeeId])

  const startTracking = useCallback(async (interval: number = 300000) => { // 5 minutes default
    if (isTracking) return
    
    setIsTracking(true)
    setError(null)
    
    // Record initial location
    await recordCurrentLocation()
    
    // Start watching position
    const watchId = await LocationService.watchPosition(
      employeeId,
      (location) => {
        setCurrentPosition({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        })
        setLastUpdate(new Date())
      },
      (error) => {
        setError(error)
        setIsTracking(false)
      }
    )
    
    watchIdRef.current = watchId
    
    // Set up periodic location recording
    const intervalId = setInterval(async () => {
      if (isTracking) {
        await recordCurrentLocation()
      }
    }, interval)
    
    // Store interval ID for cleanup
    return () => {
      clearInterval(intervalId)
      LocationService.stopWatchingPosition(watchId)
    }
  }, [isTracking, employeeId, recordCurrentLocation])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current >= 0) {
      LocationService.stopWatchingPosition(watchIdRef.current)
      watchIdRef.current = -1
    }
    setIsTracking(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current >= 0) {
        LocationService.stopWatchingPosition(watchIdRef.current)
      }
    }
  }, [])

  return {
    isTracking,
    currentPosition,
    error,
    lastUpdate,
    getCurrentLocation,
    recordCurrentLocation,
    startTracking,
    stopTracking,
    clearError,
  }
}

export function useGeolocationPermission() {
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.permissions) {
        setLoading(false)
        return
      }

      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setPermission(result.state)
        
        result.addEventListener('change', () => {
          setPermission(result.state)
        })
      } catch (error) {
        console.warn('Could not check geolocation permission:', error)
      }
      
      setLoading(false)
    }

    checkPermission()
  }, [])

  const requestPermission = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        resolve(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setPermission('granted')
          resolve(true)
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermission('denied')
          }
          resolve(false)
        },
        { timeout: 5000 }
      )
    })
  }, [])

  return {
    permission,
    loading,
    requestPermission,
    isSupported: !!navigator.geolocation,
  }
}
