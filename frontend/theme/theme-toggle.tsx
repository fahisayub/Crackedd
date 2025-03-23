'use client';

import { Button } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="bordered"
            size="sm"
            isIconOnly
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative"
        >
            <Sun
                className={`h-5 w-5 transition-transform ${theme !== 'dark' ? 'opacity-100' : 'opacity-0 scale-0'
                    }`}
            />
            <Moon
                className={`absolute h-5 w-5 transition-transform ${theme === 'dark' ? 'opacity-100' : 'opacity-0 scale-0'
                    }`}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
} 