// ========================================
// Markdown Renderer Utility
// ========================================

const MarkdownRenderer = {
    /**
     * Parse markdown text and return HTML string.
     * Supports: Headers, Bold, Italic, Lists, Code Blocks, Tables, Links.
     * @param {string} text - The markdown text to parse.
     * @returns {string} - The generated HTML.
     */
    parse(text) {
        if (!text) return '';

        // Escape HTML characters to prevent XSS (basic)
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 1. Code Blocks (```code```)
        // Replaces code blocks with placeholders to prevent other regex acting on code content
        const codeBlocks = [];
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, content) => {
            const index = codeBlocks.length;
            codeBlocks.push(`<pre><code class="language-${lang}">${content}</code></pre>`);
            return `__CODE_BLOCK_${index}__`;
        });

        // 2. Inline Code (`code`)
        const inlineCode = [];
        html = html.replace(/`([^`]+)`/g, (match, content) => {
            const index = inlineCode.length;
            inlineCode.push(`<code class="inline-code">${content}</code>`);
            return `__INLINE_CODE_${index}__`;
        });

        // 3. Tables
        // Syntax: 
        // | Header | Header |
        // | --- | --- |
        // | Cell | Cell |
        html = html.replace(/^\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.*\|\n?)*)/gm, (match, headerRow, separatorRow, bodyRows) => {
            const headers = headerRow.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
            const body = bodyRows.trim().split('\n').map(row => {
                const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `<table class="markdown-table"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
        });

        // 4. Headers (#, ##, ###)
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // 5. Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 6. Italic (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 7. Bullet Lists (- item)
        // Group consecutive list items into a ul
        html = html.replace(/(?:^|\n)- (.*)/g, '\n<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

        // 8. Numbered Lists (1. item)
        html = html.replace(/(?:^|\n)\d+\. (.*)/g, '\n<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            // If it's already wrapped in ul (mixed list), don't wrap again or adjust
            // Simple heuristic: if previous regex wrapped it in ul, replace ul with ol
            if (match.startsWith('<ul>')) return match.replace('<ul>', '<ol>').replace('</ul>', '</ol>');
            return `<ol>${match}</ol>`;
        });

        // 9. Links ([text](url))
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 10. Horizontal Rule (---)
        html = html.replace(/^---$/gm, '<hr>');

        // 11. Paragraphs (double newline)
        html = html.replace(/\n\n/g, '<br><br>');

        // Restore Inline Code
        html = html.replace(/__INLINE_CODE_(\d+)__/g, (match, index) => inlineCode[index]);

        // Restore Code Blocks
        html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => codeBlocks[index]);

        return html;
    }
};

window.MarkdownRenderer = MarkdownRenderer;
export default MarkdownRenderer;
