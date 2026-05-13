@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo A ler colagem.txt e a gerar clientes.tsv + clientes-estetica.tsv + clientes-arquitetura.tsv + clientes-automotiva.tsv ...
python parse_clientes.py
if errorlevel 1 (
  echo Falhou. Tens Python instalado e no PATH?
  pause
  exit /b 1
)
echo.
echo Concluido. Abre os TSV no Excel (clientes + estetica + arquitetura + automotiva).
pause
