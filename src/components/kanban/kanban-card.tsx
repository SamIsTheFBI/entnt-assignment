import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

export type KanbanCardData = {
  id: string
  title: string
  subtitle?: string
  notes?: string
}

export function KanbanCard({ title, subtitle, notes, actions }: KanbanCardData & { actions?: React.ReactNode }) {
  return (
    <Card className="bg-card hover:bg-accent/40 transition-colors cursor-grab active:cursor-grabbing">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm leading-6">{title}</CardTitle>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </CardHeader>
      {notes ? (
        <CardContent className="pt-0 pb-3">
          <p className="text-xs text-muted-foreground">{notes}</p>
        </CardContent>
      ) : null}
    </Card>
  )
}
