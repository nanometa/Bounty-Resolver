# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


def _parse_evaluation(raw: str) -> dict:
    try:
        txt = raw.replace("```json", "").replace("```", "").strip()
        s = txt.find("{")
        e = txt.rfind("}") + 1
        if s >= 0 and e > s:
            txt = txt[s:e]
        obj = json.loads(txt)
        score = int(obj.get("score", 0))
        score = max(0, min(100, score))
        satisfies = bool(obj.get("satisfies", False))
        strengths = obj.get("strengths", [])
        gaps = obj.get("gaps", [])
        if not isinstance(strengths, list):
            strengths = []
        if not isinstance(gaps, list):
            gaps = []
        return {
            "score": score,
            "satisfies": satisfies,
            "feedback": str(obj.get("feedback", ""))[:400],
            "strengths": [str(x)[:120] for x in strengths[:4]],
            "gaps": [str(x)[:120] for x in gaps[:4]],
        }
    except Exception:
        return {
            "score": 0,
            "satisfies": False,
            "feedback": "Could not parse evaluation.",
            "strengths": [],
            "gaps": [],
        }


def _parse_winner(raw: str) -> dict:
    try:
        txt = raw.replace("```json", "").replace("```", "").strip()
        s = txt.find("{")
        e = txt.rfind("}") + 1
        if s >= 0 and e > s:
            txt = txt[s:e]
        obj = json.loads(txt)
        ranking = obj.get("ranking", [])
        if not isinstance(ranking, list):
            ranking = []
        return {
            "winner_sub_id": str(obj.get("winner_sub_id", ""))[:32],
            "winner_address": str(obj.get("winner_address", ""))[:42],
            "reason": str(obj.get("reason", ""))[:400],
            "ranking": ranking[:10],
        }
    except Exception:
        return {
            "winner_sub_id": "",
            "winner_address": "",
            "reason": "Could not parse winner selection.",
            "ranking": [],
        }


