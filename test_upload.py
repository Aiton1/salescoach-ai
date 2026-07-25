import httpx
import time
import io
import wave

base = "https://salescoach-ai-pspy.onrender.com"

# Create a minimal valid WAV file (0.5 seconds of silence)
buf = io.BytesIO()
with wave.open(buf, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(16000)
    wf.writeframes(b"\x00\x00" * 8000)
audio_bytes = buf.getvalue()

print(f"Audio size: {len(audio_bytes)} bytes")

# Upload
r = httpx.post(
    f"{base}/api/v1/calls/upload",
    files={"audio": ("test.wav", audio_bytes, "audio/wav")},
    data={"client_name": "Test Client"},
    timeout=30,
)
print(f"Upload status: {r.status_code}")
print(f"Upload headers: {dict(r.headers)}")
data = r.json()
print(f"Upload response: {data}")
call_id = data.get("id")

if call_id:
    for i in range(40):
        time.sleep(5)
        r2 = httpx.get(f"{base}/api/v1/calls/{call_id}", timeout=30)
        sd = r2.json()
        st = sd.get("status", "?")
        pr = sd.get("progress", 0)
        tx = sd.get("progress_text", "")[:100]
        print(f"Poll {i+1}: status={st} progress={pr} text={tx}")

        if st == "completed":
            r3 = httpx.get(f"{base}/api/v1/analyses/{call_id}", timeout=30)
            if r3.status_code == 200:
                a = r3.json()
                print(f"SCORE: {a.get('overall_score')}")
                print(f"SUMMARY: {a.get('summary', '')[:300]}")
            else:
                print(f"Analysis fetch failed: {r3.status_code} {r3.text[:200]}")
            break
        elif st == "error":
            print(f"PROCESSING ERROR: {tx}")
            break
else:
    print("No call_id returned!")
