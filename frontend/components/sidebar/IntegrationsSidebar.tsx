"use client";

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  SlackIcon,
  MessageSquareIcon,
  MailIcon,
  CheckSquareIcon,
  PaletteIcon
} from 'lucide-react';
import { Button } from '@heroui/react';
import dynamic from 'next/dynamic';

// Dynamically import ThemeSwitch with no SSR
const ThemeSwitch = dynamic(
  () => import('../ThemeSwitch'),
  { ssr: false }
);

interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  color: string;
}

const integrations: IntegrationInfo[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect to Slack workspaces',
    icon: <SlackIcon className="h-6 w-6" />,
    available: true,
    color: 'bg-[#4A154B]'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Integrate with Notion workspaces',
    icon: <MessageSquareIcon className="h-6 w-6" />,
    available: false,
    color: 'bg-[#000000]'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect to Gmail',
    icon: <MailIcon className="h-6 w-6" />,
    available: false,
    color: 'bg-[#D44638]'
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Integrate with ClickUp',
    icon: <CheckSquareIcon className="h-6 w-6" />,
    available: false,
    color: 'bg-[#7B68EE]'
  }
];

export function IntegrationsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const openIntegrationModal = (integrationId: string) => {
    setCurrentIntegration(integrationId);
    if (integrationId === 'slack') {
      // Since we're using Thread component to handle the messages,
      // we'll use navigate logic instead of direct message sending
      console.log('Initiating Slack connection process');
      window.dispatchEvent(new CustomEvent('connect-slack'));
    } else {
      console.log(`Opening ${integrationId} modal (coming soon)`);
    }
  };

  const handleComingSoonClick = () => {
    console.log("This integration is coming soon!");
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full bg-background shadow-lg transition-all duration-300 z-40 flex flex-col ${isExpanded ? 'w-80' : 'w-16'
          }`}
      >
        <div className="flex items-center p-4 border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />}
          </button>
          {isExpanded && <h2 className="ml-2 font-semibold">Integrations</h2>}
        </div>

        <div className="overflow-y-auto flex-grow p-3">
          <div className={`${isExpanded ? 'space-y-4' : 'space-y-6'}`}>
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={`${!isExpanded ? 'flex justify-center' : 'border rounded-lg p-4 hover:shadow-sm transition-shadow dark:border-gray-700'}`}
              >
                {!isExpanded ? (
                  <button
                    className={`w-10 h-10 rounded-full ${integration.color} flex items-center justify-center text-white cursor-pointer`}
                    onClick={integration.available ? () => openIntegrationModal(integration.id) : handleComingSoonClick}
                    title={integration.name}
                    aria-label={`Connect to ${integration.name}`}
                  >
                    {integration.icon}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${integration.color} flex items-center justify-center text-white`}>
                        {integration.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{integration.name}</h3>
                          {!integration.available && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">Soon</span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      color={integration.available ? "primary" : "default"}
                      className='rounded-md'
                      size="sm"
                      onPress={integration.available ? () => openIntegrationModal(integration.id) : handleComingSoonClick}
                      fullWidth
                      disabled={!integration.available}
                    >
                      {integration.available ? "Connect" : "Coming Soon"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Theme Switcher Section */}
        <div className="border-t p-3 mt-auto">
          {isExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PaletteIcon size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium">Theme</span>
              </div>
              <ThemeSwitch />
            </div>
          ) : (
            <div className="flex justify-center">
              <ThemeSwitch />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Ensure proper export for dynamic imports
export default { IntegrationsSidebar };
