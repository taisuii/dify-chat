# Dify API 完整参考文档

本文档包含 Dify AI 应用 API 的完整接口说明。

## 基础信息

**基础 URL**: `http://ai.sngzs.site/v1`

**鉴权**: 所有请求需要在 Header 中包含 `Authorization: Bearer {API_KEY}`

---

## API 端点列表

### 对话消息

#### POST /chat-messages
发送对话消息，支持流式和阻塞两种模式。

**请求参数**：
- `query` (string, 必需) - 用户输入/提问内容
- `user` (string, 必需) - 用户标识，应用内唯一
- `response_mode` (string) - `streaming`（推荐）或 `blocking`
- `conversation_id` (string, 可选) - 会话 ID，用于继续对话
- `inputs` (object, 可选) - App 定义的变量值，默认 `{}`
- `files` (array[object], 可选) - 文件列表
  - `type` (string) - `document`/`image`/`audio`/`video`/`custom`
  - `transfer_method` (string) - `remote_url` 或 `local_file`
  - `url` (string) - 文件地址（remote_url 时）
  - `upload_file_id` (string) - 上传文件 ID（local_file 时）
- `auto_generate_name` (bool, 可选) - 自动生成标题，默认 `true`
- `workflow_id` (string, 可选) - 工作流 ID，指定特定版本
- `trace_id` (string, 可选) - 链路追踪 ID

**响应模式**：

**阻塞模式** (`blocking`)：
```json
{
  "event": "message",
  "task_id": "...",
  "id": "...",
  "message_id": "...",
  "conversation_id": "...",
  "mode": "chat",
  "answer": "完整回复内容",
  "metadata": {
    "usage": {...},
    "retriever_resources": [...]
  },
  "created_at": 1705395332
}
```

**流式模式** (`streaming`)：
返回 `text/event-stream` 格式，每个事件以 `data: ` 开头，用 `\n\n` 分隔。

事件类型：
- `message` - 文本块
- `message_end` - 消息结束（包含完整元数据）
- `message_file` - 文件事件
- `tts_message` - TTS 音频流（base64 编码）
- `tts_message_end` - TTS 结束
- `message_replace` - 内容替换（审查触发）
- `workflow_started` - 工作流开始
- `node_started` - 节点开始
- `node_finished` - 节点结束
- `workflow_finished` - 工作流结束
- `error` - 错误事件
- `ping` - 心跳（每 10 秒）

**错误码**：
- `404` - 对话不存在
- `400` - invalid_param, app_unavailable, provider_not_initialize, provider_quota_exceeded, model_currently_not_support, workflow_not_found, draft_workflow_error, workflow_id_format_error, completion_request_error
- `500` - 服务内部异常

---

### 文件管理

#### POST /files/upload
上传文件，使用 `multipart/form-data` 格式。

**请求参数**：
- `file` (file, 必需) - 要上传的文件
- `user` (string, 必需) - 用户标识

**响应**：
```json
{
  "id": "72fa9618-8f89-4a37-9b33-7e1178a24a67",
  "name": "example.png",
  "size": 1024,
  "extension": "png",
  "mime_type": "image/png",
  "created_by": 123,
  "created_at": 1577836800
}
```

**错误码**：
- `400` - no_file_uploaded, too_many_files, unsupported_preview, unsupported_estimate
- `413` - file_too_large
- `415` - unsupported_file_type
- `503` - s3_connection_failed, s3_permission_denied, s3_file_too_large

#### GET /files/:file_id/preview
预览或下载已上传的文件。

**路径参数**：
- `file_id` (string, 必需) - 文件 ID

**查询参数**：
- `as_attachment` (boolean, 可选) - 是否作为附件下载，默认 `false`

**错误码**：
- `400` - invalid_param
- `403` - file_access_denied
- `404` - file_not_found
- `500` - 服务内部错误

---

### 会话控制

#### POST /chat-messages/:task_id/stop
停止流式响应（仅流式模式）。

**路径参数**：
- `task_id` (string, 必需) - 任务 ID

**请求参数**：
- `user` (string, 必需) - 用户标识

**响应**：
```json
{
  "result": "success"
}
```

---

### 会话管理

#### GET /conversations
获取会话列表。

**查询参数**：
- `user` (string, 必需) - 用户标识
- `last_id` (string, 可选) - 当前页最后一条记录的 ID
- `limit` (int, 可选) - 每页数量，默认 20，最大 100
- `sort_by` (string, 可选) - 排序字段，默认 `-updated_at`

**响应**：
```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "10799fb8-64f7-4296-bbf7-b42bfbe0ae54",
      "name": "New chat",
      "inputs": {...},
      "status": "normal",
      "created_at": 1679667915,
      "updated_at": 1679667915
    }
  ]
}
```

#### DELETE /conversations/:conversation_id
删除会话。

**路径参数**：
- `conversation_id` (string, 必需) - 会话 ID

**请求参数**：
- `user` (string, 必需) - 用户标识

**响应**：`204 No Content`

#### POST /conversations/:conversation_id/name
会话重命名。

**路径参数**：
- `conversation_id` (string, 必需) - 会话 ID

