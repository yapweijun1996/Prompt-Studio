import Dexie, { type EntityTable } from 'dexie'
import type { Template } from '../types'

const db = new Dexie('PromptStudio') as Dexie & {
  templates: EntityTable<Template, 'id'>
}

db.version(1).stores({
  templates: '++id, name, promptType, createdAt',
})

export { db }
