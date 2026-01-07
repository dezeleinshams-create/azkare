@echo off
REM استبدال ملف script.js بالنسخة المحسنة
REM This script replaces the old script.js with the optimized version

echo تحديث ملف JavaScript...
echo.

REM Copy the new version
for /F "delims=" %%A in ('dir /s /b script-v2.js') do (
    echo تم العثور على: %%A
    if exist script.js (
        del script.js
        echo تم حذف الملف القديم
    )
    ren script-v2.js script.js
    echo تم استبدال الملف بالنسخة المحسنة!
)

echo.
echo ✓ اكتمل التحديث
echo افتح index.html لاستخدام التطبيق
echo.
pause

REM Open the application
start index.html
