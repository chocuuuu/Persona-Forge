"use client"

import AppShell from "@/components/app-shell"
import ChatUI from "@/components/chat-ui"

export default function ChatPage() {
  return (
    <AppShell>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col px-4 py-4">
        <div className="mt-3 flex-1 min-h-0">
          <ChatUI className="h-full min-h-0" />
        </div>
      </div>
    </AppShell>
  )
}
