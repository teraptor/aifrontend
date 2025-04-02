import type mermaid from 'mermaid'
import katex from 'katex'
import 'katex/dist/katex.min.css'

let mermaidInstance: typeof mermaid | null = null;

async function initMermaid() {
  if (!mermaidInstance) {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    mermaidInstance = mermaid;
  }
  return mermaidInstance;
}

export async function formattedText(text: string): Promise<string> {
  if (!text) return '';

  let formatted = text
    // Экранируем HTML
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Форматирование заголовков
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    
    // Форматирование жирного текста и курсива
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Форматирование списков
    .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)\s+/g, '<ul>$1</ul>')
    
    // Форматирование ссылок
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    
    // Форматирование блоков кода
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      if (lang === 'mermaid') return match;
      return `<pre class="code-block ${lang}"><code>${code.trim()}</code></pre>`;
    })
    
    // Форматирование инлайн-кода
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    
    // Форматирование математических выражений
    .replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        return `<div class="math-block">${katex.renderToString(formula, { displayMode: true })}</div>`;
      } catch (error) {
        console.error('Error rendering math formula:', error);
        return match;
      }
    })
    .replace(/\$([^\$]*)\$/g, (match, formula) => {
      try {
        return `<span class="math-inline">${katex.renderToString(formula, { displayMode: false })}</span>`;
      } catch (error) {
        console.error('Error rendering math formula:', error);
        return match;
      }
    })
    
    // Форматирование переносов строк
    .replace(/\n/g, '<br />');

  // Форматирование диаграмм Mermaid
  const matches = formatted.match(/```mermaid\n([\s\S]*?)```/g) || [];
  for (const match of matches) {
    const diagram = match.replace(/```mermaid\n/, '').replace(/```$/, '');
    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const mermaid = await initMermaid();
      const { svg } = await mermaid.render(id, diagram.trim());
      formatted = formatted.replace(match, `<div class="mermaid-diagram">${svg}</div>`);
    } catch (error) {
      console.error('Error rendering mermaid diagram:', error);
    }
  }

  return formatted;
} 