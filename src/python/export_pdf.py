#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet
import matplotlib.pyplot as plt

# ----------------------------
# Argumentos desde Node.js
# ----------------------------
if len(sys.argv) < 3:
    print("Uso: python export_report.py <output_path> <json_datos>")
    sys.exit(1)

output_path = Path(sys.argv[1])
input_json = sys.argv[2]

output_path.parent.mkdir(parents=True, exist_ok=True)

datos_json = json.loads(input_json)

# ----------------------------
# Extraer datos del payload
# ----------------------------
top_areas = datos_json.get("topAreas", [])
top_averias = datos_json.get("topAverias", [])
evolucion = datos_json.get("evolucion", [])
datos_tabla = datos_json.get("datos", [])
total_vin = len(datos_tabla)
con_danio = len([d for d in datos_tabla if d.get("areas")])

# ----------------------------
# Crear PDF
# ----------------------------
styles = getSampleStyleSheet()
doc = SimpleDocTemplate(str(output_path), pagesize=A4, rightMargin=30,leftMargin=30, topMargin=30,bottomMargin=18)
elements = []

# ----------------------------
# Portada + filtros
# ----------------------------
elements.append(Paragraph("Reporte de Daños - PRO", styles['Title']))
elements.append(Spacer(1, 12))
elements.append(Paragraph(f"Total VIN escaneados: {total_vin}", styles['Normal']))
elements.append(Paragraph(f"VIN con daño: {con_danio}", styles['Normal']))
elements.append(Spacer(1, 12))

# Mostrar filtros visibles
marcas = sorted(set(d.get("marca") for d in datos_tabla if d.get("marca")))
modelos = sorted(set(d.get("modelo") for d in datos_tabla if d.get("modelo")))

elements.append(Paragraph(f"Marcas: {', '.join(marcas) if marcas else 'Todas'}", styles['Normal']))
elements.append(Paragraph(f"Modelos: {', '.join(modelos) if modelos else 'Todos'}", styles['Normal']))
elements.append(Spacer(1, 24))

# ----------------------------
# Función para generar gráfico
# ----------------------------
def create_bar_chart(data, title, filename):
    labels = [item["label"] for item in data]
    values = [item["value"] for item in data]
    plt.figure(figsize=(6,3))
    plt.bar(labels, values, color="skyblue")
    plt.title(title)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()
    return filename

# ----------------------------
# Gráficos
# ----------------------------
if top_areas:
    img = create_bar_chart(top_areas, "Top 5 Áreas dañadas", "top_areas.png")
    elements.append(Paragraph("Top 5 Áreas dañadas", styles['Heading2']))
    elements.append(Image(img, width=400, height=200))
    elements.append(Spacer(1,12))

if top_averias:
    img = create_bar_chart(top_averias, "Top 5 Tipos de daño", "top_averias.png")
    elements.append(Paragraph("Top 5 Tipos de daño", styles['Heading2']))
    elements.append(Image(img, width=400, height=200))
    elements.append(Spacer(1,12))

if evolucion:
    evo_data = [{"label": e["fecha"], "value": e["value"]} for e in evolucion]
    img = create_bar_chart(evo_data, "Evolución de daños por fecha", "evolucion.png")
    elements.append(Paragraph("Evolución de daños por fecha", styles['Heading2']))
    elements.append(Image(img, width=400, height=200))
    elements.append(Spacer(1,12))

# ----------------------------
# Tabla completa de datos
# ----------------------------
if datos_tabla:
    elements.append(Paragraph("Datos Detallados", styles['Heading2']))
    table_data = [["Fecha", "Marca", "Modelo", "VIN", "Área", "Avería"]]
    for d in datos_tabla:
        table_data.append([
            d.get("fecha",""),
            d.get("marca",""),
            d.get("modelo",""),
            d.get("vin",""),
            d.get("areas",""),
            d.get("averias","")
        ])
    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN',(0,0),(-1,-1),'CENTER'),
        ('FONTNAME', (0,0),(-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0),(-1,0),12),
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ]))
    elements.append(table)

# ----------------------------
# Guardar PDF
# ----------------------------
doc.build(elements)
print(f"PDF PRO generado en: {output_path}")
