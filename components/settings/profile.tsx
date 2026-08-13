"use client"

import { memo, useEffect, useState, useTransition } from "react"

import { updateProfile } from "@/app/actions/settings/profile"
import { UserZodSchema } from "@/schemas/user.schema"
import Image from "next/image"
import { SettingsHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertMessage } from "../co"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react"

export type ProfileSettingsProps = {
  username: string
  name: string
  avatar: string
  socialLink: string
  firstMessage: string
}

export const ProfileSettings = memo(function ProfileSettings({
  profile,
}: {
  profile: ProfileSettingsProps
}) {
  const { data: session, update } = useSession()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const profileSchema = UserZodSchema.pick({
    username: true,
    name: true,
    avatar: true,
    socialLink: true,
    firstMessage: true,
  })

  // Avatar upload handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("isAvatar", "true")
      if (session?.user?.id) {
        fd.append("userId", session.user.id)
      }
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Avatar upload failed")
        return
      }
      form.setValue("avatar", data.url, {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success("Avatar updated!")
    } catch (err) {
      console.error(err)
      toast.error("Avatar upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    const sm = () => setMessage(null)
    sm()
  }, [values, setMessage])

  const handleSubmit = (values: z.infer<typeof profileSchema>) => {
    startTransition(async () => {
      const result = await updateProfile(values)

      if (result.success) {
        await update({
          ...session,
          user: { ...session?.user, ...values },
        })
        form.setValue("username", values.username)
        form.setValue("name", values.name)
        form.setValue("socialLink", values.socialLink || "")
        form.setValue("firstMessage", values.firstMessage)
        form.clearErrors()

        setMessage({ type: "success", text: result.message })
        toast.success("Profile updated successfully!")
      } else {
        form.setError("root", {
          message: result.message || "Failed to update profile!",
        })
        setMessage({
          type: "error",
          text: result.message || "Failed to update profile!",
        })
        toast.error("Failed to update profile!")
      }
    })
  }

  return (
    <SettingsHeader page="Profile">
      <div className="space-y-8">
        {message && (
          <AlertMessage
            message={message.text}
            variant={message.type === "success" ? "success" : "destructive"}
            className="mb-4"
          />
        )}

        <div className="group relative h-20 w-20">
          <label className="relative block h-full w-full cursor-pointer">
            <Image
              src={form.watch("avatar") || ""}
              alt={profile.name}
              fill
              sizes="80px"
              className="rounded-md border object-cover"
            />
            {!avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <ImageUpIcon className="h-6 w-6 text-white" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={avatarUploading || isPending}
              className="hidden"
            />
          </label>

          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
              <LoaderCircleIcon
                className="h-8 w-8 animate-spin text-white"
                strokeWidth={1}
              />
            </div>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium">Username</FormLabel>
                  <div className="shadow-input flex w-full items-center rounded-md">
                    <span className="text-muted-foreground pr-1 pl-3">@</span>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className="rounded-md px-2 shadow-none"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium">Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Link */}
            <FormField
              control={form.control}
              name="socialLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium">
                    Social Link
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://your-social-profile.com"
                      disabled={isPending}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First Message */}
            <FormField
              control={form.control}
              name="firstMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium">
                    First Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      className="w-full"
                      placeholder="Your first greeting message..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={
                isPending ||
                !!message ||
                !form.formState.isValid ||
                !form.formState.isDirty
              }
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </SettingsHeader>
  )
})

export function ProfileSkeleton() {
  return (
    <SettingsHeader page={"Profile"}>
      <div className="space-y-8">
        <Skeleton className="h-20 w-20" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </SettingsHeader>
  )
}
