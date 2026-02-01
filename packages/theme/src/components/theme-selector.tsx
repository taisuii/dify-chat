import { Dropdown } from 'antd'
import { useThemeContext } from '../hooks'
import { ThemeModeEnum, ThemeModeLabelEnum } from '../constants'
import { Monitor, Moon, Sun } from 'lucide-react'

interface IThemeSelectorProps {
	children?: React.ReactNode
}

/**
 * 主题选择器组件
 */
export default function ThemeSelector(props: IThemeSelectorProps) {
	const { children } = props
	const { themeMode, setThemeMode } = useThemeContext()

	return (
		<Dropdown
			placement="bottomRight"
			menu={{
				selectedKeys: [themeMode],
				items: [
					{
						type: 'item',
						key: ThemeModeEnum.SYSTEM,
						label: ThemeModeLabelEnum.SYSTEM,
						icon: <Monitor />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.LIGHT,
						label: ThemeModeLabelEnum.LIGHT,
						icon: <Sun />,
					},
					{
						type: 'item',
						key: ThemeModeEnum.DARK,
						label: ThemeModeLabelEnum.DARK,
						icon: <Moon />,
					},
				],
				onClick: item => {
					setThemeMode(item.key as ThemeModeEnum)
				},
			}}
		>
			{children}
		</Dropdown>
	)
}
