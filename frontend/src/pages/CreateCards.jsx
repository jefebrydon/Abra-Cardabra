import { useState } from 'react';
import CardForm from '../components/CreateCards/CardForm';
import DebugPanel from '../components/CreateCards/DebugPanel';

const CreateCards = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardConcepts, setCardConcepts] = useState(null);
  const [debugData, setDebugData] = useState({
    formData: null,
    generatedPrompt: null,
    apiRequest: null,
    apiResponse: null,
    error: null
  });

  const buildPrompt = (formData) => {
    // Tone configuration mapping
    const toneConfig = {
      "Funny": {
        "role": "Comedy writer + AI image prompt designer",
        "card_style": "Witty, absurd, pun-based one-liners; irony, exaggeration, wordplay, surreal humor",
        "illustration_style": "Colorful, cartoon-like, lighthearted, greeting-card friendly (never photorealistic, never dark)"
      },
      "Sweet": {
        "role": "Romantic poet + illustrator",
        "card_style": "Warm, sentimental, uplifting one-liners; focus on affection and kindness",
        "illustration_style": "Soft, pastel, heartwarming, gentle cartoon style"
      },
      "Formal": {
        "role": "Professional speechwriter + designer",
        "card_style": "Elegant, polished, thoughtful one-liners; formal tone with care and respect",
        "illustration_style": "Minimal, classic greeting-card look; clean and tasteful"
      },
      "Whimsical": {
        "role": "Fantasy storyteller + illustrator",
        "card_style": "Playful, magical, imaginative one-liners; fantastical or dreamy references",
        "illustration_style": "Vibrant, storybook-like illustrations; enchanted, dreamy feel"
      },
      "Sarcastic": {
        "role": "Stand-up comedian + satirical cartoonist",
        "card_style": "Dry, ironic, sharp humor; witty comebacks or unexpected twists",
        "illustration_style": "Bold, exaggerated caricature style; cheeky and over-the-top"
      }
    };

    // Get the configuration for the selected tone
    const selectedToneConfig = toneConfig[formData.tone];
    
    if (!selectedToneConfig) {
      throw new Error(`Invalid tone selected: ${formData.tone}`);
    }

    // Base prompt template with tone-specific configuration
    const prompt = `You are a ${selectedToneConfig.role}.
Generate exactly 3 unique card_concepts in valid JSON format.

### Context
- Recipient's Name: ${formData.recipientName}
- Occasion: ${formData.occasion}
- About the Recipient: ${formData.aboutRecipient}

### For each card_concept:
- Base content on different details from "About the Recipient" when possible.
- Include:
  - **card_phrase** → a one-liner (5–25 words) that matches this style: ${selectedToneConfig.card_style}.
  - **illustration_prompt** → a description for an AI image generator that:
    - Directly illustrates the message in card_phrase.
    - Uses 1–2 main subjects with a clear setting.
    - Style rules: ${selectedToneConfig.illustration_style}.

### Output format
Return only valid JSON:

{
  "card_concepts": [
    { "card_phrase": "...", "illustration_prompt": "..." },
    { "card_phrase": "...", "illustration_prompt": "..." },
    { "card_phrase": "...", "illustration_prompt": "..." }
  ]
}`;

    return prompt;
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    
    // Clear previous debug data and card concepts
    setCardConcepts(null);
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

      // Handle successful response and display cards
      if (apiResponse.success && apiResponse.card_concepts) {
        console.log('Cards generated successfully:', apiResponse.card_concepts);
        console.log('Debug info:', apiResponse.debug);
        
        // Store the card concepts for display
        setCardConcepts(apiResponse.card_concepts);
        
        // Log each card concept
        apiResponse.card_concepts.forEach((concept, index) => {
          console.log(`Card ${index + 1}:`, concept.card_phrase);
          console.log(`Illustration:`, concept.illustration_prompt);
        });
      } else {
        throw new Error(apiResponse.error || 'Invalid response format from server');
      }

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
          
          {/* Display Generated Card Concepts */}
          {cardConcepts && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
                🎉 Your Generated Cards
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {cardConcepts.map((concept, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Card {index + 1}
                      </h3>
                      <p className="text-gray-700 italic">
                        "{concept.card_phrase}"
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Illustration Prompt:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {concept.illustration_prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
