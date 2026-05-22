declare module 'agent-runtime-javascript-dist/agrun.js' {
  export interface AgrunSkill {
    name: string
  }

  export interface RunInput {
    provider: 'openai' | 'gemini'
    apiKey: string
    model: string
    prompt: string
    systemPrompt?: string
    endpoint?: string
    apiVariant?: 'chat' | 'responses'
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
    reasoningSummary?: 'auto' | 'concise' | 'detailed' | null
  }

  export interface AgrunError {
    code: string
    message: string
    skill: string | null
    cause: string | null
    details: {
      provider?: string
      status?: number
      reason?: string
      retryable?: boolean
    } | null
  }

  export interface RunOutput {
    kind: string
    text?: string
    provider?: string
    reasoningSummary?: string
  }

  export interface RunResult {
    output: RunOutput | null
    error: AgrunError | null
  }

  export interface RunStep {
    type: string
    detail: unknown
    timestamp?: string
  }

  // A planner "final" decision — the planner directly returns the answer,
  // bypassing the finalizer. See agrun planner-architecture.md.
  export interface PlannerFinalDecision {
    type: 'final'
    answer: string
    reasoning?: string
  }

  export interface RunOptions {
    onStep?: (step: RunStep) => void
    onToken?: (delta: string) => void
    // Invoked when the planner response fails envelope parsing, before the
    // repair cascade. Returning a decision skips repair entirely.
    onInvalidPlannerOutput?: (
      rawText: string,
      parseError: Error | null,
      runState: unknown,
    ) => PlannerFinalDecision | null | undefined | Promise<PlannerFinalDecision | null | undefined>
    abortSignal?: AbortSignal
  }

  export interface Session {
    run(input: RunInput, options?: RunOptions): Promise<RunResult>
  }

  export interface Runtime {
    run(input: RunInput, options?: RunOptions): Promise<RunResult>
    createSession(): Promise<Session>
  }

  export interface RuntimeOptions {
    skills: AgrunSkill[]
    globalMemory?: { enabled: boolean }
    debug?: boolean | ((event: unknown) => void)
  }

  export function createRuntime(options: RuntimeOptions): Runtime
  export const openaiBrowserSkill: AgrunSkill
  export const geminiBrowserSkill: AgrunSkill
  export const fallbackSkill: AgrunSkill
}
