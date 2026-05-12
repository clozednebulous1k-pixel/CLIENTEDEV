@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Python nao encontrado. Instala Python e marca "Add to PATH".
  pause
  exit /b 1
)

if not exist "index.html" (
  echo [ERRO] index.html tem de estar na mesma pasta que rodar.bat
  echo Pasta atual: %CD%
  pause
  exit /b 1
)

if not exist "serve.py" (
  echo [ERRO] Falta serve.py nesta pasta.
  pause
  exit /b 1
)

echo.
echo  A usar serve.py — pasta certa, sem 404 por causa do diretorio.
echo  Na pagina: COLA o texto do Maps e clica em ANALISAR COLAGEM.
echo  Ctrl+C para parar.
echo.

python serve.py
echo.
if errorlevel 1 pause
