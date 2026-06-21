/* Report — turns raw interview results into metrics, optionally enriches them
   with an AI-scored evaluation, and renders the debrief screen. */

import { STUDIO } from "../config.js";

const FILLERS = ["um", "uh", "er", "ah", "like", "basically", "actually", "literally",
    "you know", "sort of", "kind of", "i mean", "right"];

function wordsOf(text) {
    return (text || "").trim().split(/\s+/).filter(Boolean);
}

function countFillers(text) {
    const t = " " + (text || "").toLowerCase() + " ";
    return FILLERS.reduce((n, f) => n + (t.match(new RegExp("\\b" + f.replace(/ /g, "\\s+") + "\\b", "g")) || []).length, 0);
}

function metricsFor(item) {
    const words = wordsOf(item.answer);
    const minutes = item.durationMs / 60000;
    return {
        wordCount: words.length,
        durationSec: Math.round(item.durationMs / 1000),
        wpm: minutes > 0 ? Math.round(words.length / minutes) : 0,
        fillers: countFillers(item.answer),
        answered: words.length > 0,
    };
}

function compute(results) {
    const per = results.map((r) => ({ ...r, metrics: metricsFor(r) }));
    const totalWords = per.reduce((n, r) => n + r.metrics.wordCount, 0);
    const totalSec = per.reduce((n, r) => n + r.metrics.durationSec, 0);
    const totalFillers = per.reduce((n, r) => n + r.metrics.fillers, 0);
    const answered = per.filter((r) => r.metrics.answered).length;
    const minutes = totalSec / 60;
    return {
        per,
        overall: {
            questions: per.length,
            answered,
            totalSec,
            totalWords,
            avgWords: per.length ? Math.round(totalWords / per.length) : 0,
            wpm: minutes > 0 ? Math.round(totalWords / minutes) : 0,
            fillers: totalFillers,
        },
    };
}

/* Collect unique non-empty strings from a per-answer evaluation field. */
function aggregate(results, key) {
    const seen = [];
    results.forEach((r) => {
        const list = (r.evaluation && r.evaluation[key]) || [];
        list.forEach((s) => { if (s && !seen.includes(s)) seen.push(s); });
    });
    return seen;
}

function avgScore(items) {
    const nums = items.map((i) => i.score).filter((s) => typeof s === "number");
    return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0;
}

/**
 * Build the debrief `evaluation` object from the agent's live per-answer
 * scores (collected during the interview) plus its final report. Returns the
 * shape `render`/`toTranscript` expect, or null if nothing was scored.
 */
function fromAgent(results, report) {
    const scored = results.some((r) => r.evaluation);
    if (!report && !scored) return null;

    const items = results.map((r) => {
        const ev = r.evaluation || {};
        return {
            score: typeof ev.overall_score === "number" ? ev.overall_score : null,
            feedback: ev.feedback || "",
        };
    });

    const r = report || {};
    const strengths = (r.strengths && r.strengths.length) ? r.strengths : aggregate(results, "strengths");
    const improvements = (r.weaknesses && r.weaknesses.length) ? r.weaknesses
        : (r.recommendations && r.recommendations.length) ? r.recommendations
        : aggregate(results, "weaknesses");

    return {
        overall_score: typeof r.overall_score === "number" ? r.overall_score : avgScore(items),
        summary: r.summary || r.interview_outcome || "",
        strengths,
        improvements,
        items,
    };
}

