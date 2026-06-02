"""
Two-stage PG-13 moderation pipeline:

Stage 1a — Local word list   : instant, zero cost
Stage 1b — OpenAI Moderation : low-latency, catches serious violations with
                               custom lower thresholds for PG-13
Stage 2  — GPT-4o-mini LLM   : semantic filter for edge-cases that slip through
                               word lists; only runs when Stage 1 passes

Returns the error string to show the user, or None if the message is clean.
"""

import hashlib
import re
from openai import AsyncOpenAI

_client: AsyncOpenAI | None = None

# Stage 1 block message (word-list / OpenAI API catch)
_ERROR_STAGE1 = "Sorry, I can only help with food orders and menu questions. Please keep it friendly!"

# Stage 2 block message (LLM semantic catch)
_ERROR_STAGE2 = (
    "Sorry, let's keep our conversation food-focused and family-friendly! "
    "How can I help you with our menu today?"
)

# ── Stage 1a: profanity / sexual keyword list ─────────────────────────────────

_PROFANITY: set[str] = {
    # Strong profanity
    "fuck", "fucker", "fuckers", "fucking", "fucked", "fucks",
    "shit", "shitting", "bullshit", "shits", "shitty",
    "cunt", "cunts",
    "cock", "cocks",
    "dick", "dicks",
    "pussy", "pussies",
    "asshole", "assholes",
    "bitch", "bitches", "bitching",
    "bastard", "bastards",
    "whore", "whores",
    "slut", "sluts",
    "nigger", "niggers", "nigga", "niggas",
    "faggot", "faggots", "fag", "fags",
    "retard", "retards", "retarded",
    "motherfucker", "motherfuckers",
    "jackass", "jackasses",
    "dipshit", "dipshits",
    "douchebag", "douchebags",
    "prick", "pricks",
    "twat", "twats",
    "wanker", "wankers",
    # Sexual language — PG-13 block
    "sex", "sexy", "sexual",
    "nude", "naked", "nudity",
    "porn", "pornography", "pornographic",
    "erotic", "erotica",
    "horny", "aroused",
    "orgasm", "orgasms",
    "masturbate", "masturbation",
    "boobs", "boob", "tits", "tit",
    "penis", "vagina", "vulva",
    "dildo", "vibrator",
    "fetish", "kinky",
}

_PROFANITY_RE = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in _PROFANITY) + r")\b",
    re.IGNORECASE,
)

# ── Stage 2: GPT-4o-mini LLM filter ──────────────────────────────────────────

_PG13_SYSTEM = """\
You are a content moderator for a family-friendly restaurant chatbot. \
Evaluate if the following message is appropriate for a PG-13 restaurant environment.

Return ONLY one of:
PASS — message is appropriate
BLOCK — message contains inappropriate content

Consider these as BLOCK:
- Profanity or crude language
- Sexual references or innuendo
- Violent or threatening language
- Offensive slurs
- Drug references (alcohol on the menu is fine)

Consider these as PASS:
- Food and menu questions
- Ordering requests
- Allergen and dietary questions
- General restaurant questions
- Polite conversation\
"""

# Simple FIFO cache: md5(normalised_text) → bool (True = block)
_cache: dict[str, bool] = {}
_CACHE_MAX = 500


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI()
    return _client


def _cache_key(text: str) -> str:
    return hashlib.md5(text.lower().strip().encode()).hexdigest()


def _cache_put(key: str, value: bool) -> None:
    if len(_cache) >= _CACHE_MAX:
        del _cache[next(iter(_cache))]   # evict oldest (FIFO)
    _cache[key] = value


# ── Public API ────────────────────────────────────────────────────────────────

async def moderate(text: str) -> str | None:
    """
    Run the two-stage PG-13 pipeline.
    Returns None if the message is clean, or the error string to show the user.
    """

    # ── Stage 1a: local word list (instant) ──────────────────────────────────
    if _PROFANITY_RE.search(text):
        return _ERROR_STAGE1

    # ── Stage 1b: OpenAI Moderation API (custom PG-13 thresholds) ────────────
    try:
        result = await _get_client().moderations.create(input=text)
        r = result.results[0]
        if r.flagged:
            return _ERROR_STAGE1
        s = r.category_scores
        if (
            s.sexual > 0.3
            or s.harassment > 0.5
            or s.hate > 0.4
            or s.violence > 0.6
        ):
            return _ERROR_STAGE1
    except Exception:
        pass

    # ── Stage 2: GPT-4o-mini semantic LLM filter ─────────────────────────────
    key = _cache_key(text)
    if key in _cache:
        return _ERROR_STAGE2 if _cache[key] else None

    try:
        resp = await _get_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _PG13_SYSTEM},
                {"role": "user", "content": text},
            ],
            max_tokens=5,
            temperature=0,
        )
        verdict = (resp.choices[0].message.content or "").strip().upper()
        blocked = verdict.startswith("BLOCK")
    except Exception:
        blocked = False

    _cache_put(key, blocked)
    return _ERROR_STAGE2 if blocked else None


# Backward-compatible alias used by agent.py and tools/order.py
async def is_flagged(text: str) -> bool:
    return await moderate(text) is not None


# Convenience: returns the message to surface to the user, or empty string
MODERATION_ERROR = _ERROR_STAGE1
