import { NextRequest, NextResponse } from "next/server"

type GiphyImageVariant = {
  url?: string
  width?: string
  height?: string
}

type GiphyGif = {
  id: string
  title?: string
  url: string
  images?: {
    original?: GiphyImageVariant
    fixed_width_small?: GiphyImageVariant
    preview_gif?: GiphyImageVariant
  }
}

type GiphySearchResponse = {
  data?: GiphyGif[]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const q = body.q || ""
    const limit = Math.min(Number(body.limit) || 12, 50)

    const key = process.env.GIPHY_API_KEY
    if (!key) {
      return NextResponse.json(
        { error: "GIPHY_API_KEY not set" },
        { status: 500 },
      )
    }

    const searchUrl = new URL("https://api.giphy.com/v1/gifs/search")
    searchUrl.searchParams.set("api_key", key)
    searchUrl.searchParams.set("q", q)
    searchUrl.searchParams.set("limit", String(limit))
    searchUrl.searchParams.set("offset", "0")
    searchUrl.searchParams.set("rating", "pg-13")
    searchUrl.searchParams.set("lang", "en")

    const res = await fetch(searchUrl.toString())
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: txt }, { status: res.status })
    }

    const json = (await res.json()) as GiphySearchResponse
    const gifs = (json.data ?? []).map((g) => ({
      id: g.id,
      title: g.title || "",
      url: g.images?.original?.url || g.url,
      thumbnail: g.images?.fixed_width_small?.url || g.images?.preview_gif?.url,
      width: g.images?.original?.width,
      height: g.images?.original?.height,
    }))

    return NextResponse.json({ gifs })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to search gifs" },
      { status: 500 },
    )
  }
}
