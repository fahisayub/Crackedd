"use client";

/**
 * WorkspacesList.tsx
 * Component for displaying and selecting connected Slack workspaces
 */

import React from 'react';
import { RadioGroup, Radio } from '@heroui/react';
import { Skeleton } from '@heroui/react';

interface WorkspacesListProps {
  workspaces: { id: string }[];
  selectedWorkspace: string | null;
  onSelect: (workspaceId: string) => void;
  isLoading: boolean;
}

export function WorkspacesList({ 
  workspaces, 
  selectedWorkspace, 
  onSelect, 
  isLoading 
}: WorkspacesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No workspaces connected yet
      </div>
    );
  }

  return (
    <RadioGroup 
      value={selectedWorkspace || ""} 
      onValueChange={onSelect}
      className="space-y-2"
    >
      {workspaces.map((workspace) => (
        <div 
          key={workspace.id} 
          className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(workspace.id)}
        >
          <Radio value={workspace.id} key={workspace.id}>
            {workspace.id}
          </Radio>
        </div>
      ))}
    </RadioGroup>
  );
}
