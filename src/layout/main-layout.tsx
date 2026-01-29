import { XProvider } from '@ant-design/x'
import { AppModeEnums, IDifyAppItem, useAppContext } from '@dify-chat/core'
import React from 'react'

import { colors } from '@/theme/config'
import { isChatLikeApp, isWorkflowLikeApp } from '@/utils'

import ChatLayout from './chat-layout'
import CommonLayout from './common-layout'
import WorkflowLayout from './workflow-layout'

interface IMainLayoutProps {
	extComponents?: React.ReactNode
	renderCenterTitle?: (appInfo?: IDifyAppItem['info']) => React.ReactNode
	renderRightHeader?: () => React.ReactNode
	initLoading: boolean
	/** 头部模式：full-完整头部，minimal-仅保留主题/语言切换，none-完全隐藏头部 */
	headerMode?: 'full' | 'minimal' | 'none'
}

/**
 * 应用详情主界面布局
 */
const MainLayout = (props: IMainLayoutProps) => {
	const { currentApp } = useAppContext()

	// FIXME: 去掉这里的默认值
	const appMode = currentApp?.config?.info?.mode || AppModeEnums.CHATBOT

	return (
		<XProvider theme={{ token: { colorPrimary: colors.primary, colorText: colors['theme-text'] } }}>
			{isChatLikeApp(appMode) ? (
				<ChatLayout {...props} />
			) : (
				<CommonLayout
					initLoading={props.initLoading}
					renderCenterTitle={props.renderCenterTitle}
					extComponents={props.extComponents}
				>
					{isWorkflowLikeApp(appMode) ? <WorkflowLayout /> : <div>不支持的应用类型</div>}
				</CommonLayout>
			)}
		</XProvider>
	)
}

export default MainLayout
