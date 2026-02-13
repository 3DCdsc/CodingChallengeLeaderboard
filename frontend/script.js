const CATEGORY_REFRESH_MS = 3000;
let categoryRefreshInterval = null;

async function fetchCategories() {
    const response = await fetch('http://localhost:3000/leaderboard/categories', {
        cache: 'no-store'
    });
    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        return [];
    }

    return [...new Set(result.data)];
}

async function fetchLeaderboard(category) {
    try {
        const response = await fetch(`http://localhost:3000/leaderboard/rank/${category}`, {
            cache: 'no-store'
        });
        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            return [];
        }

        return result.data.map((entry, index) => ({
            rank: index + 1,
            name: entry.player || 'UNKNOWN',
            time: Number.parseFloat(entry.timing) || 0
        }));
    } catch (error) {
        console.error(`Error loading leaderboard for ${category}:`, error);
        return null;
    }
}

function createTableHeader() {
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="col-rank">RANK</th>
            <th class="col-name">PLAYER</th>
            <th class="col-time">TIME</th>
        </tr>
    `;
    return thead;
}

function createRow(entry) {
    const row = document.createElement('tr');

    const rankCell = document.createElement('td');
    rankCell.className = 'col-rank';
    const badge = document.createElement('div');
    badge.className = `rank-badge rank-${entry.rank <= 3 ? entry.rank : 'other'}`;
    badge.textContent = entry.rank;
    rankCell.appendChild(badge);

    const nameCell = document.createElement('td');
    nameCell.className = 'col-name';
    const name = document.createElement('span');
    name.className = `player-name ${entry.rank <= 3 ? 'top-3' : ''}`;
    name.textContent = entry.name;
    nameCell.appendChild(name);

    const timeCell = document.createElement('td');
    timeCell.className = 'col-time';
    const bubble = document.createElement('div');
    bubble.className = `timing-bubble ${entry.rank <= 3 ? 'top-3' : ''}`;
    bubble.textContent = entry.time.toFixed(3);
    timeCell.appendChild(bubble);

    row.appendChild(rankCell);
    row.appendChild(nameCell);
    row.appendChild(timeCell);

    return row;
}

function createLeaderboardCard(category, entries, hasError = false) {
    const card = document.createElement('div');
    card.className = 'panel-frame';

    const halftone = document.createElement('div');
    halftone.className = 'panel-halftone';

    const banner = document.createElement('div');
    banner.className = 'red-banner';
    const title = document.createElement('h2');
    title.textContent = category.toUpperCase();
    banner.appendChild(title);

    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    table.appendChild(createTableHeader());

    const tbody = document.createElement('tbody');

    if (hasError) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-msg">Error loading leaderboard</td></tr>';
    } else if (!entries || entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-msg">No entries yet</td></tr>';
    } else {
        entries.forEach(entry => {
            tbody.appendChild(createRow(entry));
        });
    }

    table.appendChild(tbody);

    card.appendChild(halftone);
    card.appendChild(banner);
    card.appendChild(table);
    return card;
}

function renderNoCategories(message) {
    const grid = document.getElementById('leaderboardsGrid');
    grid.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'panel-frame full-width-message';

    const halftone = document.createElement('div');
    halftone.className = 'panel-halftone';

    const table = document.createElement('table');
    table.className = 'leaderboard-table';

    const tbody = document.createElement('tbody');
    tbody.innerHTML = `<tr><td colspan="3" class="empty-msg">${message}</td></tr>`;
    table.appendChild(tbody);

    card.appendChild(halftone);
    card.appendChild(table);
    grid.appendChild(card);
}

async function refreshLeaderboards() {
    try {
        const categories = await fetchCategories();

        if (!categories.length) {
            renderNoCategories('No categories found yet');
            return;
        }

        const results = await Promise.all(categories.map(category => fetchLeaderboard(category)));
        const grid = document.getElementById('leaderboardsGrid');
        grid.innerHTML = '';

        categories.forEach((category, index) => {
            const entries = results[index];
            const hasError = entries === null;
            const card = createLeaderboardCard(category, hasError ? [] : entries, hasError);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error refreshing leaderboards:', error);
        renderNoCategories('Error loading leaderboards');
    }
}

function startCategoryRefresh() {
    if (categoryRefreshInterval) {
        clearInterval(categoryRefreshInterval);
    }

    categoryRefreshInterval = setInterval(() => {
        refreshLeaderboards();
    }, CATEGORY_REFRESH_MS);
}

document.addEventListener('DOMContentLoaded', () => {
    refreshLeaderboards();
    startCategoryRefresh();
});