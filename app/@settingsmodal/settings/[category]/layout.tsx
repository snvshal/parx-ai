import { SlotDialog } from "@/components/co"
import { SettingsSidebar } from "@/components/settings/settings-list"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SlotDialog page="/settings">
      <SettingsSidebar>{children}</SettingsSidebar>
    </SlotDialog>
  )
}
