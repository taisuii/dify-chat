import type { LucideProps } from 'lucide-react'
import {
	ArrowLeftCircle,
	ArrowRightCircle,
	Bot,
	CircleCheck,
	Copy,
	Icon,
	type IconNode,
	Languages,
	Menu,
	Monitor,
	Moon,
	Network,
	Play,
	PlusCircle,
	Sun,
	ThumbsDown,
	ThumbsUp,
	Volume2,
} from 'lucide-react'
import type { ComponentType } from 'react'
import React from 'react'

/** widget 内实际使用的 Lucide 图标名 → 组件映射，避免 lucide-react/dynamic 在 Webpack 5 fullySpecified 下解析失败 */
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
	'arrow-left-circle': ArrowLeftCircle,
	'arrow-right-circle': ArrowRightCircle,
	bot: Bot,
	'circle-check': CircleCheck,
	copy: Copy,
	languages: Languages,
	menu: Menu,
	'moon-star': Moon,
	network: Network,
	play: Play,
	'plus-circle': PlusCircle,
	'screen-share': Monitor,
	sun: Sun,
	'thumbs-down': ThumbsDown,
	'thumbs-up': ThumbsUp,
	'volume-2': Volume2,
}

export type LucideIconName = keyof typeof ICON_MAP

export interface ILucideIconProps {
	/**
	 * 图标名称（仅支持 widget 内已映射的图标）
	 */
	name: LucideIconName
	color?: string
	size?: number
	strokeWidth?: number
	className?: string
	onClick?: React.MouseEventHandler<SVGElement>
	/**
	 * 自定义图标（Lucide IconNode）
	 */
	iconNode?: IconNode
}

/**
 * Lucide 图标组件（从主入口导入，兼容 CRA/Webpack 5）
 */
export default function LucideIcon(props: ILucideIconProps) {
	const { className, name, color, size, iconNode, strokeWidth, onClick } = props

	const commonProps: LucideProps = {
		color,
		strokeWidth: strokeWidth ?? 2,
		size: size ?? 14,
		className,
		onClick,
	}

	if (iconNode) {
		return <Icon iconNode={iconNode} {...commonProps} />
	}

	const IconComponent = ICON_MAP[name]
	if (!IconComponent) return null
	return <IconComponent {...commonProps} />
}

export { LucideIcon }
export type { ILucideIconProps, LucideIconName }
