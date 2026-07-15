import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    
    if (!file) {
      return NextResponse.json({ error: "No file provided in form data" }, { status: 400 })
    }

    const imageServerUrl = process.env.IMAGE_SERVER_URL || "https://image.streamespn.org"
    const imageServerApiKey = process.env.IMAGE_SERVER_API_KEY

    if (!imageServerApiKey) {
      return NextResponse.json({ error: "IMAGE_SERVER_API_KEY is not defined in environment" }, { status: 500 })
    }

    // Construct a new FormData to send to the central image server
    const outboundFormData = new FormData()
    outboundFormData.append("image", file, file.name)

    const uploadRes = await fetch(`${imageServerUrl}/api/upload`, {
      method: "POST",
      headers: {
        "x-api-key": imageServerApiKey,
      },
      body: outboundFormData,
    })

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}))
      throw new Error(errData.error || `Image server returned status ${uploadRes.status}`)
    }

    const uploadData = await uploadRes.json()

    if (!uploadData.success || !uploadData.url) {
      throw new Error(uploadData.error || "Failed to retrieve public image URL from image server")
    }

    // Return the URL returned by the central image server
    return NextResponse.json({
      success: true,
      url: uploadData.url
    })
  } catch (err) {
    console.error("Upload API Error:", err)
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
