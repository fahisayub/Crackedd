"use client";

import { useEffect } from "react";
import { Thread, Composer } from "@assistant-ui/react";
import { makeMarkdownText } from "@assistant-ui/react-markdown";
import dynamic from 'next/dynamic';

const MarkdownText = makeMarkdownText();

// Dynamically import components with no SSR to avoid hydration issues
const SlackConnectTool = dynamic(
  () => import('./tools/slack/SlackConnectTool').then(mod => mod.SlackConnectTool),
  { ssr: false }
);

const IntegrationsSidebar = dynamic(
  () => import('./sidebar/IntegrationsSidebar').then(mod => mod.IntegrationsSidebar),
  { ssr: false }
);

export function MyAssistant() {
  useEffect(() => {
    // Flag to prevent duplicate events
    let isProcessingSlackConnect = false;

    // Listen for the connect-slack event
    const handleConnectSlack = () => {
      // Prevent duplicate handling
      if (isProcessingSlackConnect) return;
      isProcessingSlackConnect = true;

      // Use global event to trigger the composer submit
      const inputEvent = new Event('input', { bubbles: true });
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });

      // Find composer input and trigger events
      const composerInput = document.querySelector('textarea[placeholder], input[placeholder]');
      if (composerInput) {
        // Set value and trigger input event
        Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set?.call(
          composerInput,
          'Connect me to Slack'
        );
        composerInput.dispatchEvent(inputEvent);

        // Trigger enter key to submit
        setTimeout(() => {
          composerInput.dispatchEvent(keydownEvent);

          // Reset the flag after processing
          setTimeout(() => {
            isProcessingSlackConnect = false;
          }, 1000);
        }, 100);
      } else {
        isProcessingSlackConnect = false;
      }
    };

    window.addEventListener('connect-slack', handleConnectSlack);

    return () => {
      window.removeEventListener('connect-slack', handleConnectSlack);
    };
  }, []);

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Thread
          assistantMessage={{ components: { Text: MarkdownText } }}
        />
      </div>
      <div className="p-4 border-t">
        {/* <Composer /> */}
      </div>
      <SlackConnectTool />
      <IntegrationsSidebar />
    </div>
  );
}
