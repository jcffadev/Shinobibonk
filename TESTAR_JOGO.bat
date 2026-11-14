@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
rem Testes automatizados do ShinobiBonk SEM navegador. Politica: docs\development\TESTING_POLICY.md
rem Uso: TESTAR_JOGO.bat [leve^|equilibrado^|profundo]   (padrao: equilibrado)
rem   leve        - testes por codigo, sem cobertura (rapido)
rem   equilibrado - tipos + testes com cobertura + build (perfil padrao de desenvolvimento)
rem   profundo    - equilibrado + prova dos testes (mutacao). Navegador continua fora.

set "PERFIL=%~1"
if "%PERFIL%"=="" set "PERFIL=equilibrado"
if /i "%PERFIL%"=="--rapido" set "PERFIL=leve"
if /i not "%PERFIL%"=="leve" if /i not "%PERFIL%"=="equilibrado" if /i not "%PERFIL%"=="profundo" (
  echo Perfil desconhecido: %PERFIL%. Use leve, equilibrado ou profundo.
  if not defined SHINOBI_SEM_PAUSA pause
  exit /b 2
)

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

echo Perfil: %PERFIL% (sem navegador, sequencial)
set "FALHOU="
if /i "%PERFIL%"=="leve" (
  echo.
  echo === Testes por codigo ^(sem cobertura^) ===
  "%NODE_EXE%" scripts\run-tests.mjs --sem-cobertura || set "FALHOU=1"
  goto :fim
)

echo.
echo === 1/3 Verificacao de tipos ^(TypeScript^) ===
"%NODE_EXE%" node_modules\typescript\bin\tsc -b || set "FALHOU=1"
echo.
echo === 2/3 Testes por codigo com cobertura ===
"%NODE_EXE%" scripts\run-tests.mjs || set "FALHOU=1"
echo.
echo === 3/3 Build de producao ===
"%NODE_EXE%" node_modules\vite\bin\vite.js build --logLevel warn || set "FALHOU=1"
if /i "%PERFIL%"=="profundo" (
  echo.
  echo === Prova dos testes ^(mutacao: estraga regras de proposito e confere se os testes acusam^) ===
  "%NODE_EXE%" scripts\mutation-check.mjs || set "FALHOU=1"
)

:fim
echo.
if defined FALHOU (
  echo RESULTADO: FALHOU - veja as mensagens acima.
  if not defined SHINOBI_SEM_PAUSA pause
  exit /b 1
)
echo RESULTADO: PASSOU ^(perfil %PERFIL%^).
if not defined SHINOBI_SEM_PAUSA pause
exit /b 0
