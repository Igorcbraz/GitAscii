import type { Alignment, ASTAttributes, ASTNode, ASTNodeType } from '../types'
import { normalizeUrl } from '../url/UrlNormalizer'

export function parseReadmeToAST(rawMarkdown: string): ASTNode {
  // 1. Strip HTML comments completely
  const sanitized = rawMarkdown.replace(/<!--[\s\S]*?-->/g, '')

  let nextId = 1
  const generateId = () => `node_${nextId++}`

  const rootNode: ASTNode = {
    id: 'root',
    type: 'document',
    attributes: {},
    children: [],
    textContent: '',
    indexInParent: 0,
  }

  // Helper to extract HTML attributes from a tag string
  const parseAttributes = (tagStr: string): ASTAttributes => {
    const attrs: ASTAttributes = {}

    // Extract align="center/left/right"
    const alignMatch = tagStr.match(/align=["']?(left|center|right)["']?/i)
    if (alignMatch) {
      attrs.align = alignMatch[1].toLowerCase() as Alignment
    }

    // Extract src="..."
    const srcMatch = tagStr.match(/src=["']([^"']+)["']/i)
    if (srcMatch) {
      attrs.src = normalizeUrl(srcMatch[1])
    }

    // Extract href="..."
    const hrefMatch = tagStr.match(/href=["']([^"']+)["']/i)
    if (hrefMatch) {
      attrs.href = normalizeUrl(hrefMatch[1])
    }

    // Extract alt="..."
    const altMatch = tagStr.match(/alt=["']([^"']*)["']/i)
    if (altMatch) {
      attrs.alt = altMatch[1]
    }

    // Extract width="..."
    const widthMatch = tagStr.match(/width=["']?(\d+%?|auto)["']?/i)
    if (widthMatch) {
      attrs.width = widthMatch[1]
    }

    // Extract height="..."
    const heightMatch = tagStr.match(/height=["']?(\d+%?|auto)["']?/i)
    if (heightMatch) {
      attrs.height = heightMatch[1]
    }

    // Extract id="..." and class="..."
    const idMatch = tagStr.match(/id=["']([^"']+)["']/i)
    if (idMatch) attrs.id = idMatch[1]

    const classMatch = tagStr.match(/class=["']([^"']+)["']/i)
    if (classMatch) attrs.class = classMatch[1]

    // Extract style="..."
    const styleMatch = tagStr.match(/style=["']([^"']+)["']/i)
    if (styleMatch) {
      attrs.style = styleMatch[1]
      if (!attrs.align) {
        if (/text-align\s*:\s*center/i.test(styleMatch[1])) attrs.align = 'center'
        else if (/text-align\s*:\s*right/i.test(styleMatch[1])) attrs.align = 'right'
        else if (/text-align\s*:\s*left/i.test(styleMatch[1])) attrs.align = 'left'
      }
    }

    return attrs
  }

  // Tokenize & Parse hybrid HTML/Markdown blocks
  const parseBlock = (content: string, parent: ASTNode) => {
    const lines = content.split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed) {
        i++
        continue
      }

      // Check for horizontal divider
      if (
        /^---+$/.test(trimmed) ||
        /^___+$/.test(trimmed) ||
        /^\*\*\*+$/.test(trimmed) ||
        /^<hr\s*\/?>$/i.test(trimmed)
      ) {
        const divNode: ASTNode = {
          id: generateId(),
          type: 'divider',
          attributes: {},
          children: [],
          textContent: '---',
          indexInParent: parent.children.length,
          parentId: parent.id,
        }
        parent.children.push(divNode)
        i++
        continue
      }

      // Check for Markdown Heading (# Header)
      const mdHeaderMatch = line.match(/^(#{1,6})\s+(.*)$/)
      if (mdHeaderMatch) {
        const level = mdHeaderMatch[1].length
        const headingText = mdHeaderMatch[2].trim()
        const headingNode: ASTNode = {
          id: generateId(),
          type: 'heading',
          attributes: { level },
          children: [],
          textContent: headingText,
          indexInParent: parent.children.length,
          parentId: parent.id,
        }
        // Parse inline images/links inside heading if present
        parseInlineElements(headingText, headingNode)
        parent.children.push(headingNode)
        i++
        continue
      }

      // Check for HTML Opening Tag block (e.g. <div ...>, <p ...>, <table ...>, <blockquote ...>, <h1 ...>)
      const htmlBlockMatch = line.match(/^<([a-z1-6]+)([\s\S]*?)>/i)
      if (htmlBlockMatch) {
        const tagName = htmlBlockMatch[1].toLowerCase()
        const attributes = parseAttributes(line)

        // Self closing tags like <img .../>, <br/>, <hr/>
        if (tagName === 'img') {
          const imgNode: ASTNode = {
            id: generateId(),
            type: 'image',
            tagName: 'img',
            attributes,
            children: [],
            textContent: attributes.alt ? (attributes.alt as string) : '',
            rawHtml: line,
            indexInParent: parent.children.length,
            parentId: parent.id,
          }
          parent.children.push(imgNode)
          i++
          continue
        }

        if (tagName === 'hr') {
          const hrNode: ASTNode = {
            id: generateId(),
            type: 'divider',
            tagName: 'hr',
            attributes,
            children: [],
            textContent: '',
            rawHtml: line,
            indexInParent: parent.children.length,
            parentId: parent.id,
          }
          parent.children.push(hrNode)
          i++
          continue
        }

        // Multiline HTML block closing matching
        let htmlContent = ''
        let depth = 0
        let j = i
        let foundClosing = false
        const openTagRegex = new RegExp(`<${tagName}[\\s>]`, 'gi')
        const closeTagRegex = new RegExp(`</${tagName}>`, 'gi')

        while (j < lines.length) {
          const currentLine = lines[j]
          const openMatches = (currentLine.match(openTagRegex) || []).length
          const closeMatches = (currentLine.match(closeTagRegex) || []).length

          depth += openMatches - closeMatches

          if (j > i) htmlContent += '\n' + currentLine
          else {
            // Remove the outer open tag from content
            htmlContent += currentLine.substring(htmlBlockMatch[0].length)
          }

          if (depth <= 0) {
            foundClosing = true
            // Strip ending tag </tagName>
            htmlContent = htmlContent.replace(new RegExp(`</${tagName}>\\s*$`, 'i'), '')
            i = j + 1
            break
          }
          j++
        }

        if (!foundClosing) {
          // If unclosed HTML tag, treat line by line
          htmlContent = line.substring(htmlBlockMatch[0].length)
          i++
        }

        let nodeType: ASTNodeType = 'container'
        if (tagName.startsWith('h') && tagName.length === 2 && !isNaN(Number(tagName[1]))) {
          nodeType = 'heading'
          attributes.level = Number(tagName[1])
        } else if (tagName === 'p') {
          nodeType = 'paragraph'
        } else if (tagName === 'table') {
          nodeType = 'table'
        } else if (tagName === 'tr') {
          nodeType = 'table_row'
        } else if (tagName === 'td' || tagName === 'th') {
          nodeType = 'table_cell'
        } else if (tagName === 'blockquote') {
          nodeType = 'blockquote'
        } else if (tagName === 'a') {
          nodeType = 'link'
        }

        const containerNode: ASTNode = {
          id: generateId(),
          type: nodeType,
          tagName,
          attributes,
          children: [],
          textContent: '',
          rawHtml: htmlBlockMatch[0] + htmlContent + `</${tagName}>`,
          indexInParent: parent.children.length,
          parentId: parent.id,
        }

        // Recursively parse inside the HTML block!
        if (htmlContent.trim()) {
          parseBlock(htmlContent, containerNode)
        }

        parent.children.push(containerNode)
        continue
      }

      // Check for Markdown Table (| Header | Header |)
      if (line.includes('|') && (lines[i + 1]?.includes('---') || line.trim().startsWith('|'))) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i])
          i++
        }

        const tableNode: ASTNode = {
          id: generateId(),
          type: 'table',
          attributes: {},
          children: [],
          textContent: tableLines.join('\n'),
          indexInParent: parent.children.length,
          parentId: parent.id,
        }

        for (const tLine of tableLines) {
          if (/^\|?\s*:?-+:?\s*\|/.test(tLine.trim())) continue // Skip header delimiter
          const cells = tLine
            .split('|')
            .map((c) => c.trim())
            .filter((c, idx, arr) => {
              // ignore leading/trailing empty split cells
              return !((idx === 0 || idx === arr.length - 1) && c === '')
            })

          if (cells.length > 0) {
            const rowNode: ASTNode = {
              id: generateId(),
              type: 'table_row',
              attributes: {},
              children: [],
              textContent: '',
              indexInParent: tableNode.children.length,
              parentId: tableNode.id,
            }
            cells.forEach((cellText) => {
              const cellNode: ASTNode = {
                id: generateId(),
                type: 'table_cell',
                attributes: {},
                children: [],
                textContent: cellText,
                indexInParent: rowNode.children.length,
                parentId: rowNode.id,
              }
              parseInlineElements(cellText, cellNode)
              rowNode.children.push(cellNode)
            })
            tableNode.children.push(rowNode)
          }
        }
        parent.children.push(tableNode)
        continue
      }

      // Standard paragraph / line block
      const paraNode: ASTNode = {
        id: generateId(),
        type: 'paragraph',
        attributes: {},
        children: [],
        textContent: line,
        indexInParent: parent.children.length,
        parentId: parent.id,
      }
      parseInlineElements(line, paraNode)
      parent.children.push(paraNode)
      i++
    }
  }

  // Parse inline elements (images, links, html tags) within text
  const parseInlineElements = (text: string, parentNode: ASTNode) => {
    // Regex for HTML img tags, Markdown images ![alt](url), HTML a tags, Markdown links [text](url)
    const inlineRegex =
      /(<a\s+[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>)|(<img\s+[^>]*>)|(!\[(.*?)\]\((.*?)\))|(\[(.*?)\]\((.*?)\))/gi
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = inlineRegex.exec(text)) !== null) {
      const matchIndex = match.index
      if (matchIndex > lastIndex) {
        const textChunk = text.substring(lastIndex, matchIndex).trim()
        if (textChunk) {
          parentNode.children.push({
            id: generateId(),
            type: 'text',
            attributes: {},
            children: [],
            textContent: textChunk,
            indexInParent: parentNode.children.length,
            parentId: parentNode.id,
          })
        }
      }

      const rawMatch = match[0]

      // 1. HTML Link `<a href="...">...</a>`
      if (match[1]) {
        const hrefMatch = rawMatch.match(/href=["']([^"']+)["']/i)
        const href = hrefMatch ? normalizeUrl(hrefMatch[1]) : ''
        const linkNode: ASTNode = {
          id: generateId(),
          type: 'link',
          tagName: 'a',
          attributes: { href, ...parseAttributes(rawMatch) },
          children: [],
          textContent: rawMatch.replace(/<[^>]+>/g, '').trim(),
          rawHtml: rawMatch,
          indexInParent: parentNode.children.length,
          parentId: parentNode.id,
        }

        // Inner img or text inside <a> tag
        const innerImgMatch =
          rawMatch.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i) ||
          rawMatch.match(/!\[(.*?)\]\((.*?)\)/i)
        if (innerImgMatch) {
          const imgSrc =
            innerImgMatch[1] && innerImgMatch[1].startsWith('http')
              ? innerImgMatch[1]
              : innerImgMatch[2] || innerImgMatch[1]
          const imgNode: ASTNode = {
            id: generateId(),
            type: 'image',
            tagName: 'img',
            attributes: { src: normalizeUrl(imgSrc), ...parseAttributes(innerImgMatch[0]) },
            children: [],
            textContent: '',
            rawHtml: innerImgMatch[0],
            indexInParent: 0,
            parentId: linkNode.id,
          }
          linkNode.children.push(imgNode)
        }

        parentNode.children.push(linkNode)
      }
      // 2. HTML Image `<img src="..." />`
      else if (match[3]) {
        const imgAttrs = parseAttributes(rawMatch)
        const imgNode: ASTNode = {
          id: generateId(),
          type: 'image',
          tagName: 'img',
          attributes: imgAttrs,
          children: [],
          textContent: (imgAttrs.alt as string) || '',
          rawHtml: rawMatch,
          indexInParent: parentNode.children.length,
          parentId: parentNode.id,
        }
        parentNode.children.push(imgNode)
      }
      // 3. Markdown Image `![alt](url)`
      else if (match[4]) {
        const alt = match[5] || ''
        const src = normalizeUrl(match[6] || '')
        const imgNode: ASTNode = {
          id: generateId(),
          type: 'image',
          attributes: { alt, src },
          children: [],
          textContent: alt,
          indexInParent: parentNode.children.length,
          parentId: parentNode.id,
        }
        parentNode.children.push(imgNode)
      }
      // 4. Markdown Link `[text](url)`
      else if (match[7]) {
        const linkText = match[8] || ''
        const href = normalizeUrl(match[9] || '')
        const linkNode: ASTNode = {
          id: generateId(),
          type: 'link',
          attributes: { href },
          children: [],
          textContent: linkText,
          indexInParent: parentNode.children.length,
          parentId: parentNode.id,
        }

        const innerImgMatch =
          linkText.match(/!\[(.*?)\]\((.*?)\)/i) ||
          linkText.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i)
        if (innerImgMatch) {
          const alt =
            innerImgMatch[1] && !innerImgMatch[1].startsWith('http') ? innerImgMatch[1] : ''
          const imgSrc =
            innerImgMatch[2] ||
            (innerImgMatch[1] && innerImgMatch[1].startsWith('http') ? innerImgMatch[1] : '')
          if (imgSrc) {
            const imgNode: ASTNode = {
              id: generateId(),
              type: 'image',
              attributes: { alt, src: normalizeUrl(imgSrc) },
              children: [],
              textContent: alt,
              indexInParent: 0,
              parentId: linkNode.id,
            }
            linkNode.children.push(imgNode)
          }
        } else if (linkText) {
          linkNode.children.push({
            id: generateId(),
            type: 'text',
            attributes: {},
            children: [],
            textContent: linkText,
            indexInParent: 0,
            parentId: linkNode.id,
          })
        }
        parentNode.children.push(linkNode)
      }

      lastIndex = matchIndex + rawMatch.length
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex).trim()
      if (remainingText) {
        parentNode.children.push({
          id: generateId(),
          type: 'text',
          attributes: {},
          children: [],
          textContent: remainingText,
          indexInParent: parentNode.children.length,
          parentId: parentNode.id,
        })
      }
    }
  }

  parseBlock(sanitized, rootNode)
  return rootNode
}
