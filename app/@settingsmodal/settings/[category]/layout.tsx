import { SlotDialog } from "@/components/co"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SlotDialog page="/settings">{children}</SlotDialog>
}
