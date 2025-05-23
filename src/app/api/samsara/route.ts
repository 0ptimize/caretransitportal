import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const SAMSARA_API_TOKEN = process.env.SAMSARA_API_TOKEN
const SAMSARA_API_URL = "https://api.samsara.com"

// Updated Address type to include tags
interface Address {
  id: string;
  name: string;
  formattedAddress: string;
  notes?: string;
  tagIds: string[];
  tags: { name: string }[];
}

// Update callSamsaraApi to accept payload as object
async function callSamsaraApi(
  endpoint: string,
  method: string = "GET",
  payload?: object
): Promise<Address | Address[]> {
  const response = await fetch(`${SAMSARA_API_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${SAMSARA_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  })

  if (!response.ok) {
    throw new Error(`Samsara API error: ${response.statusText}`)
  }

  return response.json()
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const district = searchParams.get("district")
    if (!district) {
      return NextResponse.json({ error: "District parameter is required" }, { status: 400 })
    }
    // Get addresses for the district
    const addresses = await callSamsaraApi("/addresses") as Address[]
    // Filter addresses by district tag
    const districtAddresses = addresses.filter((address: Address) =>
      address.tags.some((tag) => tag.name === district)
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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const data = await request.json() as { name: string; formattedAddress: string; notes?: string; tagIds: string[] }
    const { name, formattedAddress, notes, tagIds } = data
    if (!name || !formattedAddress || !tagIds || tagIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    // Create new address in Samsara
    const response = await callSamsaraApi("/addresses", "POST", {
      name,
      formattedAddress,
      notes,
      tagIds
    }) as Address
    return NextResponse.json(response)
  } catch (error) {
    console.error("Samsara API error:", error)
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    )
  }
} 