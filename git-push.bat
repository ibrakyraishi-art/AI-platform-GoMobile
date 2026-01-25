@echo off
chcp 65001 >nul
echo ================================
echo   AI GoMobile - Git Push
echo ================================
echo.

cd /d "%~dp0"

echo [1/4] Удаление блокировки Git...
if exist .git\index.lock (
    del /f /q .git\index.lock
    echo ✓ Блокировка удалена
) else (
    echo ✓ Блокировки нет
)
echo.

echo [2/4] Добавление файлов...
git add .
if %errorlevel% neq 0 (
    echo ✗ Ошибка при добавлении файлов
    pause
    exit /b 1
)
echo ✓ Файлы добавлены
echo.

echo [3/4] Создание коммита...
git commit -m "Modern dark design with orange accents and glassmorphism effects"
if %errorlevel% neq 0 (
    if %errorlevel% equ 1 (
        echo ! Нет изменений для коммита
    ) else (
        echo ✗ Ошибка при создании коммита
        pause
        exit /b 1
    )
) else (
    echo ✓ Коммит создан
)
echo.

echo [4/4] Загрузка на GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ✗ Ошибка при загрузке на GitHub
    pause
    exit /b 1
)
echo ✓ Загрузка завершена
echo.

echo ================================
echo   ✓ Готово! Vercel начнет деплой
echo ================================
echo.
timeout /t 5
