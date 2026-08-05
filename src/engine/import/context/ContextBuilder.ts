import type { Alignment, ASTNode, ContextFrame, SectionCategory } from '../types'

export class ContextStack {
  private stack: ContextFrame[] = []

  constructor() {
    // Initial root frame
    this.stack.push({
      nodeId: 'root',
      align: 'left',
      sectionCategory: 'hero',
      depth: 0,
      isInsideLink: false,
      isTable: false,
      isTableRow: false,
      isTableCell: false,
    })
  }

  public current(): ContextFrame {
    return this.stack[this.stack.length - 1]
  }

  public push(
    node: ASTNode,
    sectionCategory?: SectionCategory,
    sectionTitle?: string
  ): ContextFrame {
    const parent = this.current()

    // Determine alignment: inherit parent alignment unless node specifies explicit align
    let align: Alignment = parent.align
    if (node.attributes.align) {
      align = node.attributes.align
    }

    const isInsideLink = parent.isInsideLink || node.type === 'link'
    const linkHref = node.type === 'link' ? (node.attributes.href as string) : parent.linkHref

    const frame: ContextFrame = {
      nodeId: node.id,
      tagName: node.tagName,
      align,
      sectionCategory: sectionCategory || parent.sectionCategory,
      sectionTitle: sectionTitle || parent.sectionTitle,
      depth: parent.depth + 1,
      isInsideLink,
      linkHref,
      isTable: parent.isTable || node.type === 'table',
      isTableRow: parent.isTableRow || node.type === 'table_row',
      isTableCell: parent.isTableCell || node.type === 'table_cell',
      gridColumnSpan: node.attributes.width ? 1 : undefined,
    }

    this.stack.push(frame)
    return frame
  }

  public pop(): ContextFrame | undefined {
    if (this.stack.length > 1) {
      return this.stack.pop()
    }
    return undefined
  }
}
