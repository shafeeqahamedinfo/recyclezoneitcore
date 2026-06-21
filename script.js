/**
 * RecycleZone - Core UI Interaction Script
 * Safely handles local storage accesses.
 */

// --- IN-MEMORY/LOCAL OFFLINE DATABASE SIMULATOR ---
window.RecycleZoneDB = {
    getProjects: async () => {
        return window.RecycleZoneProjects || [];
    },
    submitContact: async (contact) => {
        console.log("RecycleZone: Contact form submitted locally:", contact);
        try {
            let submissions = JSON.parse(localStorage.getItem('recyclezone_contacts') || '[]');
            submissions.unshift({
                id: 'rz_contact_' + Math.random().toString(36).substr(2, 9),
                ...contact,
                created_at: new Date().toISOString()
            });
            localStorage.setItem('recyclezone_contacts', JSON.stringify(submissions));
        } catch (e) {
            console.warn("RecycleZone: Could not write contact submission to localStorage.", e);
        }
        return contact;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. DISMISS LOADER SCREEN
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    });
    // Fallback if window load takes too long
    setTimeout(() => {
        const loader = document.getElementById('loader-screen');
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
    }, 2500);

    // 2. DYNAMIC YEAR SETTER
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 3. DARK/LIGHT THEME SWITCHER
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage theme preference
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('recyclezone_theme');
    } catch (e) {
        console.warn("RecycleZone: localStorage access restricted for theme settings.", e);
    }

    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        updateThemeIcon(true);
    } else {
        body.classList.remove('light-theme');
        updateThemeIcon(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            try {
                localStorage.setItem('recyclezone_theme', isLight ? 'light' : 'dark');
            } catch (e) {}
            updateThemeIcon(isLight);
            // Re-initialize canvas to adjust particle colors
            initParticles();
        });
    }

    function updateThemeIcon(isLight) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (isLight) {
            icon.className = 'bi bi-sun-fill';
        } else {
            icon.className = 'bi bi-moon-stars-fill';
        }
    }

    // 4. HEADER NAVBAR SCROLL CLASS
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 5. HTML5 CANVAS PARTICLES BACKGROUND
    const canvas = document.getElementById('particle-canvas');
    let ctx = null;
    let particlesArray = [];
    let numberOfParticles = 80;

    if (canvas) {
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        });
        
        // Setup initial canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const isLightTheme = document.body.classList.contains('light-theme');
            // Theme-appropriate colors
            const pColor = isLightTheme ? 'rgba(179, 143, 29, 0.15)' : 'rgba(212, 175, 55, 0.2)';
            
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 3) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                
                particlesArray.push(new Particle(x, y, directionX, directionY, size, pColor));
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        function connectParticles() {
            const isLightTheme = document.body.classList.contains('light-theme');
            const lineColor = isLightTheme ? 'rgba(179, 143, 29, 0.05)' : 'rgba(212, 175, 55, 0.06)';
            let maxDistance = 140;
            
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distSq = ((particlesArray[a].x - particlesArray[b].x) ** 2) + 
                                 ((particlesArray[a].y - particlesArray[b].y) ** 2);
                    if (distSq < maxDistance ** 2) {
                        let alpha = 1 - (Math.sqrt(distSq) / maxDistance);
                        ctx.strokeStyle = lineColor.replace(')', `, ${alpha})`).replace('rgba', 'rgba');
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        initParticles();
        animateParticles();
    }

    // 6. HERO TYPING ANIMATION
    const typedTextSpan = document.getElementById('typed-headline');
    if (typedTextSpan) {
        const words = ["Digital Excellence", "Enterprise Systems", "Eco-Friendly Tech", "Custom Software"];
        const typingSpeed = 100;
        const erasingSpeed = 60;
        const newWordDelay = 2000;
        let wordIndex = 0;
        let charIndex = 0;

        function type() {
            if (charIndex < words[wordIndex].length) {
                typedTextSpan.textContent = words[wordIndex].substring(0, charIndex + 1);
                charIndex++;
                setTimeout(type, typingSpeed);
            } else {
                setTimeout(erase, newWordDelay);
            }
        }

        function erase() {
            if (charIndex > 0) {
                typedTextSpan.textContent = words[wordIndex].substring(0, charIndex - 1);
                charIndex--;
                setTimeout(erase, erasingSpeed);
            } else {
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, typingSpeed + 100);
            }
        }
        
        // Initiate typing
        setTimeout(type, 1000);
    }

    // 7. SCROLL REVEAL & STATS COUNTER ANIMATION
    const reveals = document.querySelectorAll('.reveal');
    const counters = document.querySelectorAll('.stat-number, .counter-number');

    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(element => {
        revealObserver.observe(element);
    });

    // Numerical Counter Observer
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'), 10);
                let count = 0;
                // Animate speeds based on target size
                const increment = Math.ceil(target / 50); 
                const speed = 25; 

                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        counter.textContent = count + "+";
                        setTimeout(updateCount, speed);
                    } else {
                        counter.textContent = target + "+";
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // 8. BACK TO TOP BUTTON CONTROL
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 9. DYNAMIC PROJECTS LOADING, SEARCH AND FILTERS
    let allProjects = [];
    const projectsGrid = document.getElementById('projects-grid');
    const searchInput = document.getElementById('project-search-input');
    const filterButtons = document.querySelectorAll('#project-filter-buttons .filter-btn');

    async function loadProjects() {
        if (!projectsGrid) return;
        
        try {
            // Fetch projects from supabase wrapper
            allProjects = await window.RecycleZoneDB.getProjects();
            renderProjects(allProjects);
        } catch (error) {
            console.error("Error loading projects:", error);
            projectsGrid.innerHTML = `
                <div class="col-12 text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill" style="font-size: 2rem;"></i>
                    <p class="mt-2">Failed to load projects database. Please check Supabase schema settings.</p>
                </div>
            `;
        }
    }

    function renderProjects(projectsToRender) {
        if (!projectsGrid) return;
        
        if (projectsToRender.length === 0) {
            projectsGrid.innerHTML = `
                <div class="col-12 text-center text-secondary py-5">
                    <i class="bi bi-folder-x" style="font-size: 2.5rem;"></i>
                    <p class="mt-2">No matching projects found.</p>
                </div>
            `;
            return;
        }

        projectsGrid.innerHTML = "";
        
        projectsToRender.forEach(project => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 reveal active'; // Reveal immediately on filtering
            
            // Format status badge color
            const statusClass = project.status.toLowerCase() === 'completed' ? 'bg-success bg-opacity-25 text-success border-success' : 'bg-warning bg-opacity-25 text-warning border-warning';
            
            col.innerHTML = `
                <div class="glass-card project-card">
                    <div class="project-img-wrap">
                        <img src="${project.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'}" class="project-img" alt="${project.title}">
                        <div class="project-overlay">
                            <button class="btn project-detail-btn" data-project-id="${project.id}">View Details</button>
                        </div>
                    </div>
                    <div class="project-body text-start">
                        <span class="project-tag border ${statusClass}">${project.status}</span>
                        <h3 class="project-title text-white">${project.title}</h3>
                        <p class="project-desc">${project.description}</p>
                        <div class="project-tech">
                            <i class="bi bi-stack me-2 text-gold"></i>${project.technologies}
                        </div>
                    </div>
                </div>
            `;
            
            projectsGrid.appendChild(col);
        });

        // Add event listeners to the view details buttons
        document.querySelectorAll('.project-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectId = e.target.getAttribute('data-project-id');
                const project = allProjects.find(p => p.id === projectId);
                if (project) {
                    showProjectModal(project);
                }
            });
        });
    }

    function showProjectModal(project) {
        const modal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
        document.getElementById('projectDetailModalLabel').textContent = project.title;
        document.getElementById('modal-project-img').src = project.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80';
        document.getElementById('modal-project-title').textContent = project.title;
        document.getElementById('modal-project-desc').textContent = project.description;
        document.getElementById('modal-project-tech').textContent = project.technologies;
        
        // Status indicator
        const statusSpan = document.getElementById('modal-project-status');
        statusSpan.textContent = project.status;
        statusSpan.className = 'project-tag border ' + 
            (project.status.toLowerCase() === 'completed' ? 'bg-success bg-opacity-25 text-success border-success' : 'bg-warning bg-opacity-25 text-warning border-warning');
        
        // Demo and Github URLs
        const liveBtn = document.getElementById('modal-project-live-btn');
        const githubBtn = document.getElementById('modal-project-github-btn');
        
        if (project.live_url && project.live_url !== "#") {
            liveBtn.href = project.live_url;
            liveBtn.classList.remove('d-none');
        } else {
            liveBtn.classList.add('d-none');
        }
        
        if (project.github_url && project.github_url !== "#") {
            githubBtn.href = project.github_url;
            githubBtn.classList.remove('d-none');
        } else {
            githubBtn.classList.add('d-none');
        }
        
        modal.show();
    }

    // Live search input handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const activeFilter = document.querySelector('#project-filter-buttons .filter-btn.active').getAttribute('data-filter');
            filterAndSearchProjects(query, activeFilter);
        });
    }

    // Category Filter Buttons handler
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const activeFilter = e.target.getAttribute('data-filter');
            const query = searchInput ? searchInput.value.toLowerCase() : "";
            filterAndSearchProjects(query, activeFilter);
        });
    });

    function filterAndSearchProjects(searchQuery, filterStatus) {
        let filtered = allProjects;
        
        // Apply category status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(p => p.status.toLowerCase() === filterStatus);
        }
        
        // Apply text search
        if (searchQuery) {
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(searchQuery) || 
                p.description.toLowerCase().includes(searchQuery) ||
                p.technologies.toLowerCase().includes(searchQuery)
            );
        }
        
        renderProjects(filtered);
    }

    // Initialize Projects loading
    loadProjects();

    // 10. CONTACT FORM SUBMISSION HANDLER
    const contactForm = document.getElementById('contact-form');
    const formAlertContainer = document.getElementById('form-alert-container');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('contact-submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...`;
            
            const contactData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value || "",
                company: document.getElementById('contact-company').value || "",
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value
            };

            try {
                // Submit to Supabase/Mock layer
                await window.RecycleZoneDB.submitContact(contactData);
                
                showAlert(formAlertContainer, 'success', 'Success! Your message has been received. Our team will contact you shortly.');
                contactForm.reset();
            } catch (error) {
                console.error("Form submit error:", error);
                showAlert(formAlertContainer, 'danger', 'Oops! Failed to submit message. Please try again later or check database connection.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // 11. NEWSLETTER SUBSCRIPTION HANDLER
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterAlert = document.getElementById('newsletter-alert');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value;
            
            // Save email locally to simulate subscription
            let subscribers = [];
            try {
                subscribers = JSON.parse(localStorage.getItem('recyclezone_newsletter_subs') || '[]');
                if (!subscribers.includes(email)) {
                    subscribers.push(email);
                    localStorage.setItem('recyclezone_newsletter_subs', JSON.stringify(subscribers));
                }
            } catch (e) {
                console.warn("RecycleZone: Failed to save newsletter subscription to localStorage.", e);
            }
            
            newsletterAlert.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Subscribed successfully!`;
            newsletterForm.reset();
            
            setTimeout(() => {
                newsletterAlert.innerHTML = "";
            }, 5000);
        });
    }

    // Alert display helper
    function showAlert(container, type, message) {
        if (!container) return;
        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
        container.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show bg-opacity-25 text-${type} border-${type} mt-3" role="alert">
                <i class="bi ${icon} me-2"></i> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
});
