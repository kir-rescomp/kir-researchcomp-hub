// DNA Network Background - Page-Specific Version
(function() {
    'use strict';
    
    // ============================================================
    // PAGE CONFIGURATION - Edit this to control which pages show the background
    // ============================================================
    const ENABLED_PAGES = [
        '/',           // Home page (index.md)
        '/index.html', // Alternative home URL
        // Add more pages as needed:
        // '/about/',
        // '/research/',
    ];
    
    // Check if current page should have the background
    function shouldShowBackground() {
        const currentPath = window.location.pathname;
        return ENABLED_PAGES.some(page => {
            return currentPath === page || currentPath.endsWith(page);
        });
    }
    
    // Don't initialize if not on target page
    if (!shouldShowBackground()) {
        return;
    }
    
    // ============================================================
    
    const PRIMARY_COLOR = '#181844';
    const bases = ['A', 'T', 'G', 'C'];
    const basePairs = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
    
    function init() {
        const canvas = document.createElement('canvas');
        canvas.id = 'dna-network-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = 1.5 + Math.random() * 1;
                this.baseOpacity = 0.2 + Math.random() * 0.2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(24, 24, 68, ${this.baseOpacity})`;
                ctx.fill();
            }
        }
        
        // DNA Connection class
        class DNAConnection {
            constructor(p1, p2) {
                this.p1 = p1;
                this.p2 = p2;
                this.sequence = this.generateSequence();
                this.showBases = Math.random() < 0.3;
            }
            
            generateSequence() {
                const length = 3 + Math.floor(Math.random() * 3);
                let seq = [];
                for (let i = 0; i < length; i++) {
                    const base = bases[Math.floor(Math.random() * bases.length)];
                    seq.push({ base, pair: basePairs[base] });
                }
                return seq;
            }
            
            draw(distance, maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.15;
                
                ctx.beginPath();
                ctx.moveTo(this.p1.x, this.p1.y);
                ctx.lineTo(this.p2.x, this.p2.y);
                ctx.strokeStyle = `rgba(24, 24, 68, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                
                if (this.showBases && distance < maxDistance * 0.7) {
                    const dx = this.p2.x - this.p1.x;
                    const dy = this.p2.y - this.p1.y;
                    
                    const numBases = Math.min(this.sequence.length, 4);
                    for (let i = 0; i < numBases; i++) {
                        const t = (i + 1) / (numBases + 1);
                        const x = this.p1.x + dx * t;
                        const y = this.p1.y + dy * t;
                        
                        const angle = Math.atan2(dy, dx) + Math.PI / 2;
                        const len = 3;
                        const x1 = x + Math.cos(angle) * len;
                        const y1 = y + Math.sin(angle) * len;
                        const x2 = x - Math.cos(angle) * len;
                        const y2 = y - Math.sin(angle) * len;
                        
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = `rgba(24, 24, 68, ${opacity * 1.5})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                        
                        const baseOpacity = opacity * 2;
                        if (baseOpacity > 0.1) {
                            ctx.font = '8px Courier New';
                            ctx.fillStyle = `rgba(24, 24, 68, ${baseOpacity})`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            ctx.fillText(this.sequence[i].base, x1 + Math.cos(angle) * 2, y1 + Math.sin(angle) * 2);
                            ctx.fillText(this.sequence[i].pair, x2 - Math.cos(angle) * 2, y2 - Math.sin(angle) * 2);
                        }
                    }
                }
            }
        }
        
        const particleCount = 70;
        const particles = [];
        const maxDistance = 180;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        const connections = new Map();
        
        function getConnectionKey(i, j) {
            return i < j ? `${i}-${j}` : `${j}-${i}`;
        }
        
        const mouse = { x: null, y: null, radius: 150 };
        
        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        
        canvas.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        const key = getConnectionKey(i, j);
                        
                        if (!connections.has(key)) {
                            connections.set(key, new DNAConnection(particles[i], particles[j]));
                        }
                        
                        connections.get(key).draw(distance, maxDistance);
                    }
                }
                
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        const opacity = (1 - distance / mouse.radius) * 0.2;
                        ctx.strokeStyle = `rgba(24, 24, 68, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        
                        const force = (mouse.radius - distance) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        particles[i].vx -= Math.cos(angle) * force * 0.01;
                        particles[i].vy -= Math.sin(angle) * force * 0.01;
                    }
                }
            }
            
            if (connections.size > 200) {
                connections.clear();
            }
        }
        
        function animate() {
            ctx.fillStyle = 'rgba(245, 247, 250, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            drawConnections();
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
