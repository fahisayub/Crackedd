"use client";

/**
 * SlackIntegration.tsx
 * Main component for Slack workspace integration and data processing
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Input, Textarea } from '@heroui/react';
import { Tabs, Tab } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Progress } from '@heroui/react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react';
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, Download } from 'lucide-react';
import { 
  connectSlackWorkspace, 
  listSlackWorkspaces, 
  extractSlackData, 
  processSlackData, 
  pollProcessingStatus,
  SlackWorkspace,
  SlackAIProcessingResult 
} from '../../lib/api/slack';
import { ConnectWorkspaceForm } from './ConnectWorkspaceForm';
import { WorkspacesList } from './WorkspacesList';
import { ProcessingResults } from './ProcessingResults';

export function SlackIntegration() {
  // State variables
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<{ id: string }[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<SlackWorkspace | null>(null);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingResults, setProcessingResults] = useState<SlackAIProcessingResult | null>(null);
  const [activeView, setActiveView] = useState<string>('connect');
  const [customInstruction, setCustomInstruction] = useState<string>('');

  // Load workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fetch connected workspaces
  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const response = await listSlackWorkspaces();
      const data = response as { id: string }[];
      setWorkspaces(data);
      if (data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(data[0].id);
      }
    } catch (err: any) {
      setError(`Failed to load workspaces: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for connecting a new workspace
  const handleConnectWorkspace = async (credentials: { bot_token: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await connectSlackWorkspace(credentials);
      const data = response as { workspace_id: string; message: string };
      setSuccess(data.message);
      await fetchWorkspaces();
      setSelectedWorkspace(data.workspace_id);
    } catch (err: any) {
      setError(`Failed to connect workspace: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for extracting data from a workspace
  const handleExtractData = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      const data = await extractSlackData(selectedWorkspace);
      setExtractedData(data);
      setActiveView('process');
      setSuccess('Data extracted successfully');
    } catch (err: any) {
      setError(`Failed to extract data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for processing data with AI
  const handleProcessData = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setProcessingResults(null);
      
      const response = await processSlackData({
        workspace_id: selectedWorkspace,
        instruction: customInstruction || undefined
      });
      
      const data = response as { task_id: string };
      setProcessingTaskId(data.task_id);
      setProcessingStatus('processing');
      setProcessingProgress(0);
      
      // Poll for status updates
      pollProcessingStatus(
        data.task_id,
        (status) => {
          const statusData = status as { status: string; progress: number };
          setProcessingStatus(statusData.status);
          setProcessingProgress(statusData.progress || 0);
          
          if (statusData.status === 'completed') {
            setIsLoading(false);
          }
        }
      ).then((results) => {
        setProcessingResults(results);
        setActiveView('results');
        setSuccess('Processing completed');
      }).catch((err) => {
        setError(`Processing failed: ${err.message}`);
        setIsLoading(false);
      });
      
    } catch (err: any) {
      setError(`Failed to start processing: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Reset the current session
  const handleReset = () => {
    setExtractedData(null);
    setProcessingTaskId(null);
    setProcessingStatus(null);
    setProcessingProgress(0);
    setProcessingResults(null);
    setActiveView('connect');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Slack Integration</h1>
      
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{success}</p>
        </div>
      )}
      
      {/* Main content */}
      <Tabs 
        selectedKey={activeView}
        onSelectionChange={key => setActiveView(key as string)}
      >
        <Tab key="connect" title="Connect">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <Card>
                <CardHeader>
                  <div>
                    <h3 className="text-xl font-semibold">Connect a Workspace</h3>
                    <p className="text-sm text-gray-500">
                      Add a new Slack workspace to extract and analyze its data
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <ConnectWorkspaceForm 
                    onSubmit={handleConnectWorkspace} 
                    isLoading={isLoading} 
                  />
                </CardBody>
                <CardFooter>
                  <a 
                    href="https://api.slack.com/tutorials/tracks/getting-a-token" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Learn how to get a Slack bot token
                  </a>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-xl font-semibold">Connected Workspaces</h3>
                  <p className="text-sm text-gray-500">
                    Manage your connected Slack workspaces
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <WorkspacesList 
                  workspaces={workspaces} 
                  selectedWorkspace={selectedWorkspace} 
                  onSelect={setSelectedWorkspace}
                  isLoading={isLoading}
                />
              </CardBody>
              <CardFooter>
                <Button
                  onClick={handleExtractData}
                  color="primary"
                  isDisabled={!selectedWorkspace || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Extract Data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Tab>
        
        <Tab key="process" title="Process">
          <div className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-xl font-semibold">Process Workspace Data</h3>
                  <p className="text-sm text-gray-500">
                    Process your Slack data with AI to extract insights
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {extractedData && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Data Overview:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border rounded p-3 bg-gray-50">
                          <p className="text-sm font-medium">Users</p>
                          <p className="text-2xl font-semibold">{extractedData.users?.length || 0}</p>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <p className="text-sm font-medium">Channels</p>
                          <p className="text-2xl font-semibold">{extractedData.channels?.length || 0}</p>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <p className="text-sm font-medium">Messages</p>
                          <p className="text-2xl font-semibold">
                            {extractedData.channels?.reduce((acc, channel) => acc + (channel.messages?.length || 0), 0) || 0}
                          </p>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <p className="text-sm font-medium">Canvases</p>
                          <p className="text-2xl font-semibold">{extractedData.canvases?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label htmlFor="custom-instruction" className="block text-sm font-medium">
                      Custom Instructions (Optional)
                    </label>
                    <Textarea
                      id="custom-instruction"
                      placeholder="E.g., Focus on project management discussions and group similar concepts together"
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      rows={3}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Add specific instructions to guide the AI in processing your data
                    </p>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={handleReset}
                  color="default"
                  isDisabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleProcessData}
                  color="primary"
                  isDisabled={!extractedData || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Process with AI
                </Button>
              </CardFooter>
            </Card>
            
            {processingStatus && (
              <Card>
                <CardHeader>
                  <div>
                    <h3 className="text-xl font-semibold">Processing Status</h3>
                    <p className="text-sm text-gray-500">
                      AI is analyzing your Slack data
                    </p>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Chip color={processingStatus === 'completed' ? 'success' : 'warning'}>
                        {processingStatus === 'completed' ? 'Completed' : 'Processing'}
                      </Chip>
                      <p className="text-sm">{processingProgress}% Complete</p>
                    </div>
                    <Progress value={processingProgress} color="primary" />
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </Tab>
        
        <Tab key="results" title="Results">
          <div className="mt-4">
            {processingResults ? (
              <ProcessingResults results={processingResults} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                No results available yet. Process your data first.
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
