"use client"

import { memo, useEffect, useState, useTransition } from "react"
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import {
  addInstruction,
  updateInstruction,
  deleteInstruction,
} from "@/app/actions/settings/instruction"
import { SettingsHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
  InstructionZodSchema,
  TInstruction,
} from "@/schemas/instruction.schema"
import { AlertDialogComponent } from "../co"
import { AlertMessage } from "../co"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "../ui/badge"
import { toast } from "sonner"

const instructionFormSchema = InstructionZodSchema.pick({
  type: true,
  content: true,
})

type InstructionFormProps = {
  defaultValues?: z.infer<typeof instructionFormSchema>
  onSubmit: (
    values: z.infer<typeof instructionFormSchema>,
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
    content: string,
  ) => Promise<{ success: boolean; message: string }>
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>
}

export type TNewInstruction = Omit<
  z.infer<typeof InstructionZodSchema>,
  "userId"
>

export const InstructionSettings = ({ inst }: { inst: TInstruction[] }) => {
  const [instructions, setInstructions] = useState<TInstruction[]>(inst)
  const [addNewInstruction, setAddNewInstruction] = useState(
    localStorage.getItem("addNewInstruction") === "true",
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isEditingId, setIsEditingId] = useState<string | null>(null)

  const setAddNewInst = (value: boolean) => {
    setAddNewInstruction(value)
    localStorage.setItem("addNewInstruction", value.toString())
  }

  const handleAdd = async (values: z.infer<typeof instructionFormSchema>) => {
    setError(null)

    try {
      const newInstruction: TNewInstruction = {
        type: values.type,
        content: values.content,
        mediaUrls: [],
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

      toast.success("Instruction added successfully!")
    } catch {
      setError("Failed to add instruction.")
    }
  }

  const handleUpdate = async (id: string, type: string, content: string) => {
    try {
      const result = await updateInstruction(id, type, content)

      if (result.success) {
        setInstructions(
          (prev) =>
            prev.map((inst) =>
              String(inst._id) === id ? { ...inst, type, content } : inst,
            ) as TInstruction[],
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
          prev.filter((inst) => String(inst._id) !== id),
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
    <SettingsHeader page={`Instructions${addNewInstruction ? " / New" : ""}`}>
      {addNewInstruction ? (
        <div className="mb-10">
          <WarningComponent />
          <div className="mb-4 flex items-center justify-between">
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
            submitButtonText="Submit"
          />
        </div>
      ) : (
        <Accordion type="single" collapsible>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Added</h2>
              <Badge variant="secondary">{instructions.length}</Badge>
            </div>
            {instructions.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setAddNewInst(!addNewInstruction)
                  setError(null)
                }}
              >
                <PlusIcon className="h-4 w-4" aria-hidden={true} />
                Add New
              </Button>
            ) : null}
          </div>
          {!instructions.length ? (
            <p className="text-muted-foreground">No Instructions here</p>
          ) : (
            instructions.map((instruction) => (
              <InstructionItem
                key={String(instruction._id)}
                instruction={instruction}
                isEditingId={isEditingId}
                setIsEditingId={setIsEditingId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </Accordion>
      )}
    </SettingsHeader>
  )
}

export const InstructionForm = memo(function InstructionForm({
  defaultValues = { type: "", content: "" },
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  setError,
  submitButtonText,
}: InstructionFormProps) {
  const form = useForm<z.infer<typeof instructionFormSchema>>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues,
  })

  const values = useWatch({ control: form.control })

  useEffect(() => {
    const se = () => setError(null)
    se()
  }, [values, setError])

  const handleSubmit = async (
    values: z.infer<typeof instructionFormSchema>,
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
                <Input
                  placeholder="Type"
                  {...field}
                  disabled={isSubmitting}
                  autoFocus
                />
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
})

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

  const id = String(instruction._id)

  const handleUpdate = async (
    values: z.infer<typeof instructionFormSchema>,
  ) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onUpdate(id, values.type, values.content)

      if (result.success) {
        setIsEditingId(null)
        toast.success(result.message)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to update instruction.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await onDelete(id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Failed to delete instruction.")
    }
  }

  if (isEditingId === id) {
    return (
      <div className="relative mb-4 rounded-lg border p-4">
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
    <AccordionItem value={id} className="mb-2 rounded-lg border px-4">
      <AccordionTrigger>
        <span className="text-base wrap-break-word">{instruction.type}</span>
      </AccordionTrigger>
      <AccordionContent>
        <p className="wrap-break-word whitespace-pre-wrap">
          {instruction.content}
        </p>
        <div className="mt-4 flex justify-between max-sm:flex-col max-sm:gap-4">
          <p className="text-muted-foreground flex items-center text-xs">
            Last update: {format(instruction.updatedAt, "d MMM, yyyy")}
          </p>
          <div className="flex gap-2 max-sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingId(id)}
            >
              <PencilIcon className="h-4 w-4" /> Edit
            </Button>
            <AlertDialogComponent
              open={isDeleteDialogOpen}
              setOpen={setIsDeleteDialogOpen}
              action={handleDelete}
              trigger={
                <Button size="sm" variant="destructive">
                  <TrashIcon className="h-4 w-4" /> Delete
                </Button>
              }
              actionName="Delete"
              title="Delete Instruction?"
              description={`Are you sure you want to delete the '${instruction.type}' instruction? This action cannot be undone.`}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function WarningComponent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const setWCD = () => {
      const hasDismissed = localStorage.getItem("warningDismissed")
      if (!hasDismissed) setIsVisible(true)
    }
    setWCD()
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("warningDismissed", "true")
  }

  if (!isVisible) return null

  return (
    <Alert variant="warning" className="group relative mb-4">
      <AlertTitle className="mb-2 flex items-center gap-2">
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
        className="absolute top-2 right-2 p-1 opacity-50 transition-opacity group-hover:opacity-100"
        aria-label="Dismiss warning"
      >
        <XIcon className="h-4 w-4" aria-hidden={true} />
      </button>
    </Alert>
  )
}
