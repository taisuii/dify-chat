import config from '../config/runtime-config'

/**
 * 判断是否为 debug 模式
 */
export const isDebugMode = () => {
	return config.PUBLIC_DEBUG_MODE === 'true'
}

export default function DebugMode() {
	if (!isDebugMode()) {
		return null
	}
	return (
		<div
			style={{
				position: 'fixed',
				top: 100,
				right: 0,
				background: 'rgba(0,0,0,0.8)',
				color: '#fff',
				padding: 10,
				fontSize: 12,
				zIndex: 9999,
			}}
		>
			Debug Mode
		</div>
	)
}