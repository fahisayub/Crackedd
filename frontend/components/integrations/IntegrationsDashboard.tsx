"use client";

/**
 * IntegrationsDashboard.tsx
 * Dashboard for displaying and managing integrations
 */

import React, { useState } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import {
  MessageSquareIcon, MailIcon, CheckSquareIcon,
  ArrowUpRightIcon, SlackIcon
} from 'lucide-react';

interface IntegrationInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  color: string;
}

interface IntegrationsDashboardProps {
  onConnectClick?: (integration: string) => void;
}

const integrations: IntegrationInfo[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect to Slack workspaces to analyze conversations and extract insights.',
    icon: <SlackIcon className="h-8 w-8" />,
    available: true,
    color: 'bg-[#4A154B]'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Integrate with Notion workspaces for document analysis and knowledge management.',
    icon: <MessageSquareIcon className="h-8 w-8" />,
    available: false,
    color: 'bg-[#000000]'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect to Gmail to analyze communications and organize your inbox.',
    icon: <MailIcon className="h-8 w-8" />,
    available: false,
    color: 'bg-[#D44638]'
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Integrate with ClickUp for task management and project analysis.',
    icon: <CheckSquareIcon className="h-8 w-8" />,
    available: false,
    color: 'bg-[#7B68EE]'
  }
];

export function IntegrationsDashboard({ onConnectClick }: IntegrationsDashboardProps) {
  const [currentIntegration, setCurrentIntegration] = useState<string | null>(null);

  const openIntegrationModal = (integrationId: string) => {
    if (onConnectClick && integrationId === 'slack') {
      onConnectClick(integrationId);
      return;
    }

    setCurrentIntegration(integrationId);
    if (integrationId === 'slack') {
      console.log('Using new Slack integration approach');
    } else {
      console.log(`Opening ${integrationId} modal (coming soon)`);
    }
  };

  const handleComingSoonClick = () => {
    // Could show a toast notification here
    console.log("This integration is coming soon!");
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect Crackedd with your favorite tools and services to unlock powerful insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              isPressable={integration.available}
              onPress={integration.available ? () => openIntegrationModal(integration.id) : handleComingSoonClick}
              className={`border dark:border-gray-700 ${!integration.available ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}
            >
              <CardBody className="flex flex-col gap-3 p-6">
                <div className={`w-14 h-14 rounded-full ${integration.color} flex items-center justify-center text-white mb-2`}>
                  {integration.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{integration.name}</h3>
                    {!integration.available && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">Coming Soon</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{integration.description}</p>
                </div>
                <div className="mt-auto pt-3">
                  {integration.available ? (
                    <div
                      onClick={() => openIntegrationModal(integration.id)}
                      className="w-full p-2 text-center text-sm bg-primary-50 text-primary-600 rounded-md cursor-pointer hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                    >
                      Connect <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="text-center py-1 text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:underline" onClick={handleComingSoonClick}>
                      Coming Soon
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

// Add default export for dynamic imports
export default IntegrationsDashboard;
