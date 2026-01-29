import { useState } from 'react';
import { ChatPanel } from '@/components/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Settings,
  MessageSquare,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import './App.css';

function App() {
  // Configuration state
  const [apiBase, setApiBase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState(`user-${Date.now()}`);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [showConfig, setShowConfig] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    if (apiBase && apiKey) {
      setIsConnected(true);
      setShowConfig(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setShowConfig(true);
  };

  const handleMessageSend = (msg: string, files?: unknown[]) => {
    console.log('[对话面板] 用户消息:', msg, files);
  };

  return (
    <div className={`min-h-screen ${theme}`} data-theme={theme}>
      {/* Configuration Panel */}
      {showConfig && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Dify Chat 组件配置</CardTitle>
              </div>
              <CardDescription>
                配置 Dify API 连接参数以开始使用聊天组件
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiBase">API Base URL</Label>
                <Input
                  id="apiBase"
                  placeholder="https://api.dify.ai/v1"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Dify API 的基础地址，例如: https://api.dify.ai/v1
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="your-api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  从 Dify 控制台获取的 API Key
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>主题</Label>
                  <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>浅色</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>深色</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>语言</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as 'zh' | 'en')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>中文</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>English</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">主题色</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleConnect}
                disabled={!apiBase || !apiKey}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                连接并开始聊天
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chat Interface */}
      {isConnected && (
        <div className="h-screen flex flex-col">
          {/* Top Bar */}
          <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold">Dify Chat</h1>
              <span className="text-xs text-muted-foreground">
                {apiBase}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <Settings className="h-4 w-4 mr-2" />
                重新配置
              </Button>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              apiBase={apiBase}
              apiKey={apiKey}
              user={userId}
              title={language === 'zh' ? '聊天界面' : 'Chat Panel'}
              theme={theme}
              language={language}
              config={{
                features: {
                  sidebar: true,
                  fileUpload: true,
                  feedback: true,
                  suggestions: true,
                  workflow: true,
                },
                theme: {
                  primaryColor: primaryColor,
                  accentColor: primaryColor,
                },
                i18n: {
                  welcomeMessage: language === 'zh' 
                    ? '你好！很高兴见到你~' 
                    : 'Hello! Nice to meet you~',
                  placeholder: language === 'zh' 
                    ? '输入消息...' 
                    : 'Type a message...',
                  thinking: language === 'zh' ? '正在思考...' : 'Thinking...',
                  send: language === 'zh' ? '发送' : 'Send',
                  newChat: language === 'zh' ? '新对话' : 'New Chat',
                  copy: language === 'zh' ? '复制' : 'Copy',
                  copied: language === 'zh' ? '已复制' : 'Copied',
                  like: language === 'zh' ? '点赞' : 'Like',
                  dislike: language === 'zh' ? '点踩' : 'Dislike',
                  regenerate: language === 'zh' ? '重新生成' : 'Regenerate',
                  uploadFile: language === 'zh' ? '上传文件' : 'Upload File',
                  uploadImage: language === 'zh' ? '上传图片' : 'Upload Image',
                  dragDropHint: language === 'zh' 
                    ? '拖放文件到此处' 
                    : 'Drop files here',
                  aiDisclaimer: language === 'zh' 
                    ? '内容由 AI 生成，仅供参考' 
                    : 'Content generated by AI, for reference only',
                },
              }}
              onMessageSend={handleMessageSend}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
