// Morphing DNA Network Background Animation
(function() {
    'use strict';
    
    const PRIMARY_COLOR = '#181844';
    const bases = ['A', 'T', 'G', 'C'];
    
    function init() {
        const canvas = document.createElement('canvas');
        canvas.id = 'morphing-dna-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Animation state
        let morphProgress = 0;
        let morphing = false;
        let morphCycle = 0;
        const morphDuration = 180;
        const holdDuration = 120;
        const restDuration = 300;
        
        // Particle class
        class Particle {
            constructor(index, total) {
                this.networkX = Math.random() * canvas.width;
                this.networkY = Math.random() * canvas.height;
                
                const helixProgress = index / total;
                const helixY = canvas.height * 0.2 + (canvas.height * 0.6) * helixProgress;
                const angle = helixProgress * Math.PI * 4;
                const helixRadius = 50;
                const centerX = canvas.width / 2;
                
                this.helixX1 = centerX + Math.cos(angle) * helixRadius;
                this.helixY1 = helixY;
                this.helixX2 = centerX + Math.cos(angle + Math.PI) * helixRadius;
                this.helixY2 = helixY;
                
                this.isStrand1 = index % 2 === 0;
                this.helixX = this.isStrand1 ? this.helixX1 : this.helixX2;
                this.helixY = this.isStrand1 ? this.helixY1 : this.helixY2;
                
                this.x = this.networkX;
                this.y = this.networkY;
                
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                
                this.radius = 1.5 + Math.random() * 1;
                this.baseOpacity = 0.2 + Math.random() * 0.2;
                this.base = bases[Math.floor(Math.random() * bases.length)];
                this.index = index;
            }
            
            update(morphFactor) {
                if (!morphing || morphFactor < 0.5) {
                    this.networkX += this.vx;
                    this.networkY += this.vy;
                    
                    if (this.networkX < 0) this.networkX = canvas.width;
                    if (this.networkX > canvas.width) this.networkX = 0;
                    if (this.networkY < 0) this.networkY = canvas.height;
                    if (this.networkY > canvas.height) this.networkY = 0;
                }
                
                const eased = this.easeInOutCubic(morphFactor);
                this.x = this.networkX + (this.helixX - this.networkX) * eased;
                this.y = this.networkY + (this.helixY - this.networkY) * eased;
            }
            
            easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            
            draw(morphFactor) {
                const opacity = this.baseOpacity * (0.7 + morphFactor * 0.3);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(24, 24, 68, ${opacity})`;
                ctx.fill();
            }
        }
        
        const particleCount = 60;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(i, particleCount));
        }
        
        function drawConnections(morphFactor) {
            const maxDistance = morphing ? 200 : 150;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        let opacity = (1 - distance / maxDistance) * 0.12;
                        
                        if (morphFactor > 0.3) {
                            const indexDiff = Math.abs(particles[i].index - particles[j].index);
                            
                            if (particles[i].isStrand1 === particles[j].isStrand1 && indexDiff <= 2) {
                                opacity *= 1.5;
                            }
                            else if (particles[i].isStrand1 !== particles[j].isStrand1 && indexDiff <= 1) {
                                opacity *= 2;
                                
                                if (morphFactor > 0.6 && indexDiff === 1) {
                                    const midX = (particles[i].x + particles[j].x) / 2;
                                    const midY = (particles[i].y + particles[j].y) / 2;
                                    
                                    const angle = Math.atan2(dy, dx) + Math.PI / 2;
                                    const len = 2;
                                    
                                    ctx.beginPath();
                                    ctx.moveTo(midX + Math.cos(angle) * len, midY + Math.sin(angle) * len);
                                    ctx.lineTo(midX - Math.cos(angle) * len, midY - Math.sin(angle) * len);
                                    ctx.strokeStyle = `rgba(24, 24, 68, ${opacity * 1.5})`;
                                    ctx.lineWidth = 1;
                                    ctx.stroke();
                                }
                            }
                        }
                        
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(24, 24, 68, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }
        
        function updateMorphState() {
            morphCycle++;
            
            if (!morphing && morphCycle >= restDuration) {
                morphing = true;
                morphCycle = 0;
            } else if (morphing && morphCycle >= morphDuration + holdDuration) {
                morphing = false;
                morphCycle = 0;
                morphProgress = 0;
            } else if (morphing) {
                if (morphCycle < morphDuration) {
                    morphProgress = morphCycle / morphDuration;
                } else if (morphCycle < morphDuration + holdDuration) {
                    morphProgress = 1;
                } else {
                    morphProgress = 1 - (morphCycle - morphDuration - holdDuration) / morphDuration;
                }
            }
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
        
        function animate() {
            ctx.fillStyle = 'rgba(245, 247, 250, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            updateMorphState();
            
            particles.forEach(particle => {
                particle.update(morphProgress);
                particle.draw(morphProgress);
            });
            
            drawConnections(morphProgress);
            
            if (mouse.x !== null && mouse.y !== null && morphProgress < 0.5) {
                particles.forEach(particle => {
                    const dx = particle.x - mouse.x;
                    const dy = particle.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        const opacity = (1 - distance / mouse.radius) * 0.15;
                        ctx.strokeStyle = `rgba(24, 24, 68, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            }
            
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
