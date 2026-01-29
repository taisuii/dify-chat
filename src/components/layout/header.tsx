import { LucideIcon } from '@/components'
import { useIsMobile } from '@dify-chat/helpers'
import { ThemeSelector, useThemeContext } from '@dify-chat/theme'
import { Space } from 'antd'
import classNames from 'classnames'
import React from 'react'

import CenterTitleWrapper from './center-title-wrapper'
import { GithubIcon, Logo } from './logo'
import I18nSwitcher from '../i18n-switcher'

export interface IHeaderLayoutProps {
	/**
	 * 自定义标题
	 */
	title?: React.ReactNode
	/**
	 * 传进来的标题是否已经包含容器
	 */
	isTitleWrapped?: boolean
	/**
	 * 自定义右侧图标
	 */
	rightIcon?: React.ReactNode
	/**
	 * Logo 文本
	 */
	logoText?: string
	/**
	 * 自定义 Logo 渲染
	 */
	renderLogo?: () => React.ReactNode
	/** 隐藏左侧 Logo（如嵌入态仅保留语言切换） */
	hideLogo?: boolean
	/** 隐藏中间标题 */
	hideTitle?: boolean
}

const HeaderSiderIcon = (props: { align: 'left' | 'right'; children: React.ReactNode }) => {
	return (
		<div
			className={classNames({
				'flex-1 h-full flex items-center': true,
				'justify-start': props.align === 'left',
				'justify-end': props.align === 'right',
			})}
		>
			{props.children}
		</div>
	)
}

/**
 * 头部布局组件
 */
export default function HeaderLayout(props: IHeaderLayoutProps) {
	const { isTitleWrapped, title, rightIcon, logoText, renderLogo, hideLogo, hideTitle } = props
	const { themeMode } = useThemeContext()
	const isMobile = useIsMobile()
	return (
		<div className="flex h-16 items-center justify-between px-4">
			<HeaderSiderIcon align="left">
				{hideLogo ? null : (
					<Logo
						text={logoText}
						renderLogo={renderLogo}
						hideText={isMobile}
						hideGithubIcon
					/>
				)}
			</HeaderSiderIcon>

			{hideTitle ? null : isTitleWrapped ? title : <CenterTitleWrapper>{title}</CenterTitleWrapper>}

			<HeaderSiderIcon align="right">
				{rightIcon ?? (
					<Space className="flex items-center" size={16}>
						<ThemeSelector>
							<div className="flex cursor-pointer items-center">
								<LucideIcon
									name={
										themeMode === 'dark'
											? 'moon-star'
											: themeMode === 'light'
												? 'sun'
												: 'screen-share'
									}
									size={20}
								/>
							</div>
						</ThemeSelector>
						<I18nSwitcher />
						<GithubIcon />
					</Space>
				)}
			</HeaderSiderIcon>
		</div>
	)
}
