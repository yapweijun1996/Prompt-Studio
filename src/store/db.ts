import Dexie, { type EntityTable } from 'dexie'
import type { Template, Conversation } from '../types'

const db = new Dexie('PromptStudio') as Dexie & {
  templates: EntityTable<Template, 'id'>
  conversations: EntityTable<Conversation, 'id'>
}

// v1 — templates only. v2 adds the auto-written conversation history.
// templates index list is unchanged (the Template field changes in v2 are
// non-indexed, so no migration is needed).
db.version(2).stores({
  templates: '++id, name, promptType, createdAt',
  conversations: '++id, createdAt',
})

export { db }
