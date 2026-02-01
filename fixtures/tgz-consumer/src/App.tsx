import { DifyChat } from '@dify-chat/widget'
import { ConfigProvider } from 'antd'


/**
 * 最小集成：仅渲染 DifyChat，用于验证 tgz 安装后能否正常构建与运行。
 * 配置好 API_BASE / API_KEY 后可看到完整聊天界面。
 */
export default function App() {
  return (
    <ConfigProvider>
      <div style={{ height: '100vh', padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>tgz-consumer · 安装验证</h2>
        <div style={{ height: 'calc(100vh - 80px)' }}>
          <DifyChat apiBase="https://ai.sngzs.site/v1" apiKey="app-abiD8xtMKIhzusCd7Sh8QRpF" user="showcase-user" />
        </div>
      </div>
    </ConfigProvider>
  )
}
