import { RedoOutlined } from '@ant-design/icons'
import { IRating } from '@dify-chat/api'
import { copyToClipboard } from '@toolkit-fe/clipboard'
import { Space } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import LucideIcon from '../../lucide-icon'

export interface IMessageFooterProps {
	ttsConfig?: {
		enabled: boolean
		autoPlay: 'enabled' | 'disabled'
		language: string
		voice: string
	}
	question?: string
	messageId: string
	messageContent: string
	feedback?: {
		rating: IRating
		callback: () => void
	}
	isRequesting: boolean
	onRegenerateMessage?: () => void
}

/**
 * Message footer component
 */
export default function MessageFooter(props: IMessageFooterProps) {
	const {
		ttsConfig,
		question,
		messageId,
		messageContent,
		feedback,
		isRequesting,
		onRegenerateMessage,
	} = props
	const { t } = useTranslation()

	const handleCopy = useCallback(async () => {
		await copyToClipboard(messageContent)
	}, [messageContent])

	const handleLike = useCallback(() => {
		feedback?.callback()
	}, [feedback])

	const handleDislike = useCallback(() => {
		feedback?.callback()
	}, [feedback])

	return (
		<Space size={8}>
			{ttsConfig?.enabled && (
				<LucideIcon
					name="volume-2"
					size={16}
					className="cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={() => {
						// TODO: Implement TTS
						console.log('TTS not implemented yet')
					}}
				/>
			)}
			<LucideIcon
				name="copy"
				size={16}
				className="cursor-pointer text-gray-500 hover:text-gray-700"
				onClick={handleCopy}
			/>
			{feedback && (
				<>
					<LucideIcon
						name="thumbs-up"
						size={16}
						className={`cursor-pointer ${
							feedback.rating === 'like'
								? 'text-blue-500'
								: 'text-gray-500 hover:text-gray-700'
						}`}
						onClick={handleLike}
					/>
					<LucideIcon
						name="thumbs-down"
						size={16}
						className={`cursor-pointer ${
							feedback.rating === 'dislike'
								? 'text-red-500'
								: 'text-gray-500 hover:text-gray-700'
						}`}
						onClick={handleDislike}
					/>
				</>
			)}
			{onRegenerateMessage && !isRequesting && (
				<RedoOutlined
					className="cursor-pointer text-gray-500 hover:text-gray-700"
					onClick={onRegenerateMessage}
				/>
			)}
		</Space>
	)
}