@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  echo Node.js nao foi encontrado no ambiente Codex deste computador.
  echo Instale Node.js LTS e pnpm, depois execute: pnpm dev
  pause
  exit /b 1
)
"%NODE_EXE%" "%~dp0node_modules\vite\bin\vite.js" --host 127.0.0.1 --open
pause
