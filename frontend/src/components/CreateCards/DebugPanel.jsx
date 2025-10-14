import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Copy, FileText, MessageSquare, Send, Download, AlertTriangle, Image } from 'lucide-react';

const DebugPanel = ({ formData, generatedPrompt, apiRequest, apiResponse, imageGenerationRequest, imageGenerationResponse, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = () => {
    const debugData = {
      formData,
      generatedPrompt,
      apiRequest,
      apiResponse,
      imageGenerationRequest,
      imageGenerationResponse,
      error,
      timestamp: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
  };

  return (
    <div className="mt-6 w-full max-w-[640px]">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="flex w-fit items-center gap-2 text-sm font-semibold text-[#6B5E55]">
            <span>Debug Panel</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-4 space-y-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
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
                  <h4 className="text-sm font-semibold text-green-600">OpenAI API Response</h4>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Image Generation Request */}
            {imageGenerationRequest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-semibold text-orange-600">Gemini Image Generation Request</h4>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(imageGenerationRequest, null, 2)}
                </pre>
              </div>
            )}

            {/* Image Generation Response */}
            {imageGenerationResponse && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-orange-600" />
                  <h4 className="text-sm font-semibold text-orange-600">Gemini Image Generation Response</h4>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(imageGenerationResponse, null, 2)}
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
            {(formData || generatedPrompt || apiRequest || apiResponse || imageGenerationRequest || imageGenerationResponse) && (
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DebugPanel;
