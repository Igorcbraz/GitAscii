import type { ASTNode, ContextFrame, Provider, ProviderMatchResult } from '../types'

export abstract class BaseProvider implements Provider {
  abstract id: string
  abstract name: string
  description?: string

  abstract match(node: ASTNode, _contextFrame: ContextFrame): ProviderMatchResult | null

  protected extractImageSrc(node: ASTNode): string | null {
    if (node.type === 'image' && node.attributes.src) {
      return node.attributes.src as string
    }
    if (node.type === 'link') {
      const imgChild = node.children.find((c) => c.type === 'image' && c.attributes.src)
      if (imgChild && imgChild.attributes.src) {
        return imgChild.attributes.src as string
      }
    }
    return null
  }

  protected extractLinkHref(node: ASTNode, _contextFrame: ContextFrame): string | null {
    if (node.type === 'link' && node.attributes.href) {
      return node.attributes.href as string
    }
    return _contextFrame.linkHref || null
  }
}
