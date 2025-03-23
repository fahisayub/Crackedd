"use client";

/**
 * ProcessingResults.tsx
 * Component for displaying AI processing results of Slack data
 */

import React, { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Button } from '@heroui/react';
import { Accordion, AccordionItem } from '@heroui/react';
import { SlackAIProcessingResult } from '../../lib/api/slack';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';

interface ProcessingResultsProps {
  results: SlackAIProcessingResult;
}

export function ProcessingResults({ results }: ProcessingResultsProps) {
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Function to download results as JSON
  const handleDownload = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `slack-analysis-${results.workspace_id}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Analysis Results</h3>
        <Button 
          variant="bordered" 
          size="sm" 
          onClick={handleDownload}
          startContent={<Download className="h-4 w-4" />}
        >
          Export
        </Button>
      </div>

      <Tabs 
        selectedKey={activeTab}
        onSelectionChange={key => setActiveTab(key as string)}
        aria-label="Analysis results tabs"
      >
        <Tab key="summary" title="Summary">
          <Card className="mt-4">
            <CardHeader className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">Workspace Overview</h3>
              <p className="text-sm text-gray-500">
                Generated on {new Date(results.processing_time).toLocaleString()}
              </p>
            </CardHeader>
            <CardBody>
              <div className="prose prose-sm max-w-none">
                {results.summary.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="insights" title="Insights">
          <Card className="mt-4">
            <CardHeader className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">Key Insights</h3>
              <p className="text-sm text-gray-500">
                Important information extracted from the workspace
              </p>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {results.key_insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Chip size="sm" className="mt-0.5 shrink-0">{index + 1}</Chip>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="topics" title="Topics">
          <Card className="mt-4">
            <CardHeader className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">Identified Topics</h3>
              <p className="text-sm text-gray-500">
                Main themes and subjects discussed in the workspace
              </p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.topics.map((topic, index) => (
                  <Card key={index} className="bg-gray-50 border">
                    <CardHeader className="py-3 px-4">
                      <h4 className="text-md font-medium">{topic.name}</h4>
                    </CardHeader>
                    <CardBody className="py-2 px-4">
                      <p className="text-sm text-gray-700 mb-2">{topic.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.map((keyword, idx) => (
                          <Chip key={idx} variant="bordered" className="bg-white">
                            {keyword}
                          </Chip>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="channels" title="Channels">
          <Card className="mt-4">
            <CardHeader className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold">Channel Summaries</h3>
              <p className="text-sm text-gray-500">
                Analysis of individual channel conversations
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Accordion variant="bordered">
                  {Object.entries(results.channel_summaries).map(([channelId, summary], index) => (
                    <AccordionItem 
                      key={channelId} 
                      title={
                        <div className="flex items-center">
                          <span className="font-medium">Channel {index + 1}</span>
                          <Chip variant="bordered" className="ml-2">{channelId}</Chip>
                        </div>
                      }
                    >
                      <div className="prose prose-sm max-w-none">
                        {summary.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {Object.keys(results.canvas_summaries).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Canvas Summaries</h4>
                  <Accordion variant="bordered">
                    {Object.entries(results.canvas_summaries).map(([canvasId, summary], index) => (
                      <AccordionItem 
                        key={canvasId} 
                        title={
                          <div className="flex items-center">
                            <span className="font-medium">Canvas {index + 1}</span>
                            <Chip variant="bordered" className="ml-2">{canvasId}</Chip>
                          </div>
                        }
                      >
                        <div className="prose prose-sm max-w-none">
                          {summary.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
