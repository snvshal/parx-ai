"use client"

import { useEffect, useState, useTransition } from "react"
import { TrashIcon, PencilIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import {
  addInstruction,
  updateInstruction,
  deleteInstruction,
  updateProfile,
} from "./actions"
import {
  instructionSchema,
  TInstruction,
  TUser,
  userSchema,
} from "@/schemas/user.schema"
import Image from "next/image"
import { HeaderComponent } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AlertDialogComponent, AlertMessage } from "../components"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const instructionFormSchema = instructionSchema.pick({
  type: true,
  content: true,
})

type InstructionFormProps = {
  defaultValues?: z.infer<typeof instructionFormSchema>
  onSubmit: (
    values: z.infer<typeof instructionFormSchema>
  ) => Promise<void> | void
  onCancel: () => void
  isSubmitting: boolean
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>
  submitButtonText: string
}

type InstructionItemProps = {
  instruction: TInstruction
  isEditingId: string | null
  setIsEditingId: React.Dispatch<React.SetStateAction<string | null>>
  onUpdate: (
    id: string,
    type: string,
    content: string
  ) => Promise<{ success: boolean; message: string }>
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>
}

export type ProfileSettingsProps = {
  username: string
  name: string
  avatar: string
  socialLink: string
  firstMessage: string
}

