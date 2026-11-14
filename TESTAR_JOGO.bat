@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
rem Testes automatizados do ShinobiBonk SEM navegador: tipos, regras e testes unitarios/integracao.
rem Uso: TESTAR_JOGO.bat            (tudo)
rem      TESTAR_JOGO.bat --rapido   (so os testes de tests/, sem build)

set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  where node >nul 2>nul && (set "NODE_EXE=node") || (
    echo Node.js nao encontrado. Instale o Node.js LTS ou rode ABRIR_JOGO.bat uma vez.
    if not defined SHINOBI_SEM_PAUSA pause
    exit /b 1
  )
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencias ausentes: rode ABRIR_JOGO.bat uma vez para instala-las.
  if not defined SHINOBI_SEM_PAUSA pause
  exit /b 1
)

set "FALHOU="
if /i not "%~1"=="--rapido" (
  echo.
  echo === 1/3 Verificacao de tipos ^(TypeScript^) ===
  "%NODE_EXE%" node_modules\typescript\bin\tsc -b || set "FALHOU=1"
)
echo.
echo === 2/3 Testes unitarios e de integracao ^(tests\, sem navegador^) ===
"%NODE_EXE%" --test --test-concurrency=1 --test-reporter=spec "tests/*.test.mjs" || set "FALHOU=1"
if /i not "%~1"=="--rapido" (
  echo.
  echo === 3/3 Build de producao ===
  "%NODE_EXE%" node_modules\vite\bin\vite.js build --logLevel warn || set "FALHOU=1"
)

echo.
if defined FALHOU (
  echo RESULTADO: FALHOU - veja as mensagens acima.
  if not defined SHINOBI_SEM_PAUSA pause
  exit /b 1
)
echo RESULTADO: TUDO OK.
if not defined SHINOBI_SEM_PAUSA pause
exit /b 0
