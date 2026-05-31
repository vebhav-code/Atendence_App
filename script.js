/* =============================================
   SAKSHAM ID – script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------
       1. SCROLL REVEAL – Step Cards
    ----------------------------------------------- */
    const stepCards = document.querySelectorAll('.step-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = parseInt(card.dataset.delay || 0);
                setTimeout(() => card.classList.add('visible'), delay);
                revealObserver.unobserve(card);
            }
        });
    }, { threshold: 0.15 });
    stepCards.forEach(card => revealObserver.observe(card));


    /* -----------------------------------------------
       2. STATIC DEMO STEP CYCLE (left-side demo panel)
    ----------------------------------------------- */
    const demoStepsPanel = document.querySelectorAll('.demo-step');
    const startDemoBtn = document.getElementById('startDemoBtn');
    let panelStep = 1;
    let panelTimer = null;
    let panelRunning = false;

    function activatePanelStep(n) {
        demoStepsPanel.forEach(s => s.classList.remove('active'));
        const t = document.querySelector(`.demo-step[data-step="${n}"]`);
        if (t) t.classList.add('active');
    }
    function runPanelDemo() {
        panelRunning = true;
        startDemoBtn.innerHTML = '<i class="fas fa-stop-circle"></i> Stop Demo';
        panelStep = 1; activatePanelStep(1);
        panelTimer = setInterval(() => {
            panelStep++;
            if (panelStep > demoStepsPanel.length) { stopPanelDemo(); return; }
            activatePanelStep(panelStep);
        }, 1800);
    }
    function stopPanelDemo() {
        clearInterval(panelTimer);
        panelRunning = false;
        startDemoBtn.innerHTML = '<i class="fas fa-play-circle"></i> Start Interactive Demo';
        activatePanelStep(1);
    }
    if (startDemoBtn) {
        startDemoBtn.addEventListener('click', () => {
            if (panelRunning) stopPanelDemo(); else runPanelDemo();
        });
    }
    demoStepsPanel.forEach(step => {
        step.addEventListener('click', () => {
            stopPanelDemo();
            activatePanelStep(parseInt(step.dataset.step));
        });
    });


    /* -----------------------------------------------
       3. NAVBAR shadow on scroll
    ----------------------------------------------- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 20
            ? '0 2px 16px rgba(0,0,0,0.09)'
            : '0 1px 8px rgba(0,0,0,0.04)';
    });


    /* -----------------------------------------------
       4. HERO buttons
    ----------------------------------------------- */
    const heroVerifyBtn = document.getElementById('heroVerifyBtn');
    const heroLearnBtn = document.getElementById('heroLearnBtn');

    if (heroVerifyBtn) heroVerifyBtn.addEventListener('click', openPhoneDemo);
    if (heroLearnBtn) {
        heroLearnBtn.addEventListener('click', () => {
            document.querySelector('.how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }


    /* -----------------------------------------------
       5. OFFLINE badge opacity
    ----------------------------------------------- */
    function updateOfflineStatus() {
        document.querySelectorAll('.offline-badge,.offline-pill').forEach(b => {
            b.style.opacity = navigator.onLine ? '0.7' : '1';
        });
    }
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    updateOfflineStatus();


    /* -----------------------------------------------
       6. SECURITY CARD tilt
    ----------------------------------------------- */
    document.querySelectorAll('.dark-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
            const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
            card.style.transition = 'transform 0.08s linear';
            card.style.transform = `perspective(500px) rotateX(${dy * -8}deg) rotateY(${dx * 8}deg) scale(1.04)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s ease';
            card.style.transform = '';
        });
    });


    /* -----------------------------------------------
       7. STEP CARD ripple
    ----------------------------------------------- */
    if (!document.querySelector('#rippleStyle')) {
        const s = document.createElement('style');
        s.id = 'rippleStyle';
        s.textContent = `@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }`;
        document.head.appendChild(s);
    }
    stepCards.forEach(card => {
        card.addEventListener('click', e => {
            const ripple = document.createElement('span');
            const r = card.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            ripple.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(13,110,94,.12);
        width:${size}px;height:${size}px;
        left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;
        transform:scale(0);animation:rippleAnim .55s ease-out forwards;pointer-events:none;`;
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 560);
        });
    });


    /* ============================================================
       PHONE DEMO MODAL
    ============================================================ */
    const modal = document.getElementById('demoModal');
    const backdrop = document.getElementById('modalBackdrop');
    const dphoneBack = document.getElementById('dphoneBack');
    const captureBtn = document.getElementById('captureBtn');
    const doneDashBtn = document.getElementById('doneToDashboard');
    const closeDemoBtn = document.getElementById('closeDemoBtn');

    const screens = {
        capture: document.getElementById('screen-capture'),
        verify: document.getElementById('screen-verify'),
        success: document.getElementById('screen-success'),
        dashboard: document.getElementById('screen-dashboard'),
    };

    let cameraStream = null;

    function showScreen(name) {
        Object.values(screens).forEach(s => { s.classList.remove('active'); });
        screens[name].classList.add('active');
    }

    /* Update live clock in status bar */
    function updateClock() {
        const el = document.getElementById('dphoneTime');
        if (!el) return;
        const now = new Date();
        let h = now.getHours(), m = now.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        el.textContent = `${h}:${m.toString().padStart(2, '0')}`;
    }
    updateClock();
    setInterval(updateClock, 30000);

    /* Open Modal */
    function openPhoneDemo() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        showScreen('capture');
        resetStepDots(1);
        startCamera();
    }

    /* Close Modal */
    function closePhoneDemo() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        stopCamera();
        // reset captured image
        document.getElementById('capturedImg').style.display = 'none';
        document.getElementById('cameraPlaceholder').style.display = 'flex';
    }

    /* Also open from "Start Interactive Demo" button */
    if (startDemoBtn) {
        // override: open phone demo instead of cycling panel steps
        startDemoBtn.removeEventListener('click', () => { });
        startDemoBtn.onclick = openPhoneDemo;
    }

    backdrop.addEventListener('click', closePhoneDemo);
    dphoneBack.addEventListener('click', () => {
        const active = Object.entries(screens).find(([, s]) => s.classList.contains('active'));
        if (!active) return;
        const order = ['capture', 'verify', 'success', 'dashboard'];
        const idx = order.indexOf(active[0]);
        if (idx <= 0) closePhoneDemo();
        else showScreen(order[idx - 1]);
    });

    /* ── CAMERA ── */
    function startCamera() {
        const video = document.getElementById('cameraFeed');
        const placeholder = document.getElementById('cameraPlaceholder');
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            placeholder.innerHTML = '<i class="fas fa-user-circle"></i><span>Camera not available</span>';
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                video.style.display = 'block';
                placeholder.style.display = 'none';
            })
            .catch(() => {
                // Camera permission denied – show demo image
                placeholder.innerHTML = '<i class="fas fa-user-circle" style="font-size:54px;color:#9ca3af"></i><span>Demo Mode – no camera</span>';
            });
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        const video = document.getElementById('cameraFeed');
        video.srcObject = null;
        video.style.display = 'none';
    }

    /* ── CAPTURE BUTTON ── */
    captureBtn.addEventListener('click', () => {
        const video = document.getElementById('cameraFeed');
        const canvas = document.getElementById('cameraCanvas');
        const img = document.getElementById('capturedImg');
        const placeholder = document.getElementById('cameraPlaceholder');

        if (cameraStream && video.readyState >= 2) {
            // Take snapshot from live video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            img.src = canvas.toDataURL('image/jpeg');
            img.style.display = 'block';
            video.style.display = 'none';
            placeholder.style.display = 'none';
        }

        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
      position:absolute;inset:0;background:#fff;border-radius:18px;
      animation:flashAnim .35s ease-out forwards;pointer-events:none;z-index:9;`;
        if (!document.querySelector('#flashStyle')) {
            const fs = document.createElement('style');
            fs.id = 'flashStyle';
            fs.textContent = `@keyframes flashAnim{0%{opacity:1}100%{opacity:0}}`;
            document.head.appendChild(fs);
        }
        document.getElementById('cameraBox').appendChild(flash);
        setTimeout(() => flash.remove(), 360);

        // Advance to Verify screen after short delay
        setTimeout(() => {
            showScreen('verify');
            resetStepDots(2);
            runVerifyAnimation();
        }, 400);
    });

    /* ── VERIFY ANIMATION ── */
    function runVerifyAnimation() {
        const items = ['vsl1', 'vsl2', 'vsl3'];
        items.forEach(id => {
            const el = document.getElementById(id);
            el.classList.add('dim');
            el.classList.remove('done');
            el.innerHTML = el.innerHTML.replace(/✓\s*/, '');
            el.querySelector && (el.children[0].className = 'fas fa-circle-notch fa-spin');
        });

        items.forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                el.classList.remove('dim');
            }, i * 900);
            setTimeout(() => {
                const el = document.getElementById(id);
                el.classList.add('done');
                el.innerHTML = `<i class="fas fa-check-circle"></i> ${el.textContent.trim().replace('…', '… ✓')}`;
            }, i * 900 + 700);
        });

        setTimeout(() => {
            showScreen('success');
            resetStepDots(4);
            setSuccessDateTime();
            spawnConfetti();
        }, items.length * 900 + 500);
    }

    /* ── SET TIME/DATE ON SUCCESS SCREEN ── */
    function setSuccessDateTime() {
        const now = new Date();
        let h = now.getHours(), m = now.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

        document.getElementById('successTime').textContent = timeStr;
        document.getElementById('successDate').textContent = dateStr;
        // Also update dashboard recent verification time
        const dashT = document.getElementById('dashTime2');
        if (dashT) dashT.textContent = timeStr;
    }

    /* ── CONFETTI ── */
    function spawnConfetti() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';
        const colors = ['#22c55e', '#0d6e5e', '#14a085', '#86efac', '#bbf7d0', '#fbbf24', '#60a5fa'];
        for (let i = 0; i < 42; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = -10 + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.width = (6 + Math.random() * 7) + 'px';
            p.style.height = (6 + Math.random() * 7) + 'px';
            p.style.animationDelay = (Math.random() * 0.8) + 's';
            p.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
            container.appendChild(p);
        }
    }

    /* ── DONE → DASHBOARD ── */
    doneDashBtn.addEventListener('click', () => {
        showScreen('dashboard');
        resetStepDots(4);
    });

    /* ── CLOSE DEMO ── */
    closeDemoBtn.addEventListener('click', closePhoneDemo);

    /* ── STEP DOTS ── */
    function resetStepDots(activeIdx) {
        // Update step progress indicators on capture screen
        const dsteps = document.querySelectorAll('.dstep');
        dsteps.forEach((s, i) => {
            s.classList.remove('active', 'done');
            if (i + 1 < activeIdx) s.classList.add('done');
            if (i + 1 === activeIdx) s.classList.add('active');
        });
    }

    /* Smooth scroll for anchor links */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const t = document.querySelector(link.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });

});