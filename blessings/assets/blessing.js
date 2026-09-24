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
        "mid-autumn": { count: 0.000078, kinds: ["firefly", "star", "lantern", "spark"] },
        "new-year": { count: 0.000076, kinds: ["ember", "lantern", "star", "spark"] },
        birthday: { count: 0.000082, kinds: ["confetti", "bubble", "star", "spark"] },
        valentine: { count: 0.000076, kinds: ["heart", "spark", "star", "petal"] },
        "mothers-day": { count: 0.000078, kinds: ["petal", "butterfly", "spark", "bubble"] },
        "fathers-day": { count: 0.000072, kinds: ["star", "comet", "spark", "ember"] },
        graduation: { count: 0.000084, kinds: ["confetti", "plane", "star", "spark"] },
        thanksgiving: { count: 0.00008, kinds: ["leaf", "spark", "star", "bubble"] },
        anniversary: { count: 0.000074, kinds: ["rose", "spark", "star", "petal"] },
        peace: { count: 0.000078, kinds: ["bubble", "petal", "star", "spark"] },
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
    let beatPulse = 0;
    let impactPulse = 0;
    let wordField = null;
    let wordNodes = [];
    let shockwaves = [];

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
        const target = clamp(Math.round(width * height * settings.count * 0.24), 26, reduceMotion ? 48 : 96);
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
        const radius = particle.size * 2.6;
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius);
        glow.addColorStop(0, particle.color);
        glow.addColorStop(0.12, particle.color);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = particle.alpha * 0.72;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawLantern(particle) {
        const w = particle.size * 2.25;
        const h = particle.size * 2.95;
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

    function createWordHeart() {
        const commonWords = [
            "平安",
            "喜乐",
            "顺遂",
            "好运",
            "如愿",
            "温暖",
            "常安",
            "欢喜",
            "幸福",
            "闪光",
            "美好",
        ];
        const themeWords = {
            "mid-autumn": ["团圆", "月圆", "清辉", "花好月圆", "中秋快乐"],
            "new-year": ["新岁", "胜意", "启封", "岁岁欢愉", "新年快乐"],
            birthday: ["生日快乐", "发光", "热烈", "自在生长", "岁岁闪耀"],
            valentine: ["心动", "相伴", "喜欢", "久处仍怦然", "一直爱你"],
            "mothers-day": ["妈妈", "温柔", "安康", "笑口常开", "节日快乐"],
            "fathers-day": ["爸爸", "如山", "沉稳", "平安顺遂", "节日快乐"],
            graduation: ["前程似锦", "毕业快乐", "山海", "来日方长", "一路生花"],
            thanksgiving: ["感恩", "相遇", "陪伴", "温暖同行", "谢谢你"],
            anniversary: ["周年快乐", "纪念", "并肩", "岁岁常相见", "一直在一起"],
            peace: ["平安喜乐", "日日有光", "顺意", "无忧", "万事胜意"],
        };
        const sourceWords = [...(themeWords[theme] || []), ...commonWords];
        const count = reduceMotion ? 36 : 100;

        wordField = document.createElement("div");
        wordField.className = "word-field";
        wordField.setAttribute("aria-hidden", "true");

        const stage = document.createElement("div");
        stage.className = "heart-stage";
        const layerCount = reduceMotion ? 1 : width < 720 ? 2 : 3;

        wordNodes = [];
        Array.from({ length: layerCount }, (_, layerIndex) => {
            const layer = document.createElement("div");
            layer.className = "heart-layer";

            Array.from({ length: count }, (_, index) => {
                const orbit = document.createElement("span");
                const vertical = document.createElement("span");
                const node = document.createElement("span");
                const wordIndex = (index + layerIndex * 7) % sourceWords.length;
                const word = sourceWords[wordIndex];
                const delay = `${(index + 1) * -0.3 - layerIndex * 0.18}s`;
                orbit.className = "heart-orbit";
                vertical.className = "heart-vertical";
                node.className = "heart-word";
                node.textContent = word;
                node.style.setProperty("--word-color", palette[(index + layerIndex) % palette.length]);
                node.style.setProperty("--z", `${-170 + ((index * 47) % 340) - layerIndex * 70}px`);
                node.style.setProperty("--pop", `${58 + ((index + layerIndex) % 6) * 20}px`);
                node.style.setProperty("--word-size", `${24 + ((index + layerIndex) % 4) * 2}px`);
                node.style.animationDelay = `${(index % 11) * -0.47 - layerIndex * 0.31}s`;
                orbit.style.animationDelay = delay;
                vertical.style.animationDelay = delay;
                vertical.appendChild(node);
                orbit.appendChild(vertical);
                layer.appendChild(orbit);
            });

            stage.appendChild(layer);
            return layer;
        });

        wordField.appendChild(stage);
        document.querySelector(".blessing").prepend(wordField);
    }

    function splitBlessingTitle() {
        const title = document.querySelector(".blessing-title");
        if (!title || title.dataset.split === "true") {
            return;
        }

        const fragment = document.createDocumentFragment();
        let charIndex = 0;

        Array.from(title.childNodes).forEach((node) => {
            const isAccent = node.nodeType === Node.ELEMENT_NODE && node.classList.contains("accent");
            const characters = Array.from(node.textContent || "");

            characters.forEach((character) => {
                const span = document.createElement("span");
                span.className = isAccent ? "char accent" : "char";
                span.style.setProperty("--char-index", charIndex);
                span.textContent = character;
                fragment.appendChild(span);
                charIndex += 1;
            });
        });

        title.replaceChildren(fragment);
        title.dataset.split = "true";
    }

    function updateWordHeart() {
        if (!wordField) {
            return;
        }

        const baseScale = clamp(Math.min((width - 18) / 620, (height - 18) / 620), 0.54, 1);
        const energy = 1 + beatPulse * 0.035 + impactPulse * 0.06;
        wordField.style.setProperty("--heart-scale", (baseScale * energy).toFixed(3));
    }

    function drawCinematicCore() {
        if (!body.classList.contains("opening") && !body.classList.contains("opened")) {
            return;
        }

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const innovationBoost = body.classList.contains("mode-innovation") ? 1.55 : 1;
        const pulse = 1 + (beatPulse * 0.16 + impactPulse * 0.26) * innovationBoost;
        const baseRadius = Math.min(width, height) * 0.19;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(elapsed * 0.00008);

        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 2.4 * pulse);
        glow.addColorStop(0, `${palette[0]}00`);
        glow.addColorStop(0.32, `${palette[0]}1f`);
        glow.addColorStop(0.62, `${palette[1]}0d`);
        glow.addColorStop(1, `${palette[0]}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 2.4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        const rayCount = body.classList.contains("mode-innovation") ? 34 : 22;
        for (let ray = 0; ray < rayCount; ray += 1) {
            const angle = (ray / rayCount) * Math.PI * 2;
            const inner = baseRadius * (0.48 + Math.sin(elapsed * 0.001 + ray) * 0.04);
            const outer = baseRadius * (1.5 + (ray % 3) * 0.13) * pulse;
            ctx.globalAlpha = 0.024 + (ray % 4) * 0.009;
            ctx.strokeStyle = palette[ray % palette.length];
            ctx.lineWidth = ray % 3 === 0 ? 1.1 : 0.55;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.stroke();
        }

        for (let ring = 0; ring < 3; ring += 1) {
            ctx.globalAlpha = 0.06 - ring * 0.013 + beatPulse * 0.03;
            ctx.strokeStyle = palette[(ring + 1) % palette.length];
            ctx.lineWidth = 1;
            ctx.setLineDash(ring === 1 ? [3, 15] : []);
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius * (1.25 + ring * 0.34) * pulse, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    function spawnShockwave(x, y) {
        shockwaves.push({
            x,
            y,
            radius: 12,
            alpha: 0.9,
            speed: 7.5,
            color: palette[0],
        });
    }

    function updateShockwaves(dt) {
        const frameScale = dt / 16.67;
        shockwaves.forEach((wave) => {
            wave.radius += wave.speed * frameScale;
            wave.speed *= 0.975;
            wave.alpha *= 0.965;
        });
        shockwaves = shockwaves.filter((wave) => wave.alpha > 0.025);
    }

    function drawShockwaves() {
        shockwaves.forEach((wave) => {
            ctx.save();
            ctx.globalAlpha = wave.alpha;
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = wave.color;
            ctx.shadowBlur = 24;
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
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
        const frameScale = dt / 16.67;
        particles.forEach((particle) => updateParticle(particle, dt));
        particles = particles.filter((particle) => !particle.dead);
        beatPulse *= Math.pow(0.91, frameScale);
        impactPulse *= Math.pow(0.9, frameScale);
        audio.updateVisualizer();
        updateWordHeart(elapsed);
        updateShockwaves(dt);

        if (!reduceMotion && elapsed > nextBurst) {
            if (theme === "new-year") {
                burst(random(width * 0.15, width * 0.85), random(height * 0.12, height * 0.48), 26, "spark");
                nextBurst = elapsed + random(2200, 3300);
            } else if (theme === "birthday" || theme === "graduation") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.08, height * 0.3), 18, "confetti");
                nextBurst = elapsed + random(3000, 4600);
            } else if (theme === "valentine") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.24, height * 0.76), 10, "heart");
                nextBurst = elapsed + random(2600, 4100);
            } else if (theme === "mid-autumn") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.18, height * 0.65), 8, "firefly");
                nextBurst = elapsed + random(4300, 6200);
            } else if (theme === "mothers-day" || theme === "thanksgiving") {
                burst(random(width * 0.08, width * 0.92), random(height * 0.08, height * 0.4), 12, theme === "mothers-day" ? "petal" : "leaf");
                nextBurst = elapsed + random(3200, 4800);
            } else if (theme === "anniversary" || theme === "peace") {
                burst(random(width * 0.12, width * 0.88), random(height * 0.18, height * 0.72), 10, theme === "anniversary" ? "rose" : "bubble");
                nextBurst = elapsed + random(3300, 5000);
            } else {
                burst(random(width * 0.1, width * 0.9), random(height * 0.12, height * 0.7), 10, "spark");
                nextBurst = elapsed + random(3400, 5000);
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, width, height);
        drawBackdrop();
        drawCinematicCore();
        particles.forEach(drawParticle);
        drawShockwaves();
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
            const speed = random(1.7, 8.1);
            return {
                kind,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: random(1.5, 4.1),
                length: random(10, 32),
                rotation: random(0, Math.PI * 2),
                spin: random(-0.3, 0.3),
                alpha: random(0.45, 1),
                phase: random(0, Math.PI * 2),
                wave: 0,
                color: color(),
                life: random(0.45, 1),
                decay: random(0.004, 0.012),
            };
        });

        particles.push(...additions.slice(0, Math.max(0, 920 - particles.length)));
    }

    function spiralBurst(x, y, amount = 150, kind = "spark") {
        if (reduceMotion) {
            return;
        }

        const additions = Array.from({ length: amount }, (_, index) => {
            const angle = (index / amount) * Math.PI * 6 + random(-0.18, 0.18);
            const speed = random(1.4, 7.8);
            return {
                kind: index % 7 === 0 ? "star" : kind,
                x,
                y,
                vx: Math.cos(angle) * speed + random(-0.8, 0.8),
                vy: Math.sin(angle) * speed + random(-0.8, 0.8),
                size: random(1.3, 3.9),
                length: random(12, 38),
                rotation: angle,
                spin: random(-0.34, 0.34),
                alpha: random(0.55, 1),
                phase: random(0, Math.PI * 2),
                wave: 0,
                color: color(),
                life: random(0.6, 1),
                decay: random(0.0035, 0.009),
            };
        });

        particles.push(...additions.slice(0, Math.max(0, 980 - particles.length)));
    }

    function handlePointer(event) {
        pointer = { x: event.clientX, y: event.clientY, active: true };
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);

        if (!body.classList.contains("opened") || reduceMotion) {
            return;
        }

        const now = performance.now();
        if (now - lastPointerSpark > 55) {
            burst(pointer.x, pointer.y, theme === "peace" ? 8 : 11, theme === "peace" ? "bubble" : "spark");
            lastPointerSpark = now;
        }
    }

    class DreamAudio {
        constructor() {
            this.context = null;
            this.master = null;
            this.compressor = null;
            this.reverb = null;
            this.reverbGain = null;
            this.noiseBuffer = null;
            this.timer = 0;
            this.step = 0;
            this.nextStepTime = 0;
            this.enabled = false;
            this.bgm = null;
            this.bgmSource = null;
            this.analyser = null;
            this.analyserData = null;
            this.bgmFadeTimer = 0;
            this.hasStarted = false;
            this.pendingPlay = false;
            this.offsets = {
                "mid-autumn": 0,
                "new-year": 24,
                birthday: 52,
                valentine: 78,
                "mothers-day": 104,
                "fathers-day": 132,
                graduation: 158,
                thanksgiving: 184,
                anniversary: 212,
                peace: 238,
            };
            this.configs = {
                "mid-autumn": {
                    tempo: 126,
                    root: 62,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 5, 3, 4],
                    melody: [0, 4, 7, 4, 5, 4, 2, 0, 7, 9, 7, 5, 4, 2, 1, 0],
                    pad: ["sine", "triangle"],
                },
                "new-year": {
                    tempo: 136,
                    root: 60,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 4, 5, 3],
                    melody: [0, 4, 7, 9, 7, 4, 2, 4, 0, 7, 9, 12, 9, 7, 4, 2],
                    pad: ["triangle", "sine"],
                },
                birthday: {
                    tempo: 132,
                    root: 64,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 5, 3, 4],
                    melody: [0, 2, 4, 7, 9, 7, 4, 2, 4, 7, 9, 12, 9, 7, 5, 4],
                    pad: ["triangle", "sine"],
                },
                valentine: {
                    tempo: 118,
                    root: 57,
                    scale: [0, 2, 3, 7, 9, 12, 14, 15],
                    progression: [0, 5, 3, 4],
                    melody: [0, 3, 7, 9, 7, 3, 2, 0, 4, 7, 9, 12, 9, 7, 3, 2],
                    pad: ["sine", "triangle"],
                },
                "mothers-day": {
                    tempo: 120,
                    root: 60,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 3, 5, 4],
                    melody: [0, 4, 5, 7, 9, 7, 5, 4, 2, 4, 7, 9, 7, 5, 4, 2],
                    pad: ["sine", "sine"],
                },
                "fathers-day": {
                    tempo: 108,
                    root: 45,
                    scale: [0, 3, 5, 7, 10, 12, 15, 17],
                    progression: [0, 5, 3, 4],
                    melody: [0, 3, 5, 7, 5, 3, 2, 0, 7, 10, 7, 5, 3, 2, 0, -2],
                    pad: ["sine", "triangle"],
                },
                graduation: {
                    tempo: 128,
                    root: 62,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 4, 5, 3],
                    melody: [0, 4, 7, 9, 12, 9, 7, 4, 2, 4, 7, 9, 7, 5, 4, 2],
                    pad: ["triangle", "sine"],
                },
                thanksgiving: {
                    tempo: 116,
                    root: 55,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 3, 5, 4],
                    melody: [0, 4, 7, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4],
                    pad: ["sine", "triangle"],
                },
                anniversary: {
                    tempo: 122,
                    root: 57,
                    scale: [0, 2, 3, 7, 9, 12, 14, 15],
                    progression: [0, 5, 3, 4],
                    melody: [0, 3, 7, 9, 12, 9, 7, 3, 2, 3, 7, 9, 7, 5, 3, 2],
                    pad: ["sine", "triangle"],
                },
                peace: {
                    tempo: 112,
                    root: 65,
                    scale: [0, 2, 4, 7, 9, 12, 14, 16],
                    progression: [0, 3, 5, 4],
                    melody: [0, 4, 7, 9, 7, 4, 2, 0, 4, 5, 7, 9, 7, 5, 4, 2],
                    pad: ["sine", "sine"],
                },
            };
            this.config = this.configs[theme] || this.configs["mid-autumn"];
        }

        ensureContext() {
            if (this.context) {
                return true;
            }

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                showToast("当前浏览器不支持动态音乐");
                return false;
            }

            this.context = new AudioContext({ latencyHint: "interactive" });
            this.master = this.context.createGain();
            this.master.gain.value = 0.0001;
            this.compressor = this.context.createDynamicsCompressor();
            this.compressor.threshold.value = -18;
            this.compressor.knee.value = 16;
            this.compressor.ratio.value = 5;
            this.compressor.attack.value = 0.005;
            this.compressor.release.value = 0.22;
            this.compressor.connect(this.master);
            this.master.connect(this.context.destination);

            const impulseLength = Math.floor(this.context.sampleRate * 1.65);
            const impulse = this.context.createBuffer(2, impulseLength, this.context.sampleRate);
            for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
                const samples = impulse.getChannelData(channel);
                for (let index = 0; index < impulseLength; index += 1) {
                    samples[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / impulseLength, 2.8);
                }
            }
            this.reverb = this.context.createConvolver();
            this.reverb.buffer = impulse;
            this.reverbGain = this.context.createGain();
            this.reverbGain.gain.value = 0.2;
            this.reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.master);

            const noiseLength = Math.floor(this.context.sampleRate * 2);
            this.noiseBuffer = this.context.createBuffer(1, noiseLength, this.context.sampleRate);
            const noise = this.noiseBuffer.getChannelData(0);
            for (let index = 0; index < noiseLength; index += 1) {
                noise[index] = Math.random() * 2 - 1;
            }
            return true;
        }

        ensureBackgroundTrack() {
            if (this.bgm) {
                return true;
            }

            const element = document.createElement("audio");
            element.id = "bgm";
            element.className = "background-track";
            element.src = "assets/audio/piano-bgm.mp3";
            element.loop = true;
            element.preload = "auto";
            element.playsInline = true;
            element.setAttribute("aria-hidden", "true");
            document.body.appendChild(element);
            this.bgm = element;
            this.connectBackgroundTrack();
            return true;
        }

        connectBackgroundTrack() {
            if (!this.context || !this.bgm || this.bgmSource) {
                return;
            }

            try {
                this.bgmSource = this.context.createMediaElementSource(this.bgm);
                this.analyser = this.context.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.82;
                this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
                this.bgmSource.connect(this.analyser);
                this.analyser.connect(this.compressor);
            } catch (error) {
                this.bgmSource = null;
                this.analyser = null;
                this.analyserData = null;
                this.bgm.volume = 0.86;
            }
        }

        prepare() {
            this.ensureBackgroundTrack();
            this.bgm.load();
        }

        fadeBackgroundTrack(target, duration = 700) {
            if (!this.bgm) {
                return;
            }

            window.clearInterval(this.bgmFadeTimer);
            const startVolume = this.bgm.volume;
            const startedAt = performance.now();
            this.bgmFadeTimer = window.setInterval(() => {
                const progress = clamp((performance.now() - startedAt) / duration, 0, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                this.bgm.volume = startVolume + (target - startVolume) * eased;
                if (progress >= 1) {
                    window.clearInterval(this.bgmFadeTimer);
                    this.bgmFadeTimer = 0;
                }
            }, 25);
        }

        playBackgroundTrack(restart = false) {
            if (!this.ensureBackgroundTrack()) {
                return false;
            }

            if (restart || !this.hasStarted) {
                const offset = this.offsets[theme] || 0;
                if (Number.isFinite(this.bgm.duration) && this.bgm.duration > offset + 1) {
                    this.bgm.currentTime = offset;
                } else {
                    this.bgm.addEventListener(
                        "loadedmetadata",
                        () => {
                            if (this.bgm.duration > offset + 1) {
                                this.bgm.currentTime = offset;
                            }
                        },
                        { once: true }
                    );
                }
                this.hasStarted = true;
            }

            this.bgm.volume = restart ? 0.0001 : Math.max(0.15, this.bgm.volume);
            const playPromise = this.bgm.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise
                    .then(() => {
                        this.pendingPlay = false;
                this.fadeBackgroundTrack(0.94, restart ? 1350 : 650);
                    })
                    .catch(() => {
                        this.pendingPlay = true;
                        showToast("再次轻触页面即可继续播放音乐");
                    });
            }
            return true;
        }

        start(options = {}) {
            const restart = Boolean(options.restart);
            if (this.enabled && !restart) {
                return true;
            }

            this.ensureContext();
            this.ensureBackgroundTrack();
            this.connectBackgroundTrack();
            this.enabled = true;
            if (this.context) {
                const now = this.context.currentTime + 0.018;
                this.context.resume().catch(() => {});
                this.master.gain.cancelScheduledValues(now);
                this.master.gain.setValueAtTime(0.0001, now);
                this.master.gain.exponentialRampToValueAtTime(0.72, now + 0.08);
            }
            this.playBackgroundTrack(restart);
            return true;
        }

        stop() {
            this.enabled = false;
            window.clearInterval(this.timer);
            this.timer = 0;
            if (this.bgm) {
                this.fadeBackgroundTrack(0.0001, 340);
                window.setTimeout(() => {
                    if (!this.enabled && this.bgm) {
                        this.bgm.pause();
                    }
                }, 360);
            }
            if (this.context) {
                const now = this.context.currentTime;
                this.master.gain.cancelScheduledValues(now);
                this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), now);
                this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
            }
        }

        toggle() {
            if (this.enabled) {
                this.stop();
            } else {
                this.start();
            }
            return this.enabled;
        }

        updateVisualizer() {
            if (!this.enabled || !this.analyser || !this.analyserData) {
                return;
            }

            this.analyser.getByteFrequencyData(this.analyserData);
            let bass = 0;
            let total = 0;
            for (let index = 0; index < this.analyserData.length; index += 1) {
                total += this.analyserData[index];
                if (index < 12) {
                    bass += this.analyserData[index];
                }
            }
            const bassLevel = bass / (12 * 255);
            const overall = total / (this.analyserData.length * 255);
            if (bassLevel > 0.34) {
                beatPulse = Math.max(beatPulse, (bassLevel - 0.28) * 1.8);
            }
            document.documentElement.style.setProperty("--music-level", overall.toFixed(3));
        }

        scheduler() {
            if (!this.enabled || !this.context || this.context.state === "closed") {
                return;
            }

            const lookAhead = 0.12;
            const stepDuration = 60 / this.config.tempo / 2;
            while (this.nextStepTime < this.context.currentTime + lookAhead) {
                this.scheduleStep(this.step, this.nextStepTime);
                this.step += 1;
                this.nextStepTime += stepDuration;
            }
        }

        scheduleStep(step, time) {
            const localStep = step % 16;
            const bar = Math.floor(step / 16) % this.config.progression.length;
            const chord = this.config.progression[bar];
            const melodyDegree = this.config.melody[localStep] + chord;

            if (localStep % 2 === 0) {
                this.playPluck(this.degreeToFrequency(melodyDegree, 1), time, localStep % 4 === 0 ? 0.105 : 0.075);
            }

            if (localStep === 2 || localStep === 10) {
                this.playChime(this.degreeToFrequency(melodyDegree + 5, 1), time + 0.03, 0.09);
            }

            if (localStep === 0 || localStep === 8) {
                [0, 2, 4].forEach((offset, index) => {
                    this.playPad(this.degreeToFrequency(chord + offset, 0), time + index * 0.028, 2.25, 0.032);
                });
            }

            if (localStep % 4 === 0) {
                this.playBass(this.degreeToFrequency(chord - 12, 0), time, 0.42);
            }

            if (localStep === 0 || localStep === 4 || localStep === 8 || localStep === 12) {
                this.playKick(time);
                beatPulse = 1;
            }

            if (localStep === 4 || localStep === 12) {
                this.playClap(time + 0.012);
            }

            if (localStep % 2 === 1) {
                this.playHat(time, localStep % 4 === 3 ? 0.037 : 0.022);
            }
        }

        degreeToFrequency(degree, octave = 0) {
            const scale = this.config.scale;
            const length = scale.length;
            const normalized = ((degree % length) + length) % length;
            const octaveOffset = Math.floor(degree / length) * 12;
            const midi = this.config.root + scale[normalized] + octaveOffset + octave * 12;
            return 440 * Math.pow(2, (midi - 69) / 12);
        }

        connectVoice(node, reverbAmount = 0.2) {
            const panner = typeof this.context.createStereoPanner === "function"
                ? this.context.createStereoPanner()
                : null;
            if (panner) {
                panner.pan.value = random(-0.38, 0.38);
                node.connect(panner);
                panner.connect(this.compressor);
                if (this.reverb && reverbAmount > 0) {
                    const send = this.context.createGain();
                    send.gain.value = reverbAmount;
                    panner.connect(send);
                    send.connect(this.reverb);
                }
                return;
            }
            node.connect(this.compressor);
            if (this.reverb && reverbAmount > 0) {
                const send = this.context.createGain();
                send.gain.value = reverbAmount;
                node.connect(send);
                send.connect(this.reverb);
            }
        }

        playPluck(frequency, startTime, level) {
            const oscillator = this.context.createOscillator();
            const harmonic = this.context.createOscillator();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            oscillator.type = "triangle";
            harmonic.type = "sine";
            oscillator.frequency.value = frequency;
            harmonic.frequency.value = frequency * 2.01;
            harmonic.detune.value = random(-8, 8);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(3600, startTime);
            filter.frequency.exponentialRampToValueAtTime(880, startTime + 0.72);
            filter.Q.value = 0.75;
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(level, startTime + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.78);
            oscillator.connect(filter);
            harmonic.connect(filter);
            filter.connect(gain);
            this.connectVoice(gain, 0.25);
            oscillator.start(startTime);
            harmonic.start(startTime);
            oscillator.stop(startTime + 0.82);
            harmonic.stop(startTime + 0.82);
        }

        playPad(frequency, startTime, duration, level) {
            [0, 1].forEach((index) => {
                const oscillator = this.context.createOscillator();
                const filter = this.context.createBiquadFilter();
                const gain = this.context.createGain();
                oscillator.type = this.config.pad[index];
                oscillator.frequency.value = frequency * (index === 1 ? 1.006 : 1);
                oscillator.detune.value = index === 1 ? 7 : -5;
                filter.type = "lowpass";
                filter.frequency.value = 1350;
                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.exponentialRampToValueAtTime(level, startTime + 0.38);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
                oscillator.connect(filter);
                filter.connect(gain);
                this.connectVoice(gain, 0.5);
                oscillator.start(startTime);
                oscillator.stop(startTime + duration + 0.08);
            });
        }

        playBass(frequency, startTime, duration) {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency * 1.035, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(frequency, startTime + 0.22);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.17, startTime + 0.025);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            oscillator.connect(gain);
            this.connectVoice(gain, 0.08);
            oscillator.start(startTime);
            oscillator.stop(startTime + duration + 0.06);
        }

        playChime(frequency, startTime, level = 0.12) {
            [1, 2.01].forEach((ratio, index) => {
                const oscillator = this.context.createOscillator();
                const gain = this.context.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = frequency * ratio;
                gain.gain.setValueAtTime(0.0001, startTime);
                gain.gain.exponentialRampToValueAtTime(level / (index + 1), startTime + 0.012);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.25 - index * 0.32);
                oscillator.connect(gain);
                this.connectVoice(gain, 0.42);
                oscillator.start(startTime);
                oscillator.stop(startTime + 1.3);
            });
        }

        playKick(startTime) {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(128, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(43, startTime + 0.16);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.34, startTime + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);
            oscillator.connect(gain);
            this.connectVoice(gain, 0.08);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        }

        playClap(startTime) {
            const source = this.context.createBufferSource();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            source.buffer = this.noiseBuffer;
            filter.type = "bandpass";
            filter.frequency.value = 1550;
            filter.Q.value = 0.8;
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);
            source.connect(filter);
            filter.connect(gain);
            this.connectVoice(gain, 0.22);
            source.start(startTime);
            source.stop(startTime + 0.18);
        }

        playHat(startTime, level) {
            const source = this.context.createBufferSource();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            source.buffer = this.noiseBuffer;
            filter.type = "highpass";
            filter.frequency.value = 5200;
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(level, startTime + 0.003);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.055);
            source.connect(filter);
            filter.connect(gain);
            this.connectVoice(gain, 0.12);
            source.start(startTime);
            source.stop(startTime + 0.07);
        }

        playWhoosh(startTime) {
            const source = this.context.createBufferSource();
            const filter = this.context.createBiquadFilter();
            const gain = this.context.createGain();
            source.buffer = this.noiseBuffer;
            source.loop = true;
            filter.type = "bandpass";
            filter.Q.value = 1.4;
            filter.frequency.setValueAtTime(170, startTime);
            filter.frequency.exponentialRampToValueAtTime(2450, startTime + 0.34);
            filter.frequency.exponentialRampToValueAtTime(260, startTime + 0.92);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.21, startTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.96);
            source.connect(filter);
            filter.connect(gain);
            this.connectVoice(gain, 0.28);
            source.start(startTime);
            source.stop(startTime + 1);
        }

        playImpact(startTime) {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(118, startTime);
            oscillator.frequency.exponentialRampToValueAtTime(38, startTime + 0.42);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.42, startTime + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.58);
            oscillator.connect(gain);
            this.connectVoice(gain, 0.14);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.62);
            impactPulse = 1;
        }

        effect(type = "tap") {
            beatPulse = Math.max(beatPulse, type === "tap" ? 0.36 : 0.52);
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

    function setMode(mode) {
        const innovation = mode === "innovation";
        body.classList.toggle("mode-clone", !innovation);
        body.classList.toggle("mode-innovation", innovation);
        document.querySelectorAll(".mode-option").forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
        });

        if (innovation && body.classList.contains("opened") && !reduceMotion) {
            const kind = ["new-year", "fathers-day"].includes(theme)
                ? "spark"
                : theme === "valentine"
                    ? "heart"
                    : theme === "peace"
                        ? "bubble"
                        : "confetti";
            beatPulse = 1;
            impactPulse = 1;
            spiralBurst(width * 0.5, height * 0.48, 180, kind);
            spawnShockwave(width * 0.5, height * 0.48);
            window.setTimeout(() => spiralBurst(width * 0.5, height * 0.48, 120, kind), 260);
        }
    }

    function injectModeSwitch() {
        const modeSwitch = document.createElement("div");
        modeSwitch.className = "mode-switch";
        modeSwitch.setAttribute("role", "group");
        modeSwitch.setAttribute("aria-label", "动画模式");
        modeSwitch.innerHTML = `
            <button class="mode-option" type="button" data-mode="clone" aria-pressed="true">复刻</button>
            <button class="mode-option" type="button" data-mode="innovation" aria-pressed="false">创新</button>
        `;
        document.body.appendChild(modeSwitch);
        modeSwitch.querySelectorAll(".mode-option").forEach((button) => {
            button.addEventListener("click", () => setMode(button.dataset.mode));
        });
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

    function openBlessing() {
        if (body.classList.contains("opened")) {
            return;
        }

        body.classList.add("opening");
        audio.start();
        syncSoundControl();
        const burstKind = ["new-year", "fathers-day"].includes(theme)
            ? "spark"
            : theme === "valentine"
                ? "heart"
                : theme === "peace"
                    ? "bubble"
                    : "confetti";
        spiralBurst(width * 0.5, height * 0.46, 118, burstKind);
        spawnShockwave(width * 0.5, height * 0.46);
        window.setTimeout(() => {
            body.classList.add("opened");
        }, 45);
        window.setTimeout(() => {
            burst(width * 0.5, height * 0.36, 52, burstKind);
            window.setTimeout(() => burst(width * 0.24, height * 0.42, 32, burstKind), 170);
            window.setTimeout(() => burst(width * 0.76, height * 0.3, 32, burstKind), 330);
            window.setTimeout(() => spawnShockwave(width * 0.5, height * 0.4), 120);
        }, 170);
        window.setTimeout(() => body.classList.remove("opening"), 1450);
    }

    function replay() {
        body.classList.remove("opened");
        body.classList.add("opening");
        audio.stop();
        syncSoundControl();
        window.setTimeout(() => {
            body.classList.add("opened");
            audio.start({ restart: true });
            syncSoundControl();
            spiralBurst(width * 0.5, height * 0.42, 108, theme === "new-year" ? "spark" : "confetti");
            spawnShockwave(width * 0.5, height * 0.42);
            window.setTimeout(() => body.classList.remove("opening"), 1300);
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
                if (audio.pendingPlay) {
                    audio.playBackgroundTrack(false);
                }
                audio.effect("tap");
                burst(event.clientX, event.clientY, 20, theme === "peace" ? "bubble" : "spark");
                spawnShockwave(event.clientX, event.clientY);
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
        setMode("clone");
        injectToolbar();
        injectModeSwitch();
        personalize();
        audio.prepare();
        resize();
        splitBlessingTitle();
        createWordHeart();
        bindEvents();
        nextBurst = elapsed + 900;
        animationFrame = requestAnimationFrame(animate);
    }

    init();
})();
