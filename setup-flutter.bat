@echo off
setlocal

echo Checking Flutter installation...
flutter doctor -v
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Flutter not found or setup has issues. Install Flutter and add it to PATH, then re-run this script.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Creating Flutter project in the current directory (this will create files if missing)...
flutter create .
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Failed to create Flutter project. If this directory already contains a non-Flutter project, consider creating a new project elsewhere and copying files.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Building release APK...
flutter build apk --release
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Build failed. Inspect the output above for errors.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Build finished successfully. The APK will be under build\app\outputs\flutter-apk\
pause
endlocal
@echo off
setlocal





























endlocalpauseecho Build finished successfully. The APK will be under build\app\outputs\flutter-apk\echo.)  exit /b %ERRORLEVEL%  pause  echo Build failed. Inspect the output above for errors.  echo.if %ERRORLEVEL% NEQ 0 (flutter build apk --releaseecho Building release APK...echo.)  exit /b %ERRORLEVEL%  pause  echo Failed to create Flutter project. If this directory already contains a non-Flutter project, consider creating a new project elsewhere and copying files.  echo.if %ERRORLEVEL% NEQ 0 (flutter create .echo Creating Flutter project in the current directory (this will create files if missing)...echo.)  exit /b %ERRORLEVEL%  pause  echo Flutter not found or setup has issues. Install Flutter and add it to PATH, then re-run this script.  echo.flutter doctor -v
nif %ERRORLEVEL% NEQ 0 (necho Checking Flutter installation...