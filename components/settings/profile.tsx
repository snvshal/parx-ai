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

  const profileSchema = UserZodSchema.pick({
    username: true,
    name: true,
    avatar: true,
    socialLink: true,
    firstMessage: true,
  })

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
      } else {
        form.setError("root", {
          message: result.message || "Failed to update profile.",
        })
        setMessage({
          type: "error",
          text: result.message || "Failed to update profile.",
        })
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

        <div>
          <Image
            src={profile.avatar}
            alt={profile.name}
            height={80}
            width={80}
            priority
            className="rounded-md"
          />
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
                  <div className="flex w-full items-center rounded-md border">
                    <span className="flex w-8 items-center justify-center">
                      @
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className="rounded-r-md border-none"
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
