import { getUserByUsername } from "@/app/actions/chat"
import { ImageResponse } from "next/og"

const CONFIG = {
  width: 1200,
  height: 630,
  defaultImage: process.env.METADATA_BASE_URL + "/opengraph-image.png",
  baseStyles: {
    fontSize: 48,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ogiStyles: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    position: "absolute",
  },
  personaStyles: {
    backgroundColor: "#a5b4fc88",
    borderRadius: "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0px 16px",
    height: "108px",
  },
  avatarStyles: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginRight: "16px",
  },
  personaLogoStyles: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: "40px",
    paddingRight: "40px",
  },
} as const

export const alt = "Parx AI chatbot"
export const size = { width: CONFIG.width, height: CONFIG.height }
export const contentType = "image/png"

const DefaultView = ({ message }: { message: string }) => (
  <div style={CONFIG.baseStyles}>{message}</div>
)

const View = ({ imageUrl, name }: { imageUrl: string; name: string }) => (
  <div style={CONFIG.baseStyles}>
    {/* eslint-disable @next/next/no-img-element */}
    <img src={CONFIG.defaultImage} alt="Parx AI" style={CONFIG.ogiStyles} />
    <div style={CONFIG.personaLogoStyles}>
      <div style={CONFIG.personaStyles}>
        <img
          src={imageUrl}
          alt={`${name}'s persona avatar`}
          style={CONFIG.avatarStyles}
        />
        <p style={{ marginRight: "16px" }}>{name}</p>
      </div>
    </div>
  </div>
)

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type")
    return (response.ok && contentType?.startsWith("image/")) || false
  } catch {
    return false
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  try {
    const username = (await params).username
    const user = await getUserByUsername(username)
    if (!user)
      return new ImageResponse(<DefaultView message="User not found" />, size)

    const { name, avatar } = user
    const validAvatar =
      avatar && (await isValidImageUrl(avatar)) ? avatar : CONFIG.defaultImage

    return new ImageResponse(<View imageUrl={validAvatar} name={name} />, size)
  } catch (error) {
    console.error("Error generating OG image:", error)
    return new ImageResponse(
      <DefaultView message="Error generating image" />,
      size,
    )
  }
}
