import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const SAMSARA_API_TOKEN = process.env.SAMSARA_API_TOKEN
const SAMSARA_API_URL = "https://api.samsara.com"

async function callSamsaraApi(endpoint: string, method = "GET", payload = null) {
  const response = await fetch(`${SAMSARA_API_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${SAMSARA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(payload && { body: JSON.stringify(payload) }),
  })

  if (!response.ok) {
    throw new Error(`Samsara API error: ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district")

    if (!district) {
      return NextResponse.json({ error: "District parameter is required" }, { status: 400 })
    }

    // Get addresses for the district
    const addresses = await callSamsaraApi("/addresses")
    
    // Filter addresses by district tag
    const districtAddresses = addresses.data.filter((address: any) => 
      address.tags.some((tag: any) => tag.name === district)
    )

    return NextResponse.json({ data: districtAddresses })
  } catch (error) {
    console.error("Samsara API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch district data" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, district, notes } = body

    if (!name || !address || !district) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create new address in Samsara
    const response = await callSamsaraApi("/addresses", "POST", {
      name,
      formattedAddress: address,
      notes,
      tagIds: [district], // Assuming district is the tag ID
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Samsara API error:", error)
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    )
  }
} 