import { SlotDialog } from "@/components/co"

export default async function PeopleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SlotDialog page="/people">{children}</SlotDialog>
}
