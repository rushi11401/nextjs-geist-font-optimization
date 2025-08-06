"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Salary Box</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Manage employee records and track their current locations with our modern PWA solution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/employees')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>👥</span>
              <span>Employee Management</span>
            </CardTitle>
            <CardDescription>
              Add, edit, and manage employee records with comprehensive profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Employees</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/locations')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📍</span>
              <span>Location Tracking</span>
            </CardTitle>
            <CardDescription>
              Track and monitor employee locations in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Track Locations</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Total Employees</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Active Today</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Departments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">0</div>
          <div className="text-sm text-muted-foreground">Locations</div>
        </div>
      </div>
    </div>
  )
}
