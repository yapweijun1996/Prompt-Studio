import { useStore } from '../store/useStore'
import { OutputCard } from './OutputCard'

export function OutputList() {
  const outputs = useStore((s) => s.outputs)

  if (outputs.length === 0) return null

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {outputs.map((card) => (
        <OutputCard key={card.id} card={card} />
      ))}
    </section>
  )
}
