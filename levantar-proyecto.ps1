# Script para levantar Frontend y Backend del proyecto CLT
# Ejecutar en PowerShell: .\levantar-proyecto.ps1

$ErrorActionPreference = "Stop"
$proyectoRoot = $PSScriptRoot

# 1. Verificar PostgreSQL (Docker)
Write-Host "Verificando PostgreSQL..." -ForegroundColor Cyan
$postgres = docker ps -a --filter "name=postgres" --format "{{.Names}} {{.Status}}" 2>$null
if (-not $postgres -or $postgres -notmatch "Up") {
    Write-Host "Iniciando PostgreSQL con Docker..." -ForegroundColor Yellow
    docker run --name postgres -e POSTGRES_PASSWORD=Paraguay2026 -p 5432:5432 -d postgres
    Start-Sleep -Seconds 5
} else {
    Write-Host "PostgreSQL ya está corriendo." -ForegroundColor Green
}

# 2. JAVA_HOME (requerido por Maven)
if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
    Write-Host "JAVA_HOME configurado: $env:JAVA_HOME" -ForegroundColor Yellow
}

# 3. Backend (Spring Boot) - Terminal 1
Write-Host "`nIniciando Backend en nueva ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='C:\Program Files\Java\jdk-17'; cd '$proyectoRoot\backend-clt'; .\mvnw.cmd spring-boot:run"

# 4. Esperar a que el backend inicie
Write-Host "Esperando 60 segundos a que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# 5. Frontend (Angular) - Terminal 2
Write-Host "`nIniciando Frontend en nueva ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$proyectoRoot\frontend-clt'; npm start"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Proyecto CLT iniciado correctamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Swagger:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  Usuario:  admin / admin123" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
