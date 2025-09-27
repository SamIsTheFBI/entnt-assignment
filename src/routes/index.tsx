import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Flower } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <main className="h-svh overflow-hidden flex items-center justify-center">
      <section className="mx-auto max-w-2xl px-6 text-left">
        <div className="mb-6 mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-sm text-muted-foreground">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Flower className="size-11" aria-hidden="true" />
          </span>
          <span className="font-medium text-2xl">TalentFlow</span>
        </div>
        <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
          Modern HR management, simplified
        </h1>
        <p className="mt-4 text-balance text-muted-foreground sm:text-lg leading-relaxed">
          Onboard faster, manage people with clarity, and empower your teams—all in one place.
        </p>
        <div className="mt-8 flex items-center justify-start">
          <Button asChild size="lg" aria-label="Get started with HR management">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </section>
      <div>
        <Flower className="absolute size-36 left-0 opacity-10 hover:rotate-45 transition-all" />
        <Flower className="absolute size-36 left-10 bottom-30 opacity-10 hover:rotate-45 transition-all" />
      </div>
    </main>
  )
}
