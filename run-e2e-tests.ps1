# =====================================================================
# Skrypt do uruchamiania testów E2E Playwright
# =====================================================================
# Użycie:
#   .\run-e2e-tests.ps1                    # Wszystkie testy headless
#   .\run-e2e-tests.ps1 -Headed            # Z widoczną przeglądarką
#   .\run-e2e-tests.ps1 -UI                # Tryb UI (interaktywny)
#   .\run-e2e-tests.ps1 -Debug             # Tryb debug
#   .\run-e2e-tests.ps1 -Test login        # Tylko test login
# =====================================================================

param(
    [switch]$Headed,
    [switch]$UI,
    [switch]$Debug,
    [string]$Test = ""
)

Write-Host "🎭 Playwright E2E Tests - LowCarbPlaner" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Sprawdź, czy jesteśmy w właściwym katalogu
if (-not (Test-Path "playwright.config.ts")) {
    Write-Host "❌ Błąd: Uruchom skrypt z katalogu głównego projektu!" -ForegroundColor Red
    exit 1
}

# Sprawdź, czy .env.e2e istnieje
if (-not (Test-Path ".env.e2e")) {
    Write-Host "❌ Błąd: Brak pliku .env.e2e!" -ForegroundColor Red
    Write-Host "Skopiuj .env.e2e.example do .env.e2e i wypełnij dane" -ForegroundColor Yellow
    exit 1
}

# Zbuduj komendę
$command = "npx playwright test"

# Dodaj ścieżkę do testu jeśli podana
if ($Test) {
    if ($Test -notmatch "\.spec\.ts$") {
        $command += " tests/e2e/**/*$Test*.spec.ts"
    } else {
        $command += " $Test"
    }
} else {
    $command += " tests/e2e"
}

# Dodaj projekt (tylko Chromium dla szybkości)
$command += " --project=chromium"

# Tryby uruchomienia
if ($UI) {
    Write-Host "🎨 Uruchamiam tryb UI (interaktywny)...`n" -ForegroundColor Green
    $command = "npx playwright test --ui"
}
elseif ($Debug) {
    Write-Host "🐛 Uruchamiam tryb debug...`n" -ForegroundColor Yellow
    $command += " --debug"
}
elseif ($Headed) {
    Write-Host "👀 Uruchamiam z widoczną przeglądarką...`n" -ForegroundColor Green
    $command += " --headed"
}
else {
    Write-Host "🏃 Uruchamiam testy (headless)...`n" -ForegroundColor Green
}

# Dodaj reporter
if (-not $UI -and -not $Debug) {
    $command += " --reporter=list"
}

Write-Host "📝 Komenda: $command`n" -ForegroundColor Gray

# Uruchom testy
try {
    Invoke-Expression $command
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "`n✅ Wszystkie testy przeszły pomyślnie!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Niektóre testy nie przeszły (kod: $exitCode)" -ForegroundColor Yellow
    }

    # Zapytaj o raport
    if (-not $UI -and -not $Debug) {
        Write-Host "`n📊 Czy otworzyć raport HTML? (t/n): " -ForegroundColor Cyan -NoNewline
        $response = Read-Host
        if ($response -eq "t" -or $response -eq "T") {
            npx playwright show-report
        }
    }

    exit $exitCode
}
catch {
    Write-Host "`n❌ Błąd podczas uruchamiania testów:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