export const InstructionSettings = ({ user }: { user: TUser }) => {
  const [instructions, setInstructions] = useState<TInstruction[]>([])
  const [addNewInstruction, setAddNewInstruction] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isEditingId, setIsEditingId] = useState<string | null>(null)

  useEffect(() => {
    setInstructions(user.instructions)
  }, [user])

  useEffect(() => {
    const hasAddNewInst = localStorage.getItem("addNewInstruction")
    if (hasAddNewInst === "true") {
      setAddNewInstruction(true)
    }
  }, [])

  const setAddNewInst = (value: boolean) => {
    setAddNewInstruction(value)
    localStorage.setItem("addNewInstruction", value.toString())
  }

  const handleAdd = async (values: z.infer<typeof instructionFormSchema>) => {
    setError(null)

    try {
      const newInstruction = {
        type: values.type,
        content: values.content,
        images: [],
        links: [],
      }

      const result = await addInstruction(newInstruction)

      if (result && "error" in result) {
        setError(result.error)
        return
      }

      startTransition(() => {
        setInstructions((prev) => [...prev, result])
        setAddNewInst(false)
      })

      toast({
        description: "Instruction added successfully!",
      })
    } catch {
      setError("Failed to add instruction.")
    }
  }

  const handleUpdate = async (id: string, type: string, content: string) => {
    try {
      const result = await updateInstruction(id, type, content)

      if (result.success) {
        setInstructions((prev) =>
          prev.map((inst) =>
            inst._id.toString() === id ? { ...inst, type, content } : inst
          )
        )
      }

      return result
    } catch {
      return {
        success: false,
        message: "Failed to update instruction.",
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteInstruction(id)

      if (result.success) {
        setInstructions((prev) =>
          prev.filter((inst) => inst._id.toString() !== id)
        )
      }

      return result
    } catch {
      return {
        success: false,
        message: "Failed to delete instruction.",
      }
    }
  }

  return (
    <HeaderComponent
      page="Instructions"
      actionItem={
        <Button
          variant="outline"
          onClick={() => {
            setAddNewInst(!addNewInstruction)
            setError(null)
          }}
        >
          {addNewInstruction ? "Cancel" : "Add New"}
        </Button>
      }
    >
      {addNewInstruction ? (
        <div className="mb-10">
          <WarningComponent />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Add Instruction</h2>
          </div>

          <InstructionForm
            onSubmit={(values) => {
              startTransition(async () => {
                await handleAdd(values)
              })
            }}
            onCancel={() => setAddNewInst(false)}
            isSubmitting={isPending}
            error={error}
            setError={setError}
            submitButtonText="+ Add"
          />
        </div>
      ) : (
        <Accordion type="single" collapsible>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Added Instructions</h2>
            <Button>
              <Link href={`/m/${user.username}`}>Test</Link>
            </Button>
          </div>
          {instructions.map((instruction) => (
            <InstructionItem
              key={instruction._id.toString()}
              instruction={instruction}
              isEditingId={isEditingId}
              setIsEditingId={setIsEditingId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </Accordion>
      )}
    </HeaderComponent>
  )
}

export const InstructionForm = ({
  defaultValues = { type: "", content: "" },
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  setError,
  submitButtonText,
}: InstructionFormProps) => {
  const form = useForm<z.infer<typeof instructionFormSchema>>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues,
  })

  const { watch } = form

  useEffect(() => {
    const subscription = watch(() => setError(null))
    return () => subscription.unsubscribe()
  }, [watch, setError])

  const handleSubmit = async (
    values: z.infer<typeof instructionFormSchema>
  ) => {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      {error && <AlertMessage message={error} className="mb-4" />}

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Type" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Content"
                  rows={8}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !!error ||
              !form.formState.isValid ||
              !form.formState.isDirty
            }
          >
            {isSubmitting ? "Processing..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export const InstructionItem = ({
  instruction,
  isEditingId,
  setIsEditingId,
  onUpdate,
  onDelete,
}: InstructionItemProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const id = instruction._id.toString()

  const handleUpdate = async (
    values: z.infer<typeof instructionFormSchema>
  ) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onUpdate(id, values.type, values.content)

      if (result.success) {
        setIsEditingId(null)
        toast({ description: result.message })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Failed to update instruction.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await onDelete(id)
      if (result.success) {
        toast({ description: result.message })
      } else {
        toast({
          variant: "destructive",
          description: result.message,
        })
      }
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to delete instruction.",
      })
    }
  }

  if (isEditingId === id) {
    return (
      <div className="relative mb-4 border rounded-lg p-4">
        <InstructionForm
          defaultValues={{
            type: instruction.type,
            content: instruction.content,
          }}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditingId(null)
            setError(null)
          }}
          isSubmitting={isSubmitting}
          error={error}
          setError={setError}
          submitButtonText="Save"
        />
      </div>
    )
  }

  return (
    <AccordionItem value={id} className="border rounded-lg px-4 mb-2">
      <AccordionTrigger>
        <span className="text-base break-words">{instruction.type}</span>
      </AccordionTrigger>
      <AccordionContent>
        <p className="whitespace-pre-wrap break-words">{instruction.content}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingId(id)}
          >
            <PencilIcon className="w-4 h-4" /> Edit
          </Button>
          <AlertDialogComponent
            open={isDeleteDialogOpen}
            setOpen={setIsDeleteDialogOpen}
            action={handleDelete}
            trigger={
              <Button size="sm" variant="destructive">
                <TrashIcon className="w-4 h-4" /> Delete
              </Button>
            }
            actionName="Delete"
            title="Delete Instruction?"
            description={`Are you sure you want to delete the '${instruction.type}' instruction? This action cannot be undone.`}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export const ProfileSettings = ({
  profile,
}: {
  profile: ProfileSettingsProps
}) => {
  const { data: session, update } = useSession()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const profileSchema = userSchema.pick({
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

  const { watch } = form

  useEffect(() => {
    const subscription = watch(() => setMessage(null))
    return () => subscription.unsubscribe()
  }, [watch])

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
    <HeaderComponent page="Profile Settings">
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
                  <div className="flex items-center border w-full rounded-md">
                    <span className="w-8 flex items-center justify-center">
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
    </HeaderComponent>
  )
}

export function WarningComponent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasDismissed = localStorage.getItem("warningDismissed")
    if (!hasDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("warningDismissed", "true")
  }

  if (!isVisible) return null

  return (
    <Alert variant="warning" className="relative group">
      <AlertTitle className="flex items-center gap-2 mb-2">
        <TriangleAlertIcon className="h-5 w-5" aria-hidden={true} />
        <span>Warning</span>
      </AlertTitle>
      <AlertDescription>
        Please review our{" "}
        <Link
          target="_blank"
          href="/about/terms-of-use"
          className="underline hover:text-yellow-700/95"
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          target="_blank"
          href="/about/privacy-policy"
          className="underline hover:text-yellow-700/95"
        >
          Privacy Policy
        </Link>{" "}
        before adding instructions.
      </AlertDescription>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Dismiss warning"
      >
        <XIcon className="h-4 w-4" aria-hidden={true} />
      </button>
    </Alert>
  )
}
