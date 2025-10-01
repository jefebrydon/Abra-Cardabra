import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Copy, Bug, FileText, MessageSquare, Send, Download, AlertTriangle } from 'lucide-react';

const DebugPanel = ({ formData, generatedPrompt, apiRequest, apiResponse, error }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = () => {
    const debugData = {
      formData,
      generatedPrompt,
      apiRequest,
      apiResponse,
      error,
      timestamp: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
  };

  return (
    <Card className="mt-6 border-destructive/20 bg-destructive/5">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">Debug Panel</CardTitle>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-6">
            {/* Raw Form Data */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-600">Raw Form Data</h4>
              </div>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>

            {/* Generated Prompt */}
            {generatedPrompt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-yellow-600" />
                  <h4 className="text-sm font-semibold text-yellow-600">Generated Prompt</h4>
                </div>
                <div className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {generatedPrompt}
                </div>
              </div>
            )}

            {/* OpenAI API Request Details */}
            {apiRequest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-purple-600">OpenAI API Request</h4>
                </div>
                <div className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {apiRequest.body?.prompt || 'No prompt available'}
                </div>
              </div>
            )}

            {/* API Response */}
            {apiResponse && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <h4 className="text-sm font-semibold text-green-600">API Response</h4>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Information */}
            {error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h4 className="text-sm font-semibold text-destructive">Error Details</h4>
                </div>
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md text-xs">
                  {error}
                </div>
              </div>
            )}

            {/* Copy All Data Button */}
            {(formData || generatedPrompt || apiRequest || apiResponse) && (
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Debug Data
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DebugPanel;
