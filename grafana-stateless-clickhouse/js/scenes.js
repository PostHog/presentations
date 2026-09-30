/*
 * The deck's animated scenes. Each is a small simulation drawn with the
 * helpers in motion.js. All numbers are illustrative, not production data.
 */
(function () {
    'use strict';
    const M = window.Motion;

    // =========================================================================
    // Title — the firehose: Kafka partitions → stateless CH pods → MergeTree shards
    // =========================================================================
    M.define('firehose', ({ W, H, rand, h }) => {
        const { C } = h;
        const lanes = [0, 1, 2, 3, 4, 5].map((i) => ({ y: 140 + i * 46, acc: rand() }));
        const pods = [0, 1, 2].map((i) => ({ x: 210, y: 150 + i * 92, w: 118, h: 70, buf: 0, since: 0, pulse: 0 }));
        const shards = [0, 1, 2].map((i) => ({ x: 408, y: 118 + i * 118, w: 136, h: 92, chips: [], merge: 0, level: 0.12 + i * 0.03, flash: 0 }));
        let events = [];
        let blocks = [];
        let rows = 0;

        function update(dt, t) {
            // produce
            lanes.forEach((l, i) => {
                l.acc += dt * (5.5 + 2 * Math.sin(i + t / 1.7));
                while (l.acc > 1) {
                    l.acc -= 1;
                    events.push({ lane: i, x: 12 + rand() * 6, y: l.y, pod: Math.floor(i / 2), v: 150 + rand() * 40 });
                }
            });
            // move events
            events = events.filter((e) => {
                e.x += e.v * dt;
                const p = pods[e.pod];
                const cy = p.y + p.h / 2;
                if (e.x > 162) e.y = h.lerp(lanes[e.lane].y, cy, h.ease(h.clamp((e.x - 162) / (p.x - 162))));
                if (e.x >= p.x + 6) {
                    p.buf++;
                    return false;
                }
                return true;
            });
            // pods squash rows into blocks and flush them to a shard
            pods.forEach((p) => {
                p.since += dt;
                p.pulse = Math.max(0, p.pulse - dt * 3);
                if (p.buf >= 9 || (p.buf > 0 && p.since > 0.9)) {
                    const s = Math.floor(rand() * 3);
                    blocks.push({ from: [p.x + p.w, p.y + p.h / 2], shard: s, n: p.buf, t: 0 });
                    p.buf = 0;
                    p.since = 0;
                    p.pulse = 1;
                }
            });
            // blocks fly to shards, land as parts
            blocks = blocks.filter((b) => {
                b.t += dt * 1.5;
                if (b.t >= 1) {
                    const s = shards[b.shard];
                    s.chips.push(b.n);
                    s.flash = 1;
                    rows += b.n;
                    return false;
                }
                return true;
            });
            // background merges: 6 parts → 1
            shards.forEach((s) => {
                s.flash = Math.max(0, s.flash - dt * 2.5);
                if (s.merge > 0) {
                    s.merge += dt * 1.6;
                    if (s.merge >= 1) {
                        s.merge = 0;
                        s.chips = s.chips.slice(6);
                        s.level = s.level + 0.05 > 0.72 ? 0.12 : s.level + 0.05;
                    }
                } else if (s.chips.length >= 6) s.merge = 0.001;
            });
        }

        function draw(ctx) {
            // column labels
            h.text(ctx, 'kafka', 0, 100, { font: h.fm(13, 600), color: C.kafka });
            h.text(ctx, 'stateless CH', pods[0].x, 100, { font: h.fm(13, 600), color: C.accent });
            h.text(ctx, 'MergeTree', shards[0].x, 100, { font: h.fm(13, 600), color: C.blue });

            h.box(ctx, 0, 118, 164, 272, { fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
            lanes.forEach((l, i) => {
                h.line(ctx, [[12, l.y], [152, l.y]], C.kafkaSoft, { lw: 2 });
                h.text(ctx, 'p' + i, 150, l.y - 10, { font: h.fm(9.5), color: C.kafka, align: 'right', alpha: 0.7 });
            });
            events.forEach((e) => h.dot(ctx, e.x, e.y, 3.2, C.kafka));

            pods.forEach((p, i) => {
                h.box(ctx, p.x, p.y, p.w, p.h, { stroke: C.accent, shadowColor: C.accentMid, fill: p.pulse ? `hsla(19,100%,48%,${0.1 * p.pulse})` : C.surface });
                h.text(ctx, 'ingest-' + i, p.x + 12, p.y + 20, { font: h.fs(14, 600) });
                h.text(ctx, '0 B on disk', p.x + 12, p.y + 40, { font: h.fm(10.5), color: C.ink3 });
                // buffer fill (the block being squashed)
                const bw = p.w - 24;
                h.rr(ctx, p.x + 12, p.y + 53, bw, 5, 3);
                ctx.fillStyle = C.surface3;
                ctx.fill();
                h.rr(ctx, p.x + 12, p.y + 53, bw * h.clamp(p.buf / 9), 5, 3);
                ctx.fillStyle = C.accent;
                ctx.fill();
            });

            blocks.forEach((b) => {
                const s = shards[b.shard];
                const to = [s.x - 4, s.y + s.h / 2 + 6];
                const [x, y] = h.quad(b.from, [(b.from[0] + to[0]) / 2, (b.from[1] + to[1]) / 2 - 30], to, h.ease(b.t));
                h.rr(ctx, x - 8, y - 5, 16, 10, 2);
                ctx.fillStyle = C.accent;
                ctx.fill();
            });

            shards.forEach((s, i) => {
                h.cylinder(ctx, s.x, s.y, s.w, s.h, { level: s.level, lid: s.flash ? `rgba(29,74,255,${0.08 + s.flash * 0.25})` : C.blueTint });
                h.text(ctx, 'shard ' + (i + 1), s.x + s.w / 2, s.y + 36, { font: h.fs(13, 600), align: 'center' });
                // parts waiting to be merged
                s.chips.slice(0, 6).forEach((n, k) => {
                    const m = s.merge ? h.ease(Math.min(1, s.merge)) : 0;
                    const cx = h.lerp(s.x + 16 + k * 18, s.x + s.w / 2 - 7, m);
                    const cy = h.lerp(s.y + 50, s.y + s.h - 6, m);
                    h.rr(ctx, cx, cy, 14, 10, 2);
                    ctx.fillStyle = `rgba(29,74,255,${0.75 * (1 - m * 0.8)})`;
                    ctx.fill();
                });
            });

            h.text(ctx, 'rows landed', shards[0].x, 478, { font: h.fm(11), color: C.ink3 });
            h.text(ctx, rows.toLocaleString('en-US'), shards[0].x, 500, { font: h.fm(20, 600), color: C.ink });
        }

        return { update, draw };
    });

    // =========================================================================
    // The problem, replayed: ingestion and queries fighting over one box
    // =========================================================================
    M.define('contention', ({ W, H, rand, h }) => {
        const { C } = h;
        const G = C.g;
        const LOOP = 16;
        const cores = Array.from({ length: 8 }, () => ({ who: 'idle', shimmer: rand() }));
        let lag = 0;
        let p95 = 0.2;
        let lagSeries = [];
        let p95Series = [];
        let sampleAcc = 0;
        let tl = 0; // time within loop
        let loopN = 0;

        const phase = (t) => (t < 4 ? 0 : t < 9 ? 1 : 2);
        const captions = ['① A normal day', '② Someone opens a heavy dashboard', '③ Storm’s over. The lag isn’t.'];

        function update(dt, t) {
            tl = t % LOOP;
            if (Math.floor(t / LOOP) !== loopN) {
                loopN = Math.floor(t / LOOP);
                lag = 0;
                p95 = 0.2;
                lagSeries = [];
                p95Series = [];
            }
            const ph = phase(tl);
            const incoming = ph === 0 ? 3 : 4; // core-equivalents of work arriving
            const queryCores = ph === 1 ? 7 : 2;
            const maxConsumers = 4; // kafka_num_consumers: the ceiling on catch-up
            const want = Math.min(maxConsumers, incoming + (lag > 0.01 ? 2 : 0));
            const ingestCores = Math.min(8 - queryCores, want);
            lag = Math.max(0, lag + (incoming - ingestCores) * dt);
            const p95Target = ph === 1 ? 2.6 + 0.3 * Math.sin(tl * 3) : 0.2 + 0.03 * Math.sin(tl * 5);
            p95 = h.lerp(p95, p95Target, 1 - Math.exp(-dt * 2.5));

            cores.forEach((c, i) => {
                c.who = i < queryCores ? 'query' : i < queryCores + ingestCores ? 'ingest' : 'idle';
                c.shimmer = (c.shimmer + dt * (c.who === 'idle' ? 0 : 1.4)) % 1;
            });

            sampleAcc += dt;
            while (sampleAcc > 0.1) {
                sampleAcc -= 0.1;
                if (tl < LOOP - 1) {
                    lagSeries.push(lag + (lag > 0 ? (rand() - 0.5) * 0.25 : 0));
                    p95Series.push(p95 + (rand() - 0.5) * 0.06);
                }
            }
        }

        function draw(ctx) {
            const tl0 = tl;
            const ph = phase(tl0);
            const fade = tl0 > LOOP - 1 ? LOOP - tl0 : Math.min(1, tl0 * 3);
            ctx.save();
            ctx.globalAlpha = h.clamp(fade);

            // Kafka topic w/ backlog bar
            h.box(ctx, 0, 6, 470, 64, { fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
            h.text(ctx, 'kafka · events', 14, 26, { font: h.fm(13, 600), color: C.kafka });
            h.text(ctx, 'backlog', 14, 50, { font: h.fm(11), color: C.ink3 });
            h.rr(ctx, 78, 44, 370, 12, 6);
            ctx.fillStyle = C.surface;
            ctx.fill();
            h.rr(ctx, 78, 44, Math.max(0, 370 * h.clamp(lag / 16)), 12, 6);
            ctx.fillStyle = lag > 4 ? C.danger : C.kafka;
            ctx.fill();

            // the data node
            h.box(ctx, 0, 92, 470, 262, {});
            h.text(ctx, 'data node', 14, 114, { font: h.fs(15, 600) });
            h.text(ctx, 'MergeTree + Kafka engine + your dashboards', 94, 114, { font: h.fm(11), color: C.ink3 });
            cores.forEach((c, i) => {
                const x = 14 + (i % 4) * 112;
                const y = 132 + Math.floor(i / 4) * 106;
                const fill = c.who === 'query' ? C.blueTint : c.who === 'ingest' ? 'hsla(19,100%,48%,0.1)' : C.surface2;
                const stroke = c.who === 'query' ? C.blue : c.who === 'ingest' ? C.accent : C.border;
                h.box(ctx, x, y, 102, 92, { fill, stroke, shadowColor: c.who === 'idle' ? C.border : c.who === 'query' ? C.blueSoft : C.accentMid });
                h.text(ctx, 'core ' + i, x + 10, y + 16, { font: h.fm(10.5), color: C.ink3 });
                if (c.who !== 'idle') {
                    h.text(ctx, c.who, x + 10, y + 70, { font: h.fs(14, 600), color: stroke });
                    // activity stripes
                    for (let k = 0; k < 3; k++) {
                        const w = 82 * ((c.shimmer + k * 0.33) % 1);
                        h.rr(ctx, x + 10, y + 32 + k * 8, w, 4, 2);
                        ctx.fillStyle = stroke;
                        ctx.globalAlpha *= 0.5;
                        ctx.fill();
                        ctx.globalAlpha /= 0.5;
                    }
                }
            });

            h.text(ctx, captions[ph], 0, 394, { font: h.fs(20, 600), color: ph === 0 ? C.ink : C.accent });

            // Grafana panels
            const px = 506, pw = W - px;
            const lagArea = h.gPanel(ctx, px, 6, pw, 196, 'Kafka consumer lag · events', {
                lo: 0, hi: 16, ticks: 4, fmt: (v) => (v === 0 ? '0' : h.fmtNum(v * 250000)),
                stat: lag < 0.05 ? '0' : h.fmtNum(lag * 250000) + ' msgs', statColor: lag > 4 ? G.red : G.green,
            });
            h.gLine(ctx, lagArea, lagSeries, 0, 16, h.hex2rgb(lag > 4 ? G.red : G.yellow), { n: (LOOP - 1) * 10 });
            const qArea = h.gPanel(ctx, px, 214, pw, 196, 'Query latency p95 · data nodes', {
                lo: 0, hi: 3.2, ticks: 4, fmt: (v) => v.toFixed(1) + 's',
                stat: p95.toFixed(2) + ' s', statColor: p95 > 1 ? G.red : G.green,
            });
            // 1s SLO threshold
            const ty = qArea.y + qArea.h - (1 / 3.2) * qArea.h;
            h.line(ctx, [[qArea.x, ty], [qArea.x + qArea.w, ty]], G.red, { dash: [4, 4], lw: 1, alpha: 0.6 });
            h.gLine(ctx, qArea, p95Series, 0, 3.2, h.hex2rgb(G.blue), { n: (LOOP - 1) * 10 });
            h.text(ctx, 'simulated · illustrative', W - 8, 424, { font: h.fm(10), color: C.ink3, align: 'right' });
            ctx.restore();
        }

        return { update, draw };
    });

    // =========================================================================
    // The whole path, end to end — then we delete the pod
    // =========================================================================
    M.define('pipeline', ({ W, H, rand, h }) => {
        const { C } = h;
        const LOOP = 20;
        const KILL = 10.5;
        const BACK = 13.5;
        const lanes = [0, 1, 2, 3].map((i) => ({ y: 108 + i * 64, q: [], acc: rand(), offset: 1200 + i * 317 }));
        const LANE_END = 196;
        const ktbl = { x: 262, y: 170, w: 150, h: 58 };
        const mv = { x: 450, y: 170, w: 150, h: 58 };
        const dist = { x: 638, y: 170, w: 164, h: 58 };
        const shards = [0, 1, 2].map((i) => ({ x: 900, y: 50 + i * 110, w: 200, h: 84, chips: [], merge: 0, level: 0.1 + i * 0.04, flash: 0 }));
        let fly = []; // rows in motion inside the pod / to the shards
        let buf = []; // rows squashed into the current block
        let bufAge = 0;
        let pullAcc = 0;
        let landed = 0;
        let alive = true;
        let podAlpha = 1;
        let killFlash = 0;
        let commitFlash = 0;
        let redelivered = 0;

        const nodeC = (n) => [n.x + n.w / 2, n.y + n.h / 2];

        function update(dt, t) {
            const tl = t % LOOP;
            const wasAlive = alive;
            alive = !(tl >= KILL && tl < BACK);
            if (wasAlive && !alive) {
                // pod deleted: every row that wasn't committed goes back to Kafka
                killFlash = 1;
                [...fly, ...buf].forEach((r) => {
                    lanes[r.lane].q.unshift({ x: LANE_END, lane: r.lane });
                    redelivered++;
                });
                fly = [];
                buf = [];
            }
            podAlpha = h.lerp(podAlpha, alive ? 1 : 0.25, 1 - Math.exp(-dt * 8));
            killFlash = Math.max(0, killFlash - dt * 0.5);
            commitFlash = Math.max(0, commitFlash - dt * 3);

            // producers
            lanes.forEach((l, i) => {
                l.acc += dt * 2.6;
                while (l.acc > 1) {
                    l.acc -= 1;
                    l.q.push({ x: 20, lane: i });
                }
                // rows slide right and queue up at the lane end
                let limit = LANE_END;
                l.q.forEach((r) => {
                    r.x = Math.min(r.x + 110 * dt, limit);
                    r.queued = r.x >= limit - 0.01;
                    limit = r.x - 9;
                });
            });

            // consumer: faster than producers, so a backlog drains after restart
            if (alive) {
                pullAcc += dt * 22;
                let tries = 0;
                while (pullAcc > 1 && tries < 8) {
                    tries++;
                    const l = lanes.reduce((a, b) => ((b.q[0] && b.q[0].x >= LANE_END - 1 && (!a.q[0] || b.q.length > a.q.length)) ? b : a), { q: [] });
                    if (!l.q.length || l.q[0].x < LANE_END - 1) break;
                    pullAcc -= 1;
                    const r = l.q.shift();
                    fly.push({ lane: r.lane, stage: 0, t: 0, from: [LANE_END, l.y], to: [ktbl.x, nodeC(ktbl)[1]] });
                }
                if (pullAcc > 1) pullAcc = 1;
            }

            // rows moving through Kafka table → MV (buffer)
            fly = fly.filter((r) => {
                r.t += dt * (r.stage === 2 ? 1.4 : 2.6);
                if (r.t < 1) return true;
                if (r.stage === 0) {
                    Object.assign(r, { stage: 1, t: 0, from: [ktbl.x + ktbl.w, nodeC(ktbl)[1]], to: [mv.x, nodeC(mv)[1]] });
                    return true;
                }
                if (r.stage === 1) {
                    if (!buf.length) bufAge = 0;
                    buf.push(r);
                    return false;
                }
                // stage 2: landed on a shard
                const s = shards[r.shard];
                s.flash = 1;
                landed++;
                lanes[r.lane].offset++; // commit only once the INSERT has landed
                if (r.last) {
                    s.chips.push(1);
                    commitFlash = 1;
                }
                return false;
            });

            // MV flushes a block into the Distributed table, which fans rows out by sipHash64(key)
            bufAge += dt;
            if (alive && (buf.length >= 16 || (buf.length && bufAge > 1.1))) {
                const block = buf;
                buf = [];
                block.forEach((r, k) => {
                    r.shard = Math.floor(rand() * 3);
                    const s = shards[r.shard];
                    Object.assign(r, { stage: 2, t: -k * 0.03 - 0.25, from: [dist.x + dist.w, nodeC(dist)[1]], to: [s.x - 4, s.y + s.h / 2] });
                    fly.push(r);
                });
                shards.forEach((s, i) => {
                    const mine = block.filter((r) => r.shard === i);
                    if (mine.length) mine[mine.length - 1].last = true;
                });
            }

            shards.forEach((s) => {
                s.flash = Math.max(0, s.flash - dt * 2.5);
                if (s.merge > 0) {
                    s.merge += dt * 1.6;
                    if (s.merge >= 1) {
                        s.merge = 0;
                        s.chips = s.chips.slice(5);
                        s.level = s.level + 0.06 > 0.7 ? 0.1 : s.level + 0.06;
                    }
                } else if (s.chips.length >= 5) s.merge = 0.001;
            });
        }

        function draw(ctx, t) {
            const tl = t % LOOP;
            // Kafka
            h.box(ctx, 0, 60, 214, 278, { fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
            h.text(ctx, 'kafka · groups', 12, 80, { font: h.fm(13, 600), color: C.kafka });
            lanes.forEach((l, i) => {
                h.line(ctx, [[14, l.y], [LANE_END + 4, l.y]], C.kafkaSoft, { lw: 2 });
                h.text(ctx, `p${i}`, 14, l.y - 14, { font: h.fm(10), color: C.kafka });
                h.text(ctx, `offset ${l.offset}`, LANE_END + 4, l.y - 14, { font: h.fm(10), color: commitFlash ? C.success : C.ink3, align: 'right' });
                l.q.forEach((r) => h.dot(ctx, r.x, l.y, 3.4, C.kafka));
            });
            const backlog = lanes.reduce((a, l) => a + l.q.filter((r) => r.queued).length, 0);
            h.text(ctx, alive && backlog < 12 ? 'offsets commit after each block is written' : `backlog: ${backlog} rows waiting`, 12, 356, { font: h.fm(11), color: alive && backlog < 12 ? C.ink3 : C.danger });

            // The pod
            const dead = !alive;
            h.box(ctx, 232, 60, 590, 278, { fill: dead ? 'rgba(219,55,7,0.04)' : 'hsla(19,100%,48%,0.04)', stroke: dead ? C.danger : C.accent, dash: [6, 5], shadow: false });
            const podName = tl >= BACK && tl < BACK + 3 ? 'chi-ingestion-small-0 · rescheduled' : 'chi-ingestion-small-0 · stateless pod';
            h.text(ctx, dead ? 'chi-ingestion-small-0 · deleted' : podName, 246, 80, { font: h.fm(13, 600), color: dead ? C.danger : C.accent });

            ctx.save();
            ctx.globalAlpha = podAlpha;
            [[ktbl, 'kafka_groups', 'Kafka engine', C.kafka, C.kafkaSoft], [mv, 'groups_mv', 'materialized view', C.accent, C.accentMid], [dist, 'writable_groups', 'Distributed', C.accent, C.accentMid]].forEach(([n, a, b, s, sh]) => {
                h.box(ctx, n.x, n.y, n.w, n.h, { stroke: s, shadowColor: sh });
                h.text(ctx, a, n.x + n.w / 2, n.y + 22, { font: h.fs(14, 600), align: 'center' });
                h.text(ctx, b, n.x + n.w / 2, n.y + 41, { font: h.fm(10.5), color: C.ink3, align: 'center' });
            });
            h.arrow(ctx, ktbl.x + ktbl.w + 4, nodeC(ktbl)[1], mv.x - 4, nodeC(mv)[1], C.borderStrong);
            h.arrow(ctx, mv.x + mv.w + 4, nodeC(mv)[1], dist.x - 4, nodeC(dist)[1], C.borderStrong);
            // the block being built by the MV
            h.text(ctx, 'block', mv.x, mv.y + mv.h + 26, { font: h.fm(10.5), color: C.ink3 });
            for (let k = 0; k < 16; k++) {
                const x = mv.x + 44 + (k % 8) * 13;
                const y = mv.y + mv.h + 20 + Math.floor(k / 8) * 13;
                h.rr(ctx, x, y, 10, 10, 2);
                ctx.fillStyle = k < buf.length ? C.accent : C.surface3;
                ctx.fill();
            }
            h.text(ctx, 'sipHash64(group_key) → shard', dist.x + dist.w / 2, dist.y + dist.h + 26, { font: h.fm(10.5), color: C.ink3, align: 'center' });
            h.text(ctx, '0 bytes stored · PVC reclaimPolicy: Delete', 246, 316, { font: h.fm(11), color: C.ink3 });
            ctx.restore();

            if (dead) {
                const a = h.clamp((tl - KILL) * 4);
                h.box(ctx, 380, 110, 300, 42, { fill: '#fff', stroke: C.danger, alpha: a });
                h.text(ctx, 'kubectl delete pod chi-ingestion-small-0', 530, 131, { font: h.fm(12, 600), color: C.danger, align: 'center', alpha: a });
            }

            // rows in flight
            fly.forEach((r) => {
                if (r.t < 0) return;
                const k = h.ease(h.clamp(r.t));
                const mid = [(r.from[0] + r.to[0]) / 2, (r.from[1] + r.to[1]) / 2 - (r.stage === 2 ? 26 : 22)];
                const [x, y] = h.quad(r.from, mid, r.to, k);
                h.dot(ctx, x, y, 3.4, r.stage === 2 ? C.shards[r.shard] : C.kafka);
            });

            // shards
            h.text(ctx, 'data nodes · ReplacingMergeTree', 900, 30, { font: h.fm(12, 600), color: C.blue });
            shards.forEach((s, i) => {
                h.cylinder(ctx, s.x, s.y, s.w, s.h, { level: s.level, stroke: C.shards[i], lid: s.flash ? `rgba(29,74,255,${0.06 + s.flash * 0.2})` : C.blueTint });
                h.text(ctx, `shard ${i + 1} · groups`, s.x + s.w / 2, s.y + 36, { font: h.fs(13.5, 600), align: 'center' });
                s.chips.slice(0, 5).forEach((n, k) => {
                    const m = s.merge ? h.ease(Math.min(1, s.merge)) : 0;
                    h.rr(ctx, h.lerp(s.x + 30 + k * 30, s.x + s.w / 2 - 10, m), h.lerp(s.y + 48, s.y + s.h - 4, m), 20, 11, 2);
                    ctx.fillStyle = C.shards[i];
                    ctx.globalAlpha = 0.75 * (1 - m * 0.8);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                });
            });
            h.text(ctx, `rows landed ${landed.toLocaleString('en-US')}`, 900, 384, { font: h.fm(12, 600) });
            h.text(ctx, `rows lost 0`, 1100, 384, { font: h.fm(12, 600), color: C.success, align: 'right' });
        }

        return { update, draw };
    });

    // =========================================================================
    // kafka_thread_per_consumer = 0 vs 1
    // =========================================================================
    M.define('threads', ({ W, H, rand, h }) => {
        const { C } = h;
        const RATE = 9; // rows/s one thread can squash (illustrative)
        const panels = [0, 1].map((mode) => ({
            mode,
            x: mode * 600,
            lanes: mode ? [0, 1, 2, 3] : [0],
            bufs: mode ? [0, 0, 0, 0] : [0],
            acc: mode ? [0, 0.25, 0.5, 0.75] : [0],
            next: 0,
            rows: [],
            blocks: [],
            flushed: 0,
        }));
        const consY = (i) => 78 + i * 62;

        function update(dt) {
            panels.forEach((p) => {
                p.lanes.forEach((k) => {
                    p.acc[k] += dt * RATE;
                    while (p.acc[k] > 1) {
                        p.acc[k] -= 1;
                        // thread_per_consumer=0: one thread pulls from each consumer in turn
                        const c = p.mode ? k : p.next++ % 4;
                        p.rows.push({ c, lane: k, t: 0 });
                    }
                });
                p.rows = p.rows.filter((r) => {
                    r.t += dt * 2.2;
                    if (r.t < 1) return true;
                    p.bufs[r.lane]++;
                    if (p.bufs[r.lane] >= 12) {
                        p.bufs[r.lane] = 0;
                        p.blocks.push({ lane: r.lane, t: 0 });
                    }
                    return false;
                });
                p.blocks = p.blocks.filter((b) => {
                    b.t += dt * 1.8;
                    if (b.t < 1) return true;
                    p.flushed += 12;
                    return false;
                });
            });
        }

        function draw(ctx, t) {
            panels.forEach((p) => {
                const x0 = p.x;
                const laneY = (k) => (p.mode ? consY(k) + 22 : 170);
                h.text(ctx, `kafka_thread_per_consumer = ${p.mode}`, x0, 20, { font: h.fm(15, 600), color: p.mode ? C.success : C.danger });
                for (let i = 0; i < 4; i++) {
                    h.box(ctx, x0, consY(i), 118, 44, { fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
                    h.text(ctx, `consumer ${i}`, x0 + 59, consY(i) + 22, { font: h.fs(13, 600), align: 'center' });
                }
                // threads / block builders
                p.lanes.forEach((k) => {
                    const y = laneY(k);
                    const bx = x0 + 250;
                    h.box(ctx, bx, y - 20, 150, 40, { stroke: C.accent, shadowColor: C.accentMid });
                    h.text(ctx, p.mode ? `thread ${k}` : 'the one thread', bx + 10, y - 7, { font: h.fs(12, 600) });
                    for (let j = 0; j < 12; j++) {
                        h.rr(ctx, bx + 10 + j * 11, y + 4, 8, 8, 2);
                        ctx.fillStyle = j < p.bufs[k] ? C.accent : C.surface3;
                        ctx.fill();
                    }
                    h.arrow(ctx, bx + 154, y, x0 + 452, p.mode ? y : 170, C.borderStrong);
                });
                if (!p.mode) {
                    for (let i = 0; i < 4; i++) h.line(ctx, [[x0 + 122, consY(i) + 22], [x0 + 246, 170]], C.border, { lw: 1.25 });
                }
                h.box(ctx, x0 + 458, p.mode ? 78 : 146, 96, p.mode ? 230 : 48, { stroke: C.accent, shadowColor: C.accentMid });
                h.text(ctx, 'MV →', x0 + 506, p.mode ? 180 : 162, { font: h.fs(12.5, 600), align: 'center' });
                h.text(ctx, 'Distributed', x0 + 506, p.mode ? 198 : 180, { font: h.fs(12.5, 600), align: 'center' });

                p.rows.forEach((r) => {
                    const from = [x0 + 122, consY(r.c) + 22];
                    const to = [x0 + 246, laneY(r.lane)];
                    const k = h.ease(r.t);
                    h.dot(ctx, h.lerp(from[0], to[0], k), h.lerp(from[1], to[1], k), 3.2, C.kafka);
                });
                p.blocks.forEach((b) => {
                    const y = p.mode ? laneY(b.lane) : 170;
                    h.rr(ctx, h.lerp(x0 + 404, x0 + 452, h.ease(b.t)) - 9, y - 6, 18, 12, 2);
                    ctx.fillStyle = C.accent;
                    ctx.fill();
                });

                const rate = t > 1 ? p.flushed / t : 0;
                h.text(ctx, `${p.flushed.toLocaleString('en-US')} rows flushed`, x0, 338, { font: h.fm(15, 600) });
                h.text(ctx, `${p.mode ? 'four independent flushes' : 'every consumer squashed into one block'}`, x0, 362, { font: h.fm(12), color: C.ink3 });
                const bar = 540 * h.clamp(rate / (RATE * 4.2));
                h.rr(ctx, x0 + 290, 332, 250, 12, 6);
                ctx.fillStyle = C.surface3;
                ctx.fill();
                h.rr(ctx, x0 + 290, 332, Math.min(250, bar * 250 / 540), 12, 6);
                ctx.fillStyle = p.mode ? C.success : C.danger;
                ctx.fill();
            });
            h.line(ctx, [[580, 10], [580, 370]], C.border, { dash: [4, 6] });
        }

        return { update, draw };
    });

    // =========================================================================
    // A Grafana dashboard for the ingestion tier — with a pod getting recycled
    // =========================================================================
    M.define('dashboard', ({ W, H, rand, h }) => {
        const { C } = h;
        const G = C.g;
        const N = 120; // samples across a panel
        const STEP = 0.12; // seconds per sample
        const tiers = [
            { name: 'small', base: 4, color: G.green },
            { name: 'medium', base: 14, color: G.yellow },
            { name: 'events', base: 42, color: G.blue },
        ].map((t) => ({ ...t, lag: 0.3, down: 0, series: { lag: [], read: [] } }));
        const files = [];
        const p95 = [];
        const notes = []; // annotation sample indices
        let acc = 0;
        let sinceKill = -7.5; // first recycle lands ~2–5s after the slide appears
        let n = 0;

        // prefill so the dashboard is never empty
        function sample() {
            n++;
            sinceKill += STEP;
            if (sinceKill > 9 + rand() * 3) {
                sinceKill = 0;
                const victim = tiers[1 + Math.floor(rand() * 2)];
                victim.down = 1.6;
                notes.push({ i: n, label: `pod recycled · ${victim.name}` });
            }
            let catchup = 0;
            tiers.forEach((t) => {
                const incoming = t.base * (1 + 0.08 * Math.sin(n / 17 + t.base) + (rand() - 0.5) * 0.06);
                let read;
                if (t.down > 0) {
                    t.down -= STEP;
                    read = 0;
                } else read = Math.min(incoming * 1.9, incoming + t.lag * 2.5);
                t.lag = Math.max(0.2 + rand() * 0.2, t.lag + (incoming - read) * STEP);
                if (read > incoming * 1.15) catchup += read - incoming;
                t.series.lag.push(t.lag);
                t.series.read.push(read);
                if (t.series.lag.length > N + 1) (t.series.lag.shift(), t.series.read.shift());
            });
            files.push(Math.max(0, 1 + rand() * 2 + catchup * 0.9));
            p95.push(0.21 + (rand() - 0.5) * 0.03 + 0.015 * Math.sin(n / 9));
            if (files.length > N + 1) (files.shift(), p95.shift());
            while (notes.length && notes[0].i < n - N) notes.shift();
        }
        for (let i = 0; i < N; i++) sample();

        function update(dt) {
            acc += dt;
            while (acc > STEP) {
                acc -= STEP;
                sample();
            }
        }

        function draw(ctx) {
            const off = acc / STEP; // smooth scroll between samples
            // background + header bar
            h.rr(ctx, 0, 0, W, H, 8);
            ctx.fillStyle = G.bg;
            ctx.fill();
            h.text(ctx, 'Dashboards  ›  ClickHouse  ›  Stateless ingestion', 16, 20, { font: h.fs(13, 500), color: G.text });
            h.text(ctx, 'simulated data', W - 250, 20, { font: h.fm(11), color: G.orange, align: 'right' });
            h.rr(ctx, W - 232, 8, 128, 24, 3);
            ctx.strokeStyle = G.border;
            ctx.stroke();
            h.text(ctx, '◷  Last 15 minutes', W - 222, 20, { font: h.fs(11.5, 500), color: G.text });
            h.rr(ctx, W - 96, 8, 80, 24, 3);
            ctx.stroke();
            h.text(ctx, '⟳  5s', W - 84, 20, { font: h.fs(11.5, 500), color: G.text });

            const pw = (W - 16 * 3) / 2;
            const ph = (H - 42 - 16 * 2) / 2;
            const px = [16, 16 * 2 + pw];
            const py = [40, 40 + ph + 12];
            const opts = { n: N, offset: off };

            const annotate = (area) =>
                notes.forEach((a) => {
                    const i = a.i - (n - N) - 1;
                    const x = area.x + ((i - off) / (N - 1)) * area.w;
                    if (x < area.x || x > area.x + area.w) return;
                    h.line(ctx, [[x, area.y], [x, area.y + area.h]], G.orange, { dash: [3, 3], lw: 1 });
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, area.y + area.h + 1);
                    ctx.lineTo(x - 4, area.y + area.h + 7);
                    ctx.lineTo(x + 4, area.y + area.h + 7);
                    ctx.fillStyle = G.orange;
                    ctx.fill();
                    ctx.restore();
                });
            const lastNote = notes[notes.length - 1];

            // 1 · consumer lag
            const lagHi = 30;
            let a = h.gPanel(ctx, px[0], py[0], pw, ph, 'Kafka consumer lag by tier', {
                lo: 0, hi: lagHi, ticks: 3, fmt: (v) => (v ? v * 10 + 'k' : '0'),
                legend: tiers.map((t) => [t.name, t.color]),
            });
            tiers.forEach((t) => h.gLine(ctx, a, t.series.lag, 0, lagHi, h.hex2rgb(t.color), opts));
            annotate(a);
            if (lastNote) {
                const i = lastNote.i - (n - N) - 1;
                const x = a.x + ((i - off) / (N - 1)) * a.w;
                const flip = x > a.x + a.w - 150; // keep the label inside the panel
                if (x > a.x && x < a.x + a.w) h.text(ctx, lastNote.label, flip ? x - 6 : x + 6, a.y + 10, { font: h.fs(11, 500), color: G.orange, align: flip ? 'right' : 'left' });
            }

            // 2 · messages read
            const readHi = 120;
            a = h.gPanel(ctx, px[1], py[0], pw, ph, 'rate(ProfileEvent_KafkaMessagesRead)', {
                lo: 0, hi: readHi, ticks: 3, fmt: (v) => (v ? Math.round(v * 10) + 'k/s' : '0'),
                legend: tiers.map((t) => [t.name, t.color]),
            });
            tiers.forEach((t) => h.gLine(ctx, a, t.series.read, 0, readHi, h.hex2rgb(t.color), { ...opts, fill: false }));
            annotate(a);

            // 3 · distributed queue
            a = h.gPanel(ctx, px[0], py[1], pw, ph, 'CurrentMetric_DistributedFilesToInsert', {
                lo: 0, hi: 60, ticks: 3, fmt: (v) => String(v),
                stat: String(Math.round(files[files.length - 1])),
            });
            h.gBars(ctx, a, files, 0, 60, G.purple, opts);
            annotate(a);

            // 4 · query p95 on the data nodes
            const last = p95[p95.length - 1];
            a = h.gPanel(ctx, px[1], py[1], pw, ph, 'Query p95 · data nodes', {
                lo: 0, hi: 1.2, ticks: 3, fmt: (v) => v.toFixed(1) + 's',
                stat: Math.round(last * 1000) + ' ms', statColor: G.green,
            });
            const ty = a.y + a.h - (1 / 1.2) * a.h;
            h.line(ctx, [[a.x, ty], [a.x + a.w, ty]], G.red, { dash: [4, 4], lw: 1, alpha: 0.6 });
            h.gLine(ctx, a, p95, 0, 1.2, h.hex2rgb(G.green), opts);
            annotate(a);
        }

        return { update, draw };
    });

    // =========================================================================
    // ShuffleHog: partition by the key your consumer writes on
    // =========================================================================
    M.define('shuffle', ({ W, H, rand, h }) => {
        const { C } = h;
        const KEYS = ['(1, $pageview)', '(1, signup)', '(7, $pageview)', '(9, purchase)'];
        const UPSERT = 0.2; // seconds per row upsert
        const FLUSH = 1.2; // squash interval between batches
        // Each flush is one Postgres transaction: row locks are taken as rows are
        // upserted and held until COMMIT. That's what turns overlap into a queue.
        const panels = [0, 1].map((mode) => ({
            mode,
            x: mode * 600,
            lanes: [0, 1, 2, 3].map(() => ({ acc: rand(), dots: [] })),
            cons: [0, 1, 2, 3].map((i) => ({ timer: 0.4 + i * 0.05, queue: [], held: [], cur: -1, left: 0, wait: -1 })),
            rows: KEYS.map(() => ({ holder: -1, waiters: [], flash: 0 })),
            waited: 0,
            commits: 0,
        }));
        const laneY = (i) => 86 + i * 64;
        const rowY = (i) => 108 + i * 52;

        function update(dt) {
            panels.forEach((p) => {
                p.lanes.forEach((l, i) => {
                    l.acc += dt * 3;
                    while (l.acc > 1) {
                        l.acc -= 1;
                        l.dots.push({ x: 0, k: p.mode ? i : Math.floor(rand() * 4) });
                    }
                    l.dots = l.dots.filter((d) => (d.x += dt * 140) < 138);
                });
                p.cons.forEach((c, ci) => {
                    if (c.cur >= 0) {
                        c.left -= dt;
                        if (c.left <= 0) {
                            p.rows[c.cur].flash = 1;
                            c.held.push(c.cur);
                            c.queue.shift();
                            c.cur = -1;
                        }
                        return;
                    }
                    if (c.queue.length) {
                        const k = c.queue[0];
                        const row = p.rows[k];
                        const first = row.waiters.length === 0 || row.waiters[0] === ci;
                        if (row.holder === -1 && first) {
                            if (row.waiters[0] === ci) row.waiters.shift();
                            row.holder = ci;
                            c.cur = k;
                            c.left = UPSERT;
                            c.wait = -1;
                        } else {
                            if (c.wait !== k) {
                                c.wait = k;
                                row.waiters.push(ci);
                            }
                            p.waited += dt;
                        }
                        return;
                    }
                    if (c.held.length) {
                        // COMMIT: release every row lock this batch took
                        c.held.forEach((k) => (p.rows[k].holder = -1));
                        c.held = [];
                        p.commits++;
                        c.timer = FLUSH;
                        return;
                    }
                    c.timer -= dt;
                    if (c.timer <= 0) c.queue = p.mode ? [ci] : [0, 1, 2, 3];
                });
                p.rows.forEach((r) => (r.flash = Math.max(0, r.flash - dt * 3)));
            });
        }

        function draw(ctx) {
            panels.forEach((p) => {
                const x0 = p.x;
                h.text(ctx, p.mode ? 'After · keyed by (project, event)' : 'Before · keyed by anything else', x0, 20, { font: h.fs(17, 600), color: p.mode ? C.success : C.danger });
                h.text(ctx, 'partitions', x0, 52, { font: h.fm(11), color: C.kafka });
                h.text(ctx, 'propdefs', x0 + 178, 52, { font: h.fm(11), color: C.accent });
                h.text(ctx, 'postgres · one txn per flush', x0 + 360, 52, { font: h.fm(11), color: C.blue });
                p.lanes.forEach((l, i) => {
                    h.box(ctx, x0, laneY(i) - 18, 150, 36, { fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
                    l.dots.forEach((d) => h.dot(ctx, x0 + 8 + d.x, laneY(i), 4, C.keys[d.k]));
                    const c = p.cons[i];
                    const waiting = c.wait >= 0 && c.cur < 0;
                    const from = [x0 + 294, laneY(i)];
                    c.held.forEach((k) => h.line(ctx, [from, [x0 + 356, rowY(k)]], C.keys[k], { lw: 1.5, alpha: 0.45 }));
                    if (c.cur >= 0) h.line(ctx, [from, [x0 + 356, rowY(c.cur)]], C.keys[c.cur], { lw: 2.5 });
                    if (waiting) h.line(ctx, [from, [x0 + 356, rowY(c.wait)]], C.danger, { lw: 1.25, dash: [4, 4] });
                    h.box(ctx, x0 + 178, laneY(i) - 18, 112, 36, {
                        stroke: waiting ? C.danger : C.accent, shadowColor: waiting ? 'rgba(219,55,7,0.25)' : C.accentMid,
                    });
                    h.text(ctx, waiting ? 'waiting on lock' : c.cur >= 0 ? 'upserting' : `consumer ${i}`, x0 + 234, laneY(i), {
                        font: h.fs(12, 600), align: 'center', color: waiting ? C.danger : C.ink,
                    });
                });
                p.rows.forEach((r, k) => {
                    const y = rowY(k);
                    h.box(ctx, x0 + 360, y - 17, 196, 34, { stroke: r.holder >= 0 ? C.keys[k] : C.border, fill: r.flash ? `rgba(56,134,0,${0.1 * r.flash})` : C.surface });
                    h.dot(ctx, x0 + 376, y, 5, C.keys[k]);
                    h.text(ctx, KEYS[k], x0 + 390, y, { font: h.fm(11.5, 500) });
                    if (r.holder >= 0) h.text(ctx, '🔒', x0 + 548, y, { font: h.fs(13), align: 'right' });
                    if (r.waiters.length) h.text(ctx, `+${r.waiters.length}`, x0 + 526, y, { font: h.fm(11, 600), color: C.danger, align: 'right' });
                });
                h.text(ctx, `lock wait  ${p.waited.toFixed(1)}s`, x0, 354, { font: h.fm(15, 600), color: p.waited > 0.5 ? C.danger : C.success });
                h.text(ctx, `batches committed  ${p.commits}`, x0 + 360, 354, { font: h.fm(15, 600) });
            });
            h.line(ctx, [[582, 10], [582, 370]], C.border, { dash: [4, 6] });
        }

        return { update, draw };
    });

    // =========================================================================
    // MSK → WarpStream under a live firehose: add a leg, shift, drop a leg
    // =========================================================================
    M.define('cutover', ({ W, H, rand, h }) => {
        const { C } = h;
        const LOOP = 16;
        const legs = [
            { y: 62, name: 'MSK', k: 'kafka_groups', mv: 'groups_mv', d: 'writable_groups' },
            { y: 206, name: 'WarpStream', k: 'kafka_groups_ws', mv: 'groups_ws_mv', d: 'writable_groups_ws' },
        ];
        const X = { prod: 0, topic: 150, ktbl: 350, mv: 560, dist: 740, tgt: 990 };
        const TGT = { x: 990, y: 96, w: 170, h: 96 };
        let dots = [];
        let acc = 0;
        let arrivals = [];
        let rateSeries = [];
        let bucket = 0;
        let bucketT = 0;

        // Which fraction of producers write to WarpStream, and leg visibility.
        const shiftAt = (tl) => h.ease(h.clamp((tl - 4) / 6));
        const legAlpha = (i, tl) => (i === 1 ? h.clamp((tl - 2.2) / 1) : 1 - h.clamp((tl - 12) / 1));

        function path(i) {
            const y = legs[i].y + 30;
            return [[X.prod + 110, 146], [X.topic, y], [X.ktbl, y], [X.mv, y], [X.dist, y], [TGT.x, TGT.y + TGT.h / 2]];
        }

        function update(dt, t) {
            const tl = t % LOOP;
            acc += dt * 14;
            while (acc > 1) {
                acc -= 1;
                const leg = rand() < shiftAt(tl) ? 1 : 0;
                dots.push({ leg, s: 0 });
            }
            dots = dots.filter((d) => {
                d.s += dt * 330;
                const pts = path(d.leg);
                let len = 0;
                for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
                if (d.s >= len) {
                    bucket++;
                    return false;
                }
                return true;
            });
            bucketT += dt;
            if (bucketT > 0.25) {
                if (t > 3) rateSeries.push(bucket / bucketT);
                if (rateSeries.length > 40) rateSeries.shift();
                bucket = 0;
                bucketT = 0;
            }
        }

        function pos(d) {
            const pts = path(d.leg);
            let s = d.s;
            for (let i = 1; i < pts.length; i++) {
                const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
                if (s <= seg) return [h.lerp(pts[i - 1][0], pts[i][0], s / seg), h.lerp(pts[i - 1][1], pts[i][1], s / seg)];
                s -= seg;
            }
            return pts[pts.length - 1];
        }

        function draw(ctx, t) {
            const tl = t % LOOP;
            dots.forEach((d) => {
                const [x, y] = pos(d);
                h.dot(ctx, x, y, 3.6, d.leg ? C.accent : C.kafka, 0.95);
            });
            h.box(ctx, X.prod, 116, 110, 60, {});
            h.text(ctx, 'producers', X.prod + 55, 140, { font: h.fs(14, 600), align: 'center' });
            h.text(ctx, `${Math.round(shiftAt(tl) * 100)}% → WS`, X.prod + 55, 160, { font: h.fm(11), color: C.ink3, align: 'center' });

            legs.forEach((l, i) => {
                const a = legAlpha(i, tl);
                const ghost = a < 0.99;
                const y = l.y;
                const o = { alpha: Math.max(0.12, a), dash: ghost ? [5, 4] : null };
                h.box(ctx, X.topic, y, 160, 60, { ...o, fill: C.kafkaTint, stroke: C.kafka, shadowColor: C.kafkaSoft });
                h.text(ctx, l.name, X.topic + 80, y + 22, { font: h.fs(14, 600), align: 'center', alpha: o.alpha });
                h.text(ctx, 'topic: groups', X.topic + 80, y + 41, { font: h.fm(10.5), color: C.ink3, align: 'center', alpha: o.alpha });
                [[X.ktbl, l.k, 'Kafka engine', C.kafka, C.kafkaSoft, 176], [X.mv, l.mv, 'materialized view', C.accent, C.accentMid, 150], [X.dist, l.d, 'Distributed', C.accent, C.accentMid, 200]].forEach(([x, a1, b, s, sh, w]) => {
                    h.box(ctx, x, y, w, 60, { ...o, stroke: s, shadowColor: sh });
                    h.text(ctx, a1, x + w / 2, y + 22, { font: h.fs(13.5, 600), align: 'center', alpha: o.alpha });
                    h.text(ctx, b, x + w / 2, y + 41, { font: h.fm(10.5), color: C.ink3, align: 'center', alpha: o.alpha });
                });
            });
            // DDL callouts
            const create = h.clamp((tl - 1.6) * 2) * (1 - h.clamp((tl - 5) * 1.5));
            if (create > 0) h.pill(ctx, 'CREATE TABLE kafka_groups_ws … ENGINE = Kafka(warpstream_ingestion, …)', X.ktbl, 290, C.success, { alpha: create, font: h.fm(12, 600) });
            const drop = h.clamp((tl - 11.4) * 2) * (1 - h.clamp((tl - 14.5) * 1.5));
            if (drop > 0) h.pill(ctx, 'DROP TABLE kafka_groups  -- MSK leg drained', X.ktbl, 32, C.danger, { alpha: drop, font: h.fm(12, 600) });


            h.cylinder(ctx, TGT.x, TGT.y, TGT.w, TGT.h, { level: 0.35 });
            h.text(ctx, 'groups', TGT.x + TGT.w / 2, TGT.y + 32, { font: h.fs(15, 600), align: 'center' });
            h.text(ctx, 'MergeTree', TGT.x + TGT.w / 2, TGT.y + 52, { font: h.fm(10.5), color: C.ink3, align: 'center' });
            // rows/s sparkline — should stay flat through the whole migration
            const sx = TGT.x, sy = TGT.y + TGT.h + 40, sw = TGT.w, sh = 34;
            h.text(ctx, 'rows/s into groups', sx, sy - 12, { font: h.fm(10.5), color: C.ink3 });
            if (rateSeries.length > 1) {
                h.line(ctx, rateSeries.map((v, i) => [sx + (i / 39) * sw, sy + sh - h.clamp(v / 28) * sh]), C.blue, { lw: 2 });
            }
            h.line(ctx, [[sx, sy + sh], [sx + sw, sy + sh]], C.border, { lw: 1 });
        }

        return { update, draw };
    });
})();
