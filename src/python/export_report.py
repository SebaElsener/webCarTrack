#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from pathlib import Path
from openpyxl import Workbook
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Font, Alignment

if len(sys.argv) < 3:
    print("Uso: python export_report.py <output_path_base_sin_ext> <json_datos>")
    sys.exit(1)

output_base = Path(sys.argv[1])
input_json = sys.argv[2]
output_base.parent.mkdir(parents=True, exist_ok=True)

payload = json.loads(input_json)
datos_tabla = payload.get("datos", [])
top_areas = payload.get("topAreas", [])
top_averias = payload.get("topAverias", [])
evolucion = payload.get("evolucion", [])

# ----------------------------
# Crear libro y hoja de datos
# ----------------------------
wb = Workbook()
ws_data = wb.active
ws_data.title = "Datos"

bold = Font(bold=True)
center = Alignment(horizontal="center")

# Hoja de datos como tabla filtrable
headers = ["Fecha", "Marca", "Modelo", "VIN", "Área", "Avería"]
ws_data.append(headers)
for d in datos_tabla:
    ws_data.append([
        d.get("fecha", ""),
        d.get("marca", ""),
        d.get("modelo", ""),
        d.get("vin", ""),
        d.get("areas", ""),
        d.get("averias", "")
    ])

tab = Table(displayName="TablaDatos", ref=f"A1:F{len(datos_tabla)+1}")
style = TableStyleInfo(
    name="TableStyleMedium9",
    showRowStripes=True,
    showColumnStripes=False  # opcional
)
tab.tableStyleInfo = style
ws_data.add_table(tab)

# ----------------------------
# Top Áreas
# ----------------------------
ws_areas = wb.create_sheet("Top Áreas")
ws_areas.append(["Área", "Casos"])
for t in top_areas:
    ws_areas.append([t["label"], t["value"]])

chart = BarChart()
chart.title = "Top Áreas"
chart.y_axis.title = "Casos"
chart.x_axis.title = "Área"
data = Reference(ws_areas, min_col=2, min_row=2, max_row=1+len(top_areas))
cats = Reference(ws_areas, min_col=1, min_row=2, max_row=1+len(top_areas))
chart.add_data(data, titles_from_data=False)
chart.set_categories(cats)
ws_areas.add_chart(chart, "D2")

# ----------------------------
# Top Averías
# ----------------------------
ws_averias = wb.create_sheet("Top Averías")
ws_averias.append(["Avería", "Casos"])
for t in top_averias:
    ws_averias.append([t["label"], t["value"]])

chart2 = BarChart()
chart2.title = "Top Averías"
chart2.y_axis.title = "Casos"
chart2.x_axis.title = "Avería"
data2 = Reference(ws_averias, min_col=2, min_row=2, max_row=1+len(top_averias))
cats2 = Reference(ws_averias, min_col=1, min_row=2, max_row=1+len(top_averias))
chart2.add_data(data2, titles_from_data=False)
chart2.set_categories(cats2)
ws_averias.add_chart(chart2, "D2")

# ----------------------------
# Evolución daños
# ----------------------------
ws_evo = wb.create_sheet("Evolución")
ws_evo.append(["Fecha", "Casos"])
for t in evolucion:
    ws_evo.append([t["fecha"], t["value"]])

chart3 = BarChart()
chart3.title = "Evolución de daños"
chart3.y_axis.title = "Casos"
chart3.x_axis.title = "Fecha"
data3 = Reference(ws_evo, min_col=2, min_row=2, max_row=1+len(evolucion))
cats3 = Reference(ws_evo, min_col=1, min_row=2, max_row=1+len(evolucion))
chart3.add_data(data3, titles_from_data=False)
chart3.set_categories(cats3)
ws_evo.add_chart(chart3, "D2")

# ----------------------------
# Guardar archivo Excel
# ----------------------------
excel_path = output_base.with_suffix(".xlsx")
wb.save(excel_path)
print(f"Excel listo para abrir y refrescar pivots en {excel_path}")
