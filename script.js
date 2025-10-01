// Galaxy starfield + scroll reveal
(function () {
    // Create a canvas starfield behind content
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let stars = [];
    let w, h, dpr;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function resize() {
        dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        w = canvas.width = Math.floor(window.innerWidth * dpr);
        h = canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        initStars();
    }

    function initStars() {
        const count = Math.floor((w * h) / (12000 * dpr)); // density-based
        stars = new Array(count).fill(0).map(() => ({
            x: rand(0, w),
            y: rand(0, h),
            z: rand(0.2, 1.2), // parallax factor
            r: rand(0.6, 1.8) * dpr,
            hue: rand(180, 330)
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const s of stars) {
            const twinkle = 0.7 + Math.sin((Date.now() / 700 + s.x) * 0.002) * 0.3;
            ctx.beginPath();
            ctx.fillStyle = `hsla(${s.hue}, 90%, ${70 * twinkle}%, ${0.9 * twinkle})`;
            ctx.arc(s.x, s.y, s.r * twinkle, 0, Math.PI * 2);
            ctx.fill();
            // slow drift
            s.y -= 0.05 * s.z;
            if (s.y < -2) s.y = h + 2;
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();

    // Scroll reveal for project boxes
    const toReveal = Array.from(document.querySelectorAll('.project-box, .Hero h1, .Hero p, .Button'));
    toReveal.forEach(el => el.setAttribute('data-reveal', ''));

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    toReveal.forEach(el => io.observe(el));

    // Subtle tilt on hover for project cards
    const cards = document.querySelectorAll('.project-box');
    cards.forEach(card => {
        let raf = 0;
        function onMove(e) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                card.style.transform = `translateY(-4px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
            });
        }
        function onLeave() {
            card.style.transform = '';
        }
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
    });
})();
