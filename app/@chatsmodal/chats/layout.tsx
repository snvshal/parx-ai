import { SlotDialog } from "@/components/co"

export default async function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SlotDialog page="/chats">{children}</SlotDialog>
}
