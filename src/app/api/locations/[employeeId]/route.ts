import { NextRequest, NextResponse } from 'next/server'
import { type Location } from '@/lib/types'

// In-memory storage (same as in locations/route.ts)
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
  {
    id: '3',
    employeeId: '1',
    latitude: 40.7589,
    longitude: -73.9851,
    address: 'Times Square, New York, NY, USA',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    accuracy: 8,
    source: 'gps',
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Filter locations for the specific employee
    let employeeLocations = locations.filter(loc => loc.employeeId === params.employeeId)
    
    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate)
      employeeLocations = employeeLocations.filter(loc => 
        new Date(loc.timestamp) >= start
      )
    }
    
    if (endDate) {
      const end = new Date(endDate)
      employeeLocations = employeeLocations.filter(loc => 
        new Date(loc.timestamp) <= end
      )
    }
    
    // Sort by timestamp (most recent first)
    employeeLocations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        employeeLocations = employeeLocations.slice(0, limitNum)
      }
    }

    // Get current location (most recent)
    const currentLocation = employeeLocations.length > 0 ? employeeLocations[0] : null

    return NextResponse.json({
      data: {
        employeeId: params.employeeId,
        currentLocation,
        locationHistory: employeeLocations,
        totalRecords: employeeLocations.length
      },
      message: 'Employee locations retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve employee locations' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    
    if (locationId) {
      // Delete specific location record
      const locationIndex = locations.findIndex(loc => 
        loc.id === locationId && loc.employeeId === params.employeeId
      )
      
      if (locationIndex === -1) {
        return NextResponse.json(
          { error: 'Location record not found' },
          { status: 404 }
        )
      }
      
      const deletedLocation = locations[locationIndex]
      locations.splice(locationIndex, 1)
      
      return NextResponse.json({
        data: deletedLocation,
        message: 'Location record deleted successfully'
      })
    } else {
      // Delete all location records for the employee
      const employeeLocations = locations.filter(loc => loc.employeeId === params.employeeId)
      
      if (employeeLocations.length === 0) {
        return NextResponse.json(
          { error: 'No location records found for this employee' },
          { status: 404 }
        )
      }
      
      locations = locations.filter(loc => loc.employeeId !== params.employeeId)
      
      return NextResponse.json({
        data: {
          deletedCount: employeeLocations.length,
          employeeId: params.employeeId
        },
        message: 'All location records deleted successfully'
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete location records' },
      { status: 500 }
    )
  }
}
