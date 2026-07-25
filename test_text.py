import httpx
import time

base = "https://salescoach-ai-pspy.onrender.com"

r = httpx.post(f"{base}/api/v1/calls/analyze-text", json={
    "transcription": "Vendedor: Buenos dias, hablo con el gerente de compras? Cliente: Si, habla Juan Perez. Vendedor: Me llamo Carlos de TechSolutions, le llamo para presentar nuestra solucion de software de gestion de inventarios que puede reducir sus costos operativos en un 30%. Cliente: Interesante, cuente mas. Vendedor: Nuestra plataforma integra todos sus procesos en un solo sistema. Cliente: Cuanto cuesta? Vendedor: El plan empresarial cuesta 500 dolares al mes. Cliente: Es muy caro, no tenemos ese presupuesto. Vendedor: Entiendo, podemos ajustar el plan. Cliente: Mandenme una propuesta por email. Vendedor: Perfecto, se la envio hoy mismo.",
    "client_name": "Juan Perez",
    "title": "TechSolutions - Juan Perez"
}, timeout=30)
print(f"Status: {r.status_code}")
data = r.json()
cid = data.get("id")
print(f"Call ID: {cid}")

for i in range(30):
    time.sleep(10)
    r2 = httpx.get(f"{base}/api/v1/calls/{cid}", timeout=15)
    sd = r2.json()
    st = sd.get("status", "?")
    tx = sd.get("progress_text", "")[:80]
    print(f"Poll {i+1}: {st} - {tx}")
    if st in ("completed", "error"):
        if st == "completed":
            r3 = httpx.get(f"{base}/api/v1/analyses/{cid}", timeout=15)
            if r3.status_code == 200:
                a = r3.json()
                print(f"Score: {a.get('overall_score')}")
                print(f"Summary: {a.get('summary', '')[:200]}")
                print(f"Strengths: {a.get('strengths', [])}")
                print(f"Errors: {a.get('errors', [])}")
                print(f"Recommendations: {a.get('recommendations', [])}")
                print("SUCCESS!")
            else:
                print(f"Analysis fetch failed: {r3.status_code}")
        else:
            print(f"ERROR: {tx}")
        break
