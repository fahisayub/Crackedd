import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint handles chat requests from the assistant UI
 * It forwards the request to AI services for processing
 */

export const runtime = 'edge';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Process the chat message
        // This is a simple implementation - you would typically
        // forward this to your AI provider or process it internally

        // Simulate a response for now
        const response = {
            id: crypto.randomUUID(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'crackedd-assistant',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: `I'm processing your request to ${body.messages?.[0]?.content || 'help with your task'}. What additional information can I provide?`
                    },
                    finish_reason: 'stop'
                }
            ]
        };

        // Return the response
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error processing chat request:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
} 