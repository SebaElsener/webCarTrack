# scripts/export_cartaporte.py
import sys
import json
from openpyxl import load_workbook
from pathlib import Path
from datetime import date
import barcode
from barcode.writer import ImageWriter
from pathlib import Path
from openpyxl.drawing.image import Image
from openpyxl.drawing.spreadsheet_drawing import OneCellAnchor, AnchorMarker, XDRPositiveSize2D
from openpyxl.utils import column_index_from_string
from openpyxl.styles import Alignment
import os

# Helper generar barcode
def generar_barcode_code39(valor, output_dir):
    """
    Genera un barcode Code39 como PNG
    Devuelve el path del archivo generado
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    barcode_value = str(valor)

    # ✔️ Code39 NO usa checksum por defecto
    Code39 = barcode.get_barcode_class("code39")

    code39 = Code39(
        barcode_value,
        writer=ImageWriter(),
        add_checksum=False
    )

    file_path = output_dir / "barcode_cartaporte"

    filename = code39.save(
        str(file_path),
        {
            "module_width": 0.6,
            "module_height": 15,
            "quiet_zone": 2,
            "font_size": 10,
            "text_distance": 5,
            "write_text": True
        }
    )

    return filename

#  Func para centrar imagen en un merge de celdas
EMU_PER_PX = 9525
PX_PER_POINT = 96 / 72  # conversión puntos → px

def insertar_imagen_centrada_vertical(ws, img_path, cell, max_height_px=28):
    img = Image(img_path)

    col_letter = "".join(filter(str.isalpha, cell))
    row = int("".join(filter(str.isdigit, cell)))
    col = column_index_from_string(col_letter)

    row_dim = ws.row_dimensions[row]
    row_height_pt = row_dim.height or 15
    row_height_px = row_height_pt * PX_PER_POINT

    scale = min(1.2, max_height_px / img.height)
    img.width = int(img.width * scale)
    img.height = int(img.height * scale)

    offset_y_px = int((row_height_px - img.height) / 2)
    offset_y_px += 0     # ↓ subir / bajar

    offset_x_px = 22      # ← → mover horizontal

    marker = AnchorMarker(
        col=col - 1,
        row=row - 1,
        colOff=offset_x_px * EMU_PER_PX,
        rowOff=offset_y_px * EMU_PER_PX
    )

    size = XDRPositiveSize2D(
        cx=img.width * EMU_PER_PX,
        cy=img.height * EMU_PER_PX
    )

    img.anchor = OneCellAnchor(_from=marker, ext=size)
    ws.add_image(img)


def generar_carta_porte(plantilla_path, output_path, datos):
    wb = load_workbook(plantilla_path)

    ws_cartaporte = wb["carta_porte"]
    ws_cartaporte.sheet_view.zoomScale = 97
    # Centrar en la hoja
    ws_cartaporte.print_options.horizontalCentered = True
    ws_cartaporte.print_options.verticalCentered = True
    ws_cartaporte.page_setup.paperSize = ws_cartaporte.PAPERSIZE_A4
    ws_cartaporte.page_setup.orientation = ws_cartaporte.ORIENTATION_PORTRAIT

    # Ajustar a una página
    ws_cartaporte.page_setup.fitToWidth = 1
    ws_cartaporte.page_setup.fitToHeight = False

    # Márgenes razonables
    # ws_cartaporte.page_margins.left = 0.3
    # ws_cartaporte.page_margins.right = 0.3
    # ws_cartaporte.page_margins.top = 0
    # ws_cartaporte.page_margins.bottom = 0

    ws_cartaporte["Z3"]  = datos["cartaPorte"]
    ws_cartaporte["AC5"] = datos["fecha_cartaporte"]

    ws_cartaporte["A10"]  = datos["cliente"]
    ws_cartaporte["V10"]  = datos["cuit_cliente"]
    ws_cartaporte["AC10"] = datos["cod_cliente"]

    ws_cartaporte["A12"]  = datos["origen"]
    ws_cartaporte["K12"]  = datos["dir_origen"]
    ws_cartaporte["AC12"] = datos["cuit_origen"]

    ws_cartaporte["A14"]  = datos["destino"]
    ws_cartaporte["K14"]  = datos["dir_destino"]
    ws_cartaporte["AC14"] = datos["cuit_destino"]

    ws_cartaporte["A16"] = datos["modelo"]
    ws_cartaporte["I16"] = datos["vin"]
    ws_cartaporte["V16"] = datos["fechaRemito"]

    ws_cartaporte["T17"] = datos["batea"]

    barcode_path = generar_barcode_code39(
        datos["vin"],
        output_dir="tmp/barcodes"
    )

    insertar_imagen_centrada_vertical(
        ws=wb["carta_porte"],
        img_path=barcode_path,
        cell="A17",
        max_height_px=35
    )  

    # =========================
    # DAMAGES
    # =========================
    raw_damages = datos.get("damages", "")

    # soportar string o array
    if isinstance(raw_damages, list):
        raw_damages = raw_damages[0] if raw_damages else ""

    # separar daños
    damages_list = [d.strip() for d in raw_damages.split("///") if d.strip()]

    MAX_VISIBLE = 7  # 👈 ajustá según tu plantilla

    visible = damages_list[:MAX_VISIBLE]

    if len(damages_list) > MAX_VISIBLE:
        visible.append("… (hay más daños, consultar)")

    damages_text = "\n".join(visible)

    ws_cartaporte["A68"].value = damages_text
    ws_cartaporte["A68"].alignment = Alignment(
        wrap_text=True,
        vertical="top"
)

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.properties.calcMode = "auto"
    wb.properties.fullCalcOnLoad = True

    wb.save(output_path)

    print(f"OK:{output_path}")

    try:
        os.remove(barcode_path)
    except Exception as e:
        print("No se pudo borrar barcode temporal:", e)

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