function fmtDuration(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
function scoreClass(s) { return s >= 7.5 ? "high" : s >= 5 ? "mid" : "low"; }

function render(root, config, data, evaluation) {
    const { per, overall } = data;

    // ---- meta + title
    const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
    root.querySelector("#debrief-title").textContent = `${config.role} — report`;
    root.querySelector("#debrief-meta").textContent =
        `${config.name} · ${STUDIO.TYPE_LABELS[config.type]} · ` +
        `${cap(config.difficulty)} difficulty · ${overall.questions} questions · ` +
        `${overall.answered} answered · ${fmtDuration(overall.totalSec)} spoken`;

    // ---- stat strip
    const stats = [
        { v: overall.questions, l: "Questions", accent: false },
        { v: fmtDuration(overall.totalSec), l: "Total time", accent: false },
        { v: overall.avgWords, l: "Avg words / answer", accent: false },
        { v: overall.wpm, l: "Words / min", accent: false },
        { v: overall.fillers, l: "Filler words", accent: overall.fillers > overall.questions * 3 },
    ];
    if (evaluation && typeof evaluation.overall_score === "number") {
        stats.unshift({ v: evaluation.overall_score.toFixed(1), l: "Overall score", accent: true });
    }
    root.querySelector("#overall-stats").innerHTML = stats.map((s) => `
        <div class="stat">
            <span class="stat-value ${s.accent ? "accent" : ""}">${s.v}</span>
            <span class="stat-label">${s.l}</span>
        </div>`).join("");

    // ---- AI summary
    const sumEl = root.querySelector("#ai-summary");
    if (evaluation && evaluation.summary) {
        sumEl.hidden = false;
        const strengths = (evaluation.strengths || []).map((x) => `<li>${esc(x)}</li>`).join("");
        const improvements = (evaluation.improvements || []).map((x) => `<li>${esc(x)}</li>`).join("");
        sumEl.innerHTML = `
            <h4>Interviewer's read</h4>
            <p>${esc(evaluation.summary)}</p>
            <div class="ai-cols">
                <div><h5>What landed</h5><ul class="good">${strengths || "<li>—</li>"}</ul></div>
                <div><h5>Where to sharpen</h5><ul class="grow">${improvements || "<li>—</li>"}</ul></div>
            </div>`;
    } else {
        sumEl.hidden = true;
    }

    // ---- per-question cards
    const perEval = (evaluation && evaluation.items) || [];
    root.querySelector("#qa-list").innerHTML = per.map((r, i) => {
        const m = r.metrics;
        const ev = perEval[i];
        const scoreHtml = ev && typeof ev.score === "number"
            ? `<span class="qa-score ${scoreClass(ev.score)}">${ev.score.toFixed(1)}<span style="font-size:.7rem;opacity:.5">/10</span></span>`
            : "";
        const fb = ev && ev.feedback ? `<div class="qa-feedback">${esc(ev.feedback)}</div>` : "";
        const answer = m.answered
            ? `<div class="qa-answer">${esc(r.answer)}</div>`
            : `<div class="qa-answer empty">No spoken answer captured.</div>`;
        return `
            <div class="qa-card" style="animation-delay:${i * 60}ms">
                <div class="qa-top">
                    <div class="qa-q">${esc(r.question)}</div>
                    ${scoreHtml}
                </div>
                ${answer}
                <div class="qa-metrics">
                    <span><b>${m.wordCount}</b> words</span>
                    <span><b>${fmtDuration(m.durationSec)}</b> spoken</span>
                    <span><b>${m.wpm}</b> wpm</span>
                    <span><b>${m.fillers}</b> fillers</span>
                </div>
                ${fb}
            </div>`;
    }).join("");
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function toTranscript(config, data, evaluation) {
    const lines = [
        `GLAMIS Avatar Mock Interview — transcript`,
        `Candidate: ${config.name}`,
        `Role: ${config.role}`,
        `Type: ${STUDIO.TYPE_LABELS[config.type]} (${config.difficulty})`,
        `Date: ${new Date().toLocaleString()}`,
        ``,
    ];
    data.per.forEach((r, i) => {
        lines.push(`Q${i + 1}. ${r.question}`);
        lines.push(`A: ${r.answer || "(no answer)"}`);
        const ev = evaluation && evaluation.items && evaluation.items[i];
        if (ev) lines.push(`Score: ${ev.score}/10 — ${ev.feedback}`);
        lines.push(`[${r.metrics.wordCount} words · ${r.metrics.wpm} wpm · ${r.metrics.fillers} fillers]`);
        lines.push("");
    });
    if (evaluation && evaluation.summary) {
        lines.push(`Overall: ${evaluation.overall_score}/10`);
        lines.push(evaluation.summary);
    }
    return lines.join("\n");
}

export const Report = { compute, fromAgent, render, toTranscript };
