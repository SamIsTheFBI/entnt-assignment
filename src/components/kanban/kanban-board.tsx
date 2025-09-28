import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  getAllCandidates,
  moveCandidateStage,
  seedIfEmpty,
  updateCandidateNote,
} from "@/services/db-queries/candidates"
import type { Candidate } from "@/types/candidates"

const stages: Candidate["stage"][] = ["applied", "screening", "rejected", "hired"]

export default function KanbanBoardDexie() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const init = async () => {
      await seedIfEmpty()
      const list = await getAllCandidates()
      if (active) {
        setCandidates(list)
        setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  const reload = useCallback(async () => {
    const list = await getAllCandidates()
    setCandidates(list)
  }, [])

  const byStage = useMemo(() => {
    const grouped: Record<Candidate["stage"], Candidate[]> = {
      applied: [],
      screening: [],
      rejected: [],
      hired: [],
    }
    for (const c of candidates || []) {
      if (grouped[c.stage]) grouped[c.stage].push(c)
    }
    return grouped
  }, [candidates])

  const handleDropOnStage = useCallback(
    async (stage: Candidate["stage"], e: React.DragEvent) => {
      e.preventDefault()
      const id = e.dataTransfer.getData("application/candidate-id") || e.dataTransfer.getData("text/plain")
      if (!id) return
      await moveCandidateStage(id, stage)
      await reload()
    },
    [reload],
  )

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading candidates…</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {stages.map((stage) => (
        <StageColumn
          key={stage}
          title={stage}
          candidates={byStage[stage]}
          onDrop={(e) => handleDropOnStage(stage, e)}
          onChanged={reload}
        />
      ))}
    </div>
  )
}

function StageColumn({
  title,
  candidates,
  onDrop,
  onChanged,
}: {
  title: Candidate["stage"]
  candidates: Candidate[]
  onDrop: (e: React.DragEvent) => void
  onChanged: () => void
}) {
  return (
    <section
      className={cn("rounded-lg border bg-card text-card-foreground", "flex flex-col")}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      aria-label={`${title} column`}
    >
      <header className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium text-pretty">{title}</h2>
      </header>
      <div className="flex flex-col gap-3 p-3">
        {candidates?.length ? (
          candidates.map((c) => <CandidateCard key={c.id} candidate={c} onChanged={onChanged} />)
        ) : (
          <div className="text-xs text-muted-foreground px-1 py-2">No candidates</div>
        )}
      </div>
    </section>
  )
}

function CandidateCard({ candidate, onChanged }: { candidate: Candidate; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(candidate.specialNote || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNote(candidate.specialNote || "")
  }, [candidate.specialNote])

  const onDragStart = (e: React.DragEvent) => {
    if (!candidate.id) return
    e.dataTransfer.setData("application/candidate-id", String(candidate.id))
    e.dataTransfer.setData("text/plain", String(candidate.id))
    e.dataTransfer.effectAllowed = "move"
  }

  const onSave = async () => {
    if (!candidate.id) return
    setSaving(true)
    try {
      await updateCandidateNote(candidate.id, note)
      onChanged()
    } finally {
      setSaving(false)
      setOpen(false)
    }
  }

  return (
    <article
      className={cn("rounded-md border bg-background", "p-3 flex flex-col gap-2", "cursor-grab active:cursor-grabbing")}
      draggable
      onDragStart={onDragStart}
      aria-label={`${candidate.name} - ${candidate.jobRole}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-pretty truncate">{candidate.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{candidate.jobRole}</p>
          <p className="text-[11px] text-muted-foreground truncate">{candidate.email}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation()
              }}
              aria-label="Edit special note"
              title="Edit special note"
            >
              <StickyNote className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Special note for {candidate.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a special note…"
                className="min-h-32"
              />
              <p className="text-xs text-muted-foreground">
                Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
              </p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {candidate.specialNote ? (
        <p className="text-xs text-muted-foreground line-clamp-3">{candidate.specialNote}</p>
      ) : null}
    </article>
  )
}

