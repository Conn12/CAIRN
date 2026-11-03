@echo off
chcp 65001 >nul
color 07
title CAIRN - Claude Code

rem ============================================================
rem  本项目所有依赖 / 缓存 / 下载物，一律锁在 D:\CAIRN\.local
rem  不写入 C 盘，不做全局安装
rem ============================================================
set "CAIRN_HOME=D:\CAIRN"
set "CAIRN_LOCAL=%CAIRN_HOME%\.local"

if not exist "%CAIRN_LOCAL%\npm-cache"    mkdir "%CAIRN_LOCAL%\npm-cache"
if not exist "%CAIRN_LOCAL%\npm-global"   mkdir "%CAIRN_LOCAL%\npm-global"
if not exist "%CAIRN_LOCAL%\playwright"   mkdir "%CAIRN_LOCAL%\playwright"
if not exist "%CAIRN_LOCAL%\models"       mkdir "%CAIRN_LOCAL%\models"
if not exist "%CAIRN_LOCAL%\tmp"          mkdir "%CAIRN_LOCAL%\tmp"

set "npm_config_cache=%CAIRN_LOCAL%\npm-cache"
set "npm_config_prefix=%CAIRN_LOCAL%\npm-global"
set "PLAYWRIGHT_BROWSERS_PATH=%CAIRN_LOCAL%\playwright"
set "HF_HOME=%CAIRN_LOCAL%\models\huggingface"
set "OLLAMA_MODELS=%CAIRN_LOCAL%\models\ollama"
set "TMP=%CAIRN_LOCAL%\tmp"
set "TEMP=%CAIRN_LOCAL%\tmp"

powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference='Stop'; try { $env:ANTHROPIC_BASE_URL='https://api.deepseek.com/anthropic'; $env:ANTHROPIC_MODEL='deepseek-flash[1m]'; $env:ANTHROPIC_DEFAULT_OPUS_MODEL='deepseek-flash[1m]'; $env:ANTHROPIC_DEFAULT_SONNET_MODEL='deepseek-flash[1m]'; $env:ANTHROPIC_DEFAULT_HAIKU_MODEL='deepseek-flash'; $env:CLAUDE_CODE_SUBAGENT_MODEL='deepseek-flash'; $env:ANTHROPIC_API_KEY=$null; $keyDir=Join-Path $env:LOCALAPPDATA 'ClaudeCodeLauncher'; $keyFile=Join-Path $keyDir 'deepseek-key.dpapi'; if (-not (Test-Path -LiteralPath $keyFile)) { throw 'Missing API key file. Run the original ClaudeCode.cmd once to set it up first.' }; $secret=(Get-Content -LiteralPath $keyFile -Raw).Trim() | ConvertTo-SecureString; $env:ANTHROPIC_AUTH_TOKEN=[System.Net.NetworkCredential]::new('', $secret).Password; if ([string]::IsNullOrWhiteSpace($env:ANTHROPIC_AUTH_TOKEN)) { throw 'API Key is empty.' }; Set-Location -LiteralPath 'D:\CAIRN'; & (Join-Path $env:npm_config_prefix 'claude.cmd'); exit $LASTEXITCODE } catch { Write-Host $_ -ForegroundColor Red; exit 1 }"

if errorlevel 1 pause
