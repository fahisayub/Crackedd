"use client";

/**
 * ConnectWorkspaceForm.tsx
 * Form component for connecting to a Slack workspace
 */

import React, { useState } from 'react';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { Loader2 } from 'lucide-react';

interface ConnectWorkspaceFormProps {
  onSubmit: (credentials: { bot_token: string }) => void;
  isLoading: boolean;
}

export function ConnectWorkspaceForm({ onSubmit, isLoading }: ConnectWorkspaceFormProps) {
  const [botToken, setBotToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;
    
    onSubmit({ bot_token: botToken });
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="bot-token"
              type="text"
              label="Slack Bot Token"
              placeholder="xoxb-..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              isRequired
              isDisabled={isLoading}
              classNames={{
                input: "font-mono"
              }}
              description="Enter a Bot User OAuth Token that starts with 'xoxb-'"
            />
          </div>
          
          <Button 
            type="submit" 
            isDisabled={isLoading || !botToken} 
            color="primary"
            fullWidth
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Connect Workspace
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
