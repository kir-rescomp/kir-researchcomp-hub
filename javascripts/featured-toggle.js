document$.subscribe(function() {
  const showFeaturedBtn = document.querySelector('.show-featured-btn');
  const featuredSection = document.getElementById('featured-posts');
  
  if (showFeaturedBtn && featuredSection) {
    // Hide on initial load
    featuredSection.classList.add('hidden');
    
    showFeaturedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle the 'hidden' class
      if (featuredSection.classList.contains('hidden')) {
        featuredSection.classList.remove('hidden');
        this.textContent = 'Hide Featured';
        
        setTimeout(() => {
          featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        featuredSection.classList.add('hidden');
        this.textContent = 'View Featured';
      }
    });
  }
});