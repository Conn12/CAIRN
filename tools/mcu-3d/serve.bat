@echo off
chcp 65001 >nul
title CAIRN - MCU 3D
cd /d D:\CAIRN

echo.
echo   正在启动本地服务：http://127.0.0.1:8777/tools/mcu-3d/
echo   关闭下面这个服务窗口即可停止。
echo.

start "CAIRN MCU 3D Server" /min cmd /c "cd /d D:\CAIRN && D:\Python\python.exe -m http.server 8777 --bind 127.0.0.1"
timeout /t 1 >nul
start "" http://127.0.0.1:8777/tools/mcu-3d/
