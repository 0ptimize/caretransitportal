"use client"

export const dynamic = 'force-dynamic'

export default function DistrictPortal() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">District Portal</h1>
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Student Transportation</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage student transportation information and view schedules.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <p className="text-gray-600 dark:text-gray-300">
            View recent activities and changes in the system.
          </p>
        </div>
      </div>
    </div>
  )
} 