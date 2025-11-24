import { NextResponse } from "next/server"
import { getSessionUser } from "@/app/actions/session-user"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const userId = form.get("userId") as string | null
    const isAvatar = form.get("isAvatar") === "true"

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 })

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 },
      )
    }

    const user = await getSessionUser()
    if (!user?._id || String(user._id) !== userId) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 403 })
    }

    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
    const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET

    const cloudFolder = isAvatar
      ? process.env.CLOUDINARY_FOLDER_AVATAR
      : process.env.CLOUDINARY_FOLDER_DEFAULT

    if (!CLOUD_NAME || !UPLOAD_PRESET || !cloudFolder) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 500 },
      )
    }

    const cloudUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`

    const uploadForm = new FormData()
    uploadForm.append("file", file)
    uploadForm.append("upload_preset", UPLOAD_PRESET)
    if (cloudFolder) {
      uploadForm.append("folder", cloudFolder)
    }

    const res = await fetch(cloudUrl, {
      method: "POST",
      body: uploadForm,
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Upload failed" },
        { status: res.status },
      )
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    )
  }
}
