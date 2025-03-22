"use client";

import { MyAssistant } from "@/components/MyAssistant";
import {
  AssistantRuntimeProvider,
  useEdgeRuntime,
  useAssistantInstructions,
  useAssistantTool
} from "@assistant-ui/react";

export default function Home() {
  const runtime = useEdgeRuntime({
    api: "http://localhost:8000/api/chat",
    unstable_AISDKInterop: true,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh">
        <Assistant />
        <MyAssistant />
      </main>
    </AssistantRuntimeProvider>
  );
}

function Assistant() {
  // this is a frontend system prompt that will be made available to the langgraph agent
  useAssistantInstructions("Your name is Crackedd. You are an AI platform that connects to organization's tools, aggregates siloed data, and turns it into searchable, actionable insights.");

  // this is an frontend function that will be made available to the langgraph agent
  useAssistantTool({
    toolName: "refresh_page",
    description: "Refresh the page",
    parameters: {},
    execute: async () => {
      window.location.reload();
    },
  });

  return null;
}
