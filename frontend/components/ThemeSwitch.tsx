'use client';

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../theme';

export default function ThemeSwitch() {
    const { theme, setTheme } = useTheme();

    const icons = {
        light: <Sun className="h-5 w-5" />,
        dark: <Moon className="h-5 w-5" />,
        system: <Monitor className="h-5 w-5" />,
    };

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    variant="bordered"
                    size="sm"
                    isIconOnly
                    aria-label="Change theme"
                >
                    {theme === 'light' && icons.light}
                    {theme === 'dark' && icons.dark}
                    {theme === 'system' && icons.system}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Theme selection">
                <DropdownItem
                    key="light"
                    startContent={icons.light}
                    onPress={() => setTheme('light')}
                >
                    Light
                </DropdownItem>
                <DropdownItem
                    key="dark"
                    startContent={icons.dark}
                    onPress={() => setTheme('dark')}
                >
                    Dark
                </DropdownItem>
                <DropdownItem
                    key="system"
                    startContent={icons.system}
                    onPress={() => setTheme('system')}
                >
                    System
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
} 