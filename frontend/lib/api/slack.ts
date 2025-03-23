/**
 * Slack API Client
 * Functions for interacting with the Slack integration backend API
 */

import axios from 'axios';

// Types
export interface SlackCredentials {
  bot_token: string;
  app_token?: string;
  signing_secret?: string;
  client_id?: string;
  client_secret?: string;
}

export interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  users: SlackUser[];
  channels: SlackChannel[];
  canvases: SlackCanvas[];
  extraction_time: string;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  email?: string;
  title?: string;
  is_admin: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  created: string;
  creator?: string;
  messages: SlackMessage[];
}

export interface SlackMessage {
  id: string;
  text: string;
  user: string;
  timestamp: string;
  reactions: any[];
  replies: SlackMessage[];
  thread_ts?: string;
  attachments: any[];
}

export interface SlackCanvas {
  id: string;
  title: string;
  created: string;
  creator: string;
  content: any[];
  channel_id?: string;
}

export interface SlackAIProcessingRequest {
  workspace_id: string;
  process_channels?: string[];
  process_canvases?: boolean;
  max_message_age_days?: number;
  instruction?: string;
}

export interface SlackAIProcessingResult {
  workspace_id: string;
  summary: string;
  channel_summaries: Record<string, string>;
  canvas_summaries: Record<string, string>;
  key_insights: string[];
  topics: Array<{
    name: string;
    description: string;
    keywords: string[];
  }>;
  processing_time: string;
}

export interface ProcessingStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

// Connect to a Slack workspace using provided credentials
export async function connectSlackWorkspace(credentials: SlackCredentials) {
  const response = await axios.post('/slack/connect', credentials);
  return response.data;
}

// List all connected Slack workspaces
export async function listSlackWorkspaces() {
  const response = await axios.get('/slack/workspaces');
  return response.data;
}

// Extract data from a Slack workspace
export async function extractSlackData(workspaceId: string) {
  const response = await axios.post(`/slack/extract?workspace_id=${workspaceId}`);
  return response.data as SlackWorkspace;
}

// Process Slack data with AI
export async function processSlackData(request: SlackAIProcessingRequest) {
  const response = await axios.post('/slack/process', request);
  return response.data;
}

// Get processing status
export async function getProcessingStatus(taskId: string): Promise<ProcessingStatus> {
  const response = await axios.get(`/slack/process/status?task_id=${taskId}`);
  return response.data as ProcessingStatus;
}

// Get processing results
export async function getProcessingResults(taskId: string): Promise<SlackAIProcessingResult> {
  const response = await axios.get(`/slack/process/results?task_id=${taskId}`);
  return response.data as SlackAIProcessingResult;
}

// Poll processing status until complete
export const pollProcessingStatus = (
  taskId: string, 
  onStatusUpdate?: (status: ProcessingStatus) => void,
  intervalMs: number = 2000,
  maxAttempts: number = 30
): Promise<SlackAIProcessingResult> => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await getProcessingStatus(taskId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        
        if (status.status === 'completed') {
          const results = await getProcessingResults(taskId);
          resolve(results);
          return;
        }
        
        if (status.status === 'failed') {
          reject(new Error(status.error || 'Processing failed'));
          return;
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Processing timed out'));
          return;
        }
        
        setTimeout(checkStatus, intervalMs);
      } catch (err: any) {
        reject(new Error(`Error checking status: ${err.message}`));
      }
    };
    
    checkStatus();
  });
};
