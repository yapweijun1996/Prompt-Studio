import type { EffortLevel } from '../../types'

const EFFORT_TO_BUDGET: Record<EffortLevel, number> = {
  low: 0,
  medium: -1, // dynamic thinking
  high: 8192,
  xhigh: 32768,
}

// Flash models cap thinkingBudget at 24576; Pro models at 32768.
function clampBudget(model: string, budget: number): number {
  if (budget < 0) return budget // -1 = dynamic, leave as-is
  const max = model.toLowerCase().includes('flash') ? 24576 : 32768
  return Math.min(budget, max)
}

export async function callGemini(params: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  effort: EffortLevel
}): Promise<string> {
  const thinkingBudget = clampBudget(params.model, EFFORT_TO_BUDGET[params.effort])
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`

  const body = {
    contents: [{ role: 'user', parts: [{ text: params.userPrompt }] }],
    systemInstruction: { parts: [{ text: params.systemPrompt }] },
    generationConfig: {
      thinkingConfig: {
        thinkingBudget,
        includeThoughts: false,
      },
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error((err as { error?: { message?: string } }).error?.message ?? `Gemini ${res.status}`), { status: res.status })
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
