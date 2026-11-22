"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import GeneralSettings from "./general"

export function GuestSettingsDialog({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="box-border h-[calc(100dvh-4rem)] gap-0 overflow-hidden p-0 max-sm:h-dvh sm:max-w-3xl xl:max-h-140">
        <DialogTitle className="hidden">Settings</DialogTitle>
        <DialogDescription className="hidden">
          Settings configuration
        </DialogDescription>
        <div className="flex h-full w-full max-sm:flex-col">
          <aside className="w-full shrink-0 p-4 sm:h-full sm:max-w-55">
            <div className="mb-8">
              <p className="text-muted-foreground text-xl font-semibold">
                Settings
              </p>
            </div>
            <nav className="flex gap-2 max-sm:flex-wrap sm:flex-col">
              <Button
                className="bg-accent text-accent-foreground flex items-center justify-start gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors"
                variant="ghost"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>General</span>
              </Button>
            </nav>
          </aside>

          <Separator
            orientation="vertical"
            className="my-4 hidden h-[calc(100%-2rem)] sm:block"
          />
          <Separator orientation="horizontal" className="sm:hidden" />

          <main className="h-full flex-1 max-sm:min-h-0">
            <GeneralSettings />
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
