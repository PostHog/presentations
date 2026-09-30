/*
 * Motion — tiny canvas "video" engine for the deck.
 *
 * A slide opts in with <canvas data-scene="name" width="W" height="H">. The
 * width/height attributes are the logical size on the 1280×720 slide canvas;
 * the backing store is scaled by devicePixelRatio × reveal's scale so it stays
 * crisp on a projector.
 *
 * Scenes are small simulations: setup(env) returns { update(dt, t), draw(ctx, t) }.
 * Only canvases on the current slide run. Press R to restart the current slide's
 * scenes. In ?print-pdf mode every scene is fast-forwarded and drawn as a still.
 *
 * Every number these scenes show is simulated for illustration, not
 * production data. The slides say so too.
 */
(function () {
    'use strict';

    // ---- Palette (mirrors css/posthog-theme.css) ---------------------------
    const C = {
        ink: '#151515', ink2: '#55564f', ink3: '#76776f',
        border: '#d0d1c9', borderStrong: '#b9bab1',
        surface: '#ffffff', surface2: '#f3f4ef', surface3: '#e9eae3',
        accent: 'hsl(19, 100%, 48%)', accentSoft: 'hsla(19, 100%, 48%, 0.14)', accentMid: 'hsla(19, 100%, 48%, 0.35)',
        blue: '#1d4aff', blueSoft: '#cdd7ff', blueTint: '#eef1ff',
        kafka: '#6b4fbb', kafkaSoft: '#d8cef0', kafkaTint: '#f4f0fb',
        yellow: '#f9bd2b', warning: '#f7a501', danger: '#db3707', success: '#388600',
        shards: ['#1d4aff', '#30abc6', '#a621c8'],
        keys: ['#f9bd2b', '#388600', '#a621c8', '#30abc6'],
        // Grafana dark panel palette (a nod to tonight's hosts)
        g: {
            bg: '#111217', panel: '#181b1f', border: '#2c3235', text: '#ccccdc', text2: '#8e8e9e',
            grid: 'rgba(204, 204, 220, 0.08)', green: '#73bf69', yellow: '#fade2a', red: '#f2495c',
            blue: '#5794f2', orange: '#ff9830', purple: '#b877d9',
        },
    };

    const SANS = "Inter, 'Open Runde', -apple-system, BlinkMacSystemFont, sans-serif";
    const MONO = "'Source Code Pro', ui-monospace, Menlo, monospace";
    const fs = (px, w = 600) => `${w} ${px}px ${SANS}`;
    const fm = (px, w = 500) => `${w} ${px}px ${MONO}`;

    // ---- Math helpers -------------------------------------------------------
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const quad = (p0, p1, p2, t) => {
        const u = 1 - t;
        return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
    };
    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6d2b79f5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const fmtNum = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'k' : String(Math.round(n)));

    // ---- Drawing helpers ----------------------------------------------------
    function rr(ctx, x, y, w, h, r = 6) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
    }
    // PostHog card: 1px border + the signature hard shadow (0 3px 0).
    function box(ctx, x, y, w, h, o = {}) {
        const r = o.r ?? 6;
        const a = o.alpha ?? 1;
        ctx.save();
        ctx.globalAlpha *= a;
        if (o.shadow !== false) {
            rr(ctx, x, y + 3, w, h, r);
            ctx.fillStyle = o.shadowColor || o.stroke || C.border;
            ctx.fill();
        }
        rr(ctx, x, y, w, h, r);
        // opaque base first so translucent tints don't show the shadow through
        if (o.shadow !== false) {
            ctx.fillStyle = C.surface;
            ctx.fill();
        }
        ctx.fillStyle = o.fill || C.surface;
        ctx.fill();
        if (o.dash) ctx.setLineDash(o.dash);
        ctx.lineWidth = o.lw || 1.25;
        ctx.strokeStyle = o.stroke || C.borderStrong;
        ctx.stroke();
        ctx.restore();
    }
    function text(ctx, s, x, y, o = {}) {
        ctx.save();
        ctx.globalAlpha *= o.alpha ?? 1;
        ctx.font = o.font || fs(14);
        ctx.fillStyle = o.color || C.ink;
        ctx.textAlign = o.align || 'left';
        ctx.textBaseline = o.baseline || 'middle';
        ctx.fillText(s, x, y);
        ctx.restore();
    }
    function dot(ctx, x, y, r, color, alpha = 1) {
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
    function line(ctx, pts, color, o = {}) {
        ctx.save();
        ctx.globalAlpha *= o.alpha ?? 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = o.lw || 1.5;
        if (o.dash) ctx.setLineDash(o.dash);
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
        ctx.restore();
    }
    function arrowHead(ctx, x, y, color, dir = 0, s = 6) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(dir);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-s, -s * 0.6);
        ctx.lineTo(-s, s * 0.6);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
    function arrow(ctx, x1, y1, x2, y2, color = C.ink3, o = {}) {
        line(ctx, [[x1, y1], [x2 - 5, y2]], color, o);
        arrowHead(ctx, x2, y2, color, Math.atan2(y2 - y1, x2 - x1));
    }
    // DB cylinder for MergeTree shards.
    function cylinder(ctx, x, y, w, h, o = {}) {
        const e = Math.min(12, h * 0.14);
        ctx.save();
        ctx.globalAlpha *= o.alpha ?? 1;
        // hard shadow
        ctx.fillStyle = o.shadowColor || C.blueSoft;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 3, w / 2, e, 0, 0, Math.PI);
        ctx.lineTo(x, y + e + 3);
        ctx.closePath();
        ctx.fill();
        // body
        ctx.beginPath();
        ctx.moveTo(x, y + e);
        ctx.lineTo(x, y + h);
        ctx.ellipse(x + w / 2, y + h, w / 2, e, 0, Math.PI, 0, true);
        ctx.lineTo(x + w, y + e);
        ctx.fillStyle = o.fill || C.surface;
        ctx.fill();
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = o.stroke || C.blue;
        ctx.stroke();
        // fill level (stored data)
        if (o.level) {
            const lh = (h - e) * o.level;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, y + h - lh);
            ctx.lineTo(x, y + h);
            ctx.ellipse(x + w / 2, y + h, w / 2, e, 0, Math.PI, 0, true);
            ctx.lineTo(x + w, y + h - lh);
            ctx.ellipse(x + w / 2, y + h - lh, w / 2, e, 0, 0, Math.PI, false);
            ctx.fillStyle = o.levelColor || 'rgba(29, 74, 255, 0.14)';
            ctx.fill();
            ctx.restore();
        }
        // lid
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + e, w / 2, e, 0, 0, Math.PI * 2);
        ctx.fillStyle = o.lid || C.blueTint;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    function pill(ctx, s, x, y, color, o = {}) {
        ctx.save();
        ctx.font = o.font || fm(12, 600);
        const w = ctx.measureText(s).width + 16;
        const h = o.h || 20;
        const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
        ctx.globalAlpha *= o.alpha ?? 1;
        rr(ctx, x0, y - h / 2, w, h, h / 2);
        ctx.fillStyle = o.fill || C.surface;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = o.textColor || color;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(s, x0 + 8, y + 0.5);
        ctx.restore();
        return w;
    }

    // ---- Grafana-style panels ----------------------------------------------
    function gPanel(ctx, x, y, w, h, title, o = {}) {
        const G = C.g;
        rr(ctx, x, y, w, h, 4);
        ctx.fillStyle = G.panel;
        ctx.fill();
        ctx.strokeStyle = G.border;
        ctx.lineWidth = 1;
        ctx.stroke();
        text(ctx, title, x + 10, y + 16, { font: fs(12.5, 500), color: G.text });
        if (o.stat) text(ctx, o.stat, x + w - 10, y + 16, { font: fs(12.5, 600), color: o.statColor || G.text, align: 'right' });
        const area = { x: x + 46, y: y + 34, w: w - 58, h: h - 34 - (o.legend ? 34 : 22) };
        const lo = o.lo ?? 0, hi = o.hi ?? 1;
        const ticks = o.ticks || 3;
        for (let i = 0; i <= ticks; i++) {
            const yy = area.y + area.h - (area.h * i) / ticks;
            line(ctx, [[area.x, yy], [area.x + area.w, yy]], G.grid, { lw: 1 });
            const v = lo + ((hi - lo) * i) / ticks;
            text(ctx, (o.fmt || fmtNum)(v), area.x - 6, yy, { font: fm(10, 400), color: G.text2, align: 'right' });
        }
        if (o.legend) {
            let lx = x + 12;
            const ly = y + h - 14;
            o.legend.forEach(([name, color]) => {
                line(ctx, [[lx, ly], [lx + 14, ly]], color, { lw: 3 });
                text(ctx, name, lx + 20, ly, { font: fs(11, 400), color: G.text2 });
                ctx.font = fs(11, 400);
                lx += 32 + ctx.measureText(name).width;
            });
        }
        return area;
    }
    // data: array of values sampled left→right across the area.
    // n: total slots across the width (data may be shorter = still filling).
    function gLine(ctx, area, data, lo, hi, color, o = {}) {
        if (data.length < 2) return;
        const n = o.n || data.length;
        const off = o.offset || 0; // fractional scroll, in slots
        const X = (i) => area.x + ((i - off) / (n - 1)) * area.w;
        const Y = (v) => area.y + area.h - clamp((v - lo) / (hi - lo)) * area.h;
        ctx.save();
        rr(ctx, area.x, area.y - 2, area.w, area.h + 4, 0);
        ctx.clip();
        ctx.beginPath();
        data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
        if (o.fill !== false) {
            ctx.save();
            ctx.lineTo(X(data.length - 1), area.y + area.h);
            ctx.lineTo(X(0), area.y + area.h);
            ctx.closePath();
            const g = ctx.createLinearGradient(0, area.y, 0, area.y + area.h);
            g.addColorStop(0, color.replace(')', ', 0.28)').replace('rgb(', 'rgba('));
            g.addColorStop(1, color.replace(')', ', 0.0)').replace('rgb(', 'rgba('));
            ctx.fillStyle = g;
            ctx.fill();
            ctx.restore();
            ctx.beginPath();
            data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = o.lw || 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
    }
    function gBars(ctx, area, data, lo, hi, color, o = {}) {
        const n = o.n || data.length;
        const off = o.offset || 0;
        const bw = Math.max(1, area.w / n - 1.5);
        ctx.save();
        rr(ctx, area.x, area.y - 2, area.w, area.h + 4, 0);
        ctx.clip();
        ctx.fillStyle = color;
        data.forEach((v, i) => {
            const bh = clamp((v - lo) / (hi - lo)) * area.h;
            ctx.fillRect(area.x + ((i - off) / (n - 1)) * area.w - bw / 2, area.y + area.h - bh, bw, bh);
        });
        ctx.restore();
    }
    // Grafana wants hex → rgb() so gLine can derive translucent fills.
    const hex2rgb = (h) => {
        const n = parseInt(h.slice(1), 16);
        return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    };

    const H = { C, fs, fm, clamp, lerp, ease, quad, rng, fmtNum, rr, box, text, dot, line, arrow, arrowHead, cylinder, pill, gPanel, gLine, gBars, hex2rgb };

    // ---- Engine -------------------------------------------------------------
    const scenes = {};
    let live = [];
    let raf = 0;
    let last = 0;

    function prep(canvas) {
        if (!canvas._m) {
            const W = +canvas.getAttribute('width');
            const Ht = +canvas.getAttribute('height');
            canvas.style.width = W + 'px';
            canvas.style.height = Ht + 'px';
            canvas._m = { W, H: Ht };
        }
        const { W, H: Ht } = canvas._m;
        const revealScale = window.Reveal && Reveal.isReady && Reveal.isReady() ? Reveal.getScale() : 1;
        const s = clamp((window.devicePixelRatio || 1) * revealScale, 1, 3);
        canvas.width = Math.round(W * s);
        canvas.height = Math.round(Ht * s);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(s, 0, 0, s, 0, 0);
        return ctx;
    }

    function create(canvas) {
        const name = canvas.dataset.scene;
        const setup = scenes[name];
        if (!setup) {
            console.warn('[motion] unknown scene', name);
            return null;
        }
        const ctx = prep(canvas);
        const { W, H: Ht } = canvas._m;
        const inst = { canvas, ctx, W, H: Ht, t: 0 };
        inst.scene = setup({ W, H: Ht, rand: rng(1337), h: H });
        return inst;
    }

    function paint(inst) {
        const { ctx, W, H: Ht } = inst;
        ctx.clearRect(0, 0, W, Ht);
        inst.scene.draw(ctx, inst.t);
    }

    // Fast-forward a fresh instance to time T and paint it (used for stills).
    function still(canvas, T) {
        const inst = create(canvas);
        if (!inst) return;
        const dt = 1 / 30;
        for (let t = 0; t < T; t += dt) {
            inst.t += dt;
            inst.scene.update(dt, inst.t);
        }
        paint(inst);
    }

    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        for (const inst of live) {
            inst.t += dt;
            inst.scene.update(dt, inst.t);
            paint(inst);
        }
        raf = live.length ? requestAnimationFrame(frame) : 0;
    }

    function stop() {
        live = [];
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
    }

    function play(slide) {
        stop();
        if (!slide) return;
        live = [...slide.querySelectorAll('canvas[data-scene]')].map(create).filter(Boolean);
        live.forEach(paint);
        if (live.length) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
        }
    }

    const isPrint = /print-pdf/gi.test(window.location.search);

    const Motion = {
        define(name, setup) {
            scenes[name] = setup;
        },
        restart() {
            if (window.Reveal) play(Reveal.getCurrentSlide());
        },
        init(Reveal) {
            const all = () => document.querySelectorAll('.reveal canvas[data-scene]');
            // Paint a representative still everywhere (overview mode, PDF export,
            // and so a slide never flashes blank while it fades in).
            const paintStills = () => all().forEach((c) => still(c, +(c.dataset.still || 6)));
            if (isPrint) {
                Reveal.on('pdf-ready', paintStills);
                paintStills();
                return;
            }
            paintStills();
            play(Reveal.getCurrentSlide());
            Reveal.on('slidechanged', (e) => play(e.currentSlide));
            Reveal.on('overviewshown', () => {
                stop();
                paintStills();
            });
            Reveal.on('overviewhidden', () => play(Reveal.getCurrentSlide()));
            Reveal.on('resize', () => {
                live.forEach((inst) => {
                    inst.ctx = prep(inst.canvas);
                    paint(inst);
                });
            });
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) stop();
                else play(Reveal.getCurrentSlide());
            });
        },
    };
    window.Motion = Motion;
})();
