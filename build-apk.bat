@echo off
cd /d "c:\Users\Geforce\Desktop\azkare"
echo Building APK...
flutter build apk --split-per-abi > output.log 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo APK files:
    dir /s /b build\android\app\outputs\flutter-apk\*.apk
) else (
    echo Build failed!
    type output.log
)
pause
