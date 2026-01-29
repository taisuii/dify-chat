import type { Message, MessageFile, DifyMessage, DifyConversation } from '@/types/chat';

export class DifyService {
  private apiBase: string;
  private apiKey: string;
  private user: string;

  constructor(apiBase: string, apiKey: string, user: string) {
    this.apiBase = apiBase.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.user = user;
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Send message and get streaming response
  async sendMessage(
    message: string,
    conversationId: string | null,
    files: MessageFile[],
    onMessage: (msg: DifyMessage) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<string | null> {
    const url = `${this.apiBase}/chat-messages`;
    
    const body: Record<string, unknown> = {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId || '',
      user: this.user,
      files: files.map(f => ({
        type: f.type.startsWith('image/') ? 'image' : 'document',
        transfer_method: 'local_file',
        upload_file_id: f.id,
      })),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let newConversationId: string | null = null;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return newConversationId;
            }

            try {
              const parsed: DifyMessage = JSON.parse(data);
              if (parsed.conversation_id) {
                newConversationId = parsed.conversation_id;
              }
              onMessage(parsed);
            } catch (e) {
              console.warn('Failed to parse message:', data);
            }
          }
        }
      }

      onComplete();
      return newConversationId;
    } catch (error) {
      onError(error as Error);
      return null;
    }
  }

  // Stop message generation
  async stopMessage(messageId: string, conversationId: string): Promise<void> {
    const url = `${this.apiBase}/chat-messages/${messageId}/stop`;
    
    await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        user: this.user,
        conversation_id: conversationId,
      }),
    });
  }

  // Upload file
  async uploadFile(file: File): Promise<MessageFile> {
    const url = `${this.apiBase}/files/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', this.user);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: data.url,
    };
  }

  // Get conversations list
  async getConversations(lastId?: string, limit: number = 20): Promise<DifyConversation[]> {
    const params = new URLSearchParams({
      user: this.user,
      limit: limit.toString(),
    });
    if (lastId) params.append('last_id', lastId);

    const url = `${this.apiBase}/conversations?${params}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get conversations: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    const url = `${this.apiBase}/conversations/${conversationId}`;
    
    await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ user: this.user }),
    });
  }

  // Rename conversation
  async renameConversation(conversationId: string, name: string): Promise<void> {
    const url = `${this.apiBase}/conversations/${conversationId}/name`;
    
    await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name,
        user: this.user,
      }),
    });
  }

  // Get conversation history
  async getConversationHistory(
    conversationId: string,
    firstId?: string,
    limit: number = 20
  ): Promise<Message[]> {
    const params = new URLSearchParams({
      user: this.user,
      limit: limit.toString(),
    });
    if (firstId) params.append('first_id', firstId);

    const url = `${this.apiBase}/messages?${params}&conversation_id=${conversationId}`;
    
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map((msg: Record<string, unknown>) => ({
      id: msg.id as string,
      role: (msg.role as string) === 'assistant' ? 'assistant' : 'user',
      content: msg.content as string,
      timestamp: msg.created_at as number,
      files: msg.files as MessageFile[],
    }));
  }

  // Submit feedback
  async submitFeedback(
    messageId: string,
    rating: 'like' | 'dislike',
    content?: string
  ): Promise<void> {
    const url = `${this.apiBase}/messages/${messageId}/feedbacks`;
    
    await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        rating,
        content,
        user: this.user,
      }),
    });
  }
}
