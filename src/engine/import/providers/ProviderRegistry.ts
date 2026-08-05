import type { ASTNode, ContextFrame, Provider, ProviderMatchResult } from '../types'

export class ProviderRegistry {
  private static instance: ProviderRegistry
  private providers: Provider[] = []

  private constructor() {}

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry()
    }
    return ProviderRegistry.instance
  }

  public register(provider: Provider): void {
    // Avoid duplicate registration by id
    const existingIndex = this.providers.findIndex((p) => p.id === provider.id)
    if (existingIndex >= 0) {
      this.providers[existingIndex] = provider
    } else {
      this.providers.push(provider)
    }
  }

  public getProviders(): Provider[] {
    return [...this.providers]
  }

  public matchNode(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null {
    let bestResult: ProviderMatchResult | null = null

    for (const provider of this.providers) {
      const result = provider.match(node, _contextFrame)
      if (result) {
        if (!bestResult || result.confidence > bestResult.confidence) {
          bestResult = result
        }
      }
    }

    return bestResult
  }
}
