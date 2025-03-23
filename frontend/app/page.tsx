"use client";

import { MyAssistant } from "@/components/MyAssistant";
import {
  AssistantRuntimeProvider,
  useEdgeRuntime,
  useAssistantInstructions,
  useAssistantTool
} from "@assistant-ui/react";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import the SlackConnect component with no SSR
const SlackConnect = dynamic(
  () => import('@/components/tools/slack/SlackConnectTool').then(mod => mod.SlackConnect),
  { ssr: false }
);

// Dynamically import the IntegrationsDashboard component with no SSR
const IntegrationsDashboard = dynamic(
  () => import('@/components/integrations/IntegrationsDashboard'),
  { ssr: false }
);

// Component for assistant configuration
function AssistantConfig() {
  // Set up assistant instructions
  useAssistantInstructions("Your name is Crackedd. You are an AI platform that connects to organization's tools, aggregates siloed data, and turns it into searchable, actionable insights.");

  // Add tools that can be used by the assistant
  useAssistantTool({
    toolName: "refresh_page",
    description: "Refresh the page",
    parameters: {},
    execute: async () => {
      window.location.reload();
    },
  });

  // Add the connect_slack tool with generative UI
  useAssistantTool({
    toolName: "connect_slack",
    description: "Initiates the process to connect to a Slack workspace",
    parameters: {},
    execute: async () => {
      // Return a generative UI component
      return {
        type: "component",
        component: SlackConnect,
        props: {
          onConnect: () => {
            // Notify the user of successful connection with the return value
            return {
              success: true,
              message: "Your Slack workspace has been connected successfully! What would you like to do next?"
            };
          }
        }
      };
    },
  });

  return null;
}

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [integrationToConnect, setIntegrationToConnect] = useState<string | null>(null);
  const [autoConnectSlack, setAutoConnectSlack] = useState<boolean>(false);

  // Configure the assistant runtime with the API endpoint
  const runtime = useEdgeRuntime({
    api: "/api/chat",
    unstable_AISDKInterop: true,
  });

  const handleConnectClick = (integration: string) => {
    setIntegrationToConnect(integration);
    setShowChat(true);

    if (integration === 'slack') {
      setAutoConnectSlack(true);
    }
  };

  // Effect to auto-trigger the Slack connection when requested
  useEffect(() => {
    if (autoConnectSlack) {
      // Small delay to ensure the chat interface is loaded
      const timer = setTimeout(() => {
        // Dispatch the connect-slack event
        window.dispatchEvent(new Event('connect-slack'));
        setAutoConnectSlack(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoConnectSlack]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantConfig />
      <main className="h-dvh flex flex-col">
        {showChat ? (
          <MyAssistant />
        ) : (
          <div className="flex-1 overflow-auto">
            <IntegrationsDashboard onConnectClick={handleConnectClick} />
          </div>
        )}
      </main>
    </AssistantRuntimeProvider>
  );
}
