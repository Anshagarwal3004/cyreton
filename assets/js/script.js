document.addEventListener("DOMContentLoaded", () => {
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const navbarHeight = document.querySelector('nav') ? document.querySelector('nav').offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - navbarHeight;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // If it contains cards with fade-in-up, trigger them
                const cards = entry.target.querySelectorAll('.fade-in-up');
                cards.forEach(card => card.classList.add('visible'));

                // Handle Number Counters if found inside this section
                const counters = entry.target.querySelectorAll('.counter');
                if (counters.length > 0) {
                    counters.forEach(counter => {
                        const updateCount = () => {
                            const target = +counter.getAttribute('data-target');
                            const count = +counter.innerText;
                            const inc = target / 50; // Speed of counting

                            if (count < target) {
                                counter.innerText = Math.ceil(count + inc);
                                setTimeout(updateCount, 30);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        updateCount();
                        // Remove class so it doesn't trigger again
                        counter.classList.remove('counter');
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-anim').forEach((section) => {
        observer.observe(section);
    });

    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('.hero-content.fade-in-up').forEach(el => el.classList.add('visible'));
    }, 100);

    // Canvas Background Effect (Nexus Particles)
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            
            const numParticles = Math.min(Math.floor(window.innerWidth / 15), 100);
            
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1
                });
            }
        }

        let mouse = { x: -1000, y: -1000 };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
             mouse.x = -1000;
             mouse.y = -1000;
        });
        
        window.addEventListener('resize', initCanvas);

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            
            // Interaction colors based on CSS vars
            const blue = "rgba(26, 115, 232,";
            const lime = "rgba(148, 255, 110,";

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
                ctx.fill();

                // Draw lines between nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(138, 43, 226, ${0.35 * (1 - dist / 150)})`;
                        ctx.stroke();
                    }
                }
                
                // Repel and connect to mouse
                let dxMouse = p.x - mouse.x;
                let dyMouse = p.y - mouse.y;
                let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < 200) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(255, 20, 147, ${0.6 * (1 - distMouse / 200)})`;
                    ctx.stroke();
                    
                    // subtle repel push
                    p.x += dxMouse * 0.01;
                    p.y += dyMouse * 0.01;
                }
            }
            requestAnimationFrame(drawParticles);
        }

        initCanvas();
        drawParticles();
    }

    // ====== DELAYED CARD EXPANSION ======
    // Phase 1 (instant): CSS :hover handles glow + lift
    // Phase 2 (delayed): JS adds .expanded after 500ms for the big grid push
    const serviceCards = document.querySelectorAll('.service-card');
    const expandTimers = new Map();

    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const timer = setTimeout(() => {
                card.classList.add('expanded');
            }, 800);
            expandTimers.set(card, timer);
        });

        card.addEventListener('mouseleave', () => {
            // Clear the pending timer if they leave early
            const timer = expandTimers.get(card);
            if (timer) clearTimeout(timer);
            expandTimers.delete(card);
            // Instantly collapse
            card.classList.remove('expanded');
        });
    });
});
