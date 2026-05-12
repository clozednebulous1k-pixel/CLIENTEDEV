# Terminal:  cd c:\Users\User\clonecimed   .\rodar.ps1
Set-Location $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Python nao encontrado no PATH." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "index.html")) {
    Write-Host "[ERRO] index.html nao esta nesta pasta: $PWD" -ForegroundColor Red
    exit 1
}

Write-Host "`n  A correr serve.py (pasta fixa = sem 404 por diretorio errado)" -ForegroundColor Cyan
Write-Host "  Depois: cola o Maps e clica ANALISAR COLAGEM`n" -ForegroundColor Yellow

python serve.py
