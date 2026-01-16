#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from pathlib import Path
from datetime import datetime

from openpyxl import Workbook
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.chart import BarChart, Reference, LineChart
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter


# =====================================================
# UTILIDADES
# =====================================================

def agregar_titulo_hoja(ws, ancho_columnas):
    end_col = get_column_letter(ancho_columnas)
    ws.merge_cells(f"A1:{end_col}1")

    cell = ws["A1"]
    cell.value = ws.title
    cell.font = Font(bold=True, size=16)
    cell.alignment = Alignment(horizontal="center", vertical="center")

    ws.row_dimensions[1].height = 36
    ws.row_dimensions[2].height = 8  # ⭐ fila separadora

    ws.print_title_rows = "1:1"
    ws.print_options.horizontalCentered = True


def auto_ajustar_columnas(ws, min_width=10, max_width=50):
    for col in ws.columns:
        max_length = 0
        col_letter = get_column_letter(col[0].column)

        for cell in col:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))

        ws.column_dimensions[col_letter].width = min(
            max(max_length + 2, min_width),
            max_width
        )


def configurar_impresion(ws):
    ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = False
    ws.page_setup.horizontalCentered = True

    ws.page_margins.left = 0.4
    ws.page_margins.right = 0.4
    ws.page_margins.top = 0.5
    ws.page_margins.bottom = 0.5


# =====================================================
# ARGUMENTOS
# =====================================================

if len(sys.argv) < 3:
    print("Uso: python export_report.py <output_path_base> <json_datos>")
    sys.exit(1)

output_base = Path(sys.argv[1])
payload = json.loads(sys.argv[2])
output_base.parent.mkdir(parents=True, exist_ok=True)

datos_tabla = payload.get("datos", [])
top_areas = payload.get("topAreas", [])
top_averias = payload.get("topAverias", [])
evolucion = payload.get("evolucion", [])

wb = Workbook()

# =====================================================
# HOJA DATOS
# =====================================================

ws_data = wb.active
ws_data.title = "Datos"

agregar_titulo_hoja(ws_data, ancho_columnas=6)

headers = ["Fecha", "Marca", "Modelo", "VIN", "Área", "Avería"]
ws_data.append([])            # fila 2 vacía
ws_data.append(headers)       # fila 3

for d in datos_tabla:
    fecha = d.get("fecha")
    try:
        fecha = datetime.fromisoformat(fecha.replace("Z", "")).date()
    except:
        pass

    ws_data.append([
        fecha,
        d.get("marca", ""),
        d.get("modelo", ""),
        d.get("vin", ""),
        d.get("areas", ""),
        d.get("averias", "")
    ])

tab = Table(
    displayName="TablaDatos",
    ref=f"A3:F{ws_data.max_row}"
)

tab.tableStyleInfo = TableStyleInfo(
    name="TableStyleMedium9",
    showRowStripes=True
)

ws_data.add_table(tab)
ws_data.freeze_panes = "A4"

auto_ajustar_columnas(ws_data)
configurar_impresion(ws_data)


# =====================================================
# TOP ÁREAS
# =====================================================

ws_areas = wb.create_sheet("Top Areas")
agregar_titulo_hoja(ws_areas, ancho_columnas=2)

ws_areas.append([])
ws_areas.append(["Área", "Casos"])

for t in top_areas:
    ws_areas.append([t["label"], t["value"]])

auto_ajustar_columnas(ws_areas)
configurar_impresion(ws_areas)


ws_areas_chart = wb.create_sheet("Top Areas - Gráfico")
agregar_titulo_hoja(ws_areas_chart, ancho_columnas=12)

chart = BarChart()
chart.title = "Top 5 Áreas dañadas"
chart.y_axis.title = "Casos"
chart.x_axis.title = "Área"

data = Reference(ws_areas, min_col=2, min_row=4, max_row=ws_areas.max_row)
cats = Reference(ws_areas, min_col=1, min_row=4, max_row=ws_areas.max_row)

chart.add_data(data, titles_from_data=False)
chart.set_categories(cats)
chart.width = 22
chart.height = 12

ws_areas_chart.add_chart(chart, "B3")
configurar_impresion(ws_areas_chart)


# =====================================================
# TOP AVERÍAS
# =====================================================

ws_averias = wb.create_sheet("Top Averías")
agregar_titulo_hoja(ws_averias, ancho_columnas=2)

ws_averias.append([])
ws_averias.append(["Avería", "Casos"])

for t in top_averias:
    ws_averias.append([t["label"], t["value"]])

auto_ajustar_columnas(ws_averias)
configurar_impresion(ws_averias)


ws_averias_chart = wb.create_sheet("Top Averías - Gráfico")
agregar_titulo_hoja(ws_averias_chart, ancho_columnas=12)

chart2 = BarChart()
chart2.title = "Top 5 Averías"
chart2.y_axis.title = "Casos"
chart2.x_axis.title = "Avería"

data2 = Reference(ws_averias, min_col=2, min_row=4, max_row=ws_averias.max_row)
cats2 = Reference(ws_averias, min_col=1, min_row=4, max_row=ws_averias.max_row)

chart2.add_data(data2, titles_from_data=False)
chart2.set_categories(cats2)
chart2.width = 22
chart2.height = 12

ws_averias_chart.add_chart(chart2, "B3")
configurar_impresion(ws_averias_chart)


# =====================================================
# EVOLUCIÓN
# =====================================================

ws_evo = wb.create_sheet("Evolución")
agregar_titulo_hoja(ws_evo, ancho_columnas=2)

ws_evo.append([])
ws_evo.append(["Fecha", "Casos"])

for t in evolucion:
    ws_evo.append([t["fecha"], t["value"]])

auto_ajustar_columnas(ws_evo)
configurar_impresion(ws_evo)


ws_evo_chart = wb.create_sheet("Evolución - Gráfico")
agregar_titulo_hoja(ws_evo_chart, ancho_columnas=12)

chart3 = LineChart()
chart3.title = "Evolución de daños por fecha"
chart3.y_axis.title = "Casos"
chart3.x_axis.title = "Fecha"

data3 = Reference(ws_evo, min_col=2, min_row=4, max_row=ws_evo.max_row)
cats3 = Reference(ws_evo, min_col=1, min_row=4, max_row=ws_evo.max_row)

chart3.add_data(data3, titles_from_data=False)
chart3.set_categories(cats3)
chart3.width = 22
chart3.height = 12

ws_evo_chart.add_chart(chart3, "B3")
configurar_impresion(ws_evo_chart)


# =====================================================
# GUARDAR
# =====================================================

excel_path = output_base.with_suffix(".xlsx")
wb.save(excel_path)

print(f"Excel generado correctamente en: {excel_path}")
