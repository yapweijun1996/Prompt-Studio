import { db } from '../store/db'
import type { Conversation } from '../types'

// Cap the auto-written log; oldest unpinned rows are pruned past this.
const MAX_HISTORY = 200

function deriveTitle(input: string): string {
  const firstLine = input.trim().split('\n')[0].trim()
  if (!firstLine) return 'Untitled'
  return firstLine.length > 80 ? firstLine.slice(0, 80) + '…' : firstLine
}

/** Persist one completed Convert run, then prune old unpinned rows. */
export async function saveConversation(
  data: Omit<Conversation, 'id' | 'createdAt' | 'pinned' | 'title'>,
): Promise<void> {
  await db.conversations.add({
    ...data,
    title: deriveTitle(data.input),
    pinned: false,
    createdAt: Date.now(),
  })
  await pruneHistory()
}

async function pruneHistory(): Promise<void> {
  const all = await db.conversations.orderBy('createdAt').toArray()
  const unpinned = all.filter((c) => !c.pinned)
  if (unpinned.length <= MAX_HISTORY) return
  const excess = unpinned.slice(0, unpinned.length - MAX_HISTORY)
  await db.conversations.bulkDelete(excess.map((c) => c.id as number))
}

export async function togglePin(id: number, pinned: boolean): Promise<void> {
  await db.conversations.update(id, { pinned })
}

export async function deleteConversation(id: number): Promise<void> {
  await db.conversations.delete(id)
}

export async function clearAllHistory(): Promise<void> {
  await db.conversations.clear()
}
