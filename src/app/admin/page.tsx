export const dynamic = 'force-dynamic'

import { useState } from "react"
import { UserCreationForm } from "@/components/user-creation-form"

export default function AdminPortal() {
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Portal</h1>
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="space-y-4">
            {isCreatingUser ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Create New User</h3>
                <UserCreationForm
                  onSuccess={() => setIsCreatingUser(false)}
                  onCancel={() => setIsCreatingUser(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingUser(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add New User
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">User List</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300">
                  User management interface will be implemented here.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Activity</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-300">
              System activity logs will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 