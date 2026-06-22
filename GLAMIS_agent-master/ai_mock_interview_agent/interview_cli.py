#!/usr/bin/env python3
"""
Interactive terminal client for the AI Mock Interview Agent.

Runs a real interview from your terminal: the agent asks a question, you type
your answer, and it shows the live evaluation (scores + feedback), the adapted
difficulty, follow-ups, and a final report - all from the multi-agent pipeline.

Run (from this folder):
    ./.venv/Scripts/python.exe interview_cli.py
The agent must be running. Override its URL with the AGENT_URL env var
(default http://127.0.0.1:8010).
"""
import json
import os
import sys
import urllib.request
import urllib.error

# Force UTF-8 output and enable ANSI colors on Windows consoles.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
try:
    os.system("")
except Exception:
    pass

BASE = os.environ.get("AGENT_URL", "http://127.0.0.1:8010").rstrip("/") + "/api/v1"


def c(code, s): return f"\033[{code}m{s}\033[0m"
def BOLD(s): return c("1", s)
def GREEN(s): return c("32", s)
def YELLOW(s): return c("33", s)
def CYAN(s): return c("36", s)
def RED(s): return c("31", s)
def DIM(s): return c("2", s)
def rule(): print(DIM("-" * 70))


def api(path, payload=None, method=None, timeout=120):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        BASE + path, data=data, method=method or ("POST" if data else "GET"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read() or "{}")
    except urllib.error.HTTPError as e:
        print(RED(f"\n[agent error {e.code}] {e.read().decode(errors='replace')[:300]}"))
        sys.exit(1)
    except Exception as e:
        print(RED(f"\n[cannot reach agent at {BASE}] {e}"))
        print(DIM("Is the agent running? Start it with: uvicorn main:app --port 8010"))
        sys.exit(1)


def ask(prompt, default):
    val = input(f"{prompt} [{default}]: ").strip()
    return val or default


def score_color(n):
    try:
        n = float(n)
    except (TypeError, ValueError):
        return str(n)
    s = f"{n:g}/10"
    return GREEN(s) if n >= 7 else (YELLOW(s) if n >= 5 else RED(s))


def show_eval(ev):
    print("  " + BOLD("score: ") + score_color(ev.get("overall_score")) +
          DIM(f"   (tech {ev.get('technical_score')} | comm {ev.get('communication_score')} | "
              f"rel {ev.get('relevance_score')} | problem {ev.get('problem_solving_score')} | "
              f"complete {ev.get('completeness_score')})"))
    fb = (ev.get("feedback") or "").strip()
    if fb:
        print("  " + BOLD("feedback: ") + fb)
    for s in ev.get("strengths") or []:
        print("  " + GREEN("+ ") + s)
    for w in ev.get("weaknesses") or []:
        print("  " + YELLOW("- ") + w)


def main():
    print(BOLD(CYAN("\n=== AI Mock Interview (terminal) ===")))
    print(DIM(f"agent: {BASE}\n"))
    name = ask("Your name", "Candidate")
    role = ask("Target role", "Software Engineer")
    itype = ask("Type (technical/behavioral/dsa/system-design/verbal)", "technical")
    diff = ask("Difficulty (easy/medium/hard)", "medium")
    try:
        count = int(ask("How many questions", "5"))
    except ValueError:
        count = 5
    print(DIM("\n(Type your answer and press Enter. Commands: 'skip', 'quit')\n"))

    s = api("/start-interview", {
        "candidate_name": name, "role": role, "experience": "0-2 years",
        "skills": [], "interview_type": itype, "difficulty": diff,
    })
    sid = s["session_id"]
    question = s["first_question"]

    turn = 0
    while True:
        turn += 1
        rule()
        print(BOLD(CYAN(f"Q{turn}/{count}: ")) + question)
        try:
            answer = input(BOLD("you> ")).strip()
        except (EOFError, KeyboardInterrupt):
            print("\n" + DIM("ending early...")); break
        if answer.lower() in ("quit", "exit", "/quit"):
            print(DIM("ending early...")); break
        if answer.lower() in ("skip", "/skip"):
            answer = ""

        print(DIM("  ...thinking (agents evaluating)..."))
        r = api("/submit-answer", {"session_id": sid, "answer": answer or "(No answer provided.)"})
        show_eval(r.get("evaluation", {}))
        followup = (r.get("evaluation") or {}).get("follow_up_needed")
        print("  " + BOLD("difficulty: ") + str(r.get("difficulty", "?")) +
              (DIM("   (next is a follow-up)") if followup else ""))

        if r.get("interview_complete") or turn >= count:
            break
        question = r.get("next_question") or ""
        if not question:
            break

    rule()
    print(BOLD(CYAN("Generating final report (ReportGeneratorAgent)...")))
    rep = api(f"/interview-report/{sid}").get("report", {})
    print(BOLD("\n===== REPORT ====="))
    print("overall: " + score_color(rep.get("overall_score")) +
          DIM(f"   (tech {rep.get('technical_score')} | comm {rep.get('communication_score')} | "
              f"problem {rep.get('problem_solving_score')})"))
    if rep.get("interview_outcome"):
        print("outcome: " + BOLD(str(rep["interview_outcome"])))
    if rep.get("summary"):
        print("summary: " + rep["summary"])
    if rep.get("strengths"):
        print(GREEN("strengths:"))
        for x in rep["strengths"]:
            print("  + " + x)
    if rep.get("weaknesses"):
        print(YELLOW("to improve:"))
        for x in rep["weaknesses"]:
            print("  - " + x)
    if rep.get("recommendations"):
        print(CYAN("recommendations:"))
        for x in rep["recommendations"]:
            print("  > " + x)
    print()


if __name__ == "__main__":
    main()
