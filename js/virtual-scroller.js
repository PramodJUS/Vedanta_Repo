/**
 * Lightweight Virtual Scroller for Long Text Content
 * Renders only visible lines to improve performance
 */

class VirtualTextScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.lineHeight = options.lineHeight || 24; // pixels per line
        this.bufferLines = options.bufferLines || 10; // extra lines to render above/below viewport
        this.fullText = '';
        this.lines = [];
        this.viewport = null;
        this.content = null;
        
        this.init();
    }
    
    init() {
        // Create virtual scroll structure
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.position = 'relative';
        this.viewport.style.overflow = 'auto';
        this.viewport.style.height = '100%';
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.position = 'relative';
        
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
        
        // Bind scroll handler with throttling
        this.viewport.addEventListener('scroll', this.throttle(() => {
            this.render();
        }, 16)); // ~60fps
    }
    
    setContent(text) {
        this.fullText = text;
        // Split into lines, preserving original formatting
        this.lines = text.split('\n');
        
        // Set virtual height based on total lines
        const totalHeight = this.lines.length * this.lineHeight;
        this.content.style.height = totalHeight + 'px';
        
        // Initial render
        this.render();
    }
    
    render() {
        const scrollTop = this.viewport.scrollTop;
        const viewportHeight = this.viewport.clientHeight;
        
        // Calculate visible range
        const startLine = Math.max(0, Math.floor(scrollTop / this.lineHeight) - this.bufferLines);
        const endLine = Math.min(
            this.lines.length,
            Math.ceil((scrollTop + viewportHeight) / this.lineHeight) + this.bufferLines
        );
        
        // Create visible content
        const visibleLines = this.lines.slice(startLine, endLine);
        const offsetTop = startLine * this.lineHeight;
        
        // Render only visible lines
        this.content.innerHTML = `
            <div style="position: absolute; top: ${offsetTop}px; width: 100%;">
                ${visibleLines.map((line, idx) => `
                    <div class="text-line" data-line-number="${startLine + idx}" style="min-height: ${this.lineHeight}px;">
                        ${this.escapeHtml(line)}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Utility: throttle function calls
    throttle(func, wait) {
        let timeout;
        let previous = 0;
        
        return function(...args) {
            const now = Date.now();
            const remaining = wait - (now - previous);
            
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
        };
    }
    
    // Utility: escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Scroll to specific line
    scrollToLine(lineNumber) {
        const scrollTop = lineNumber * this.lineHeight;
        this.viewport.scrollTop = scrollTop;
    }
    
    // Destroy and cleanup
    destroy() {
        this.viewport.removeEventListener('scroll', this.render);
        this.container.innerHTML = '';
    }
}
