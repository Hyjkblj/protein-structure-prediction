# 后端 API 接口说明

## 蛋白质结构预测接口

### 接口地址
```
POST /api/predict
```

### 请求格式

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (可选)
```

**Body:**
```json
{
  "sequence": "MKTAYIAKQRQISFVKSHFSRQ",
  "config": {
    // 可选的预测配置参数
  }
}
```

### 响应格式

后端可以返回以下两种格式之一：

#### 方式 1: JSON 格式（推荐）
```json
{
  "pdbData": "HEADER    PROTEIN                   01-JAN-23   XXXX              \nTITLE     ...",
  "status": "success",
  "message": "预测完成"
}
```

或者使用其他字段名：
```json
{
  "pdb": "HEADER    PROTEIN                   01-JAN-23   XXXX              \nTITLE     ..."
}
```

#### 方式 2: 直接返回 PDB 文本
```
HEADER    PROTEIN                   01-JAN-23   XXXX              
TITLE     PROTEIN STRUCTURE PREDICTION
...
```

### 响应状态码

- `200 OK`: 预测成功
- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误

### 错误响应格式

```json
{
  "error": "错误信息",
  "status": "error"
}
```

### 前端调用示例

前端会调用 `predictStructure` 函数，该函数会：
1. 发送 POST 请求到 `/api/predict`
2. 传递序列数据
3. 接收并解析响应（支持 JSON 和纯文本）
4. 返回 PDB 文件内容（字符串）

### 注意事项

1. **PDB 格式**: 返回的 PDB 数据必须是标准的 PDB 文件格式
2. **编码**: 建议使用 UTF-8 编码
3. **超时**: 预测可能需要较长时间，建议设置合理的超时时间
4. **CORS**: 如果前后端分离部署，需要配置 CORS 允许跨域请求

### 环境变量配置

前端通过环境变量 `VITE_API_BASE_URL` 配置后端地址，默认为 `http://localhost:3001/api`。

创建 `.env` 文件（参考 `.env.example`）来配置：
```
VITE_API_BASE_URL=http://localhost:3001/api
```
