import katex from 'katex'
import 'katex/dist/katex.min.css'
import mermaid from 'mermaid'

// Инициализация Mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

export const formattedText = (text: string) => {
  if (!text) return ''
  
  try {
    let formatted = text.toString()

    // Форматирование блоков кода
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || ''
      return `<pre class="code-block ${language}"><code>${code.trim()}</code></pre>`
    })

    // Форматирование таблиц
    formatted = formatted.replace(/\|(.+)\|/g, (match, content: string) => {
      const cells: string[] = content.split('|').map((cell: string) => cell.trim())
      return `<div class="table-row">${cells.map((cell: string) => `<div class="table-cell">${cell}</div>`).join('')}</div>`
    })

    // Форматирование диаграмм (поддержка Mermaid)
    formatted = formatted.replace(/```mermaid\n([\s\S]*?)```/g, (match, diagram) => {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
      setTimeout(() => {
        try {
          mermaid.render(id, diagram.trim()).then((result) => {
            const element = document.getElementById(id)
            if (element) {
              element.innerHTML = result.svg
            }
          })
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error)
        }
      }, 0)
      return `<div class="mermaid-diagram"><div id="${id}"></div></div>`
    })

    // Заменяем переносы строк на <br />
    formatted = formatted.replace(/\n/g, '<br />')

    // Форматирование математических формул
    formatted = formatted.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
      try {
        return `<div class="math-block">${katex.renderToString(formula, { displayMode: true })}</div>`
      } catch (error) {
        console.error('Error rendering math formula:', error)
        return match
      }
    })
    formatted = formatted.replace(/\$(.*?)\$/g, (match, formula) => {
      try {
        return `<span class="math-inline">${katex.renderToString(formula, { displayMode: false })}</span>`
      } catch (error) {
        console.error('Error rendering math formula:', error)
        return match
      }
    })

    // Выделяем жирным текст между ** (как в Markdown)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Выделяем курсивом текст между * (как в Markdown)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Форматируем код (однострочный)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

    // Добавляем ссылки
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )

    return formatted
  } catch (error) {
    console.error('Error formatting message:', error)
    return text
  }
} 