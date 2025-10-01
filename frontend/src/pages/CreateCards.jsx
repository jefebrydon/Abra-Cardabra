import { useState } from 'react';
import CardForm from '../components/CreateCards/CardForm';
import DebugPanel from '../components/CreateCards/DebugPanel';

const CreateCards = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardConcepts, setCardConcepts] = useState(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState({});
  const [debugData, setDebugData] = useState({
    formData: null,
    generatedPrompt: null,
    apiRequest: null,
    apiResponse: null,
    imageGenerationRequest: null,
    imageGenerationResponse: null,
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

  /**
   * Generate images for card concepts using Gemini API
   * @param {Array} concepts - Array of card concepts with illustration_prompt
   * @returns {Array} - Array of concepts with generated images
   */
  const generateImagesForConcepts = async (concepts) => {
    setIsGeneratingImages(true);
    setImageGenerationProgress({});
    
    try {
      // Extract illustration prompts
      const illustrationPrompts = concepts.map(concept => concept.illustration_prompt);
      
      console.log('🎨 Starting image generation for', illustrationPrompts.length, 'prompts');
      
      // Update debug data with image generation request
      const imageGenerationRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/generate-images',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          illustrationPrompts
        }
      };

      setDebugData(prev => ({
        ...prev,
        imageGenerationRequest
      }));

      // Initialize progress tracking for each image
      const progress = {};
      concepts.forEach((_, index) => {
        progress[index] = { status: 'pending', message: 'Waiting to generate...' };
      });
      setImageGenerationProgress(progress);

      // Make API call to generate images
      const response = await fetch('http://localhost:3000/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          illustrationPrompts
        })
      });

      if (!response.ok) {
        throw new Error(`Image generation API request failed: ${response.status} ${response.statusText}`);
      }

      const imageGenerationResponse = await response.json();
      
      // Update debug data with image generation response
      setDebugData(prev => ({
        ...prev,
        imageGenerationResponse
      }));

      if (!imageGenerationResponse.success) {
        throw new Error(imageGenerationResponse.error || 'Image generation failed');
      }

      console.log('✅ Image generation completed:', imageGenerationResponse.successfulCount, 'successful');

      // Update concepts with generated images
      const updatedConcepts = concepts.map((concept, index) => {
        const imageResult = imageGenerationResponse.images[index];
        
        if (imageResult && imageResult.success) {
          return {
            ...concept,
            generatedImage: imageResult.imageData,
            imageGenerationStatus: 'success'
          };
        } else {
          return {
            ...concept,
            imageGenerationStatus: 'failed',
            imageGenerationError: imageResult ? imageResult.error : 'Unknown error'
          };
        }
      });

      // Update progress to show completion
      const completedProgress = {};
      updatedConcepts.forEach((concept, index) => {
        if (concept.imageGenerationStatus === 'success') {
          completedProgress[index] = { status: 'completed', message: 'Image generated successfully!' };
        } else {
          completedProgress[index] = { status: 'failed', message: concept.imageGenerationError };
        }
      });
      setImageGenerationProgress(completedProgress);

      return updatedConcepts;

    } catch (error) {
      console.error('❌ Error generating images:', error);
      
      // Update progress to show error
      const errorProgress = {};
      concepts.forEach((_, index) => {
        errorProgress[index] = { status: 'failed', message: error.message };
      });
      setImageGenerationProgress(errorProgress);

      // Update debug data with error
      setDebugData(prev => ({
        ...prev,
        error: prev.error ? `${prev.error}; Image generation error: ${error.message}` : `Image generation error: ${error.message}`
      }));

      throw error;
    } finally {
      setIsGeneratingImages(false);
    }
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

      // Handle successful response and generate images
      if (apiResponse.success && apiResponse.card_concepts) {
        console.log('Cards generated successfully:', apiResponse.card_concepts);
        console.log('Debug info:', apiResponse.debug);
        
        // Log each card concept
        apiResponse.card_concepts.forEach((concept, index) => {
          console.log(`Card ${index + 1}:`, concept.card_phrase);
          console.log(`Illustration:`, concept.illustration_prompt);
        });

        // Generate images for the card concepts
        try {
          const conceptsWithImages = await generateImagesForConcepts(apiResponse.card_concepts);
          setCardConcepts(conceptsWithImages);
        } catch (imageError) {
          console.warn('⚠️ Image generation failed, showing cards without images:', imageError.message);
          // Still show the cards even if image generation fails
          setCardConcepts(apiResponse.card_concepts.map(concept => ({
            ...concept,
            imageGenerationStatus: 'failed',
            imageGenerationError: imageError.message
          })));
        }
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
                    {/* Image Section */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Card {index + 1}
                      </h3>
                      
                      {/* Image Display */}
                      <div className="mb-4 min-h-[200px] bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {isGeneratingImages && imageGenerationProgress[index]?.status === 'pending' && (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">
                              {imageGenerationProgress[index]?.message || 'Generating image...'}
                            </p>
                          </div>
                        )}
                        
                        {isGeneratingImages && imageGenerationProgress[index]?.status === 'completed' && (
                          <div className="text-center">
                            <div className="text-green-600 mb-2">✅</div>
                            <p className="text-sm text-green-600">
                              {imageGenerationProgress[index]?.message || 'Image ready!'}
                            </p>
                          </div>
                        )}
                        
                        {concept.imageGenerationStatus === 'success' && concept.generatedImage && (
                          <div className="w-full h-full flex items-center justify-center">
                            {concept.generatedImage.imageUrl ? (
                              <img 
                                src={concept.generatedImage.imageUrl} 
                                alt={`Generated illustration for card ${index + 1}`}
                                className="max-w-full max-h-full object-contain rounded"
                              />
                            ) : concept.generatedImage.imageBase64 ? (
                              <img 
                                src={`data:image/png;base64,${concept.generatedImage.imageBase64}`}
                                alt={`Generated illustration for card ${index + 1}`}
                                className="max-w-full max-h-full object-contain rounded"
                              />
                            ) : concept.generatedImage.isPlaceholder ? (
                              <div className="text-center text-orange-600">
                                <div className="text-orange-500 mb-2">⚠️</div>
                                <p className="text-sm">{concept.generatedImage.message || 'Image generation attempted'}</p>
                                <p className="text-xs text-gray-400 mt-1">Check debug panel for details</p>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500">
                                <div className="text-green-600 mb-2">✅</div>
                                <p className="text-sm">Image generated successfully</p>
                                <p className="text-xs text-gray-400 mt-1">(Image data available)</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {concept.imageGenerationStatus === 'failed' && (
                          <div className="text-center text-red-500">
                            <div className="text-red-500 mb-2">❌</div>
                            <p className="text-sm">
                              {imageGenerationProgress[index]?.message || concept.imageGenerationError || 'Image generation failed'}
                            </p>
                          </div>
                        )}
                        
                        {!isGeneratingImages && !concept.imageGenerationStatus && (
                          <div className="text-center text-gray-500">
                            <div className="text-gray-400 mb-2">🖼️</div>
                            <p className="text-sm">Image will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Card Phrase */}
                    <div className="mb-4">
                      <p className="text-gray-700 italic text-center">
                        "{concept.card_phrase}"
                      </p>
                    </div>
                    
                    {/* Illustration Prompt (Debug Info) */}
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
              
              {/* Image Generation Status Summary */}
              {isGeneratingImages && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Generating images...
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DebugPanel 
            formData={debugData.formData}
            generatedPrompt={debugData.generatedPrompt}
            apiRequest={debugData.apiRequest}
            apiResponse={debugData.apiResponse}
            imageGenerationRequest={debugData.imageGenerationRequest}
            imageGenerationResponse={debugData.imageGenerationResponse}
            error={debugData.error}
          />
        </main>
      </div>
    </div>
  );
};

export default CreateCards;
