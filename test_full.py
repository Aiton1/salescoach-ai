import httpx

base = "https://salescoach-ai-pspy.onrender.com"

r = httpx.get(f"{base}/api/v1/calls", timeout=15)
calls = r.json()
print(f"Total calls: {len(calls)}")
for c in calls[:5]:
    cid = c["id"][:8]
    st = c["status"]
    pr = c.get("progress", 0)
    tx = c.get("progress_text", "")[:60]
    print(f"  {cid}.. status={st} progress={pr} text={tx}")

# Test Whisper with tiny audio
import io, wave
buf = io.BytesIO()
with wave.open(buf, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(16000)
    wf.writeframes(b"\x00\x00" * 16000)

r2 = httpx.post(
    f"{base}/api/v1/calls/upload",
    files={"audio": ("test.wav", buf.getvalue(), "audio/wav")},
    data={"client_name": "Test2"},
    timeout=30,
)
print(f"\nUpload: {r2.status_code}")
data = r2.json()
cid = data.get("id", "?")
print(f"Call ID: {cid}")

import time
for i in range(20):
    time.sleep(10)
    r3 = httpx.get(f"{base}/api/v1/calls/{cid}", timeout=15)
    sd = r3.json()
    st = sd.get("status", "?")
    pr = sd.get("progress", 0)
    tx = sd.get("progress_text", "")[:80]
    print(f"Poll {i+1}: status={st} progress={pr} text={tx}")
    if st in ("completed", "error"):
        if st == "completed":
            r4 = httpx.get(f"{base}/api/v1/analyses/{cid}", timeout=15)
            if r4.status_code == 200:
                a = r4.json()
                print(f"  SCORE: {a.get('overall_score')}")
                print(f"  SUMMARY: {a.get('summary', '')[:200]}")
            else:
                print(f"  Analysis fetch failed: {r4.status_code}")
        break
