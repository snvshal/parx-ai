"use client"

import { SettingsHeader } from "../header"
import { ModeToggleDropdown } from "../ui/theme-provider"

export default function GeneralSettings() {
  return (
    <SettingsHeader page="General">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Appearance</h3>
          <ModeToggleDropdown />
        </div>
      </div>
    </SettingsHeader>
  )
}
