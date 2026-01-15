#!/usr/bin/env python3
import subprocess
from pathlib import Path
import sys

if len(sys.argv) < 2:
    print("Uso: python export_pdf.py <archivo_excel>")
    sys.exit(1)

excel_path = Path(sys.argv[1]).resolve()
output_dir = excel_path.parent

# 🔑 Path correcto en macOS
LIBREOFFICE_BIN = "/Applications/LibreOffice.app/Contents/MacOS/soffice"

if not Path(LIBREOFFICE_BIN).exists():
    raise RuntimeError("LibreOffice no encontrado en macOS")

cmd = [
    LIBREOFFICE_BIN,
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    str(output_dir),
    str(excel_path),
]

subprocess.run(cmd, check=True)

print(f"PDF generado en: {excel_path.with_suffix('.pdf')}")