**请求参数**：
- `name` (string, 可选) - 名称
- `auto_generate` (bool, 可选) - 自动生成标题，默认 `false`
- `user` (string, 必需) - 用户标识

**响应**：
```json
{
  "id": "...",
  "name": "hello",
  "inputs": {},
  "status": "normal",
  "introduction": "",
  "created_at": 1732731141,
  "updated_at": 1732734510
}
```

#### GET /conversations/:conversation_id/variables
获取对话变量。

**路径参数**：
- `conversation_id` (string, 必需) - 会话 ID

**查询参数**：
- `user` (string, 必需) - 用户标识
- `last_id` (string, 可选) - 分页参数
- `limit` (int, 可选) - 每页数量，默认 20，最大 100

**响应**：
```json
{
  "limit": 100,
  "has_more": false,
  "data": [
    {
      "id": "variable-uuid-1",
      "name": "customer_name",
      "value_type": "string",
      "value": "John Doe",
      "description": "客户名称",
      "created_at": 1650000000000,
      "updated_at": 1650000000000
    }
  ]
}
```

#### PUT /conversations/:conversation_id/variables/:variable_id
更新对话变量。

**路径参数**：
- `conversation_id` (string, 必需) - 会话 ID
- `variable_id` (string, 必需) - 变量 ID

**请求参数**：
- `value` (any, 必需) - 变量的新值
- `user` (string, 必需) - 用户标识

**错误码**：
- `400` - Type mismatch
- `404` - conversation_not_exists, conversation_variable_not_exists

---

### 消息管理

#### GET /messages
获取会话历史消息（倒序返回）。

**查询参数**：
- `conversation_id` (string, 必需) - 会话 ID
- `user` (string, 必需) - 用户标识
- `first_id` (string, 可选) - 当前页第一条记录的 ID
- `limit` (int, 可选) - 每页数量，默认 20

**响应**：
```json
{
  "limit": 20,
  "has_more": false,
  "data": [
    {
      "id": "...",
      "conversation_id": "...",
      "inputs": {...},
      "query": "用户问题",
      "message_files": [],
      "answer": "AI 回答",
      "feedback": null,
      "retriever_resources": [...],
      "created_at": 1705569239
    }
  ]
}
```

#### POST /messages/:message_id/feedbacks
消息反馈（点赞/点踩）。

**路径参数**：
- `message_id` (string, 必需) - 消息 ID

**请求参数**：
- `rating` (string, 必需) - `like` / `dislike` / `null`（撤销）
- `user` (string, 必需) - 用户标识
- `content` (string, 可选) - 反馈内容

**响应**：
```json
{
  "result": "success"
}
```

#### GET /messages/:message_id/suggested
获取下一轮建议问题列表。

**路径参数**：
- `message_id` (string, 必需) - 消息 ID

**查询参数**：
- `user` (string, 必需) - 用户标识

**响应**：
```json
{
  "result": "success",
  "data": ["问题1", "问题2", "问题3"]
}
```

#### GET /app/feedbacks
获取 APP 的消息点赞和反馈。

**查询参数**：
- `page` (string, 可选) - 页码，默认 1
- `limit` (string, 可选) - 每页数量，默认 20

**响应**：
```json
{
  "data": [
    {
      "id": "...",
      "app_id": "...",
      "conversation_id": "...",
      "message_id": "...",
      "rating": "like",
      "content": "反馈内容",
      "from_source": "user",
      "from_end_user_id": "...",
      "created_at": "2025-04-24T09:24:38",
      "updated_at": "2025-04-24T09:24:38"
    }
  ]
}
```

---

### 语音转换

#### POST /audio-to-text
语音转文字。

**请求格式**：`multipart/form-data`

**请求参数**：
- `file` (file, 必需) - 语音文件
  - 支持格式：`mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`
  - 文件大小限制：15MB
- `user` (string, 必需) - 用户标识

**响应**：
```json
{
  "text": "转换后的文字"
}
```

#### POST /text-to-audio
文字转语音。

**请求参数**：
- `message_id` (string, 可选) - Dify 生成的文本消息 ID（优先使用）
- `text` (string, 可选) - 语音生成内容（无 message_id 时使用）
- `user` (string, 必需) - 用户标识

**响应**：
- Content-Type: `audio/wav`
- 返回音频文件流

---

### 应用信息

#### GET /info
获取应用基本信息。

**响应**：
```json
{
  "name": "My App",
  "description": "This is my app.",
  "tags": ["tag1", "tag2"],
  "mode": "advanced-chat",
  "author_name": "Dify"
}
```

#### GET /parameters
获取应用参数（功能开关、输入表单配置等）。

**响应**：
```json
{
  "introduction": "开场白",
  "suggested_questions": ["问题1", "问题2"],
  "suggested_questions_after_answer": {
    "enabled": true
  },
  "speech_to_text": {
    "enabled": true
  },
  "text_to_speech": {
    "enabled": true,
    "voice": "...",
    "language": "...",
    "autoPlay": "enabled"
  },
  "retriever_resource": {
    "enabled": true
  },
  "annotation_reply": {
    "enabled": true
  },
  "user_input_form": [...],
  "file_upload": {
    "document": {...},
    "image": {...},
    "audio": {...},
    "video": {...},
    "custom": {...}
  },
  "system_parameters": {
    "file_size_limit": 15,
    "image_file_size_limit": 10,
    "audio_file_size_limit": 50,
    "video_file_size_limit": 100
  }
}
```

