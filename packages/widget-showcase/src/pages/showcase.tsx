import { DifyChat } from '@dify-chat/widget'

export default function ShowcasePage() {
	return (
		<div style={{ height: '100vh', padding: '20px' }}>
			<h1 style={{ marginBottom: '20px' }}>DifyChat Widget 使用展示</h1>
			<div
				style={{
					height: 'calc(100vh - 100px)',
					border: '1px solid #d9d9d9',
					borderRadius: '8px',
					overflow: 'hidden',
				}}
			>
				<DifyChat
					apiBase="https://ai.sngzs.site/v1"
					apiKey="app-abiD8xtMKIhzusCd7Sh8QRpF"
					user="showcase-user"
				/>
			</div>
		</div>
	)
}
