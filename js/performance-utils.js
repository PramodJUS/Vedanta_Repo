/**
 * Performance Optimization Utilities
 */

// 1. Debounce - Wait for user to stop typing/scrolling before executing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 2. Throttle - Limit execution frequency (e.g., max once per 100ms)
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 3. Lazy loader for images and heavy content
class LazyLoader {
    constructor(options = {}) {
        this.observer = null;
        this.onIntersect = options.onIntersect || null;
        this.rootMargin = options.rootMargin || '50px';
        this.init();
    }
    
    init() {
        // Use Intersection Observer for efficient lazy loading
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.rootMargin // Start loading before element is visible
        });
    }
    
    loadElement(element) {
        // If custom callback provided, use it
        if (this.onIntersect) {
            this.onIntersect(element);
            return;
        }
        
        // Default behavior
        if (element.dataset.src) {
            element.src = element.dataset.src;
        }
        
        if (element.dataset.content) {
            element.innerHTML = element.dataset.content;
        }
        
        element.classList.add('loaded');
    }
    
    observe(elements) {
        // Handle both single element and array/NodeList
        if (elements instanceof NodeList || Array.isArray(elements)) {
            elements.forEach(el => this.observer.observe(el));
        } else {
            this.observer.observe(elements);
        }
    }
}

// 4. Batch DOM updates to avoid layout thrashing
class DOMBatcher {
    constructor() {
        this.readQueue = [];
        this.writeQueue = [];
        this.scheduled = false;
    }
    
    read(fn) {
        this.readQueue.push(fn);
        this.scheduleFlush();
    }
    
    write(fn) {
        this.writeQueue.push(fn);
        this.scheduleFlush();
    }
    
    scheduleFlush() {
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    }
    
    flush() {
        // Execute all reads first
        let fn;
        while (fn = this.readQueue.shift()) {
            fn();
        }
        
        // Then all writes
        while (fn = this.writeQueue.shift()) {
            fn();
        }
        
        this.scheduled = false;
    }
}

// 5. Simple LRU Cache for frequently accessed data
class LRUCache {
    constructor(maxSize = 50) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) return null;
        
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        
        return value;
    }
    
    set(key, value) {
        // Delete if exists (to update position)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // Add to end
        this.cache.set(key, value);
        
        // Remove oldest if over size
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }
    
    clear() {
        this.cache.clear();
    }
}

// 6. Measure and log performance
class PerformanceMonitor {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.marks = new Map();
    }
    
    start(name) {
        if (!this.enabled) return;
        this.marks.set(name, performance.now());
    }
    
    end(name) {
        if (!this.enabled) return;
        
        const start = this.marks.get(name);
        if (!start) {
            console.warn(`No start mark for "${name}"`);
            return;
        }
        
        const duration = performance.now() - start;
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        
        this.marks.delete(name);
        return duration;
    }
    
    measure(name, fn) {
        if (!this.enabled) return fn();
        
        this.start(name);
        const result = fn();
        this.end(name);
        
        return result;
    }
}

// 7. RequestIdleCallback polyfill for low-priority tasks
const scheduleIdleTask = window.requestIdleCallback || function(fn) {
    const start = Date.now();
    return setTimeout(() => {
        fn({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
        });
    }, 1);
};

// 8. Memoization for expensive computations
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        return result;
    };
}

// Export for use
window.PerformanceUtils = {
    debounce,
    throttle,
    LazyLoader,
    DOMBatcher,
    LRUCache,
    PerformanceMonitor,
    scheduleIdleTask,
    memoize
};
