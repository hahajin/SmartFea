# app_ollama.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import re

# -------------------------
# Basic Flask setup
# -------------------------
app = Flask(__name__)
CORS(app)

# Defaults: point at local Ollama and use the small qwen2 model
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
MODEL_NAME = os.environ.get("OLLAMA_MODEL", "qwen2:0.5b-instruct")

def build_prompt(user_text: str) -> str:
    # System-style instructions embedded in the prompt
    return f"""你是一个结构工程建模助手。请把用户的自然语言描述转换为一个 JSON，对应下面的精确结构；严格只返回 JSON：
{{
  "type": "truss",
  "span": <number, 单位米>,
  "height": <number, 单位米>,
  "material": <"steel" 或 "concrete" 等>,
  "nodes": [
    {{"id": <int>, "x": <number>, "y": <number>, "z": <number>}},
    ...
  ],
  "elements": [
    {{"id": <int>, "from": <node id>, "to": <node id>}},
    ...
  ],
  "supports": [
    {{"node": <node id>, "type": <"pin" 或 "roller" 等>}},
    ...
  ],
  "loads": [
    {{"node": <node id>, "fx": <number>, "fy": <number>, "fz": <number>}},
    ...
  ]
}}

严格规则：
- 仅输出 JSON，不要任何解释或额外文本。
- 若用户未给出某项，按合理工程默认：type="truss"；material="steel"；span=18；height=3；
  nodes/elements/supports/loads 可为空数组([])但必须存在。
- 数值必须是 number 而非字符串；id 使用正整数。
- elements 的键必须是 "from" 与 "to"（保持小写）。

用户描述：{user_text}
"""

def call_ollama(prompt: str) -> dict:
    """Call local Ollama with JSON format enforced. Returns parsed dict or raises."""
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {"temperature": 0}
    }
    r = requests.post(url, json=payload, timeout=120)
    r.raise_for_status()
    data = r.json()

    # Ollama's response shape can vary across versions; try a few fields.
    raw = ""
    if isinstance(data, dict):
        raw = data.get("response") or data.get("output") or data.get("text") or ""
        if (not raw) and "results" in data and isinstance(data["results"], list) and data["results"]:
            first = data["results"][0]
            raw = first.get("response") or first.get("output") or first.get("content") or ""
    if not isinstance(raw, str):
        raw = str(raw)
    raw = raw.strip()

    # First, try loading directly
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # attempt to extract a JSON substring from model text (best-effort)
        m = re.search(r'(\{.*\}|\[.*\])', raw, re.S)
        if m:
            return json.loads(m.group(1))
        # If all fails, raise with helpful info
        raise json.JSONDecodeError(f"Could not parse JSON from model response: {raw}", raw, 0)

def validate_and_fill(d: dict) -> dict:
    """Light validation and default filling to guarantee the target schema."""
    if not isinstance(d, dict):
        d = {}

    d.setdefault("type", "truss")
    d.setdefault("span", 18)
    d.setdefault("height", 3)
    d.setdefault("material", "steel")
    d.setdefault("nodes", [])
    d.setdefault("elements", [])
    d.setdefault("supports", [])
    d.setdefault("loads", [])

    # Ensure types
    if not isinstance(d.get("type"), str):
        d["type"] = "truss"

    for key in ("span", "height"):
        try:
            d[key] = float(d.get(key, 18 if key == "span" else 3))
        except Exception:
            d[key] = 18.0 if key == "span" else 3.0

    if not isinstance(d.get("material"), str):
        d["material"] = "steel"

    def ensure_list(v):
        return v if isinstance(v, list) else []

    d["nodes"] = ensure_list(d["nodes"])
    d["elements"] = ensure_list(d["elements"])
    d["supports"] = ensure_list(d["supports"])
    d["loads"] = ensure_list(d["loads"])

    # Clean nodes
    clean_nodes = []
    for n in d["nodes"]:
        if not isinstance(n, dict):
            continue
        try:
            nid = int(n.get("id"))
            x = float(n.get("x", 0))
            y = float(n.get("y", 0))
            z = float(n.get("z", 0))
            clean_nodes.append({"id": nid, "x": x, "y": y, "z": z})
        except Exception:
            continue
    d["nodes"] = clean_nodes

    # Clean elements
    clean_elements = []
    for e in d["elements"]:
        if not isinstance(e, dict):
            continue
        try:
            eid = int(e.get("id"))
            nfrom = int(e.get("from"))
            nto = int(e.get("to"))
            clean_elements.append({"id": eid, "from": nfrom, "to": nto})
        except Exception:
            continue
    d["elements"] = clean_elements

    # Supports
    clean_supports = []
    for s in d["supports"]:
        if not isinstance(s, dict):
            continue
        try:
            node = int(s.get("node"))
            stype = str(s.get("type", "pin"))
            if stype not in ("pin", "roller", "fixed", "guide"):
                stype = "pin"
            clean_supports.append({"node": node, "type": stype})
        except Exception:
            continue
    d["supports"] = clean_supports

    # Loads
    clean_loads = []
    for ld in d["loads"]:
        if not isinstance(ld, dict):
            continue
        try:
            node = int(ld.get("node"))
            fx = float(ld.get("fx", 0))
            fy = float(ld.get("fy", 0))
            fz = float(ld.get("fz", 0))
            clean_loads.append({"node": node, "fx": fx, "fy": fy, "fz": fz})
        except Exception:
            continue
    d["loads"] = clean_loads

    return d

@app.route("/api/health", methods=["GET"])
def health():
    # quick probe to see if Ollama is reachable
    try:
        url = f"{OLLAMA_HOST}/api/tags"
        r = requests.get(url, timeout=5)
        ok = r.status_code == 200
        return jsonify({"ok": ok, "ollama": ok})
    except Exception as e:
        return jsonify({"ok": False, "ollama": False, "error": str(e)}), 503

@app.route("/api/parse", methods=["POST"])
def parse():
    data = request.get_json(force=True, silent=True) or {}
    message = data.get("message") or ""
    if not message or not str(message).strip():
        return jsonify({"error": "message is required"}), 400

    try:
        prompt = build_prompt(message)
        parsed = call_ollama(prompt)
        result = validate_and_fill(parsed)
        return jsonify({"structured": result})
    except requests.exceptions.RequestException as http_err:
        return jsonify({"error": "Failed to contact Ollama. Is it running?", "detail": str(http_err)}), 503
    except json.JSONDecodeError as je:
        return jsonify({"error": "Model did not return valid JSON", "detail": str(je)}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print(f"Using Ollama at {OLLAMA_HOST}, model={MODEL_NAME}")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
