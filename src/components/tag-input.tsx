import * as React from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  "aria-describedby"?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = "Press Enter to add tag",
  className,
  ...props
}: TagInputProps) {
  const [draft, setDraft] = React.useState("")

  function addTag(next: string) {
    const t = next.trim()
    if (!t) return
    if (value.includes(t)) return
    onChange([...value, t])
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(draft)
      setDraft("")
    } else if (e.key === "Backspace" && draft.length === 0 && value.length) {
      e.preventDefault()
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1" aria-label={`Tag: ${tag}`}>
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center justify-center"
              aria-label={`Remove ${tag}`}
              title={`Remove ${tag}`}
            >
              <X className="size-3.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          {...props}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            addTag(draft)
            setDraft("")
          }}
          aria-label="Add tag"
        >
          Add
        </Button>
      </div>
    </div>
  )
}
