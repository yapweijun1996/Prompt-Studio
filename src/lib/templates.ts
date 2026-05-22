import { db } from '../store/db'
import type { Template, GenerationMode, EffortLevel } from '../types'

// A template is a named preset of the settings a user re-types each session.
export interface TemplatePreset {
  name: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
}

// Built-in starters so the feature isn't empty on first use.
export const STARTER_TEMPLATES: TemplatePreset[] = [
  { name: 'Polished email', promptType: 'Email', mode: 'strict', effort: 'medium' },
  { name: 'Brainstorm ideas', promptType: 'Creative Writing', mode: 'creative', effort: 'medium' },
]

export async function saveTemplate(t: Omit<Template, 'id' | 'createdAt'>): Promise<void> {
  await db.templates.add({ ...t, createdAt: Date.now() })
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.templates.delete(id)
}
