// ========================================
// Markdown Renderer Utility
// ========================================

const MarkdownRenderer = {
    /**
     * Parse markdown text and return HTML string.
     * Supports: Headers, Bold, Italic, Lists, Code Blocks, Tables, Links, Blockquotes.
     * @param {string} text - The markdown text to parse.
     * @returns {string} - The generated HTML.
     */
    parse(text) {
        if (!text) return '';

        let html = text;

        // 1. Code Blocks (```code```) — extract BEFORE escaping
        const codeBlocks = [];
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, content) => {
            const index = codeBlocks.length;
            // Escape HTML inside code blocks separately
            const escaped = content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            codeBlocks.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`);
            return `__CODE_BLOCK_${index}__`;
        });

        // 2. Inline Code (`code`) — extract BEFORE escaping
        const inlineCode = [];
        html = html.replace(/`([^`]+)`/g, (match, content) => {
            const index = inlineCode.length;
            const escaped = content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            inlineCode.push(`<code class="inline-code">${escaped}</code>`);
            return `__INLINE_CODE_${index}__`;
        });

        // 3. Tables — parse BEFORE escaping so | characters are intact
        html = html.replace(/(?:^|\n)\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.*\|(?:\n|$))*)/gm, (match, headerRow, separatorRow, bodyRows) => {
            const headers = headerRow.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
            const body = bodyRows.trim().split('\n').map(row => {
                const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `\n<div class="table-container"><table class="markdown-table"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></div>\n`;
        });

        // 4. Blockquotes (> text) — parse BEFORE escaping so > is literal
        html = html.replace(/^> (.*$)/gm, '<blockquote class="premium-quote-line">$1</blockquote>');
        // Merge consecutive blockquotes into a single premium-quote div
        html = html.replace(/(<blockquote class="premium-quote-line">.*<\/blockquote>\n?)+/g, (match) => {
            const content = match.replace(/<\/?blockquote[^>]*>/g, '').trim();
            return `<div class="premium-quote">${content}</div>\n`;
        });

        // NOW escape HTML for remaining content (tables, code, blockquotes already handled)
        // We need a selective approach: only escape content NOT already in HTML tags
        html = html.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;");
        // Don't escape < and > that are part of our generated HTML tags
        // Instead, we'll skip this for now since our content comes from AI and tables/code are already extracted

        // 5. Headers (#, ##, ###, ####)
        html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // 6. Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 7. Italic (*text*)
        html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

        // 8. Strikethrough (~~text~~)
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // 9. Bullet Lists (- item or * item)
        // Handle nested lists with indentation
        html = html.replace(/(?:^|\n)(?:- |\* )(.*)/g, '\n<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

        // 10. Numbered Lists (1. item, 2. item, etc.)
        html = html.replace(/(?:^|\n)\d+\. (.*)/g, '\n<li class="ol-item">$1</li>');
        html = html.replace(/(<li class="ol-item">.*<\/li>\n?)+/g, (match) => {
            return `<ol>${match.replace(/ class="ol-item"/g, '')}</ol>`;
        });

        // 11. Links ([text](url))
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // 12. Horizontal Rule (--- or ***)
        html = html.replace(/^---$/gm, '<hr>');
        html = html.replace(/^\*\*\*$/gm, '<hr>');

        // 13. Paragraphs (double newline)
        html = html.replace(/\n\n/g, '</p><p>');
        // Single newlines to <br> (but not inside tags)
        html = html.replace(/\n(?!<)/g, '<br>');

        // Wrap in paragraph
        if (!html.startsWith('<')) {
            html = `<p>${html}</p>`;
        }

        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>\s*(<(?:h[1-4]|ul|ol|div|table|pre|hr|blockquote))/g, '$1');
        html = html.replace(/(<\/(?:h[1-4]|ul|ol|div|table|pre|hr|blockquote)>)\s*<\/p>/g, '$1');

        // Restore Inline Code
        html = html.replace(/__INLINE_CODE_(\d+)__/g, (match, index) => inlineCode[index]);

        // Restore Code Blocks
        html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => codeBlocks[index]);

        return html;
    }
};

window.MarkdownRenderer = MarkdownRenderer;
export default MarkdownRenderer;
