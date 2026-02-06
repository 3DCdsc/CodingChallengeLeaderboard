// ============================================
// LEADERBOARD STATE & DATA MANAGEMENT
// ============================================

let currentCategory = null;
let leaderboardData = [];
let categoryRotationInterval = null;
let availableCategories = [];
let currentCategoryIndex = 0;

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!';

// ============================================
// CATEGORY MANAGEMENT
// ============================================

/**
 * Load available categories from backend
 */
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/leaderboard/categories');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            availableCategories = result.data;
            
            if (!categoryRotationInterval) {
                startCategoryRotation();
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Start rotating through categories every 10 seconds
 */
function startCategoryRotation() {
    if (availableCategories.length === 0) return;
    
    // Clear any existing rotation interval
    if (categoryRotationInterval) {
        clearInterval(categoryRotationInterval);
    }
    
    // Load first category immediately
    if (!currentCategory) {
        selectCategory(availableCategories[0]);
    }
    
    // Rotate to next category every 10 seconds
    categoryRotationInterval = setInterval(() => {
        currentCategoryIndex = (currentCategoryIndex + 1) % availableCategories.length;
        const nextCategory = availableCategories[currentCategoryIndex];
        console.log(`Rotating to category: ${nextCategory}`);
        selectCategory(nextCategory);
    }, 10000);
}

/**
 * Select a category and load its leaderboard
 * @param {string} category - Category name
 */
function selectCategory(category) {
    currentCategory = category;
    currentCategoryIndex = availableCategories.indexOf(category);
    
    const bannerTitle = document.getElementById('bannerTitle');
    if (bannerTitle) {
        bannerTitle.textContent = category.toUpperCase();
    }
    
    loadLeaderboard(category);
}

// ============================================
// LEADERBOARD DATA FETCHING & RENDERING
// ============================================

/**
 * Load leaderboard data for a specific category
 * @param {string} category - Category name
 */
async function loadLeaderboard(category) {
    try {
        const response = await fetch(`http://localhost:3000/leaderboard/rank/${category}`);
        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data)) {
            leaderboardData = result.data.map((entry, index) => ({
                rank: index + 1,
                name: entry.player || 'UNKNOWN',
                time: parseFloat(entry.timing) || 0
            }));
            
            renderLeaderboard();
        } else {
            renderEmptyLeaderboard('No entries yet for this category');
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        renderEmptyLeaderboard('Error loading leaderboard');
    }
}

/**
 * Scramble text animation for category transitions
 * @param {HTMLElement} element - Element to scramble
 * @param {string} finalText - Final text to display
 * @param {number} duration - Duration in milliseconds
 */
function scrambleText(element, finalText, duration = 400) {
    const startTime = Date.now();
    const originalLength = finalText.length;
    
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const progress = easeOutCubic(rawProgress);
        
        let scrambledText = '';
        for (let i = 0; i < originalLength; i++) {
            if (i < finalText.length * progress) {
                // Reveal characters progressively
                scrambledText += finalText[i];
            } else {
                // Scramble unrevealed characters
                scrambledText += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
        }
        
        element.textContent = scrambledText;
        
        if (rawProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = finalText;
        }
    };
    
    animate();
}

/**
 * Render leaderboard table
 */
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = '';
    
    if (!leaderboardData || leaderboardData.length === 0) {
        renderEmptyLeaderboard('No entries yet');
        return;
    }
    
    leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        
        // Rank cell with badge
        const rankCell = document.createElement('td');
        rankCell.className = 'col-rank';
        const badge = document.createElement('div');
        badge.className = `rank-badge rank-${entry.rank <= 3 ? entry.rank : 'other'}`;
        badge.textContent = entry.rank;
        rankCell.appendChild(badge);
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'col-name';
        const name = document.createElement('span');
        name.className = `player-name ${entry.rank <= 3 ? 'top-3' : ''}`;
        name.textContent = '';  // Start empty for scramble effect
        nameCell.appendChild(name);
        
        // Time cell with speech bubble
        const timeCell = document.createElement('td');
        timeCell.className = 'col-time';
        const bubble = document.createElement('div');
        bubble.className = `timing-bubble ${entry.rank <= 3 ? 'top-3' : ''}`;
        bubble.textContent = '';  // Start empty for scramble effect
        timeCell.appendChild(bubble);
        
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        
        tbody.appendChild(row);
        
        // Apply scramble effect with staggered delay
        const staggerDelay = index * 50;
        setTimeout(() => {
            scrambleText(name, entry.name, 1000);
            scrambleText(bubble, entry.time.toFixed(3), 400);
        }, staggerDelay);
    });
}

/**
 * Render empty state message
 * @param {string} message - Message to display
 */
function renderEmptyLeaderboard(message) {
    const tbody = document.getElementById('leaderboard');
    tbody.innerHTML = `<tr><td colspan="3" class="empty-msg">${message}</td></tr>`;
}


// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load initial categories (only once on page load)
    loadCategories();
});