document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const grammarContainer = document.getElementById('grammar-content');
    const searchInput = document.getElementById('grammar-search');
    const categoryFilter = document.getElementById('grammar-category-filter');
    const difficultyFilter = document.getElementById('grammar-difficulty-filter');
    const loadingIndicator = document.getElementById('grammar-loading-indicator');
    
    // Data storage
    let grammarData = {};
    let filteredRules = [];
    
    // Fetch grammar data
    async function fetchGrammarData() {
        try {
            showLoading(true);
            const response = await fetch('../assets/data/grammar-bank.json');
            const data = await response.json();
            
            grammarData = data;
            
            // Initialize filters
            populateFilterOptions(categoryFilter, data.categories, 'All Categories');
            populateFilterOptions(difficultyFilter, data.difficulties, 'All Difficulty Levels');
            
            // Initial display
            displayGrammarContent();
            showLoading(false);
        } catch (error) {
            console.error('Error loading grammar data:', error);
            showLoading(false);
            if (grammarContainer) {
                grammarContainer.innerHTML = `<p class="error-message">Error loading grammar data. Please try again later.</p>`;
            }
        }
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
    
    // Filter grammar rules
    function filterGrammarRules() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const categoryValue = categoryFilter ? categoryFilter.value : '';
        const difficultyValue = difficultyFilter ? difficultyFilter.value : '';
        
        filteredRules = grammarData.rules.filter(rule => {
            // Search term matching
            const matchesSearch = 
                searchTerm === '' || 
                rule.title.toLowerCase().includes(searchTerm) || 
                rule.description.toLowerCase().includes(searchTerm) ||
                (rule.examples && rule.examples.some(ex => 
                    ex.original.toLowerCase().includes(searchTerm) || 
                    ex.translation.toLowerCase().includes(searchTerm)
                ));
            
            // Filter matching - strict equality check instead of includes
            const matchesCategory = categoryValue === '' || rule.category === categoryValue;
            const matchesDifficulty = difficultyValue === '' || rule.difficulty === difficultyValue;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
        
        displayGrammarContent();
    }
    
    // Display grammar content
    function displayGrammarContent() {
        if (!grammarContainer) return;
        
        // Don't reset filteredRules if filters are applied
        if (filteredRules.length === 0 && 
            (!searchInput || !searchInput.value) && 
            (!categoryFilter || !categoryFilter.value) && 
            (!difficultyFilter || !difficultyFilter.value) && 
            grammarData.rules) {
            filteredRules = [...grammarData.rules];
        }
        
        // Show "no results" message if no rules match the filters
        if (filteredRules.length === 0) {
            grammarContainer.innerHTML = `<p>No grammar rules found matching your criteria.</p>`;
            return;
        }
        
        // Group by sections if no filters are applied
        if ((!searchInput || !searchInput.value) && 
            (!categoryFilter || !categoryFilter.value) && 
            (!difficultyFilter || !difficultyFilter.value) && 
            grammarData.sections) {
            displayBySections();
        } else {
            // Display as flat list when filters are applied
            displayAsFlatList();
        }
    }
    
    // Display grammar rules grouped by sections
    function displayBySections() {
        let html = '';
        
        grammarData.sections.forEach(section => {
            html += `<h3 class="section-title">${section.title}</h3>`;
            
            // Only display rules that are in the filtered set
            const sectionRules = section.rules
                .map(ruleId => grammarData.rules.find(r => r.id === ruleId))
                .filter(rule => rule && filteredRules.some(fr => fr.id === rule.id));
            
            if (sectionRules.length === 0) {
                // Skip sections with no matching rules
                return;
            }
            
            sectionRules.forEach(rule => {
                html += createRuleHTML(rule);
            });
        });
        
        if (html === '') {
            html = '<p>No grammar rules found matching your criteria.</p>';
        }
        
        grammarContainer.innerHTML = html;
    }
    
    // Display grammar rules as a flat list
    function displayAsFlatList() {
        let html = '';
        
        filteredRules.forEach(rule => {
            html += createRuleHTML(rule);
        });
        
        grammarContainer.innerHTML = html;
    }
    
    // Create HTML for a single grammar rule
    function createRuleHTML(rule) {
        let html = `
            <div class="grammar-rule" data-id="${rule.id}" data-category="${rule.category}" data-difficulty="${rule.difficulty}">
                <h3>${rule.title}</h3>
                <div class="rule-meta">
                    <span class="rule-category">${capitalizeFirstLetter(rule.category)}</span>
                    <span class="rule-difficulty">${capitalizeFirstLetter(rule.difficulty)}</span>
                </div>
                <p>${rule.description}</p>
        `;
        
        // Add examples if they exist
        if (rule.examples && rule.examples.length > 0) {
            html += `<div class="grammar-example">`;
            rule.examples.forEach(example => {
                html += `
                    <p><strong>${example.original}</strong> = ${example.translation}</p>
                `;
            });
            html += `</div>`;
        }
        
        // Add table if it exists
        if (rule.table) {
            html += `<table class="grammar-table">
                <thead>
                    <tr>`;
            
            rule.table.headers.forEach(header => {
                html += `<th>${header}</th>`;
            });
            
            html += `</tr>
                </thead>
                <tbody>`;
            
            rule.table.rows.forEach(row => {
                html += `<tr>`;
                row.forEach(cell => {
                    html += `<td>${cell}</td>`;
                });
                html += `</tr>`;
            });
            
            html += `</tbody>
            </table>`;
        }
        
        // Add notes if they exist
        if (rule.notes) {
            html += `<p class="rule-notes"><em>${rule.notes}</em></p>`;
        }
        
        html += `</div>`;
        return html;
    }
    
    // Helper function to show/hide loading indicator
    function showLoading(isLoading) {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (grammarContainer) {
            grammarContainer.style.opacity = isLoading ? '0.5' : '1';
        }
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterGrammarRules);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterGrammarRules);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterGrammarRules);
    }
    
    // Initialize
    fetchGrammarData();
}); 