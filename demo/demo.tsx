/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChatWidget, ChatPanel } from 'dify-chat-widget'
import 'antd/dist/reset.css'
import { ConfigProvider, Select, Space, Switch, Typography } from 'antd'

const apiBase = import.meta.env.VITE_DIFY_API_BASE || 'https://ai.sngzs.site/v1'
const apiKey = import.meta.env.VITE_DIFY_API_KEY || ''
const userId = import.meta.env.VITE_DIFY_USER || 'demo-user'

const DemoApp: React.FC<{ apiBase: string; apiKey: string; userId: string }> = ({
  apiBase,
  apiKey,
  userId,
}) => {
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('light')
  const [language, setLanguage] = React.useState<'zh' | 'en'>('zh')
  const [primaryColor, setPrimaryColor] = React.useState('#111827')
  const [widgetSize, setWidgetSize] = React.useState<'default' | 'large' | 'responsive'>('default')

  return (
    <>
      {/* API 配置提示 */}
      {(!apiKey || apiKey === '') && (
        <div style={{ 
          maxWidth: 820, 
          margin: '24px auto 12px', 
          padding: '16px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <strong>⚠️ API 配置提示：</strong>
          <p style={{ margin: '8px 0 0' }}>
            请在 <code>.env.local</code> 文件中配置正确的 Dify API Key：
            <br />
            <code>VITE_DIFY_API_BASE=https://your-dify-api.com/v1</code>
            <br />
            <code>VITE_DIFY_API_KEY=app-your-api-key-here</code>
          </p>
        </div>
      )}
      
      <div style={{ maxWidth: 820, margin: '24px auto 12px' }}>
        <Space size="large" align="center" wrap>
          <Typography.Text>主题</Typography.Text>
          <Switch
            checked={themeMode === 'dark'}
            onChange={(checked) => setThemeMode(checked ? 'dark' : 'light')}
            checkedChildren="暗色"
            unCheckedChildren="亮色"
          />
          <Typography.Text>语言</Typography.Text>
          <Select
            value={language}
            onChange={(value) => setLanguage(value)}
            options={[
              { value: 'zh', label: '中文' },
              { value: 'en', label: 'English' },
            ]}
            style={{ width: 120 }}
          />
          <Typography.Text>主题色</Typography.Text>
          <Select
            value={primaryColor}
            onChange={(value) => setPrimaryColor(value)}
            options={[
              { value: '#111827', label: '默认黑' },
              { value: '#2563eb', label: '蓝色' },
              { value: '#7c3aed', label: '紫色' },
              { value: '#059669', label: '绿色' },
            ]}
            style={{ width: 120 }}
          />
          <Typography.Text>悬浮窗尺寸</Typography.Text>
          <Select
            value={widgetSize}
            onChange={(value) => setWidgetSize(value)}
            options={[
              { value: 'default', label: '默认 (384×560)' },
              { value: 'large', label: '大尺寸 (480×700)' },
              { value: 'responsive', label: '响应式 (90%×85vh)' },
            ]}
            style={{ width: 180 }}
          />
        </Space>
      </div>

      {/* 悬浮窗入口（右下角） - 支持尺寸配置 */}
      <ChatWidget
        apiBase={apiBase}
        apiKey={apiKey}
        user={userId}
        theme={themeMode}
        language={language}
        config={{
          theme: {
            primaryColor: primaryColor,
            accentColor: primaryColor,
          },
          ui: {
            // 根据选择的尺寸配置悬浮窗大小
            widgetWidth: widgetSize === 'large' ? 480 : widgetSize === 'responsive' ? '90%' : 384,
            widgetHeight: widgetSize === 'large' ? 700 : widgetSize === 'responsive' ? '85vh' : 560,
          },
        }}
        onMessageSend={(msg) => console.log('[悬浮窗] 用户消息:', msg)}
      />

      {/* 页面中内嵌的对话面板 - 响应式容器示例 */}
      <div style={{ width: '90%', height: '80vh', margin: '0 auto' }}>
        <ChatPanel
          apiBase={apiBase}
          apiKey={apiKey}
          user={userId}
          title={language === 'zh' ? '聊天界面' : 'Chat Panel'}
          theme={themeMode}
          language={language}
          config={{
            features: {
              sidebar: true,
              fileUpload: true,
              feedback: true,
            },
            theme: {
              primaryColor: primaryColor,
              accentColor: primaryColor,
            },
          }}
          onMessageSend={(msg) => console.log('[对话面板] 用户消息:', msg)}
        />
      </div>
    </>
  )
}

// 仅演示两个场景：悬浮窗入口 + 内嵌对话面板
ReactDOM.createRoot(document.getElementById('demo-root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <DemoApp apiBase={apiBase} apiKey={apiKey} userId={userId} />
    </ConfigProvider>
  </React.StrictMode>
)