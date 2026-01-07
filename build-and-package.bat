@echo off
setlocal

REM Build and package Flutter APK, save log, copy APK to Desktop
echo Starting build at %DATE% %TIME%
set LOGFILE=%~dp0build-log.txt
echo Build started at %DATE% %TIME%> "%LOGFILE%"

cd /d "%~dp0"

echo Running flutter pub get...>> "%LOGFILE%"
flutter pub get >> "%LOGFILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo pub get failed. See %LOGFILE% for details.
  type "%LOGFILE%"
  pause
  exit /b %ERRORLEVEL%
)

echo Building release APK...>> "%LOGFILE%"
flutter build apk --release >> "%LOGFILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Build failed. See %LOGFILE% for details.
  type "%LOGFILE%"
  pause
  exit /b %ERRORLEVEL%
)

set APK_SOURCE=%~dp0build\app\outputs\flutter-apk\app-release.apk
set APK_DEST=%USERPROFILE%\Desktop\%~n0-app-release.apk

if exist "%APK_SOURCE%" (
  copy /y "%APK_SOURCE%" "%APK_DEST%" >nul
  echo Build succeeded. APK copied to %APK_DEST%
  echo See build log: %LOGFILE%
  explorer /select,"%APK_DEST%"
) else (
  echo APK not found at expected location: %APK_SOURCE%
  echo Check %LOGFILE% for details.
)

pause
endlocal
