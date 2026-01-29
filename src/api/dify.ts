export type DifyClientConfig = {
  apiBase: string;
  apiKey: string;
};

export type DifyConversation = {
  id: string;
  name?: string;
  created_at?: number;
};

export type DifyMessage = {
  id: string;
  conversation_id?: string;
  query?: string;
  answer?: string;
  created_at?: number;
  metadata?: Record<string, unknown>;
};

export type DifyFileInput = {
  type: 'image' | 'document' | 'audio' | 'video';
  transfer_method: 'local_file';
  upload_file_id: string;
};

export type DifyChatPayload = {
  query: string;
  user: string;
  response_mode?: 'streaming' | 'blocking';
  conversation_id?: string;
  inputs?: Record<string, unknown>;
  files?: DifyFileInput[];
};

export type DifyStreamHandlers = {
  onMessageChunk?: (text: string) => void;
  onMessageEnd?: (payload: Record<string, unknown>) => void;
  onEvent?: (event: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
};

const buildHeaders = (apiKey: string, extra?: Record<string, string>) => {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    ...extra,
  };
  return headers;
};

const normalizeBase = (apiBase: string) => apiBase.replace(/\/$/, '');

const ensureOk = async (response: Response) => {
  if (response.ok) return response;
  const raw = await response.text();
  try {
    const data = JSON.parse(raw) as { message?: string; code?: string };
    const detail = [data.code, data.message].filter(Boolean).join(': ');
    throw new Error(detail || raw || `Request failed: ${response.status}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes(':')) {
      throw err; // 重新抛出已解析的错误
    }
    throw new Error(raw || `Request failed: ${response.status}`);
  }
};

export const listConversations = async (
  config: DifyClientConfig,
  user: string,
): Promise<DifyConversation[]> => {
  const url = `${normalizeBase(config.apiBase)}/conversations?user=${encodeURIComponent(user)}`;
  const response = await ensureOk(
    await fetch(url, {
      headers: buildHeaders(config.apiKey),
    }),
  );
  const data = await response.json();
  return (data?.data ?? []) as DifyConversation[];
};

export const deleteConversation = async (
  config: DifyClientConfig,
  conversationId: string,
): Promise<void> => {
  const url = `${normalizeBase(config.apiBase)}/conversations/${conversationId}`;
  await ensureOk(
    await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(config.apiKey),
    }),
  );
};

export const renameConversation = async (
  config: DifyClientConfig,
  conversationId: string,
  name: string,
): Promise<void> => {
  const url = `${normalizeBase(config.apiBase)}/conversations/${conversationId}/name`;
  await ensureOk(
    await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config.apiKey, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ name }),
    }),
  );
};

export const listMessages = async (
  config: DifyClientConfig,
  conversationId: string,
  user: string,
): Promise<DifyMessage[]> => {
  const url = `${normalizeBase(config.apiBase)}/messages?conversation_id=${encodeURIComponent(
    conversationId,
  )}&user=${encodeURIComponent(user)}`;
  const response = await ensureOk(
    await fetch(url, {
      headers: buildHeaders(config.apiKey),
    }),
  );
  const data = await response.json();
  return (data?.data ?? []) as DifyMessage[];
};

export const uploadFile = async (
  config: DifyClientConfig,
  file: File,
  user: string,
): Promise<string> => {
  const url = `${normalizeBase(config.apiBase)}/files/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', user);
  const response = await ensureOk(
    await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config.apiKey),
      body: formData,
    }),
  );
  const data = await response.json();
  return (data?.id || data?.upload_file_id) as string;
};

export const streamChatMessage = async (
  config: DifyClientConfig,
  payload: DifyChatPayload,
  handlers: DifyStreamHandlers,
) => {
  const url = `${normalizeBase(config.apiBase)}/chat-messages`;
  const response = await ensureOk(
    await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config.apiKey, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        ...payload,
        inputs: payload.inputs ?? {},
        response_mode: 'streaming',
      }),
    }),
  );

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Stream not supported in this environment.');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let lastTaskId: string | undefined;
  let lastMessageId: string | undefined;
  let lastConversationId: string | undefined;
  let lastMetadata: Record<string, unknown> | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() ?? '';

      for (const chunk of chunks) {
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const jsonText = line.replace(/^data:\s*/, '');
          if (!jsonText) continue;
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(jsonText);
          } catch (error) {
            continue;
          }
          handlers.onEvent?.(data);

          const event = data.event as string | undefined;
          if (event === 'message') {
            if (typeof data.answer === 'string') {
              handlers.onMessageChunk?.(data.answer);
            }
            if (typeof data.task_id === 'string') {
              lastTaskId = data.task_id;
            }
          } else if (event === 'message_end') {
            lastMessageId = data.message_id as string | undefined;
            lastConversationId = data.conversation_id as string | undefined;
            lastMetadata = (data.metadata as Record<string, unknown>) ?? undefined;
            handlers.onMessageEnd?.(data);
          } else if (event === 'error') {
            const error = new Error((data.message as string) || 'Dify stream error');
            handlers.onError?.(error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    taskId: lastTaskId,
    messageId: lastMessageId,
    conversationId: lastConversationId,
    metadata: lastMetadata,
  };
};

export const stopChatTask = async (
  config: DifyClientConfig,
  taskId: string,
): Promise<void> => {
  const url = `${normalizeBase(config.apiBase)}/chat-messages/${taskId}/stop`;
  await ensureOk(
    await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config.apiKey),
    }),
  );
};

export const submitFeedback = async (
  config: DifyClientConfig,
  messageId: string,
  rating: 'like' | 'dislike',
): Promise<void> => {
  const url = `${normalizeBase(config.apiBase)}/messages/${messageId}/feedbacks`;
  await ensureOk(
    await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config.apiKey, {
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ rating }),
    }),
  );
};

export const getAppParameters = async (
  config: DifyClientConfig,
  user: string,
): Promise<{
  opening_statement?: string;
  suggested_questions?: string[];
}> => {
  const url = `${normalizeBase(config.apiBase)}/parameters?user=${encodeURIComponent(user)}`;
  const response = await ensureOk(
    await fetch(url, {
      headers: buildHeaders(config.apiKey),
    }),
  );
  const data = await response.json();
  return data ?? {};
};
