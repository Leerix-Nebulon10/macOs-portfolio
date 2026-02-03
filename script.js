// Global state
let activeWindow = null;
let zIndexCounter = 100;
const openWindowsMap = new Map();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initClock();
    initWidgetTime();
    initThemeToggle();
    initStartMenu();
    initWindows();
    initDesktopIcons();
    initDraggableIcons();
    initWelcomeScreen();
    initSkillsTabs();
    initResumeDownload();
    initWallpaperSelector();
});

// Animated Particles
function initParticles() {
    const container = document.getElementById('particleContainer');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
    }
}

// Clock
function initClock() {
    const clockEl = document.getElementById('clock');
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// Widget Time Update
function initWidgetTime() {
    const timeDisplay = document.getElementById('widgetTime');
    const dateDisplay = document.getElementById('widgetDate');
    
    function updateWidgetTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}`;
        
        const options = { weekday: 'long' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateWidgetTime();
    setInterval(updateWidgetTime, 1000);
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        body.classList.remove('dark-mode');
        themeIcon.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeIcon.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        // Add rotation animation
        themeIcon.classList.add('rotating');
        
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        themeIcon.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            themeIcon.classList.remove('rotating');
        }, 600);
    });
}

// Start Menu
function initStartMenu() {
    const startBtn = document.getElementById('startBtn');
    const startMenu = document.getElementById('startMenu');
    
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
            startMenu.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.menu-item[data-window]').forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.getAttribute('data-window');
            openWindow(windowId);
            startMenu.classList.remove('active');
        });
    });
}

// Desktop Icons
function initDesktopIcons() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const windowId = icon.getAttribute('data-window');
            openWindow(windowId);
        });
        
        // Add click effect
        icon.addEventListener('click', function() {
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 600);
        });
    });
}

// Draggable Desktop Icons
function initDraggableIcons() {
    const desktop = document.querySelector('.desktop');
    
    document.querySelectorAll('.desktop-icon.draggable').forEach(icon => {
        let isDragging = false;
        let initialX = 0;
        let initialY = 0;
        let currentX = 0;
        let currentY = 0;
        
        icon.addEventListener('mousedown', (e) => {
            if (e.detail > 1) return; // Ignore double clicks
            isDragging = true;
            initialX = e.clientX - icon.offsetLeft;
            initialY = e.clientY - icon.offsetTop;
            icon.classList.add('dragging');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            // Keep icon within bounds
            const maxX = desktop.offsetWidth - icon.offsetWidth;
            const maxY = desktop.offsetHeight - icon.offsetHeight - 60; // Account for taskbar
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            icon.style.left = currentX + 'px';
            icon.style.top = currentY + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                icon.classList.remove('dragging');
            }
        });
    });
}

// Windows
function initWindows() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        makeWindowDraggable(window);
        initWindowControls(window);
        
        // Bring to front on click
        window.addEventListener('mousedown', () => {
            bringToFront(window);
        });
        
        // Center window initially
        centerWindow(window);
    });
}

function openWindow(windowId) {
    const window = document.getElementById(`${windowId}-window`);
    if (!window) return;
    
    window.classList.add('active');
    bringToFront(window);
    
    if (!openWindowsMap.has(windowId)) {
        addToTaskbar(windowId, window);
    }
}

function closeWindow(window) {
    const windowId = window.getAttribute('data-window-id');
    window.classList.remove('active');
    openWindowsMap.delete(windowId);
    updateTaskbar();
}

function minimizeWindow(window) {
    window.classList.remove('active');
}

function maximizeWindow(window) {
    window.classList.toggle('maximized');
}

function bringToFront(window) {
    zIndexCounter++;
    window.style.zIndex = zIndexCounter;
    activeWindow = window;
    
    // Update taskbar
    document.querySelectorAll('.taskbar-window').forEach(tw => {
        tw.classList.remove('active');
    });
    const windowId = window.getAttribute('data-window-id');
    const taskbarWindow = document.querySelector(`[data-taskbar-window="${windowId}"]`);
    if (taskbarWindow) {
        taskbarWindow.classList.add('active');
    }
}

function centerWindow(window) {
    const rect = window.getBoundingClientRect();
    const x = (window.innerWidth - rect.width) / 2;
    const y = (window.innerHeight - rect.height) / 2 - 24; // Account for taskbar
    
    window.style.left = `${Math.max(0, x)}px`;
    window.style.top = `${Math.max(0, y)}px`;
}

function makeWindowDraggable(window) {
    const header = window.querySelector('.window-header');
    let isDragging = false;
    let isResizing = false;
    let currentX, currentY, initialX, initialY;
    let startX, startY, startWidth, startHeight;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        if (window.classList.contains('maximized')) return;
        
        isDragging = true;
        isResizing = false;
        initialX = e.clientX - window.offsetLeft;
        initialY = e.clientY - window.offsetTop;
        
        bringToFront(window);
        window.style.cursor = 'grabbing';
    });
    
    // Resize handle detection
    window.addEventListener('mousedown', (e) => {
        if (window.classList.contains('maximized')) return;
        
        const rect = window.getBoundingClientRect();
        const isNearEdge = (
            e.clientX >= rect.right - 20 && 
            e.clientY >= rect.bottom - 20
        );
        
        if (isNearEdge) {
            isResizing = true;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = window.offsetWidth;
            startHeight = window.offsetHeight;
            
            bringToFront(window);
            window.style.cursor = 'se-resize';
            e.stopPropagation();
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging && !isResizing) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            // Keep window within bounds
            const maxX = window.innerWidth - window.offsetWidth;
            const maxY = window.innerHeight - window.offsetHeight - 48;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            window.style.left = `${currentX}px`;
            window.style.top = `${currentY}px`;
        }
        
        if (isResizing && !isDragging) {
            e.preventDefault();
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            
            // Apply minimum constraints
            if (width >= 450) {
                window.style.width = width + 'px';
            }
            if (height >= 350) {
                window.style.height = height + 'px';
            }
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        window.style.cursor = 'default';
    });
}

function makeWindowResizable(window) {
    // This function is now handled in makeWindowDraggable
}

function initWindowControls(window) {
    const controls = window.querySelector('.window-controls');
    const minimizeBtn = controls.querySelector('.minimize');
    const maximizeBtn = controls.querySelector('.maximize');
    const closeBtn = controls.querySelector('.close');
    
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(window);
    });
    
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        maximizeWindow(window);
    });
    
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(window);
    });
}

// Taskbar
function addToTaskbar(windowId, window) {
    const windowTitle = window.querySelector('.window-title').textContent.trim();
    const windowIconEl = window.querySelector('.window-icon');
    const windowIcon = windowIconEl.innerHTML;
    
    openWindowsMap.set(windowId, { title: windowTitle, icon: windowIcon });
    updateTaskbar();
}

function updateTaskbar() {
    const openWindowsEl = document.getElementById('openWindows');
    openWindowsEl.innerHTML = '';
    
    openWindowsMap.forEach((data, windowId) => {
        const taskbarWindow = document.createElement('button');
        taskbarWindow.className = 'taskbar-window';
        taskbarWindow.setAttribute('data-taskbar-window', windowId);
        taskbarWindow.setAttribute('title', data.title);
        taskbarWindow.innerHTML = data.icon;
        
        taskbarWindow.addEventListener('click', () => {
            const window = document.getElementById(`${windowId}-window`);
            if (window.classList.contains('active')) {
                minimizeWindow(window);
            } else {
                openWindow(windowId);
            }
        });
        
        openWindowsEl.appendChild(taskbarWindow);
    });
}

// Skills Tabs
function initSkillsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Animate skill bars
            animateSkillBars(tabId);
        });
    });
}

function animateSkillBars(tabId) {
    const tab = document.getElementById(tabId);
    const progressBars = tab.querySelectorAll('.skill-progress');
    
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Resume Download
function initResumeDownload() {
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            console.log('Resume download initiated');
            
            // Create notification
            showNotification('Resume downloaded successfully!');
            
            // Here you would trigger actual download
            // window.location.href = 'resume.pdf';
        });
    }
}

// Wallpaper Selector
function initWallpaperSelector() {
    const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
    const desktop = document.querySelector('.desktop');
    
    const wallpapers = {
        default: 'radial-gradient(circle at 30% 20%, rgba(138, 43, 226, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(10, 132, 255, 0.1) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #0a0e27 50%, #0d0915 100%)',
        light: 'radial-gradient(circle at 30% 20%, rgba(100, 100, 200, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(10, 132, 255, 0.05) 0%, transparent 50%), linear-gradient(135deg, #f5f5f7 0%, #e8e8eb 50%, #ddd 100%)',
        sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ff9a56 50%, #ffd93d 100%)',
        ocean: 'linear-gradient(135deg, #0a4d68 0%, #088395 50%, #05bfdb 100%)',
        forest: 'linear-gradient(135deg, #1b3a34 0%, #2d6a4f 50%, #52b788 100%)',
        midnight: 'linear-gradient(135deg, #0f1419 0%, #1a1f36 50%, #16213e 100%)'
    };
    
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            const wallpaperId = option.getAttribute('data-wallpaper');
            
            // Update active state
            wallpaperOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Apply wallpaper
            desktop.style.backgroundImage = wallpapers[wallpaperId];
            
            // Save preference
            localStorage.setItem('wallpaper', wallpaperId);
            
            showNotification(`Wallpaper changed to ${option.getAttribute('title')}`);
        });
    });
    
    // Load saved wallpaper
    const savedWallpaper = localStorage.getItem('wallpaper') || 'default';
    const savedOption = document.querySelector(`[data-wallpaper="${savedWallpaper}"]`);
    if (savedOption) {
        savedOption.click();
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(20px);
        color: white;
        font-size: 0.95rem;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Welcome Screen
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        
        // Auto-open about window on startup
        setTimeout(() => {
            openWindow('about');
        }, 200);
    }, 3500);
}

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Add click handler for email
document.addEventListener('click', (e) => {
    if (e.target.closest('.contact-method[href^="mailto"]')) {
        e.preventDefault();
        const email = e.target.closest('.contact-method').querySelector('.contact-value').textContent;
        copyToClipboard(email);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + number keys to open windows
    if (e.altKey) {
        const keyMap = {
            '1': 'about',
            '2': 'education',
            '3': 'skills',
            '4': 'projects',
            '5': 'achievements',
            '6': 'contact'
        };
        
        if (keyMap[e.key]) {
            e.preventDefault();
            openWindow(keyMap[e.key]);
        }
    }
    
    // Escape to close active window
    if (e.key === 'Escape' && activeWindow) {
        closeWindow(activeWindow);
    }
    
    // Alt + T to toggle theme
    if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        document.getElementById('themeToggle').click();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Easter egg console
console.log('%c🍎 Welcome to Leenath Portfolio!', 'color: #0a84ff; font-size: 24px; font-weight: bold;');
console.log('%c⌨️  Try these keyboard shortcuts:', 'color: #a1a1a6; font-size: 14px;');
console.log('%c  • Alt + 1-6: Open windows', 'color: #a1a1a6; font-size: 12px;');
console.log('%c  • Alt + T: Toggle theme', 'color: #a1a1a6; font-size: 12px;');
console.log('%c  • Escape: Close active window', 'color: #a1a1a6; font-size: 12px;');
console.log('%c📧 Contact: alexchen@example.com', 'color: #0a84ff; font-size: 14px; font-weight: bold;');