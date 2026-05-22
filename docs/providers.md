# Provider Reference

## Default Demo Provider (GPT Gateway)

**Endpoint**: `https://gpt.yapweijun1996.com/v1/responses`
**Model**: `gpt-5.4-mini`
**Format**: OpenAI Responses API
**Rate limit**: 30 req/min (sliding window) → max 10 Convert/min

### Request Shape

```json
{
  "model": "gpt-5.4-mini",
  "input": [
    {
      "role": "user",
      "content": [{ "type": "input_text", "text": "<prompt>" }]
    }
  ],
  "instructions": "<system prompt>",
  "stream": false,
  "reasoning": { "effort": "medium" }
}
```

### Auth
```
Authorization: Bearer <XOR-decrypted key>
Content-Type: application/json
```

### Demo Key
Stored as XOR-obfuscated hex in source. Decrypted at runtime with key `"20260515"`. Not persisted in localStorage for the demo key — only user-supplied keys are persisted.

---

## OpenAI (Direct)

**Endpoint**: `https://api.openai.com/v1/responses`
**Models**: `o3`, `o4-mini`, `gpt-5.2`, `gpt-5.5`, and others
**Format**: OpenAI Responses API

### Reasoning Effort

`reasoning.effort` controls how much compute the model spends reasoning before answering.

| Value | When to use | Latency | Cost |
|---|---|---|---|
| `"low"` | Fast, simple prompts | Lowest | Lowest |
| `"medium"` | Default balanced | Medium | Medium |
| `"high"` | Complex reasoning, agentic | High | High |
| `"xhigh"` | Hardest tasks, async | Highest | Highest |

> `"xhigh"` is only available on GPT-5.2+. Older models (o3, o4-mini) support low/medium/high only.

### Request Shape

```json
{
  "model": "o3",
  "input": [
    {
      "role": "user",
      "content": [{ "type": "input_text", "text": "<prompt>" }]
    }
  ],
  "reasoning": { "effort": "medium" }
}
```

### UI Mapping (EffortSelector)

| UI Label | `reasoning.effort` |
|---|---|
| Quick | `"low"` |
| Balanced (default) | `"medium"` |
| Thorough | `"high"` |
| Deep (GPT-5.2+ only) | `"xhigh"` |

---

## Gemini (Google Generative AI)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`
**Models**: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-3-pro` (check availability)
**Format**: Google Generative AI REST API

### Thinking Budget

`thinkingConfig.thinkingBudget` controls how many tokens the model can use for internal reasoning.

| Value | Meaning |
|---|---|
| `0` | No thinking — fastest, cheapest |
| `1` – `24576` | Flash models: fixed token budget |
| `1` – `32768` | Pro models: fixed token budget |
| `-1` | Dynamic thinking — model decides (max 8192 tokens) |

> Thinking is **enabled by default** for Gemini 2.5 series. Set `thinkingBudget: 0` to disable.

### Request Shape

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "<prompt>" }]
    }
  ],
  "systemInstruction": {
    "parts": [{ "text": "<system prompt>" }]
  },
  "generationConfig": {
    "thinkingConfig": {
      "thinkingBudget": 1024,
      "includeThoughts": false
    }
  }
}
```

### UI Mapping (EffortSelector)

| UI Label | `thinkingBudget` |
|---|---|
| Quick | `0` (no thinking) |
| Balanced (default) | `-1` (dynamic) |
| Thorough | `8192` |
| Deep | `32768` (Pro only) |

### Auth
```
x-goog-api-key: <user API key>
Content-Type: application/json
```

---

## Custom Provider

**Endpoint**: User-supplied (must be OpenAI Responses API compatible)
**Format**: OpenAI Responses API (passthrough)

Passes `reasoning.effort` through as-is. Users are responsible for model compatibility.

---

## Provider Adapter Interface

All providers implement the same internal interface:

```ts
interface ProviderAdapter {
  call(params: {
    systemPrompt: string
    userPrompt: string
    effort: 'low' | 'medium' | 'high' | 'xhigh'
  }): Promise<string>
}
```

The `effort` value is mapped to provider-specific parameters inside each adapter. The UI always uses the 4-level abstraction.