#### GET /meta
获取应用 Meta 信息（工具图标等）。

**响应**：
```json
{
  "tool_icons": {
    "dalle2": "https://...",
    "api_tool": {
      "background": "#252525",
      "content": "😁"
    }
  }
}
```

#### GET /site
获取应用 WebApp 设置。

**响应**：
```json
{
  "title": "My App",
  "chat_color_theme": "#ff4a4a",
  "chat_color_theme_inverted": false,
  "icon_type": "emoji",
  "icon": "😄",
  "icon_background": "#FFEAD5",
  "icon_url": null,
  "description": "This is my app.",
  "copyright": "all rights reserved",
  "privacy_policy": "",
  "custom_disclaimer": "All generated by AI",
  "default_language": "en-US",
  "show_workflow_steps": false,
  "use_icon_as_answer_icon": false
}
```

---

### 标注管理

#### GET /apps/annotations
获取标注列表。

**查询参数**：
- `page` (string, 可选) - 页码
- `limit` (string, 可选) - 每页数量

**响应**：
```json
{
  "data": [
    {
      "id": "...",
      "question": "问题",
      "answer": "答案",
      "hit_count": 0,
      "created_at": 1735625869
    }
  ],
  "has_more": false,
  "limit": 20,
  "total": 1,
  "page": 1
}
```

#### POST /apps/annotations
创建标注。

**请求参数**：
- `question` (string, 必需) - 问题
- `answer` (string, 必需) - 答案内容

**响应**：同 GET 响应格式

#### PUT /apps/annotations/:annotation_id
更新标注。

**路径参数**：
- `annotation_id` (string, 必需) - 标注 ID

**请求参数**：
- `question` (string, 必需) - 问题
- `answer` (string, 必需) - 答案内容

**响应**：同 GET 响应格式

#### DELETE /apps/annotations/:annotation_id
删除标注。

**路径参数**：
- `annotation_id` (string, 必需) - 标注 ID

**响应**：`204 No Content`

#### POST /apps/annotation-reply/:action
标注回复初始设置。

**路径参数**：
- `action` (string, 必需) - `enable` 或 `disable`

**请求参数**：
- `embedding_provider_name` (string, 必需) - 嵌入模型提供商
- `embedding_model_name` (string, 必需) - 嵌入模型名称
- `score_threshold` (number, 必需) - 相似度阈值

**响应**：
```json
{
  "job_id": "...",
  "job_status": "waiting"
}
```

#### GET /apps/annotation-reply/:action/status/:job_id
查询标注回复初始设置任务状态。

**路径参数**：
- `action` (string, 必需) - `enable` 或 `disable`
- `job_id` (string, 必需) - 任务 ID

**响应**：
```json
{
  "job_id": "...",
  "job_status": "waiting",
  "error_msg": ""
}
```

---

## 文件类型支持

### Document
支持类型：`TXT`, `MD`, `MARKDOWN`, `MDX`, `PDF`, `HTML`, `XLSX`, `XLS`, `VTT`, `PROPERTIES`, `DOC`, `DOCX`, `CSV`, `EML`, `MSG`, `PPTX`, `PPT`, `XML`, `EPUB`

### Image
支持类型：`JPG`, `JPEG`, `PNG`, `GIF`, `WEBP`, `SVG`

### Audio
支持类型：`MP3`, `M4A`, `WAV`, `WEBM`, `MPGA`

### Video
支持类型：`MP4`, `MOV`, `MPEG`, `WEBM`

---

## 使用示例

### 完整对话流程

```typescript
// 1. 首次对话
const firstResponse = await fetch('http://ai.sngzs.site/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '你好',
    user: 'user-123',
    response_mode: 'streaming',
  }),
});

// 从 message_end 事件获取 conversation_id
let conversationId = '';

// 2. 继续对话
const continueResponse = await fetch('http://ai.sngzs.site/v1/chat-messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: '继续刚才的话题',
    user: 'user-123',
    response_mode: 'streaming',
    conversation_id: conversationId, // 使用之前的会话 ID
  }),
});
```

### 处理流式响应

```typescript
async function handleStreamResponse(response: Response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || ''; // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          switch (data.event) {
            case 'message':
              // 累积文本块
              console.log('文本:', data.answer);
              break;
            case 'message_end':
              // 完整响应
              console.log('完整答案:', data.metadata);
              break;
            case 'error':
              // 错误处理
              console.error('错误:', data.message);
              break;
            case 'workflow_started':
              console.log('工作流开始:', data.workflow_run_id);
              break;
            case 'workflow_finished':
              console.log('工作流结束:', data.data.status);
              break;
          }
        } catch (e) {
          console.error('解析错误:', e);
        }
      }
    }
  }
}
```
