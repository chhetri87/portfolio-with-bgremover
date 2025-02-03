document.addEventListener('DOMContentLoaded', function() {
    const footerLinks = document.querySelectorAll('.footer-nav-link');
    const sections = document.querySelectorAll('.page-section');
    const homeSection = document.getElementById('home');
    const mainNavLinks = document.querySelectorAll('.main-nav a');

    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states in main navigation
            mainNavLinks.forEach(navLink => {
                if (navLink.getAttribute('href') === `#${targetId}`) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            });
            
            // Show/hide sections
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                    section.scrollIntoView({ behavior: 'smooth' });
                } else {
                    section.style.display = 'none';
                }
            });

            // Show/hide home content
            if (targetId === 'home') {
                homeSection.style.display = 'block';
            } else {
                homeSection.style.display = 'none';
            }
        });
    });
}); 