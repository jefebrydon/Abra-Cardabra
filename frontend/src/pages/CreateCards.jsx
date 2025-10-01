import { useState } from 'react';
import CardForm from '../components/CreateCards/CardForm';
import DebugPanel from '../components/CreateCards/DebugPanel';

const CreateCards = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugData, setDebugData] = useState({
    formData: null,
    generatedPrompt: null,
    apiRequest: null,
    apiResponse: null,
    error: null
  });

  const buildPrompt = (formData) => {
    // This will be replaced with the actual prompt template later
    const prompt = `Create 3 personalized greeting card concepts for:

Recipient: ${formData.recipientName}
Occasion: ${formData.occasion}
Tone: ${formData.tone}
About the recipient: ${formData.aboutRecipient}

Please return exactly 3 card concepts in JSON format:
[
  {
    "card_phrase": "Custom greeting text for the card",
    "illustration_prompt": "Detailed description for image generation"
  }
]`;

    return prompt;
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    
    // Clear previous debug data
    setDebugData({
      formData: null,
      generatedPrompt: null,
      apiRequest: null,
      apiResponse: null,
      error: null
    });

    try {
      // Build the prompt
      const generatedPrompt = buildPrompt(formData);
      
      // Update debug data with form data and prompt
      setDebugData(prev => ({
        ...prev,
        formData,
        generatedPrompt
      }));

      // Prepare API request
      const apiRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/generate-concepts',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          formData,
          prompt: generatedPrompt
        }
      };

      // Update debug data with API request
      setDebugData(prev => ({
        ...prev,
        apiRequest
      }));

      // Make API call
      const response = await fetch('http://localhost:3000/api/generate-concepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData,
          prompt: generatedPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      // Update debug data with API response
      setDebugData(prev => ({
        ...prev,
        apiResponse
      }));

      // TODO: Handle successful response and display cards
      console.log('Cards generated:', apiResponse);

    } catch (error) {
      console.error('Error generating cards:', error);
      
      // Update debug data with error
      setDebugData(prev => ({
        ...prev,
        error: error.message
      }));

      // TODO: Show toast notification for error
      alert(`Error generating cards: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2">
            🎉✨ Abra Cardabra
          </h1>
          <p className="text-gray-600">
            Generate personalized AI-powered greeting cards in seconds
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <CardForm 
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
          
          <DebugPanel 
            formData={debugData.formData}
            generatedPrompt={debugData.generatedPrompt}
            apiRequest={debugData.apiRequest}
            apiResponse={debugData.apiResponse}
            error={debugData.error}
          />
        </main>
      </div>
    </div>
  );
};

export default CreateCards;
