# GitHub 仓库设置指南

## 步骤 1: 在 GitHub 上创建新仓库

1. 登录你的 GitHub 账号
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `protein-structure-prediction` (或你喜欢的名称)
   - **Description**: `蛋白质分子结构预测与可视化应用`
   - **Visibility**: 选择 Public 或 Private
   - **⚠️ 重要**: 不要勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

## 步骤 2: 连接本地仓库到 GitHub

创建仓库后，GitHub 会显示连接命令。使用以下命令连接：

```bash
# 进入项目目录
cd d:\Develop\Project\AIForScience\react-standard-project

# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/protein-structure-prediction.git

# 或者使用 SSH（如果你配置了 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/protein-structure-prediction.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 3: 验证连接

```bash
# 查看远程仓库配置
git remote -v

# 应该显示类似：
# origin  https://github.com/YOUR_USERNAME/protein-structure-prediction.git (fetch)
# origin  https://github.com/YOUR_USERNAME/protein-structure-prediction.git (push)
```

## 后续操作

### 推送更新
```bash
git add .
git commit -m "你的提交信息"
git push
```

### 拉取更新
```bash
git pull
```

### 查看状态
```bash
git status
```

## 注意事项

- 确保 `.gitignore` 文件已正确配置，避免提交 `node_modules` 等不必要的文件
- 如果遇到认证问题，可能需要配置 GitHub Personal Access Token
- 建议定期提交和推送代码，保持远程仓库与本地同步
