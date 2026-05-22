import {
  createRuntime,
  openaiBrowserSkill,
  geminiBrowserSkill,
  fallbackSkill,
} from 'agent-runtime-javascript-dist/agrun.js'
import type { Runtime, RunInput } from 'agent-runtime-javascript-dist/agrun.js'

let _runtime: Runtime | null = null

function getRuntime(): Runtime {
  if (!_runtime) {
    _runtime = createRuntime({
      skills: [openaiBrowserSkill, geminiBrowserSkill, fallbackSkill],
      // One-shot conversions need no cross-session memory — skip the
      // per-turn semantic-extraction LLM call.
      globalMemory: { enabled: false },
    })
  }
  return _runtime
}

/**
 * Runs one one-shot agrun turn and returns the answer text.
 * agrun does NOT throw on provider failure — it resolves with
 * `{ error, output: null }`. This helper normalizes that into a thrown
 * Error carrying the provider HTTP status (for 429 rate-limit handling).
 */
export async function runAgrun(input: RunInput): Promise<string> {
  const result = await getRuntime().run(input, {
    // Prompt Studio is a single-shot rewriter, not an agent task. Our system
    // prompt tells the model to output ONLY the rewritten prompt (no JSON) —
    // correct for the answer, but it makes agrun's PLANNER call return plain
    // text instead of a JSON envelope. That plain text already IS the finished
    // rewrite, so coerce it straight into a `final` decision. This fires before
    // the repair cascade, skipping ~5 wasted LLM calls and the approval-
    // required fallback that was surfacing as an error.
    onInvalidPlannerOutput: (rawText) => {
      const text = typeof rawText === 'string' ? rawText.trim() : ''
      return text ? { type: 'final', answer: text, reasoning: 'one-shot prompt rewrite' } : null
    },
    onStep: (step) => {
      if (
        step.type === 'provider-error' ||
        step.type === 'planner-repair-failed' ||
        step.type === 'action-execute-error' ||
        step.type === 'run-max-steps-reached'
      ) {
        console.warn('[agrun]', step.type, step.detail)
      }
    },
  })

  if (result.error) {
    const status = result.error.details?.status
    throw Object.assign(new Error(result.error.message || 'Provider call failed'), { status })
  }

  const out = result.output
  if (!out) {
    throw new Error('Empty response from provider')
  }
  if (out.kind === 'approval_required') {
    throw new Error('Provider unexpectedly requested approval')
  }
  if (typeof out.text !== 'string' || out.text.trim().length === 0) {
    throw new Error('Provider returned no text')
  }
  return out.text
}
