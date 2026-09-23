export class LlmProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly transient: boolean,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "LlmProviderError";
  }
}
