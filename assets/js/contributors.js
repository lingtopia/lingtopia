document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const coreContributorsContainer = document.getElementById('core-contributors-container');
    const contributorsLeaderboard = document.getElementById('contributors-leaderboard');
    const contributorsFilter = document.getElementById('contributors-filter');
    const loadingIndicator = document.getElementById('contributors-loading');
    const coreLoadingIndicator = document.getElementById('core-contributors-loading');
    
    // Data storage
    let communityData = {};
    let coreData = {};
    let filteredContributors = [];
    
    // Fetch core contributors data
    async function fetchCoreContributors() {
        if (!coreContributorsContainer) return;
        
        try {
            showCoreLoading(true);
            const response = await fetch('../assets/data/core-contributors.json');
            const data = await response.json();
            
            coreData = data;
            displayCoreContributors();
            showCoreLoading(false);
        } catch (error) {
            console.error('Error loading core contributors data:', error);
            showCoreLoading(false);
            if (coreContributorsContainer) {
                coreContributorsContainer.innerHTML = `<p class="error-message">Error loading core contributors data. Please try again later.</p>`;
            }
        }
    }
    
    // Fetch community contributors data
    async function fetchCommunityContributors() {
        if (!contributorsLeaderboard) return;
        
        try {
            showLoading(true);
            const response = await fetch('../assets/data/contributors.json');
            const data = await response.json();
            
            communityData = data;
            
            // Initialize filters if they exist
            if (contributorsFilter) {
                populateFilterOptions(contributorsFilter, data.areas, 'All Areas');
            }
            
            // Initial display
            filteredContributors = [...data.contributors].sort((a, b) => b.contributions - a.contributions);
            displayContributorsLeaderboard();
            showLoading(false);
        } catch (error) {
            console.error('Error loading community contributors data:', error);
            showLoading(false);
            if (contributorsLeaderboard) {
                contributorsLeaderboard.innerHTML = `<p class="error-message">Error loading contributors data. Please try again later.</p>`;
            }
        }
    }
    
    // Display core contributors
    function displayCoreContributors() {
        if (!coreContributorsContainer || !coreData.contributors) return;
        
        let html = '<div class="contributor-grid">';
        
        coreData.contributors.forEach(contributor => {
            html += `
                <div class="contributor-card">
                    <div class="contributor-image">
                        <img src="${contributor.image}" alt="${contributor.name}">
                    </div>
                    <div class="contributor-info">
                        <h3 class="contributor-name">${contributor.name}</h3>
                        <span class="contributor-role">${contributor.role}</span>
                        <p class="contributor-bio">${contributor.bio}</p>
                        <p><strong>Contributions:</strong> ${contributor.contributions}</p>
                        <div class="contributor-links">
            `;
            
            // Add links
            if (contributor.links) {
                if (contributor.links.email) {
                    html += `<a href="mailto:${contributor.links.email}">Email</a>`;
                }
                if (contributor.links.twitter) {
                    html += `<a href="${contributor.links.twitter}">Twitter</a>`;
                }
                if (contributor.links.github) {
                    html += `<a href="${contributor.links.github}">GitHub</a>`;
                }
                if (contributor.links.linkedin) {
                    html += `<a href="${contributor.links.linkedin}">LinkedIn</a>`;
                }
                if (contributor.links.website) {
                    html += `<a href="${contributor.links.website}">Website</a>`;
                }
            }
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        coreContributorsContainer.innerHTML = html;
    }
    
    // Populate filter dropdowns
    function populateFilterOptions(selectElement, options, defaultText) {
        if (!selectElement) return;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = defaultText;
        selectElement.appendChild(defaultOption);
        
        // Add options from data
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = capitalizeFirstLetter(option);
            selectElement.appendChild(optionElement);
        });
    }
    
    // Filter contributors
    function filterContributors() {
        if (!contributorsFilter) return;
        
        const areaValue = contributorsFilter.value;
        
        filteredContributors = communityData.contributors.filter(contributor => {
            return areaValue === '' || contributor.area === areaValue;
        });
        
        // Sort by contribution count
        filteredContributors.sort((a, b) => b.contributions - a.contributions);
        
        displayContributorsLeaderboard();
    }
    
    // Display contributors leaderboard
    function displayContributorsLeaderboard() {
        if (!contributorsLeaderboard) return;
        
        if (filteredContributors.length === 0) {
            contributorsLeaderboard.innerHTML = `<p>No contributors found matching your criteria.</p>`;
            return;
        }
        
        let html = `
            <table class="contributors-table">
                <thead>
                    <tr>
                        <th class="rank-column">Rank</th>
                        <th class="contributor-column">Contributor</th>
                        <th class="area-column">Focus Area</th>
                        <th class="contributions-column">Contributions</th>
                        <th class="joined-column">Joined</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        filteredContributors.forEach((contributor, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `top-${rank}` : '';
            const formattedDate = new Date(contributor.joined).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            html += `
                <tr class="${rankClass}">
                    <td class="rank-column">
                        ${rank <= 3 ? `<span class="rank-badge rank-${rank}">${rank}</span>` : rank}
                    </td>
                    <td class="contributor-column">
                        <div class="contributor-info">
                            <img src="${contributor.image || '../assets/images/contributors/default.jpg'}" alt="${contributor.name}" class="contributor-avatar">
                            <div class="contributor-name">
                                <strong>${contributor.name}</strong>
                                ${contributor.username ? `<span class="username">${contributor.username}</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="area-column">
                        <span class="area-tag">${capitalizeFirstLetter(contributor.area)}</span>
                    </td>
                    <td class="contributions-column">
                        <strong>${contributor.contributions}</strong>
                    </td>
                    <td class="joined-column">
                        ${formattedDate}
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        contributorsLeaderboard.innerHTML = html;
    }
    
    // Helper function to show/hide loading indicator for community contributors
    function showLoading(isLoading) {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (contributorsLeaderboard) {
            contributorsLeaderboard.style.opacity = isLoading ? '0.5' : '1';
        }
    }
    
    // Helper function to show/hide loading indicator for core contributors
    function showCoreLoading(isLoading) {
        if (coreLoadingIndicator) {
            coreLoadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (coreContributorsContainer) {
            coreContributorsContainer.style.opacity = isLoading ? '0.5' : '1';
        }
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Event listeners
    if (contributorsFilter) {
        contributorsFilter.addEventListener('change', filterContributors);
    }
    
    // Initialize
    fetchCoreContributors();
    fetchCommunityContributors();
}); 