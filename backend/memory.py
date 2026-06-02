from typing import Dict, List, Any

_sessions: Dict[str, List[dict]] = {}
_orders: Dict[str, List[dict]] = {}


def get_history(session_id: str) -> List[dict]:
    return list(_sessions.get(session_id, []))


def add_user(session_id: str, content: str) -> None:
    _sessions.setdefault(session_id, []).append({"role": "user", "content": content})


def add_assistant(session_id: str, content: str) -> None:
    _sessions.setdefault(session_id, []).append({"role": "assistant", "content": content})


def update_order(session_id: str, order_details: str, confirmation: str) -> None:
    _orders.setdefault(session_id, []).append({
        "order_details": order_details,
        "confirmation": confirmation,
    })


def get_orders(session_id: str) -> List[dict]:
    return list(_orders.get(session_id, []))


def clear_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
    _orders.pop(session_id, None)
