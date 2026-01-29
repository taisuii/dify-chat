---
name: dify-api-integration
description: 集成 Dify AI 应用 API，包括对话消息、文件上传、会话管理、语音转换等功能。当需要对接 Dify AI 应用、调用 Dify API、实现聊天功能或处理 Dify 相关接口时使用此技能。
---

# Dify API 集成

## 基础配置

### 基础 URL
```
http://ai.sngzs.site/v1
```

### 鉴权方式
所有 API 请求需要在 HTTP Header 中包含 API-Key：
```
Authorization: Bearer {API_KEY}
```

**重要**：API-Key 应存储在后端，不要暴露在客户端代码中。

## 核心 API 端点

### 1. 发送对话消息
**POST** `/chat-messages`

最常用的接口，支持流式和阻塞两种模式。

**请求参数**：
- `query` (string, 必需) - 用户输入/提问内容
- `user` (string, 必需) - 用户标识，应用内唯一
- `response_mode` (string) - `streaming`（推荐）或 `blocking`
- `conversation_id` (string, 可选) - 会话 ID，用于继续对话
- `inputs` (object, 可选) - App 定义的变量值
- `files` (array, 可选) - 文件列表，支持 document/image/audio/video
- `workflow_id` (string, 可选) - 指定工作流版本

**流式响应事件**：
- `message` - LLM 返回文本块
- `message_end` - 消息结束，包含完整元数据
- `workflow_started` - 工作流开始
- `node_started` / `node_finished` - 节点执行状态
- `workflow_finished` - 工作流结束
- `error` - 错误事件

### 2. 文件上传
**POST** `/files/upload`

使用 `multipart/form-data` 格式上传文件。

**请求参数**：
- `file` (file, 必需) - 要上传的文件
- `user` (string, 必需) - 用户标识

**响应**：返回 `upload_file_id`，用于在 `/chat-messages` 中使用。

### 3. 会话管理

**获取会话列表**：`GET /conversations?user={user_id}`
**删除会话**：`DELETE /conversations/{conversation_id}`
**会话重命名**：`POST /conversations/{conversation_id}/name`
**获取历史消息**：`GET /messages?conversation_id={id}&user={user_id}`

### 4. 其他常用接口

- **停止响应**：`POST /chat-messages/{task_id}/stop`（仅流式模式）
- **消息反馈**：`POST /messages/{message_id}/feedbacks`
- **语音转文字**：`POST /audio-to-text`
- **文字转语音**：`POST /text-to-audio`
- **获取应用信息**：`GET /info`、`GET /parameters`、`GET /site`

## 使用模式

### 流式对话（推荐）

```typescript
const response = await fetch('http://ai.sngzs.site/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '用户问题',
    user: 'user-123',
    response_mode: 'streaming',
    conversation_id: '', // 首次对话为空
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      
      if (data.event === 'message') {
        // 累积文本块
        console.log('文本块:', data.answer);
      } else if (data.event === 'message_end') {
        // 完整响应
        console.log('完整答案:', data.metadata);
      }
    }
  }
}
```

### 阻塞模式

```typescript
const response = await fetch('http://ai.sngzs.site/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '用户问题',
    user: 'user-123',
    response_mode: 'blocking',
  }),
});

const data = await response.json();
console.log('完整答案:', data.answer);
```

### 文件上传后发送消息

```typescript
// 1. 上传文件
const formData = new FormData();
formData.append('file', file);
formData.append('user', 'user-123');

const uploadResponse = await fetch('http://ai.sngzs.site/v1/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
  },
  body: formData,
});

const { id: upload_file_id } = await uploadResponse.json();

// 2. 发送消息时使用文件
const messageResponse = await fetch('http://ai.sngzs.site/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '分析这张图片',
    user: 'user-123',
    response_mode: 'streaming',
    files: [{
      type: 'image',
      transfer_method: 'local_file',
      upload_file_id: upload_file_id,
    }],
  }),
});
```

## 错误处理

常见错误码：
- `400` - 参数错误（invalid_param, app_unavailable, provider_quota_exceeded 等）
- `404` - 资源不存在（conversation_not_exists, file_not_found 等）
- `500` - 服务内部错误

流式响应中的错误会以 `error` 事件返回：
```json
{
  "event": "error",
  "task_id": "...",
  "status": 400,
  "code": "invalid_param",
  "message": "错误消息"
}
```

## 重要注意事项

1. **用户标识唯一性**：`user` 参数必须在应用内唯一，用于隔离不同用户的数据
2. **会话持久化**：使用 `conversation_id` 可以继续之前的对话
3. **文件类型限制**：根据模型能力支持不同文件类型（document/image/audio/video）
4. **流式模式推荐**：阻塞模式在长时间请求时可能超时（Cloudflare 限制 100 秒）
5. **API-Key 安全**：始终在后端使用 API-Key，不要暴露给客户端

## 详细文档

完整的 API 参考文档请查看 [reference.md](reference.md)，包含所有端点的详细参数说明和响应格式。
