import type React from "react"

import { type ReactNode, useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ColumnId } from "@/types/candidates"

export function KanbanColumn({
  id,
  title,
  cards,
  onDrop,
  onDragOver,
  children,
}: {
  id: ColumnId
  title: string
  cards: unknown[]
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  children: ReactNode
}) {
  const [isOver, setIsOver] = useState(false)

  return (
    <section aria-labelledby={`${id}-heading`} className="flex flex-col">
      <header className="mb-2 md:mb-3">
        <h2 id={`${id}-heading`} className="text-pretty text-sm font-medium text-muted-foreground">
          {title}
        </h2>
      </header>

      <Card
        role="region"
        aria-label={`${id} column`}
        onDragOver={(e) => {
          onDragOver(e)
          setIsOver(true)
        }}
        onDragEnter={() => setIsOver(true)}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          onDrop(e)
          setIsOver(false)
        }}
        className={cn(
          "bg-card border-border p-2 md:p-3 transition-colors min-h-[660px]",
          isOver ? "outline-2 outline-color-ring" : "outline-none",
        )}
      >
        <div role="list" aria-label={`${id} items`} className="flex flex-col gap-2">
          {children}
          {cards.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6 select-none">Drop items here</p>
          )}
        </div>
      </Card>
    </section>
  )
}
