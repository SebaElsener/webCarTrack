# scripts/export_cartaporte.py
import sys
import json
from openpyxl import load_workbook
from pathlib import Path
from datetime import date

# (tu función tal cual la tenés)
def generar_carta_porte(plantilla_path, output_path, datos):
    wb = load_workbook(plantilla_path)

    ws_header = wb["header"]
    ws_footer = wb["footer"]

    ws_header["Z3"]  = datos["cartaPorte"]
    ws_header["AD5"] = datos["fecha_cartaporte"]

    ws_header["A10"]  = datos["cliente"]
    ws_header["V10"]  = datos["cuit_cliente"]
    ws_header["AC10"] = datos["cod_cliente"]

    ws_header["A12"]  = datos["origen"]
    ws_header["K12"]  = datos["dir_origen"]
    ws_header["AC12"] = datos["cuit_origen"]

    ws_header["A14"]  = datos["destino"]
    ws_header["K14"]  = datos["dir_destino"]
    ws_header["AC14"] = datos["cuit_destino"]

    ws_header["A16"] = datos["modelo"]
    ws_header["I16"] = datos["vin"]
    ws_header["V16"] = datos["fechaRemito"]

    ws_header["T18"] = datos["batea"]

    # =========================
    # FOOTER – DAMAGES
    # =========================

    damages = datos.get("damages", "")

    # soportar string o array
    if isinstance(damages, list):
        damages_text = damages[0] if damages else ""
    else:
        damages_text = damages

    # 👉 escribir SOLO en la celda superior izquierda del merge
    ws_footer["A2"].value = damages_text


    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)

    print(f"OK:{output_path}")


# =========================
# ENTRYPOINT PARA NODE
# =========================
if __name__ == "__main__":
    plantilla_path = sys.argv[1]
    output_path = sys.argv[2]
    datos = json.loads(sys.argv[3])

    generar_carta_porte(
        plantilla_path=plantilla_path,
        output_path=output_path,
        datos=datos,
    )
