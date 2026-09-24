(() => {
    "use strict";

    const canvas = document.querySelector("#atmosphere");
    const context = canvas.getContext("2d");
    const cards = Array.from(document.querySelectorAll(".wish-card"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let pointer = { x: 0, y: 0, active: false };
    let elapsed = 0;
    let previousTime = performance.now();
    let animationFrame = 0;

    const random = (min, max) => Math.random() * (max - min) + min;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = clamp(window.devicePixelRatio || 1, 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = Array.from({ length: clamp(Math.round((width * height) / 18000), 45, 110) }, () => ({
            x: random(0, width),
            y: random(0, height),
            radius: random(0.45, 1.45),
            alpha: random(0.18, 0.72),
            phase: random(0, Math.PI * 2),
            speed: random(0.0006, 0.0018),
            vx: random(-0.035, 0.035),
            vy: random(-0.025, 0.025),
        }));
    }

    function draw(dt) {
        context.clearRect(0, 0, width, height);
        context.save();

        stars.forEach((star) => {
            star.x += star.vx * (dt / 16.67);
            star.y += star.vy * (dt / 16.67);
            if (star.x < -10) star.x = width + 10;
            if (star.x > width + 10) star.x = -10;
            if (star.y < -10) star.y = height + 10;
            if (star.y > height + 10) star.y = -10;
            star.phase += star.speed * dt;
        });

        context.lineWidth = 0.55;
        for (let index = 0; index < stars.length; index += 1) {
            const first = stars[index];
            for (let nextIndex = index + 1; nextIndex < stars.length; nextIndex += 1) {
                const second = stars[nextIndex];
                const distance = Math.hypot(first.x - second.x, first.y - second.y);
                if (distance < 125) {
                    const pointerDistance = pointer.active
                        ? Math.hypot((first.x + second.x) / 2 - pointer.x, (first.y + second.y) / 2 - pointer.y)
                        : 1000;
                    if (!pointer.active || pointerDistance < 340) {
                        context.globalAlpha = (1 - distance / 125) * (pointer.active ? 0.12 : 0.035);
                        context.strokeStyle = "#9bc9c4";
                        context.beginPath();
                        context.moveTo(first.x, first.y);
                        context.lineTo(second.x, second.y);
                        context.stroke();
                    }
                }
            }
        }

        stars.forEach((star) => {
            const alpha = star.alpha * (0.66 + Math.sin(star.phase) * 0.34);
            context.globalAlpha = alpha;
            context.fillStyle = star.radius > 1.15 ? "#efc76d" : "#e8f4ef";
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
        });

        context.restore();
    }

    function animate(time) {
        const dt = Math.min(34, time - previousTime);
        previousTime = time;
        elapsed += dt;
        draw(dt);
        animationFrame = requestAnimationFrame(animate);
    }

    function revealCards() {
        if (!("IntersectionObserver" in window) || reduceMotion) {
            cards.forEach((card) => card.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14, rootMargin: "0px 0px -40px" }
        );

        cards.forEach((card, index) => {
            card.style.transitionDelay = `${(index % 2) * 70}ms`;
            observer.observe(card);
        });
    }

    function bindPointer() {
        window.addEventListener("pointermove", (event) => {
            pointer = { x: event.clientX, y: event.clientY, active: true };
        }, { passive: true });
        window.addEventListener("pointerleave", () => {
            pointer.active = false;
        });

        cards.forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const bounds = card.getBoundingClientRect();
                const x = ((event.clientX - bounds.left) / bounds.width) * 100;
                const y = ((event.clientY - bounds.top) / bounds.height) * 100;
                card.style.setProperty("--mx", `${x}%`);
                card.style.setProperty("--my", `${y}%`);
            }, { passive: true });
        });
    }

    function init() {
        resize();
        revealCards();
        bindPointer();
        window.addEventListener("resize", resize, { passive: true });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrame);
            } else {
                previousTime = performance.now();
                animationFrame = requestAnimationFrame(animate);
            }
        });
        animationFrame = requestAnimationFrame(animate);
    }

    init();
})();
