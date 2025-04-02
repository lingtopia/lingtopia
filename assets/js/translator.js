// Simple demonstration translator
document.addEventListener('DOMContentLoaded', function() {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const translateBtn = document.getElementById('translate-btn');
    
    // Sample dictionary for demo purposes
    const dictionary = {
        'hello': 'novu',
        'world': 'mundi',
        'language': 'lingua',
        'new': 'nova',
        'welcome': 'benventu',
        'thank you': 'gratia',
        'please': 'peti',
        'yes': 'afir',
        'no': 'nega',
        'good': 'bona',
        'bad': 'mala',
        'day': 'diurna',
        'night': 'nokta',
        'friend': 'amiku',
        'learn': 'aprendi',
        'speak': 'parla',
        'understand': 'komprehendi',
        'create': 'krea',
        'future': 'futura',
        'research': 'sercha',
        'academic': 'akademi',
        'project': 'projekto',
        'community': 'komunita',
        'together': 'unisona',
        'knowledge': 'scia',
        'idea': 'idea',
        'word': 'vorto',
        'sentence': 'fraza',
        'grammar': 'gramatika',
        'structure': 'struktura',
        'meaning': 'signifa',
        'communication': 'komunika',
        'global': 'globala',
        'culture': 'kultura',
        'science': 'scienca',
        'art': 'arta',
        'human': 'humana',
        'technology': 'teknologia',
        'progress': 'progresa',
        'innovation': 'inovacia',
        'collaboration': 'kolabora'
    };
    
    translateBtn.addEventListener('click', function() {
        const text = sourceText.value.toLowerCase();
        let translation = '';
        
        // Very simple word-by-word translation for demo
        const words = text.split(/\s+/);
        
        words.forEach(word => {
            // Remove punctuation for lookup
            const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
            
            if (dictionary[cleanWord]) {
                // Keep the original punctuation
                const punctuation = word.match(/[.,!?;:'"()]/g) || '';
                translation += dictionary[cleanWord] + punctuation + ' ';
            } else {
                // If word not found, keep original
                translation += word + ' ';
            }
        });
        
        targetText.textContent = translation.trim();
    });
}); 