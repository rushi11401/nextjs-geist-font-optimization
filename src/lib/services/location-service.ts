import { Location, LocationFormData, ApiResponse } from '@/lib/types'

const API_BASE = '/api/locations'

export class LocationService {
  static async getAll(params?: {
    employeeId?: string
    limit?: number
  }): Promise<ApiResponse<Location[]>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.employeeId) {
        searchParams.append('employeeId', params.employeeId)
      }
      
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString())
      }
      
      const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch locations')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch locations'
      }
    }
  }

  static async getByEmployeeId(
    employeeId: string,
    params?: {
      limit?: number
      startDate?: string
      endDate?: string
    }
  ): Promise<ApiResponse<{
    employeeId: string
    currentLocation: Location | null
    locationHistory: Location[]
    totalRecords: number
  }>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.limit) {
        searchParams.append('limit', params.limit.toString())
      }
      
      if (params?.startDate) {
        searchParams.append('startDate', params.startDate)
      }
      
      if (params?.endDate) {
        searchParams.append('endDate', params.endDate)
      }
      
      const url = searchParams.toString() 
        ? `${API_BASE}/${employeeId}?${searchParams}` 
        : `${API_BASE}/${employeeId}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employee locations')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch employee locations'
      }
    }
  }

  static async create(locationData: LocationFormData): Promise<ApiResponse<Location>> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record location')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to record location'
      }
    }
  }

  static async deleteEmployeeLocations(
    employeeId: string,
    locationId?: string
  ): Promise<ApiResponse<any>> {
    try {
      const url = locationId 
        ? `${API_BASE}/${employeeId}?locationId=${locationId}`
        : `${API_BASE}/${employeeId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete location records')
      }
      
      return data
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to delete location records'
      }
    }
  }

  static async getCurrentPosition(): Promise<{
    latitude: number
    longitude: number
    accuracy: number
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          let errorMessage = 'Failed to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  static async recordCurrentLocation(employeeId: string): Promise<ApiResponse<Location>> {
    try {
      const position = await this.getCurrentPosition()
      
      const locationData: LocationFormData = {
        employeeId,
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: new Date().toISOString(),
        accuracy: position.accuracy,
        source: 'gps'
      }
      
      return await this.create(locationData)
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to record current location'
      }
    }
  }

  static async watchPosition(
    employeeId: string,
    onLocationUpdate: (location: Location) => void,
    onError: (error: string) => void
  ): Promise<number> {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by this browser')
      return -1
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds
    }

    return navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const locationData: LocationFormData = {
            employeeId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
            source: 'gps'
          }
          
          const result = await this.create(locationData)
          
          if (result.data) {
            onLocationUpdate(result.data)
          } else if (result.error) {
            onError(result.error)
          }
        } catch (error) {
          onError(error instanceof Error ? error.message : 'Failed to record location')
        }
      },
      (error) => {
        let errorMessage = 'Failed to watch location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        onError(errorMessage)
      },
      options
    )
  }

  static stopWatchingPosition(watchId: number): void {
    if (navigator.geolocation && watchId >= 0) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}
