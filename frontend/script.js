let currentCategory = null;
let refreshInterval = null;

// Load available categories
async function loadCategories() {
    try {
        const response = await fetch("http://localhost:3000/leaderboard/categories");
        const result = await response.json();
        const tabsContainer = document.getElementById('categoryTabs');
        
        if (result.data && result.data.length > 0) {
            tabsContainer.innerHTML = '';
            
            result.data.forEach(category => {
                const tab = document.createElement('button');
                tab.className = 'category-tab';
                tab.textContent = category;
                tab.onclick = () => selectCategory(category);
                tabsContainer.appendChild(tab);
            });
            
            // Auto-select first category if none selected
            if (!currentCategory && result.data.length > 0) {
                selectCategory(result.data[0]);
            }
        } else {
            tabsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">No categories available yet</p>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Select a category and load its leaderboard
function selectCategory(category) {
    currentCategory = category;
    
    // Update active tab styling
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.textContent === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update current category display
    document.getElementById('currentCategoryName').textContent = category;
    
    // Load leaderboard for this category
    loadLeaderboard(category);
    
    // Clear existing interval and set new one
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    refreshInterval = setInterval(() => loadLeaderboard(category), 3000);
}

// Load leaderboard for specific category
async function loadLeaderboard(category) {
    try {
        const response = await fetch(`http://localhost:3000/leaderboard/rank/${category}`);
        const result = await response.json();
        const tbody = document.getElementById('leaderboard');
        
        // Clear old rows before adding new ones
        tbody.innerHTML = '';
        
        if (result.data && result.data.length > 0) {
            result.data.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.player}</td>
                    <td>${entry.timing}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">No entries yet for this category</td></tr>';
        }
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('leaderboard');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #ff6b6b;">Error loading leaderboard</td></tr>';
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    // Refresh categories every 10 seconds to detect new ones
    setInterval(loadCategories, 10000);
});