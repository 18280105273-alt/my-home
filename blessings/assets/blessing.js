(() => {
    "use strict";

    const body = document.body;
    const theme = body.dataset.theme || "mid-autumn";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.querySelector("#fx");
    const ctx = canvas.getContext("2d");
    const toast = document.querySelector("#toast");

    const palettes = {
        "mid-autumn": ["#fff4b8", "#f3c760", "#7fd9cf", "#ffffff"],
        "new-year": ["#ffd36a", "#ff6d59", "#f9f0c7", "#e62f3d"],
        birthday: ["#ffd6e4", "#8fe6db", "#ffad72", "#8c78eb", "#fff4be"],
        valentine: ["#ff8cab", "#ffc1cf", "#f15a79", "#ffe9d7", "#ff735f"],
        "mothers-day": ["#ef98b1", "#76bfa9", "#f3c85d", "#ffffff", "#7eb6d8"],
        "fathers-day": ["#f0cb78", "#7fa2c8", "#ffffff", "#78cdb1"],
        graduation: ["#f2c65d", "#ff7e72", "#8ed8c6", "#fff4d5", "#7da5da"],
        thanksgiving: ["#f0a23f", "#d85d3e", "#f6d486", "#78b9a6", "#9d5f34"],
        anniversary: ["#f0d49e", "#ef8fa6", "#65c7a6", "#fff3d8"],
        peace: ["#89d8c8", "#f3a887", "#f1ce72", "#a4c5e6", "#ffffff"],
    };

    const themeSettings = {
        "mid-autumn": { count: 0.000072, kinds: ["firefly", "star", "lantern"] },
        "new-year": { count: 0.00006, kinds: ["ember", "lantern", "star"] },
        birthday: { count: 0.000064, kinds: ["confetti", "bubble", "star"] },
        valentine: { count: 0.000058, kinds: ["heart", "spark", "star"] },
        "mothers-day": { count: 0.000062, kinds: ["petal", "butterfly", "spark"] },
        "fathers-day": { count: 0.000052, kinds: ["star", "comet", "spark"] },
        graduation: { count: 0.000066, kinds: ["confetti", "plane", "star"] },
        thanksgiving: { count: 0.000064, kinds: ["leaf", "spark", "star"] },
        anniversary: { count: 0.000058, kinds: ["rose", "spark", "star"] },
        peace: { count: 0.000058, kinds: ["bubble", "petal", "star"] },
    };

    const palette = palettes[theme] || palettes["mid-autumn"];
    const settings = themeSettings[theme] || themeSettings["mid-autumn"];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let stars = [];
    let elapsed = 0;
    let lastFrame = performance.now();
    let nextBurst = 0;
    let pointer = { x: 0, y: 0, active: false };
    let animationFrame = 0;
    let lastPointerSpark = 0;

    const random = (min, max) => Math.random() * (max - min) + min;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const color = (index = 0) => palette[Math.floor(Math.random() * palette.length + index) % palette.length];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = clamp(window.devicePixelRatio || 1, 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seedScene();
    }

    function seedScene() {
        const target = clamp(Math.round(width * height * settings.count), 42, reduceMotion ? 70 : 180);
        particles = Array.from({ length: target }, (_, index) => makeParticle(settings.kinds[index % settings.kinds.length], true));
        buildStars();
    }

    function buildStars() {
        const target = clamp(Math.round((width * height) / 13500), 45, 160);
        stars = Array.from({ length: target }, () => ({
            x: random(0, width),
            y: random(0, height),
            radius: random(0.35, 1.35),
            alpha: random(0.14, 0.72),
            phase: random(0, Math.PI * 2),
            speed: random(0.0007, 0.0022),
        }));
    }

    function makeParticle(kind, initial = false) {
        const scale = clamp(width / 1200, 0.72, 1.25);
        const particle = {
            kind,
            x: random(0, width),
            y: initial ? random(0, height) : random(-50, height + 50),
            vx: random(-0.18, 0.18) * scale,
            vy: random(0.16, 0.52) * scale,
            size: random(2, 7) * scale,
            length: random(10, 28) * scale,
            rotation: random(0, Math.PI * 2),
            spin: random(-0.018, 0.018),
            alpha: random(0.35, 0.9),
            phase: random(0, Math.PI * 2),
            wave: random(0.005, 0.022) * scale,
            color: color(),
            life: 1,
            decay: random(0.001, 0.004),
        };

        if (["ember", "lantern", "heart", "bubble", "plane"].includes(kind)) {
            particle.y = initial ? random(height * 0.35, height + 50) : height + random(25, 90);
            particle.vy = -random(0.2, 0.72) * scale;
        }

        if (kind === "firefly") {
            particle.vy = random(-0.08, 0.08) * scale;
            particle.vx = random(-0.12, 0.12) * scale;
        }

        if (kind === "comet") {
            particle.x = random(-width * 0.2, width);
            particle.y = random(-80, height * 0.45);
            particle.vx = random(0.7, 1.45) * scale;
            particle.vy = random(0.3, 0.72) * scale;
            particle.length = random(80, 190) * scale;
        }

        if (kind === "star") {
            particle.x = random(0, width);
            particle.y = random(0, height);
            particle.vx = 0;
            particle.vy = 0;
            particle.size = random(0.8, 2.2);
        }

        return particle;
    }

    function resetParticle(particle) {
        const replacement = makeParticle(particle.kind);
        Object.assign(particle, replacement);
    }

    function updateParticle(particle, dt) {
        const frameScale = dt / 16.67;
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;
        particle.rotation += particle.spin * frameScale;
        particle.phase += 0.018 * frameScale;

        if (!["star", "heart"].includes(particle.kind)) {
            particle.x += Math.sin(elapsed * 0.001 + particle.phase) * particle.wave * frameScale;
        }

        if (particle.kind === "spark") {
            particle.vx *= 0.985;
            particle.vy = particle.vy * 0.985 + 0.012 * frameScale;
            particle.life -= particle.decay * frameScale * 4;
            if (particle.life <= 0) {
                particle.dead = true;
            }
        }

        if (particle.kind === "firefly") {
            particle.alpha = 0.3 + (Math.sin(particle.phase * 1.6) + 1) * 0.27;
        }

        if (particle.kind === "heart") {
            particle.alpha = 0.25 + (Math.sin(particle.phase * 2.2) + 1) * 0.26;
        }

        if (particle.kind === "star") {
            particle.alpha = 0.24 + (Math.sin(particle.phase) + 1) * 0.25;
        }

        const margin = 120;
        const movingOut =
            particle.x < -margin ||
            particle.x > width + margin ||
            particle.y < -margin ||
            particle.y > height + margin;

        if (movingOut && particle.kind !== "spark") {
            resetParticle(particle);
        }
    }

    function drawStar(particle) {
        const size = particle.size * (0.8 + Math.sin(particle.phase) * 0.2);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (size > 1.45) {
            ctx.globalAlpha = particle.alpha * 0.5;
            ctx.fillRect(particle.x - size * 3, particle.y - 0.35, size * 6, 0.7);
            ctx.fillRect(particle.x - 0.35, particle.y - size * 3, 0.7, size * 6);
        }
    }

    function drawFirefly(particle) {
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 5.5);
        glow.addColorStop(0, particle.color);
        glow.addColorStop(0.18, particle.color);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 5.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLantern(particle) {
        const w = particle.size * 2.9;
        const h = particle.size * 3.7;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(Math.sin(particle.phase) * 0.06);
        ctx.globalAlpha = particle.alpha;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 22;
        ctx.fillStyle = theme === "new-year" ? "#d73c3c" : "#f0bb55";
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.42);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,230,160,.72)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-w * 0.38, -h / 2);
        ctx.lineTo(-w * 0.38, h / 2);
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(0, h / 2);
        ctx.moveTo(w * 0.38, -h / 2);
        ctx.lineTo(w * 0.38, h / 2);
        ctx.stroke();
        ctx.fillStyle = "#f6cf72";
        ctx.fillRect(-w * 0.45, -h * 0.61, w * 0.9, h * 0.11);
        ctx.fillRect(-w * 0.45, h * 0.5, w * 0.9, h * 0.11);
        ctx.restore();
    }

    function drawEmber(particle) {
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = Math.max(0.8, particle.size * 0.22);
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 10, particle.y - particle.vy * 10);
        ctx.stroke();
        ctx.restore();
    }

    function drawConfetti(particle) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        const w = particle.size * 1.8;
        const h = particle.size * 0.72;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
    }

    function drawHeart(particle) {
        const size = particle.size * 0.92;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(Math.sin(particle.phase) * 0.08);
        ctx.scale(size / 12, size / 12);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.bezierCurveTo(-11, -3, -7, -12, 0, -7);
        ctx.bezierCurveTo(7, -12, 11, -3, 0, 4);
        ctx.fill();
        ctx.restore();
    }

    function drawPetal(particle) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 1.6);
        ctx.bezierCurveTo(
            particle.size * 1.7,
            -particle.size * 0.4,
            particle.size * 1.15,
            particle.size * 1.6,
            0,
            particle.size * 1.65
        );
        ctx.bezierCurveTo(
            -particle.size * 1.15,
            particle.size * 1.6,
            -particle.size * 1.7,
            -particle.size * 0.4,
            0,
            -particle.size * 1.6
        );
        ctx.fill();
        ctx.restore();
    }

    function drawButterfly(particle) {
        const size = particle.size * 1.55;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(Math.sin(particle.phase) * 0.18);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(-size * 0.42, -size * 0.15, size * 0.58, size * 0.82, -0.35, 0, Math.PI * 2);
        ctx.ellipse(size * 0.42, -size * 0.15, size * 0.58, size * 0.82, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawPlane(particle) {
        const size = particle.size * 2;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(-size, -size * 0.5);
        ctx.lineTo(size, 0);
        ctx.lineTo(-size * 0.35, size * 0.58);
        ctx.lineTo(-size * 0.08, size * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawLeaf(particle) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 1.9);
        ctx.bezierCurveTo(
            particle.size * 1.8,
            -particle.size * 0.8,
            particle.size * 1.5,
            particle.size * 1.2,
            0,
            particle.size * 1.9
        );
        ctx.bezierCurveTo(
            -particle.size * 1.5,
            particle.size * 1.2,
            -particle.size * 1.8,
            -particle.size * 0.8,
            0,
            -particle.size * 1.9
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(255,245,210,.5)";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 1.5);
        ctx.lineTo(0, particle.size * 1.5);
        ctx.stroke();
        ctx.restore();
    }

    function drawRose(particle) {
        const size = particle.size * 1.7;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,245,245,.55)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.52, 0, Math.PI * 1.62);
        ctx.stroke();
        ctx.restore();
    }

    function drawBubble(particle) {
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.44)";
        ctx.beginPath();
        ctx.arc(
            particle.x - particle.size * 0.48,
            particle.y - particle.size * 0.55,
            particle.size * 0.22,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    function drawSpark(particle) {
        ctx.save();
        ctx.globalAlpha = clamp(particle.life, 0, 1);
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = Math.max(0.65, particle.size * 0.24);
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
        ctx.restore();
    }

    function drawComet(particle) {
        const tailX = particle.x - particle.vx * particle.length * 0.28;
        const tailY = particle.y - particle.vy * particle.length * 0.28;
        const gradient = ctx.createLinearGradient(tailX, tailY, particle.x, particle.y);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.82, "rgba(143,190,226,.35)");
        gradient.addColorStop(1, particle.color);
        ctx.globalAlpha = particle.alpha;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
    }

    function drawParticle(particle) {
        const painters = {
            star: drawStar,
            firefly: drawFirefly,
            lantern: drawLantern,
            ember: drawEmber,
            confetti: drawConfetti,
            heart: drawHeart,
            petal: drawPetal,
            butterfly: drawButterfly,
            plane: drawPlane,
            leaf: drawLeaf,
            rose: drawRose,
            bubble: drawBubble,
            spark: drawSpark,
            comet: drawComet,
        };
        (painters[particle.kind] || drawStar)(particle);
    }

    function drawBackdrop() {
        if (theme === "valentine") {
            ctx.save();
            ctx.translate(width * 0.5, height * 0.5);
            for (let i = 0; i < 3; i += 1) {
                const radius = 130 + i * 88 + Math.sin(elapsed * 0.0012 + i) * 10;
                ctx.globalAlpha = 0.08 - i * 0.016;
                ctx.strokeStyle = "#ff8eaa";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (theme === "fathers-day") {
            const constellation = stars.slice(0, 7);
            ctx.save();
            ctx.globalAlpha = 0.13;
            ctx.strokeStyle = "#a9c8e4";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            constellation.forEach((star, index) => {
                if (index === 0) {
                    ctx.moveTo(star.x, star.y);
                } else {
                    ctx.lineTo(star.x, star.y);
                }
            });
            ctx.stroke();
            ctx.restore();
        }

        if (theme === "peace") {
            ctx.save();
            for (let line = 0; line < 4; line += 1) {
                ctx.beginPath();
                for (let x = -20; x <= width + 20; x += 14) {
                    const y =
                        height * (0.72 + line * 0.055) +
                        Math.sin(x * 0.007 + elapsed * 0.00065 + line * 1.4) * (15 + line * 4);
                    if (x === -20) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.globalAlpha = 0.055 - line * 0.008;
                ctx.strokeStyle = palette[line % palette.length];
                ctx.lineWidth = 1.4;
                ctx.stroke();
            }
            ctx.restore();
        }

        if (theme === "anniversary") {
            ctx.save();
            ctx.translate(width * 0.5, height * 0.5);
            ctx.rotate(elapsed * 0.00008);
            for (let i = 0; i < 4; i += 1) {
                const radius = 118 + i * 74;
                ctx.globalAlpha = 0.06 - i * 0.009;
                ctx.strokeStyle = i % 2 ? "#65c7a6" : "#f0d49e";
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 14]);
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function update(dt) {
        particles.forEach((particle) => updateParticle(particle, dt));
        particles = particles.filter((particle) => !particle.dead);

        if (!reduceMotion && elapsed > nextBurst) {
            if (theme === "new-year") {
                burst(random(width * 0.15, width * 0.85), random(height * 0.12, height * 0.48), 28, "spark");
                nextBurst = elapsed + random(1500, 2600);
            } else if (theme === "birthday" || theme === "graduation") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.08, height * 0.3), 18, "confetti");
                nextBurst = elapsed + random(2700, 4300);
            } else if (theme === "valentine") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.24, height * 0.76), 10, "heart");
                nextBurst = elapsed + random(1900, 3100);
            } else {
                nextBurst = elapsed + 10000;
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);
        drawBackdrop();
        particles.forEach(drawParticle);
        ctx.globalAlpha = 1;
    }

    function animate(now) {
        const dt = Math.min(34, now - lastFrame);
        lastFrame = now;
        elapsed += dt;
        update(dt);
        render();
        animationFrame = requestAnimationFrame(animate);
    }

    function burst(x, y, amount = 28, kind = "spark") {
        if (reduceMotion) {
            return;
        }

        const additions = Array.from({ length: amount }, () => {
            const angle = random(0, Math.PI * 2);
            const speed = random(1.2, 6.8);
            return {
                kind,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: random(1.5, 4.2),
                length: random(8, 25),
                rotation: random(0, Math.PI * 2),
                spin: random(-0.22, 0.22),
                alpha: random(0.45, 1),
                phase: random(0, Math.PI * 2),
                wave: 0,
                color: color(),
                life: random(0.45, 1),
                decay: random(0.004, 0.012),
            };
        });

        particles.push(...additions.slice(0, Math.max(0, 520 - particles.length)));
    }

    function handlePointer(event) {
        pointer = { x: event.clientX, y: event.clientY, active: true };
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);

        if (!body.classList.contains("opened") || reduceMotion) {
            return;
        }

        const now = performance.now();
        if (now - lastPointerSpark > 70) {
            burst(pointer.x, pointer.y, theme === "peace" ? 4 : 6, theme === "new-year" ? "spark" : theme === "peace" ? "bubble" : "spark");
            lastPointerSpark = now;
        }
    }

    class DreamAudio {
        constructor() {
            this.context = null;
            this.master = null;
            this.timer = 0;
            this.step = 0;
            this.enabled = false;
            this.notesByTheme = {
                "mid-autumn": [261.63, 293.66, 349.23, 392, 523.25, 587.33],
                "new-year": [261.63, 329.63, 392, 523.25, 659.25, 783.99],
                birthday: [261.63, 329.63, 392, 523.25, 659.25, 783.99],
                valentine: [220, 261.63, 329.63, 392, 440, 523.25],
                "mothers-day": [293.66, 349.23, 440, 523.25, 587.33, 698.46],
                "fathers-day": [130.81, 164.81, 196, 261.63, 329.63, 392],
                graduation: [261.63, 293.66, 329.63, 392, 440, 523.25],
                thanksgiving: [196, 246.94, 293.66, 369.99, 440, 493.88],
                anniversary: [174.61, 220, 261.63, 329.63, 349.23, 440],
                peace: [261.63, 329.63, 392, 523.25, 587.33, 783.99],
            };
            this.notes = this.notesByTheme[theme] || this.notesByTheme["mid-autumn"];
        }

        ensureContext() {
            if (this.context) {
                return true;
            }

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                showToast("当前浏览器不支持合成音乐");
                return false;
            }

            this.context = new AudioContext();
            this.master = this.context.createGain();
            this.master.gain.value = 0.0001;
            this.master.connect(this.context.destination);
            return true;
        }

        async start() {
            if (this.enabled || !this.ensureContext()) {
                return;
            }

            await this.context.resume();
            this.enabled = true;
            const now = this.context.currentTime;
            this.master.gain.cancelScheduledValues(now);
            this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
            this.master.gain.exponentialRampToValueAtTime(0.052, now + 1.4);
            this.playStep();
            this.timer = window.setInterval(
                () => this.playStep(),
                theme === "new-year" ? 1280 : theme === "fathers-day" ? 2050 : 1740
            );
        }

        stop() {
            if (!this.enabled || !this.context) {
                return;
            }

            const now = this.context.currentTime;
            this.master.gain.cancelScheduledValues(now);
            this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
            this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
            this.enabled = false;
            window.clearInterval(this.timer);
            this.timer = 0;
        }

        toggle() {
            if (this.enabled) {
                this.stop();
            } else {
                this.start();
            }
            return this.enabled;
        }

        playStep() {
            if (!this.enabled || !this.context || this.context.state !== "running") {
                return;
            }

            const now = this.context.currentTime;
            const offset = this.step % this.notes.length;
            const note = this.notes[offset];
            const companion = this.notes[(offset + 2) % this.notes.length];
            const duration = theme === "new-year" ? 1.15 : 1.9;
            this.playTone(note, now, duration, theme === "new-year" ? 0.026 : 0.022);
            this.playTone(companion, now + 0.18, duration * 0.82, 0.012, "triangle");

            if (offset === 0 || offset === 3) {
                this.playTone(note / 2, now, duration * 1.25, 0.008, "sine");
            }

            this.step += 1;
        }

        playTone(frequency, startTime, duration, level, type = "sine") {
            const oscillator = this.context.createOscillator();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            const panner = typeof this.context.createStereoPanner === "function" ? this.context.createStereoPanner() : null;

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            oscillator.detune.value = random(-4, 4);
            filter.type = "lowpass";
            filter.frequency.value = theme === "fathers-day" ? 900 : 1650;
            filter.Q.value = 0.55;
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(level, startTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            oscillator.connect(filter);
            filter.connect(gain);

            if (panner) {
                panner.pan.value = random(-0.32, 0.32);
                gain.connect(panner);
                panner.connect(this.master);
            } else {
                gain.connect(this.master);
            }

            oscillator.start(startTime);
            oscillator.stop(startTime + duration + 0.08);
        }
    }

    const audio = new DreamAudio();

    function syncSoundControl() {
        const button = document.querySelector('[data-control="sound"]');
        if (!button) {
            return;
        }

        button.setAttribute("aria-pressed", String(audio.enabled));
        button.setAttribute("aria-label", audio.enabled ? "关闭背景音乐" : "打开背景音乐");
    }

    function showToast(message) {
        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
    }

    function textForCopy() {
        const title = document.querySelector(".blessing-title")?.textContent?.trim() || document.title;
        const lines = Array.from(document.querySelectorAll(".message-line"))
            .map((line) => line.textContent.trim())
            .filter(Boolean);
        const signature = document.querySelector(".blessing-signature")?.textContent?.trim();
        return [title, ...lines, signature].filter(Boolean).join("\n");
    }

    async function copyBlessing() {
        const text = textForCopy();
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            const helper = document.createElement("textarea");
            helper.value = text;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            document.body.appendChild(helper);
            helper.select();
            document.execCommand("copy");
            helper.remove();
        }
        showToast("祝福语已复制");
    }

    async function shareBlessing() {
        const text = textForCopy();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    text,
                    url: window.location.href,
                });
                return;
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }
            }
        }
        await copyBlessing();
    }

    async function openBlessing() {
        if (body.classList.contains("opened")) {
            return;
        }

        body.classList.add("opened");
        await audio.start();
        syncSoundControl();
        window.setTimeout(() => {
            const burstKind = ["new-year", "fathers-day"].includes(theme) ? "spark" : theme === "valentine" ? "heart" : "confetti";
            burst(width * 0.5, height * 0.36, 42, burstKind);
            window.setTimeout(() => burst(width * 0.28, height * 0.42, 24, burstKind), 180);
            window.setTimeout(() => burst(width * 0.72, height * 0.3, 24, burstKind), 340);
        }, 180);
    }

    function replay() {
        body.classList.remove("opened");
        audio.stop();
        syncSoundControl();
        window.setTimeout(() => {
            body.classList.add("opened");
            audio.start().then(syncSoundControl);
            burst(width * 0.5, height * 0.34, 34, theme === "new-year" ? "spark" : "confetti");
        }, 760);
    }

    function injectToolbar() {
        const toolbar = document.createElement("header");
        toolbar.className = "topbar";
        toolbar.innerHTML = `
            <a class="topbar-brand" href="index.html" aria-label="返回祝福作品集">
                <span class="brand-seal" aria-hidden="true"></span>
                <span>十封心意</span>
            </a>
            <div class="toolbar" role="toolbar" aria-label="祝福页工具栏">
                <button class="control-button" type="button" data-control="sound" aria-label="打开背景音乐" title="背景音乐" aria-pressed="false">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>
                </button>
                <button class="control-button" type="button" data-control="replay" aria-label="重新播放祝福" title="重新播放">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4"/><path d="M5.4 7A8 8 0 1 1 4 13"/></svg>
                </button>
                <button class="control-button" type="button" data-control="copy" aria-label="复制祝福语" title="复制祝福语">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></svg>
                </button>
                <button class="control-button" type="button" data-control="share" aria-label="分享祝福网页" title="分享">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.7 6.8-4.1M8.6 13.3l6.8 4.1"/></svg>
                </button>
            </div>
        `;
        document.body.prepend(toolbar);

        toolbar.querySelector('[data-control="sound"]').addEventListener("click", (event) => {
            const enabled = audio.toggle();
            event.currentTarget.setAttribute("aria-pressed", String(enabled));
            event.currentTarget.setAttribute("aria-label", enabled ? "关闭背景音乐" : "打开背景音乐");
        });
        toolbar.querySelector('[data-control="replay"]').addEventListener("click", replay);
        toolbar.querySelector('[data-control="copy"]').addEventListener("click", copyBlessing);
        toolbar.querySelector('[data-control="share"]').addEventListener("click", shareBlessing);
    }

    function personalize() {
        const params = new URLSearchParams(window.location.search);
        const recipient = params.get("to");
        const sender = params.get("from");
        const recipientNode = document.querySelector("[data-recipient]");
        const senderNode = document.querySelector("[data-sender]");

        if (recipient && recipientNode) {
            recipientNode.textContent = `致 ${recipient}`;
        }
        if (sender && senderNode) {
            senderNode.textContent = `来自 ${sender}`;
        }
    }

    function bindEvents() {
        document.querySelector(".open-button").addEventListener("click", openBlessing);
        document.querySelectorAll("[data-page-action]").forEach((button) => {
            button.addEventListener("click", () => {
                if (button.dataset.pageAction === "copy") {
                    copyBlessing();
                }
                if (button.dataset.pageAction === "share") {
                    shareBlessing();
                }
            });
        });
        window.addEventListener("resize", resize, { passive: true });
        window.addEventListener("pointermove", handlePointer, { passive: true });
        window.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button, a")) {
                return;
            }
            handlePointer(event);
            if (body.classList.contains("opened")) {
                burst(event.clientX, event.clientY, 12, theme === "peace" ? "bubble" : "spark");
            }
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrame);
                return;
            }
            lastFrame = performance.now();
            animationFrame = requestAnimationFrame(animate);
        });
        window.addEventListener("keydown", (event) => {
            if ((event.key === "Enter" || event.key === " ") && !body.classList.contains("opened")) {
                event.preventDefault();
                openBlessing();
            }
        });
    }

    function init() {
        injectToolbar();
        personalize();
        resize();
        bindEvents();
        nextBurst = elapsed + 900;
        animationFrame = requestAnimationFrame(animate);
    }

    init();
})();
