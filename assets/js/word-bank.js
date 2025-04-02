document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const wordsPerPage = 10;
    let currentPage = 1;
    let wordData = [];
    let filteredWords = [];
    let categories = [];
    let partsOfSpeech = [];
    let difficulties = [];

    // DOM Elements
    const wordTable = document.getElementById('word-table');
    const wordTableBody = document.getElementById('word-table-body');
    const searchInput = document.getElementById('word-search');
    const categoryFilter = document.getElementById('category-filter');
    const posFilter = document.getElementById('pos-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const pagination = document.getElementById('word-pagination');
    const totalWordsCount = document.getElementById('total-words-count');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Fetch word data
    async function fetchWordData() {
        try {
            showLoading(true);
            const response = await fetch('../assets/data/word-bank.json');
            const data = await response.json();
            
            wordData = data.words;
            categories = data.categories;
            partsOfSpeech = data.partsOfSpeech;
            difficulties = data.difficulties;
            
            // Initialize filters
            populateFilterOptions(categoryFilter, categories, 'All Categories');
            populateFilterOptions(posFilter, partsOfSpeech, 'All Parts of Speech');
            populateFilterOptions(difficultyFilter, difficulties, 'All Difficulty Levels');
            
            // Initial display
            filteredWords = [...wordData];
            updateWordDisplay();
            showLoading(false);
        } catch (error) {
            console.error('Error loading word data:', error);
            showLoading(false);
            wordTableBody.innerHTML = `<tr><td colspan="5">Error loading word data. Please try again later.</td></tr>`;
        }
    }

    // Populate filter dropdowns
    function populateFilterOptions(selectElement, options, defaultText) {
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

    // Filter words based on search and filter criteria
    function filterWords() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const categoryValue = categoryFilter.value;
        const posValue = posFilter.value;
        const difficultyValue = difficultyFilter.value;
        
        filteredWords = wordData.filter(word => {
            // Search term matching
            const matchesSearch = 
                searchTerm === '' || 
                word.term.toLowerCase().includes(searchTerm) || 
                word.definition.toLowerCase().includes(searchTerm);
            
            // Filter matching
            const matchesCategory = categoryValue === '' || word.category === categoryValue;
            const matchesPos = posValue === '' || word.partOfSpeech === posValue;
            const matchesDifficulty = difficultyValue === '' || word.difficulty === difficultyValue;
            
            return matchesSearch && matchesCategory && matchesPos && matchesDifficulty;
        });
        
        // Reset to first page when filtering
        currentPage = 1;
        updateWordDisplay();
    }

    // Update the word table display
    function updateWordDisplay() {
        // Calculate pagination
        const totalWords = filteredWords.length;
        const totalPages = Math.ceil(totalWords / wordsPerPage);
        const startIndex = (currentPage - 1) * wordsPerPage;
        const endIndex = Math.min(startIndex + wordsPerPage, totalWords);
        const currentWords = filteredWords.slice(startIndex, endIndex);
        
        // Update total count
        if (totalWordsCount) {
            totalWordsCount.textContent = totalWords;
        }
        
        // Clear table
        wordTableBody.innerHTML = '';
        
        // Add words to table
        if (currentWords.length === 0) {
            wordTableBody.innerHTML = `<tr><td colspan="5">No words found matching your criteria.</td></tr>`;
        } else {
            currentWords.forEach(word => {
                const row = document.createElement('tr');
                
                // Term cell
                const termCell = document.createElement('td');
                termCell.innerHTML = `<strong>${word.term}</strong><br><span class="pronunciation">${word.pronunciation}</span>`;
                row.appendChild(termCell);
                
                // Part of speech cell
                const posCell = document.createElement('td');
                posCell.textContent = capitalizeFirstLetter(word.partOfSpeech);
                row.appendChild(posCell);
                
                // Definition cell
                const defCell = document.createElement('td');
                defCell.textContent = word.definition;
                row.appendChild(defCell);
                
                // Example cell
                const exampleCell = document.createElement('td');
                if (word.examples && word.examples.length >= 2) {
                    exampleCell.innerHTML = `<em>${word.examples[0]}</em><br>${word.examples[1]}`;
                } else if (word.examples && word.examples.length === 1) {
                    exampleCell.innerHTML = `<em>${word.examples[0]}</em>`;
                }
                row.appendChild(exampleCell);
                
                // Category cell
                const catCell = document.createElement('td');
                catCell.textContent = capitalizeFirstLetter(word.category);
                row.appendChild(catCell);
                
                wordTableBody.appendChild(row);
            });
        }
        
        // Update pagination
        updatePagination(totalPages);
    }

    // Update pagination controls
    function updatePagination(totalPages) {
        pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            return;
        }
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = '←';
        prevButton.classList.add('pagination-btn');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateWordDisplay();
            }
        });
        pagination.appendChild(prevButton);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.textContent = '1';
            firstPageBtn.classList.add('pagination-btn');
            firstPageBtn.addEventListener('click', () => {
                currentPage = 1;
                updateWordDisplay();
            });
            pagination.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('pagination-ellipsis');
                pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.classList.add('pagination-btn');
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                updateWordDisplay();
            });
            pagination.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.classList.add('pagination-ellipsis');
                pagination.appendChild(ellipsis);
            }
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.textContent = totalPages;
            lastPageBtn.classList.add('pagination-btn');
            lastPageBtn.addEventListener('click', () => {
                currentPage = totalPages;
                updateWordDisplay();
            });
            pagination.appendChild(lastPageBtn);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = '→';
        nextButton.classList.add('pagination-btn');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateWordDisplay();
            }
        });
        pagination.appendChild(nextButton);
    }

    // Helper function to show/hide loading indicator
    function showLoading(isLoading) {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (wordTable) {
            wordTable.style.opacity = isLoading ? '0.5' : '1';
        }
    }

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterWords);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterWords);
    }
    
    if (posFilter) {
        posFilter.addEventListener('change', filterWords);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterWords);
    }

    // Initialize
    fetchWordData();
}); 