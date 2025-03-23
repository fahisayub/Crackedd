"use client";

import { useState, useEffect } from "react";
import {
    useAssistantTool
} from "@assistant-ui/react";

// Component for connecting to Slack
export function SlackConnect({ onConnect }: { onConnect: () => any }) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Automatically initiate connection when component mounts
    useEffect(() => {
        // Slight delay to make the UI visible before connecting
        const timer = setTimeout(() => {
            if (!isConnected && !isConnecting) {
                handleConnect();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleConnect = async () => {
        if (isConnected || isConnecting) return;

        setIsConnecting(true);
        try {
            // Simulate API call to connect to Slack
            // In a real implementation, this would redirect to Slack OAuth
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsConnected(true);
            if (typeof onConnect === 'function') {
                onConnect();
            }
        } catch (error) {
            console.error("Failed to connect to Slack:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-2">Connect to Slack</h3>
            <p className="mb-4">Connect your Slack workspace to access messages and channels.</p>
            {isConnected ? (
                <div className="text-green-600 font-medium">
                    ✓ Successfully connected to Slack
                </div>
            ) : (
                <div>
                    {isConnecting ? (
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Connecting to Slack...</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Connect Slack
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Configuration for Slack actions
export function SlackConnectTool() {
    // Additional Slack actions
    useAssistantTool({
        toolName: "slack_connected",
        description: "Called when Slack has been successfully connected",
        parameters: {},
        execute: async () => {
            return {
                success: true,
                message: "Slack has been connected successfully"
            };
        },
    });

    return null;
}

// Ensure the component is properly exported for dynamic imports
export default { SlackConnectTool, SlackConnect }; 