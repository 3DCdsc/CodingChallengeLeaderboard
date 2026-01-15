async function loadLeaderboard() {
    try {
        const response = await fetch("http://localhost:3000/leaderboard/rank");
        const result = await response.json();
        const tbody = document.getElementById('leaderboard');
        
        // Clear old rows before adding new ones
        tbody.innerHTML = '';
        
        result.data.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.player}</td>
                <td>${entry.timing}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', loadLeaderboard);

// Refresh leaderboard every 3 seconds
setInterval(loadLeaderboard, 3000);