"use client"

import { useState } from "react"
import type { UserRole } from "@/types/next-auth"

interface UserCreationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserCreationForm({ onSuccess, onCancel }: UserCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = (data: Record<string, string>) => {
    const errors: Record<string, string> = {}
    
    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (data.password?.length < 8) {
      errors.password = "Password must be at least 8 characters long"
    }
    
    if (!data.firstName?.trim()) {
      errors.firstName = "First name is required"
    }
    
    if (!data.lastName?.trim()) {
      errors.lastName = "Last name is required"
    }
    
    if (!data.username?.trim()) {
      errors.username = "Username is required"
    }
    
    if (!data.role) {
      errors.role = "Role is required"
    }
    
    if (!data.schoolDistrict?.trim()) {
      errors.schoolDistrict = "School district is required"
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      username: formData.get("username") as string,
      role: formData.get("role") as UserRole,
      schoolDistrict: formData.get("schoolDistrict") as string,
    }

    // Validate form data
    const errors = validateForm(data)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user")
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error creating user:", error)
      setError(error instanceof Error ? error.message : "An error occurred while creating the user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
          <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
              formErrors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
              formErrors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
            formErrors.email ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          minLength={8}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
            formErrors.password ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
            formErrors.username ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.username && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Role
        </label>
        <select
          name="role"
          id="role"
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
            formErrors.role ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select a role</option>
          <option value="ADMIN">Admin</option>
          <option value="DISTRICT_USER">District User</option>
          <option value="EMPLOYEE_USER">Employee User</option>
        </select>
        {formErrors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.role}</p>
        )}
      </div>

      <div>
        <label htmlFor="schoolDistrict" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          School District
        </label>
        <input
          type="text"
          name="schoolDistrict"
          id="schoolDistrict"
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 ${
            formErrors.schoolDistrict ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {formErrors.schoolDistrict && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.schoolDistrict}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  )
} 