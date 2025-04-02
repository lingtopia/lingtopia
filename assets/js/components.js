document.addEventListener('DOMContentLoaded', function() {
    // Load header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('/includes/header.html')
            .then(response => {
                if (!response.ok) {
                    // Try relative path if absolute path fails
                    return fetch('../includes/header.html')
                        .catch(() => fetch('./includes/header.html'));
                }
                return response;
            })
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
                // Fix navigation links based on current location
                const isRoot = window.location.pathname.endsWith('/') || 
                               window.location.pathname.endsWith('index.html');
                const isInSubdirectory = window.location.pathname.includes('/pages/');
                
                if (isInSubdirectory) {
                    // We're in a subdirectory, adjust links
                    const navLinks = document.querySelectorAll('nav a');
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === 'index.html') {
                            link.setAttribute('href', '../index.html');
                        } else if (href.startsWith('pages/')) {
                            link.setAttribute('href', href.replace('pages/', ''));
                        }
                    });
                }
                
                // Set active navigation item based on current page
                const currentPage = window.location.pathname.split('/').pop();
                const navLinks = document.querySelectorAll('nav a');
                
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (currentPage === href || 
                        (currentPage === '' && href === 'index.html') ||
                        href.endsWith('/' + currentPage)) {
                        link.classList.add('active');
                    }
                });
            })
            .catch(error => {
                console.error('Error loading header:', error);
                headerPlaceholder.innerHTML = '<p>Error loading header</p>';
            });
    }
    
    // Load footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('/includes/footer.html')
            .then(response => {
                if (!response.ok) {
                    // Try relative path if absolute path fails
                    return fetch('../includes/footer.html')
                        .catch(() => fetch('./includes/footer.html'));
                }
                return response;
            })
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Fix relative paths in footer links based on current directory
                const isInSubdirectory = window.location.pathname.includes('/pages/');
                const footerLinks = footerPlaceholder.querySelectorAll('a');
                
                if (isInSubdirectory) {
                    footerLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && href.startsWith('pages/')) {
                            link.setAttribute('href', href.replace('pages/', ''));
                        }
                        if (href && href === 'index.html#vision') {
                            link.setAttribute('href', '../index.html#vision');
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                footerPlaceholder.innerHTML = '<p>Error loading footer</p>';
            });
    }
}); 