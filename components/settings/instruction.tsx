"use client"

import { memo, useEffect, useState, useTransition } from "react"
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
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
import { useForm, useWatch, useFieldArray } from "react-hook-form"
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
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSessionUser } from "@/hooks/use-session-user"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"

const instructionFormSchema = InstructionZodSchema.pick({
  type: true,
  content: true,
  links: true,
  mediaUrls: true,
})

type GifResult = {
  id: string
  title?: string
  url: string
  thumbnail?: string
}

type GifDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (gif: GifResult) => void
}

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
  showLinks?: boolean
  showMedia?: boolean
  userId?: string
}

type InstructionItemProps = {
  instruction: TInstruction
  isEditing: boolean
  setIsEditing: (val: boolean) => void
  onUpdate: (
    id: string,
    type: string,
    content: string,
    links?: { url: string; alt: string }[],
    mediaUrls?: { url: string; alt: string }[],
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
  const [editingInstructionId, setEditingInstructionId] = useState<
    string | null
  >(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const sessionUser = useSessionUser()

  const setAddNewInst = (value: boolean) => {
    setAddNewInstruction(value)
    localStorage.setItem("addNewInstruction", value.toString())
  }

  const setEditingInst = (id: string | null) => {
    setEditingInstructionId(id)
  }

  const handleAdd = async (values: z.infer<typeof instructionFormSchema>) => {
    setError(null)

    try {
      const newInstruction: TNewInstruction = {
        type: values.type,
        content: values.content,
        mediaUrls: values.mediaUrls ?? [],
        links: values.links ?? [],
      }

      const result = await addInstruction(newInstruction)

      if (result && "error" in result) {
        setError(result.error)
        return
      }

      startTransition(() => {
        setInstructions((prev) => [result, ...prev])
        setAddNewInst(false)
      })

      toast.success("Instruction added successfully!")
    } catch {
      setError("Failed to add instruction.")
    }
  }

  const handleUpdate = async (
    id: string,
    type: string,
    content: string,
    links?: { url: string; alt: string }[],
    mediaUrls?: { url: string; alt: string }[],
  ) => {
    try {
      const result = await updateInstruction(
        id,
        type,
        content,
        links,
        mediaUrls,
      )

      if (result.success) {
        setInstructions(
          (prev) =>
            prev.map((inst) =>
              String(inst._id) === id
                ? {
                    ...inst,
                    type,
                    content,
                    links: links ?? inst.links,
                    mediaUrls: mediaUrls ?? inst.mediaUrls,
                  }
                : inst,
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
    <SettingsHeader
      page={`Instructions${addNewInstruction ? " / New" : editingInstructionId ? " / Edit" : ""}`}
    >
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
            userId={sessionUser?.id}
          />
        </div>
      ) : editingInstructionId ? (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Edit Instruction</h2>
          </div>

          {instructions.find(
            (inst) => String(inst._id) === editingInstructionId,
          ) ? (
            <InstructionForm
              onSubmit={async (values) => {
                startTransition(async () => {
                  const inst = instructions.find(
                    (i) => String(i._id) === editingInstructionId,
                  )
                  if (inst) {
                    await handleUpdate(
                      editingInstructionId,
                      values.type,
                      values.content,
                      values.links,
                      values.mediaUrls,
                    )
                    setEditingInst(null)
                  }
                })
              }}
              onCancel={() => setEditingInst(null)}
              isSubmitting={isPending}
              error={error}
              setError={setError}
              submitButtonText="Save"
              userId={sessionUser?.id}
              defaultValues={{
                type:
                  instructions.find(
                    (i) => String(i._id) === editingInstructionId,
                  )?.type || "",
                content:
                  instructions.find(
                    (i) => String(i._id) === editingInstructionId,
                  )?.content || "",
                links:
                  instructions.find(
                    (i) => String(i._id) === editingInstructionId,
                  )?.links || [],
                mediaUrls:
                  instructions.find(
                    (i) => String(i._id) === editingInstructionId,
                  )?.mediaUrls || [],
              }}
            />
          ) : null}
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
                isEditing={String(instruction._id) === editingInstructionId}
                setIsEditing={(val) =>
                  val
                    ? setEditingInst(String(instruction._id))
                    : setEditingInst(null)
                }
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
  defaultValues = { type: "", content: "", links: [], mediaUrls: [] },
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  setError,
  submitButtonText,
  showLinks = true,
  showMedia = true,
  userId,
}: InstructionFormProps) {
  const form = useForm<z.infer<typeof instructionFormSchema>>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues,
  })

  const values = useWatch({ control: form.control })

  const { fields, remove, insert } = useFieldArray({
    control: form.control,
    name: "links",
  })

  const {
    fields: mediaFields,
    insert: insertMedia,
    remove: removeMedia,
  } = useFieldArray({
    control: form.control,
    name: "mediaUrls",
  })

  // track whether a given media index is uploading and any preview object URLs
  const [uploadingMedia, setUploadingMedia] = useState<Record<number, boolean>>(
    {},
  )
  const [previewObjectUrls, setPreviewObjectUrls] = useState<
    Record<number, string>
  >({})
  // GIF selector state (dialog open + index) — refined to a single reusable component
  const [gifDialogOpen, setGifDialogOpen] = useState(false)
  const [gifDialogIndex, setGifDialogIndex] = useState<number | null>(null)

  useEffect(() => {
    const se = () => setError(null)
    se()
  }, [values, setError])

  const handleSubmit = async (
    values: z.infer<typeof instructionFormSchema>,
  ) => {
    await onSubmit(values)
  }

  const handleFileUpload = async (index: number, file?: File | null) => {
    if (!file) return
    // create a local preview immediately so user sees the image before upload
    const localObjectUrl = URL.createObjectURL(file)
    // set preview value into the form (shows image immediately)
    form.setValue(`mediaUrls.${index}.url`, localObjectUrl, {
      shouldDirty: true,
      shouldValidate: false,
    })

    // remember this object url so we can revoke it later when replaced
    setPreviewObjectUrls((s) => ({ ...s, [index]: localObjectUrl }))

    try {
      setUploadingMedia((s) => ({ ...s, [index]: true }))
      const fd = new FormData()
      fd.append("file", file)
      if (userId) {
        fd.append("userId", userId)
      }

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: fd,
      })

      const data = await res.json()

      if (!res.ok) {
        // on failure keep local preview but notify and stop uploading
        toast.error(data?.error || "Image upload failed")
        return
      }

      // set uploaded cloud url into form (replace the local preview)
      // revoke local object url for this index (if any) to avoid leaks
      if (previewObjectUrls[index]) {
        try {
          URL.revokeObjectURL(previewObjectUrls[index])
        } catch {}
        setPreviewObjectUrls((s) => {
          const t = { ...s }
          delete t[index]
          return t
        })
      }

      form.setValue(`mediaUrls.${index}.url`, data.url, {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success("Image uploaded!")
    } catch (err) {
      console.error(err)
      toast.error("Image upload failed!")
    } finally {
      setUploadingMedia((s) => ({ ...s, [index]: false }))
    }
  }

  // revoke any leftover object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewObjectUrls).forEach((url) => {
        try {
          URL.revokeObjectURL(url)
        } catch {}
      })
    }
  }, [previewObjectUrls])

  // whether any media uploads are currently in progress
  const hasUploading = Object.values(uploadingMedia).some(Boolean)

  // handle selecting a GIF from dialog for a given index
  const handleGifSelect = (gif: {
    id: string
    title?: string
    url: string
  }) => {
    const index = gifDialogIndex
    if (index === null) return

    // revoke object url if any for this index
    if (previewObjectUrls[index]) {
      try {
        URL.revokeObjectURL(previewObjectUrls[index])
      } catch {}
      setPreviewObjectUrls((s) => {
        const t = { ...s }
        delete t[index]
        return t
      })
    }

    form.setValue(`mediaUrls.${index}.url`, gif.url, {
      shouldDirty: true,
      shouldValidate: true,
    })

    form.setValue(`mediaUrls.${index}.alt`, gif.title || "GIF", {
      shouldDirty: true,
    })

    setGifDialogOpen(false)
    setGifDialogIndex(null)
    toast.success("GIF selected")
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
        {showLinks ? (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Links</h3>
              {!isSubmitting && (
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => insert(0, { url: "", alt: "" })}
                >
                  <PlusIcon className="h-4 w-4" /> Add Link
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {fields.length ? (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Link {fields.length - index}
                      </p>
                      {!isSubmitting && (
                        <Button
                          size="sm"
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`links.${index}.url` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="URL"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`links.${index}.alt` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="ALT text"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">
                  <em>No links added yet</em>
                </p>
              )}
              {/* GIF dialog rendered once */}
              <GifDialog
                open={gifDialogOpen}
                onOpenChange={setGifDialogOpen}
                onSelect={handleGifSelect}
              />
            </div>

            {/* GIF dialog will be rendered once, after media list */}
          </div>
        ) : null}
        {showMedia ? (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium">Images</h3>
              {!isSubmitting && (
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => insertMedia(0, { url: "", alt: "" })}
                >
                  <PlusIcon className="h-4 w-4" /> Add Image
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {mediaFields.length ? (
                mediaFields.map((mfield, mindex) => (
                  <div
                    key={mfield.id}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Image {mediaFields.length - mindex}
                      </p>
                      {!isSubmitting && (
                        <Button
                          size="sm"
                          type="button"
                          variant="destructive"
                          onClick={() => removeMedia(mindex)}
                          disabled={uploadingMedia[mindex]}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`upload-i-image-${mindex}`}
                        className={cn(
                          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-button flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md border p-2 px-4 py-2",
                          (isSubmitting || !!uploadingMedia[mindex]) &&
                            "cursor-not-allowed opacity-50",
                        )}
                      >
                        {uploadingMedia[mindex]
                          ? "Uploading..."
                          : "Upload Image"}
                      </Label>
                      <Input
                        id={`upload-i-image-${mindex}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(mindex, e.target.files?.[0])
                        }
                        disabled={isSubmitting || !!uploadingMedia[mindex]}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setGifDialogIndex(mindex)
                          setGifDialogOpen(true)
                        }}
                        disabled={isSubmitting}
                        className="border"
                      >
                        GIF
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`mediaUrls.${mindex}.url` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Image URL (uploaded)"
                              {...field}
                              className="hidden"
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`mediaUrls.${mindex}.alt` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Image ALT text"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.getValues(`mediaUrls.${mindex}.url`) ? (
                      <div className="relative mt-2 inline-block h-28 w-auto">
                        <Image
                          src={
                            form.getValues(`mediaUrls.${mindex}.url`) ??
                            form.watch(`mediaUrls.${mindex}.url`)
                          }
                          alt={form.getValues(`mediaUrls.${mindex}.alt`)}
                          width={200}
                          height={200}
                          className="h-28 w-auto rounded-md border object-cover"
                          loading="lazy"
                        />
                        {uploadingMedia[mindex] && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
                            <LoaderCircleIcon
                              className="h-10 w-10 animate-spin text-white/90"
                              strokeWidth={1}
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">
                  <em>No Images added yet</em>
                </p>
              )}
            </div>
          </div>
        ) : null}
        <div className="flex justify-end gap-2 border-t pt-4">
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
              isSubmitting || !!error || !form.formState.isDirty || hasUploading
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
  isEditing,
  setIsEditing,
  onUpdate,
  onDelete,
}: InstructionItemProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)

  const id = String(instruction._id)

  const handleUpdate = async (
    values: z.infer<typeof instructionFormSchema>,
  ) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await onUpdate(
        id,
        values.type,
        values.content,
        values.links,
        values.mediaUrls,
      )

      if (result.success) {
        setIsEditing(false)
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

  if (isEditing) {
    return (
      <div className="relative mb-4 rounded-lg border p-4">
        <InstructionForm
          defaultValues={{
            type: instruction.type,
            content: instruction.content,
            links: instruction.links ?? [],
            mediaUrls: instruction.mediaUrls ?? [],
          }}
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditing(false)
            setError(null)
          }}
          isSubmitting={isSubmitting}
          error={error}
          setError={setError}
          submitButtonText="Save"
          showLinks={true}
          showMedia={true}
        />
      </div>
    )
  }

  return (
    <AccordionItem value={id} className="mb-2 rounded-lg border px-4">
      <AccordionTrigger className="cursor-pointer">
        <span className="text-base wrap-break-word">{instruction.type}</span>
      </AccordionTrigger>
      <AccordionContent>
        <p className="wrap-break-word whitespace-pre-wrap">
          {instruction.content}
        </p>

        {/* Display Media */}
        {instruction.mediaUrls && instruction.mediaUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {instruction.mediaUrls.map((media, idx) => (
              <div
                key={`media-${idx}`}
                className="group relative cursor-pointer overflow-hidden rounded-md border"
                onClick={() =>
                  setSelectedImage({
                    url: media.url,
                    alt: media.alt || `Image ${idx + 1}`,
                  })
                }
              >
                <Image
                  src={media.url}
                  alt={media.alt}
                  width={200}
                  height={200}
                  className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Display Links */}
        {instruction.links && instruction.links.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {instruction.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-primary hover:bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all"
              >
                <ExternalLinkIcon className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                <span className="text-muted-foreground group-hover:decoration-primary group-hover:text-primary flex-1 underline decoration-transparent transition-all">
                  {link.alt || link.url}
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-between max-sm:flex-col max-sm:gap-4">
          <p className="text-muted-foreground flex items-center text-xs">
            Last update: {format(instruction.updatedAt, "d MMM, yyyy")}
          </p>
          <div className="flex gap-2 max-sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
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
      <ImageDialog
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </AccordionItem>
  )
}

export type ImageDialogProps = {
  selectedImage: {
    url: string
    alt: string
  } | null
  setSelectedImage: React.Dispatch<
    React.SetStateAction<{
      url: string
      alt: string
    } | null>
  >
}

export function ImageDialog({
  selectedImage,
  setSelectedImage,
}: ImageDialogProps) {
  return (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogTitle className="hidden"></DialogTitle>
      <DialogDescription className="hidden"></DialogDescription>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-6xl overflow-hidden rounded-2xl p-0">
        <div className="grid h-[95vh] grid-cols-1 md:grid-cols-4">
          <div className="bg-muted/30 col-span-3 flex items-center justify-center p-4 md:p-6">
            <div className="relative h-full max-h-80 min-h-48 w-full sm:max-h-[calc(95vh-4rem)]">
              {selectedImage && (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
              )}
            </div>
          </div>

          <div className="bg-background col-span-1 overflow-y-auto border-l p-4 md:p-6">
            <h2 className="text-foreground mb-4 text-sm font-medium">
              Alt text
            </h2>
            <div>
              {selectedImage?.alt ? (
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {selectedImage.alt}
                </p>
              ) : (
                <p className="text-muted-foreground/70 italic">
                  No description available
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

export function GifDialog({ open, onOpenChange, onSelect }: GifDialogProps) {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState("")
  const [results, setResults] = useState<GifResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function search(q: string) {
    if (!q.trim()) {
      setError("Please enter a search term")
      return
    }
    if (searched.trim() === q.trim()) return

    setSearched(q)
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/gif/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q, limit: 16 }),
      })
      const data: { gifs?: GifResult[]; error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.gifs ?? [])
    } catch (err) {
      console.error(err)
      setError("Search failed")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   // when dialog opens, pre-load trending results
  //   if (open) {
  //     void search("trending")
  //   }
  // }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-sm:h-dvh max-sm:w-screen max-sm:max-w-none sm:max-h-[calc(100dvh-4rem)] xl:max-h-140">
        <DialogTitle className="hidden"></DialogTitle>
        <DialogDescription className="hidden"></DialogDescription>
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-lg leading-none font-semibold tracking-tight max-sm:text-center">
            Add GIF
          </h2>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void search(query)
                }
              }}
            />
            <Button
              type="button"
              onClick={async () => {
                await search(query)
              }}
              className="h-10"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          <div className="flex max-h-[calc(100dvh-14rem)] min-h-0 flex-1 flex-wrap gap-2 overflow-auto xl:max-h-105">
            {results.length ? (
              results.map((g) => (
                <button
                  className="hover:brightness-90"
                  key={g.id}
                  onClick={() =>
                    onSelect({
                      id: g.id,
                      title: g.title,
                      url: g.url,
                      thumbnail: g.thumbnail,
                    })
                  }
                >
                  <Image
                    src={g.thumbnail || g.url}
                    alt={g.title || "GIF"}
                    height={200}
                    width={200}
                    className="h-28 w-full object-cover"
                  />
                </button>
              ))
            ) : (
              <div className="text-muted-foreground col-span-full py-8 text-center text-sm">
                {loading
                  ? "Searching..."
                  : "No gifs yet — search to load results"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function InstructionSkeleton() {
  return (
    <SettingsHeader page={"Instructions"}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Added</h2>
          <Skeleton className="h-6 w-6" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </SettingsHeader>
  )
}