class BountyJudge(gl.Contract):
    bounties: TreeMap[str, str]
    submissions: TreeMap[str, str]
    bounty_submissions: TreeMap[str, str]
    scores: TreeMap[str, str]
    winner_points: TreeMap[str, str]
    bounty_count: u32
    submission_count: u32

    def __init__(self):
        self.bounty_count = u32(0)
        self.submission_count = u32(0)

    @gl.public.write
    def create_bounty(self, title: str, description: str, requirements: str, reward_points: int) -> None:
        if not title.strip():
            return
        if not description.strip():
            return
        if not requirements.strip():
            return
        if reward_points <= 0 or reward_points > 10000:
            return

        bounty_id = "bounty-" + str(int(self.bounty_count))
        bounty = {
            "bounty_id": bounty_id,
            "title": str(title).strip()[:120],
            "description": str(description).strip()[:600],
            "requirements": str(requirements).strip()[:400],
            "reward_points": int(reward_points),
            "status": "open",
            "creator": str(gl.message.sender_address),
            "winner": None,
        }
        self.bounties[bounty_id] = json.dumps(bounty, sort_keys=True)
        self.bounty_submissions[bounty_id] = json.dumps([])
        self.bounty_count = u32(int(self.bounty_count) + 1)

    @gl.public.write
    def submit_solution(self, bounty_id: str, solution_url: str, description: str) -> None:
        if bounty_id not in self.bounties:
            return
        bounty = json.loads(self.bounties[bounty_id])
        if bounty["status"] != "open":
            return
        if not solution_url.strip():
            return
        url = str(solution_url).strip()[:300]
        if not url.startswith("http://") and not url.startswith("https://"):
            return
        if str(gl.message.sender_address) == bounty["creator"]:
            return

        sub_id = "sub-" + str(int(self.submission_count))
        submission = {
            "sub_id": sub_id,
            "bounty_id": bounty_id,
            "solution_url": url,
            "description": str(description).strip()[:600],
            "worker": str(gl.message.sender_address),
            "status": "pending",
        }
        self.submissions[sub_id] = json.dumps(submission, sort_keys=True)

        sub_list = json.loads(self.bounty_submissions[bounty_id])
        sub_list.append(sub_id)
        self.bounty_submissions[bounty_id] = json.dumps(sub_list)

        self.submission_count = u32(int(self.submission_count) + 1)

    @gl.public.write
    def evaluate_submission(self, sub_id: str) -> None:
        if sub_id not in self.submissions:
            return
        submission = json.loads(self.submissions[sub_id])
        if submission["status"] == "evaluated":
            return

        bounty = json.loads(self.bounties[submission["bounty_id"]])

        title = bounty["title"]
        reqs = bounty["requirements"]
        sol_url = submission["solution_url"]
        sol_desc = submission["description"]
        parse_fn = _parse_evaluation

        def run_eval():
            schema = '{"score":<0-100>,"satisfies":<true|false>,"feedback":"<2-3 sentences>","strengths":["<s1>","<s2>"],"gaps":["<g1>","<g2>"]}'
            web_content = ""
            try:
                web_content = str(gl.nondet.web.render(sol_url, mode='html'))[:3000]
            except Exception:
                web_content = "ERROR: Could not load the submitted URL."
            prompt = (
                "You are an expert bounty evaluator. "
                "Evaluate whether this solution satisfies the bounty requirements.\n\n"
                "BOUNTY: " + title + "\n"
                "REQUIREMENTS: " + reqs + "\n\n"
                "SOLUTION URL: " + sol_url + "\n"
                "SOLUTION DESCRIPTION: " + sol_desc + "\n\n"
                "WEB CONTENT FROM URL:\n" + web_content + "\n\n"
                "Return ONLY a JSON object. No markdown.\n"
                "Schema:\n" + schema
            )
            llm_raw = gl.nondet.exec_prompt(prompt)
            parsed = parse_fn(llm_raw)
            return json.dumps(parsed, sort_keys=True)

        principle = (
            "Both outputs evaluate the same bounty submission. "
            "They must agree on: "
            "1) score within ±5 points. "
            "2) satisfies must match exactly (true/false). "
            "3) same major strengths and gaps identified."
        )

        result_json = gl.eq_principle.prompt_comparative(run_eval, principle)
        result = json.loads(result_json)
        score = int(result.get("score", 0))

        submission["status"] = "evaluated"
        submission["score"] = score
        submission["satisfies"] = result.get("satisfies", False)
        submission["feedback"] = result.get("feedback", "")
        submission["strengths"] = result.get("strengths", [])
        submission["gaps"] = result.get("gaps", [])

        self.submissions[sub_id] = json.dumps(submission, sort_keys=True)
        self.scores[sub_id] = str(score)

    @gl.public.write
    def close_bounty(self, bounty_id: str) -> None:
        if bounty_id not in self.bounties:
            return
        bounty = json.loads(self.bounties[bounty_id])
        if str(gl.message.sender_address) != bounty["creator"]:
            return
        if bounty["status"] != "open":
            return

        sub_ids = json.loads(self.bounty_submissions[bounty_id])
        evaluated = []
        for s in sub_ids:
            if s in self.submissions:
                sub_data = json.loads(self.submissions[s])
                if sub_data["status"] == "evaluated":
                    evaluated.append(sub_data)

        if not evaluated:
            return

        title = bounty["title"]
        reqs = bounty["requirements"]
        reward_pts = int(bounty["reward_points"])
        parse_fn = _parse_winner
        subs_data = json.dumps(evaluated, sort_keys=True)

        def pick_winner():
            schema = '{"winner_sub_id":"<sub_id>","winner_address":"<address>","reason":"<2-3 sentences>","ranking":[{"sub_id":"...","rank":1,"score":85}]}'
            prompt = (
                "You are an expert bounty judge. "
                "Pick the best submission for this bounty.\n\n"
                "BOUNTY: " + title + "\n"
                "REQUIREMENTS: " + reqs + "\n\n"
                "SUBMISSIONS:\n" + subs_data + "\n\n"
                "Return ONLY a JSON object. No markdown.\n"
                "Schema:\n" + schema
            )
            llm_raw = gl.nondet.exec_prompt(prompt)
            parsed = parse_fn(llm_raw)
            return json.dumps(parsed, sort_keys=True)

        principle = (
            "Both outputs select the winner for the same bounty. "
            "winner_sub_id must be identical. "
            "Same ranking order for top 3 submissions."
        )

        result_json = gl.eq_principle.prompt_comparative(pick_winner, principle)
        result = json.loads(result_json)
        winner_sub = result.get("winner_sub_id", "")
        winner_addr = result.get("winner_address", "")

        bounty["status"] = "closed"
        bounty["winner"] = winner_sub
        bounty["winner_addr"] = winner_addr
        bounty["close_result"] = result
        self.bounties[bounty_id] = json.dumps(bounty, sort_keys=True)

        if winner_addr:
            prev = int(self.winner_points[winner_addr]) if winner_addr in self.winner_points else 0
            self.winner_points[winner_addr] = str(prev + reward_pts)

    @gl.public.view
    def get_bounty(self, bounty_id: str) -> str:
        if bounty_id not in self.bounties:
            return "{}"
        return self.bounties[bounty_id]

    @gl.public.view
    def get_submission(self, sub_id: str) -> str:
        if sub_id not in self.submissions:
            return "{}"
        return self.submissions[sub_id]

    @gl.public.view
    def get_bounty_submissions(self, bounty_id: str) -> str:
        if bounty_id not in self.bounty_submissions:
            return "[]"
        return self.bounty_submissions[bounty_id]

    @gl.public.view
    def get_score(self, sub_id: str) -> str:
        if sub_id not in self.scores:
            return "0"
        return self.scores[sub_id]

    @gl.public.view
    def get_winner_points(self, address: str) -> str:
        if address not in self.winner_points:
            return "0"
        return self.winner_points[address]

    @gl.public.view
    def get_bounty_count(self) -> int:
        return int(self.bounty_count)

    @gl.public.view
    def get_submission_count(self) -> int:
        return int(self.submission_count)
