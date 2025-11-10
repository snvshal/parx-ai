"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AlertDialogComponent } from "../co"
import { SettingsHeader } from "../header"

export default function AccountSettings() {
  const [openSignOut, setOpenSignOut] = useState(false)

  return (
    <SettingsHeader page="Account">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Account Management</h3>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setOpenSignOut(true)}
            className="w-fit"
          >
            Sign Out
          </Button>
        </div>

        <AlertDialogComponent
          open={openSignOut}
          setOpen={setOpenSignOut}
          action={async () => {
            await signOut()
          }}
          trigger={<span>Sign Out</span>}
          hidden={true}
          actionName="Sign Out"
          title="Confirm Sign Out"
          description="Are you sure you want to sign out? You will need to log in again to access your account."
        />
      </div>
    </SettingsHeader>
  )
}
