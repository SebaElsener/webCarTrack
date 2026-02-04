#!/usr/bin/env python3
import subprocess
from pathlib import Path
import sys
import shutil
import platform
import os

if len(sys.argv) < 2:
    print("Uso: python export_pdf.py <archivo_excel>")
    sys.exit(1)

excel_path = Path(sys.argv[1]).resolve()
output_dir = excel_path.parent

def get_libreoffice_bin():
    system = platform.system()

    # macOS
    if system == "Darwin":
        mac_path = "/Applications/LibreOffice.app/Contents/MacOS/soffice"
        if Path(mac_path).exists():
            return mac_path
        raise RuntimeError("LibreOffice no encontrado en macOS")

    # Linux (Render / Docker)
    for bin_name in ("libreoffice", "soffice"):
        path = shutil.which(bin_name)
        if path:
            return path

    raise RuntimeError("LibreOffice no encontrado en el sistema")

env = os.environ.copy()
env["SAL_USE_VCLPLUGIN"] = "gen"

LIBREOFFICE_BIN = get_libreoffice_bin()

cmd = [
    LIBREOFFICE_BIN,
    "--headless",
    "--nologo",
    "--nofirststartwizard",
    "--convert-to",
    'pdf:calc_pdf_Export:ScaleToPagesX=1,ScaleToPagesY=0',
    "--outdir",
    str(output_dir),
    str(excel_path),
]

subprocess.run(cmd, check=True, env=env)

print(f"PDF generado en: {excel_path.with_suffix('.pdf')}")
