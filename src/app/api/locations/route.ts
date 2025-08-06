import { NextRequest, NextResponse } from 'next/server'
import { locationSchema, type Location } from '@/lib/types'

// In-memory storage for MVP (replace with database in production)
let locations: Location[] = [
  {
    id: '1',
    employeeId: '1',
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY, USA',
    timestamp: new Date().toISOString(),
    accuracy: 10,
    source: 'gps',
  },
  {
    id: '2',
    employeeId: '2',
    latitude: 34.0522,
    longitude: -118.2437,
    address: 'Los Angeles, CA, USA',
    timestamp: new Date().toISOString(),
    accuracy: 15,
    source: 'gps',
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const limit = searchParams.get('limit')
    
    let filteredLocations = locations
    
    // Filter by employee ID if provided
    if (employeeId) {
      filteredLocations = locations.filter(loc => loc.employeeId === employeeId)
    }
    
    // Sort by timestamp (most recent first)
    filteredLocations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredLocations = filteredLocations.slice(0, limitNum)
      }
    }

    return NextResponse.json({
      data: filteredLocations,
      message: 'Locations retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve locations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = locationSchema.parse({
      ...body,
      id: undefined, // Let the server generate the ID
    })

    // Create new location record
    const newLocation: Location = {
      ...validatedData,
      id: Date.now().toString(),
    }

    // Add reverse geocoding if address is not provided
    if (!newLocation.address) {
      try {
        const address = await reverseGeocode(newLocation.latitude, newLocation.longitude)
        newLocation.address = address
      } catch (error) {
        // If reverse geocoding fails, use coordinates as address
        newLocation.address = `${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}`
      }
    }

    locations.push(newLocation)

    return NextResponse.json({
      data: newLocation,
      message: 'Location recorded successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to record location' },
      { status: 500 }
    )
  }
}

// Simple reverse geocoding function (in production, use a proper geocoding service)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // This is a mock implementation - in production, use Google Maps API, OpenStreetMap, etc.
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }
    
    const data = await response.json()
    return data.display_name || data.locality || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    // Fallback to coordinates
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}
