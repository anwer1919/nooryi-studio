# ============================================
# Nooryi Studio - Project Audit Script
# فحص شامل للمشروع وتحديد الملفات المشكلة
# ============================================

$ErrorActionPreference = "Continue"
$projectRoot = Get-Location

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Nooryi Studio - Project Audit Report" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# 1. الملفات التي تحتوي على suppressHydrationWarning
# ============================================
Write-Host "📋 [1] ملفات تحتوي على suppressHydrationWarning:" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$hydrationFiles = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "suppressHydrationWarning" -List

if ($hydrationFiles) {
    $hydrationFiles | ForEach-Object {
        $relativePath = $_.Path.Replace($projectRoot.Path + "\", "")
        Write-Host "  ⚠️  $relativePath" -ForegroundColor Red
    }
} else {
    Write-Host "  ✅ لا توجد ملفات" -ForegroundColor Green
}

# ============================================
# 2. الملفات التي تستخدم useSession
# ============================================
Write-Host "`n📋 [2] ملفات تستخدم useSession (NextAuth):" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$sessionFiles = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "useSession" -List

if ($sessionFiles) {
    $sessionFiles | ForEach-Object {
        $relativePath = $_.Path.Replace($projectRoot.Path + "\", "")
        Write-Host "  🔍 $relativePath" -ForegroundColor Blue
    }
} else {
    Write-Host "  ✅ لا توجد ملفات" -ForegroundColor Green
}

# ============================================
# 3. الملفات التي تستخدم new Date().toLocale
# ============================================
Write-Host "`n📋 [3] ملفات تستخدم toLocaleDateString/toLocaleString (قد تسبب Hydration):" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$dateFiles = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "toLocaleDateString|toLocaleString|toLocaleTimeString" -List

if ($dateFiles) {
    $dateFiles | ForEach-Object {
        $relativePath = $_.Path.Replace($projectRoot.Path + "\", "")
        Write-Host "  ⚠️  $relativePath" -ForegroundColor Red
    }
} else {
    Write-Host "  ✅ لا توجد ملفات" -ForegroundColor Green
}

# ============================================
# 4. الملفات التي تحتوي على SessionProvider
# ============================================
Write-Host "`n📋 [4] ملفات تحتوي على SessionProvider:" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
$providerFiles = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" } |
    Select-String -Pattern "SessionProvider" -List

if ($providerFiles) {
    $providerFiles | ForEach-Object {
        $relativePath = $_.Path.Replace($projectRoot.Path + "\", "")
        Write-Host "  🔑 $relativePath" -ForegroundColor Magenta
    }
} else {
    Write-Host "  ✅ لا توجد ملفات" -ForegroundColor Green
}

# ============================================
# 5. البحث عن الملفات غير المستخدمة
# ============================================
Write-Host "`n📋 [5] فحص الملفات غير المستخدمة (Orphan Files):" -ForegroundColor Yellow
Write-Host "-------------------------------------------"

$allComponents = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git","layout.tsx","page.tsx","route.ts" | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.Directory.Name -ne "api" }

$orphanFiles = @()

foreach ($file in $allComponents) {
    $fileName = $file.BaseName
    
    # البحث عن أي استيراد لهذا الملف في المشروع
    $imported = Get-ChildItem -Path $projectRoot -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules",".next",".git" | 
        Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -ne $file.FullName } |
        Select-String -Pattern "import.*$fileName|from.*$fileName|require.*$fileName" -Quiet
    
    if (-not $imported -and $file.Directory.Name -eq "components") {
        $relativePath = $file.FullName.Replace($projectRoot.Path + "\", "")
        $orphanFiles += $relativePath
    }
}

if ($orphanFiles.Count -gt 0) {
    Write-Host "  ⚠️  ملفات في مجلد components غير مستخدمة:" -ForegroundColor Red
    $orphanFiles | ForEach-Object {
        Write-Host "    ❌ $_" -ForegroundColor DarkRed
    }
} else {
    Write-Host "  ✅ جميع الملفات في components مستخدمة" -ForegroundColor Green
}

# ============================================
# 6. قائمة بجميع الملفات في المشروع
# ============================================
Write-Host "`n📋 [6] هيكل المشروع (src/ فقط):" -ForegroundColor Yellow
Write-Host "-------------------------------------------"
Get-ChildItem -Path "$projectRoot\src" -Recurse -Include "*.tsx","*.ts" -Exclude "node_modules" | 
    Where-Object { $_.FullName -notlike "*node_modules*" } |
    ForEach-Object {
        $relativePath = $_.FullName.Replace($projectRoot.Path + "\", "")
        Write-Host "  📄 $relativePath" -ForegroundColor Gray
    }

# ============================================
# الملخص النهائي
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  📊 الملخص النهائي" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  • ملفات Hydration: $($hydrationFiles.Count)" -ForegroundColor White
Write-Host "  • ملفات useSession: $($sessionFiles.Count)" -ForegroundColor White
Write-Host "  • ملفات التواريخ: $($dateFiles.Count)" -ForegroundColor White
Write-Host "  • ملفات غير مستخدمة: $($orphanFiles.Count)" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "💡 التوصيات:" -ForegroundColor Green
Write-Host "  1. راجع ملفات التواريخ وأضف timeZone: 'UTC' لها"
Write-Host "  2. احذف الملفات غير المستخدمة لتبسيط المشروع"
Write-Host "  3. تأكد من أن SessionProvider موجود في ملف واحد فقط"
Write-Host ""