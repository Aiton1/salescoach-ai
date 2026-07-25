import httpx
import time

base = "https://salescoach-ai-pspy.onrender.com"

r = httpx.post(f"{base}/api/v1/calls/analyze-text", json={
    "transcription": "Vendedor: Buenos dias, soy Carlos de TechSolutions. Cliente: Hola. Vendedor: Le ofrezco nuestro software de gestion que reduce costos un 30%. Cliente: Suena bien pero es caro. Vendedor: Tenemos desde 200 dolares. Cliente: Mandeme info por email. Vendedor: Perfecto.",
    "client_name": "Juan Perez",
    "title": "TechSolutions - Juan Perez"
}, timeout=30)
print("Status:", r.status_code)
if r.status_code != 200:
    print("Error:", r.text[:500])
    exit()

data = r.json()
cid = data["id"]
print(f"Call ID: {cid}")

for i in range(20):
    time.sleep(10)
    r2 = httpx.get(f"{base}/api/v1/calls/{cid}", timeout=15)
    sd = r2.json()
    st = sd.get("status", "?")
    tx = sd.get("progress_text", "")[:80]
    print(f"Poll {i+1}: {st} - {tx}")
    if st == "completed":
        r3 = httpx.get(f"{base}/api/v1/analyses/{cid}", timeout=15)
        a = r3.json()
        print(f"\n=== ANALYSIS RESULT ===")
        print(f"Score: {a.get('overall_score')}")
        print(f"Closing: {a.get('closing_probability')}%")
        print(f"Summary: {a.get('summary', '')[:300]}")
        print(f"Strengths: {a.get('strengths', [])}")
        print(f"Errors: {a.get('errors', [])}")
        print(f"Recommendations: {a.get('recommendations', [])}")
        print(f"Timeline events: {len(a.get('timeline', []))}")
        print("SUCCESS!")
        break
    if st == "error":
        print(f"FAILED: {tx}")
        break
