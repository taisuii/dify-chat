import { IFile, IMessageItem4Render } from '@dify-chat/api'
import { MarkdownRenderer } from '../../markdown-renderer'
import MessageFileList from './file-list'

interface IMessageContentProps {
	messageItem: IMessageItem4Render
	onSubmit?: (
		value: string,
		options?: {
			files?: IFile[]
			inputs?: Record<string, unknown>
		},
	) => void
}

/**
 * Message content component
 */
export default function MessageContent(props: IMessageContentProps) {
	const { messageItem, onSubmit } = props

	return (
		<div className="flex w-full flex-col gap-2">
			<MarkdownRenderer
				markdownText={messageItem.content || ''}
				onSubmit={onSubmit}
			/>
			{messageItem.files && messageItem.files.length > 0 && (
				<MessageFileList files={messageItem.files} />
			)}
		</div>
	)
}