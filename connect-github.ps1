# GitHub 仓库连接脚本
# 使用前请先在 GitHub 上创建仓库: https://github.com/new

Write-Host "=== GitHub 仓库连接脚本 ===" -ForegroundColor Cyan
Write-Host ""

# 配置信息
$GITHUB_USERNAME = "Hyjkblj"
$REPO_NAME = "protein-structure-prediction"

Write-Host "GitHub 用户名: $GITHUB_USERNAME" -ForegroundColor Yellow
Write-Host "仓库名称: $REPO_NAME" -ForegroundColor Yellow
Write-Host ""

# 检查是否已存在远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  已存在远程仓库: $existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "是否要替换为新的远程仓库? (y/n)"
    if ($replace -eq "y" -or $replace -eq "Y") {
        git remote remove origin
        Write-Host "✅ 已移除旧的远程仓库" -ForegroundColor Green
    } else {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit
    }
}

# 添加远程仓库
Write-Host "正在添加远程仓库..." -ForegroundColor Cyan
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 远程仓库添加成功" -ForegroundColor Green
} else {
    Write-Host "❌ 远程仓库添加失败" -ForegroundColor Red
    Write-Host "请确保已在 GitHub 上创建仓库: https://github.com/new" -ForegroundColor Yellow
    exit
}

# 重命名分支为 main（如果需要）
Write-Host ""
Write-Host "正在检查分支..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
if ($currentBranch -eq "master") {
    Write-Host "将分支从 master 重命名为 main..." -ForegroundColor Cyan
    git branch -M main
    $currentBranch = "main"
}

# 推送代码
Write-Host ""
Write-Host "正在推送代码到 GitHub..." -ForegroundColor Cyan
Write-Host "如果这是第一次推送，可能需要输入 GitHub 用户名和密码/Token" -ForegroundColor Yellow
Write-Host ""

git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 代码推送成功！" -ForegroundColor Green
    Write-Host "仓库地址: https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ 代码推送失败" -ForegroundColor Red
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 仓库尚未在 GitHub 上创建" -ForegroundColor Yellow
    Write-Host "2. 认证失败（需要配置 Personal Access Token）" -ForegroundColor Yellow
    Write-Host "3. 网络连接问题" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请访问以下链接创建仓库:" -ForegroundColor Cyan
    Write-Host "https://github.com/new" -ForegroundColor Cyan
}
