@echo off
cd /d "%~dp0"
:: حذف ملف النسخة القديمة
del script.js 2>nul
:: نسخ الملف الجديد
copy script-v2.js script.js >nul 2>&1
:: فتح التطبيق
start index.html
