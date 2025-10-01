const { GoogleGenAI } = require('@google/genai');

class GeminiService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  /**
   * Initialize Gemini client with API key
   */
  initializeClient() {
    try {
      if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not configured in environment variables');
      }

      // Initialize with API key - the official example shows empty object but we need the key
      this.client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY
      });

      console.log('✅ Gemini client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini client:', error.message);
      throw error;
    }
  }

  /**
   * Validate that the illustration prompt meets requirements
   * @param {string} prompt - The illustration prompt to validate
   * @returns {boolean} - Whether the prompt is valid
   */
  validateIllustrationPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Illustration prompt must be a non-empty string');
    }

    if (prompt.trim().length < 10) {
      throw new Error('Illustration prompt must be at least 10 characters long');
    }

    if (prompt.length > 1000) {
      throw new Error('Illustration prompt must be less than 1000 characters');
    }

    return true;
  }

  /**
   * Generate an image using Gemini's image generation model
   * @param {string} illustrationPrompt - The prompt for image generation
   * @returns {Object} - Formatted response with image data
   */
  async generateImage(illustrationPrompt) {
    const startTime = Date.now();
    
    try {
      // Validate prompt
      this.validateIllustrationPrompt(illustrationPrompt);

      // Ensure client is initialized
      if (!this.client) {
        throw new Error('Gemini client not initialized');
      }

      console.log('🎨 Sending image generation request to Gemini...');
      console.log('📝 Illustration prompt:', illustrationPrompt);

      // Prepare the prompt for image generation
      const fullPrompt = `Generate a greeting card illustration based on this prompt: ${illustrationPrompt}. The image should be appropriate for a greeting card, colorful, and match the described style.`;

      // Generate image using the official API structure
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: fullPrompt,
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.log('✅ Gemini image generation response received');
      console.log('⏱️ Processing time:', processingTime, 'ms');

      // Parse the response to extract image data
      const imageData = this.extractImageData(response, processingTime);
      
      return imageData;

    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      console.error('❌ Error calling Gemini image generation:', error.message);
      throw this.handleGeminiError(error, processingTime);
    }
  }

  /**
   * Generate multiple images for an array of illustration prompts
   * @param {Array<string>} illustrationPrompts - Array of prompts for image generation
   * @returns {Array<Object>} - Array of formatted responses with image data
   */
  async generateImages(illustrationPrompts) {
    try {
      if (!Array.isArray(illustrationPrompts)) {
        throw new Error('Illustration prompts must be an array');
      }

      if (illustrationPrompts.length === 0) {
        throw new Error('At least one illustration prompt is required');
      }

      console.log(`🎨 Generating ${illustrationPrompts.length} images...`);

      // Generate images in parallel for better performance
      const imagePromises = illustrationPrompts.map(async (prompt, index) => {
        try {
          console.log(`🎨 Generating image ${index + 1}/${illustrationPrompts.length}`);
          const result = await this.generateImage(prompt);
          return {
            success: true,
            index,
            prompt,
            ...result
          };
        } catch (error) {
          console.error(`❌ Failed to generate image ${index + 1}:`, error.message);
          return {
            success: false,
            index,
            prompt,
            error: error.message,
            debug: {
              timestamp: new Date().toISOString(),
              errorCode: error.code || 'IMAGE_GENERATION_FAILED'
            }
          };
        }
      });

      const results = await Promise.all(imagePromises);
      
      const successfulImages = results.filter(result => result.success);
      const failedImages = results.filter(result => !result.success);

      console.log(`✅ Successfully generated ${successfulImages.length}/${illustrationPrompts.length} images`);
      
      if (failedImages.length > 0) {
        console.warn(`⚠️ ${failedImages.length} image(s) failed to generate`);
      }

      return {
        success: true,
        images: results,
        successfulCount: successfulImages.length,
        failedCount: failedImages.length,
        debug: {
          totalPrompts: illustrationPrompts.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error in batch image generation:', error.message);
      throw error;
    }
  }

  /**
   * Extract image data from Gemini response
   * @param {Object} geminiResponse - Raw response from Gemini
   * @param {number} processingTime - Time taken for the request
   * @returns {Object} - Formatted response with image data
   */
  extractImageData(geminiResponse, processingTime) {
    try {
      if (!geminiResponse) {
        throw new Error('Invalid response from Gemini');
      }

      console.log('📄 Raw Gemini response structure:', JSON.stringify(geminiResponse, null, 2));

      // Check if response has candidates with content parts (official structure)
      if (!geminiResponse.candidates || geminiResponse.candidates.length === 0) {
        throw new Error('No candidates found in Gemini response');
      }

      const candidate = geminiResponse.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error('No content parts found in Gemini response');
      }

      // Look for image data in the parts (following official example structure)
      let imageBase64 = null;
      let imageUrl = null;

      for (const part of candidate.content.parts) {
        if (part.text) {
          console.log('📝 Text response:', part.text);
        } else if (part.inlineData) {
          // Handle base64 image data (official example structure)
          if (part.inlineData.mimeType && part.inlineData.data) {
            imageBase64 = part.inlineData.data;
            console.log('✅ Found base64 image data in response');
            console.log('📊 Image data length:', imageBase64.length);
            break;
          }
        }
      }

      // If no image data found, this might be a text-only response
      if (!imageBase64 && !imageUrl) {
        console.warn('⚠️ No image data found in Gemini response, treating as text response');
        // For now, we'll create a placeholder indicating the image generation was attempted
        return {
          success: true,
          imageData: {
            imageUrl: null,
            imageBase64: null,
            isPlaceholder: true,
            message: 'Image generation attempted but no image data received',
            metadata: {
              model: 'gemini-2.5-flash-image-preview',
              processingTime,
              timestamp: new Date().toISOString()
            }
          },
          debug: {
            processingTime,
            rawResponse: geminiResponse,
            timestamp: new Date().toISOString(),
            note: 'No image data found in response - may need to check API configuration'
          }
        };
      }

      const imageData = {
        imageUrl,
        imageBase64,
        metadata: {
          model: 'gemini-2.5-flash-image-preview',
          processingTime,
          timestamp: new Date().toISOString()
        }
      };

      return {
        success: true,
        imageData,
        debug: {
          processingTime,
          rawResponse: geminiResponse,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error extracting image data from Gemini response:', error.message);
      throw new Error(`Failed to extract image data: ${error.message}`);
    }
  }

  /**
   * Handle Gemini API errors with detailed information
   * @param {Error} error - The error from Gemini API
   * @param {number} processingTime - Time taken before error
   * @returns {Error} - Enhanced error with context
   */
  handleGeminiError(error, processingTime) {
    let errorMessage = 'Unknown error occurred during image generation';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code) {
      errorCode = error.code;
    }

    if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific Gemini error types
    if (error.code === 'INVALID_ARGUMENT') {
      errorMessage = 'Invalid prompt provided for image generation';
    } else if (error.code === 'PERMISSION_DENIED') {
      errorMessage = 'Access denied. Please check your Google API key.';
    } else if (error.code === 'QUOTA_EXCEEDED') {
      errorMessage = 'API quota exceeded. Please check your billing.';
    } else if (error.code === 'RESOURCE_EXHAUSTED') {
      errorMessage = 'Resource exhausted. Please try again later.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.code = errorCode;
    enhancedError.processingTime = processingTime;
    enhancedError.timestamp = new Date().toISOString();

    return enhancedError;
  }

  /**
   * Test the Gemini connection
   * @returns {Object} - Test result
   */
  async testConnection() {
    try {
      const testPrompt = 'A simple colorful greeting card illustration';
      
      console.log('🧪 Testing Gemini connection...');
      
      // Test using the official API structure
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: testPrompt,
      });

      console.log('✅ Gemini test response received');

      return {
        success: true,
        message: 'Gemini connection test successful',
        testResponse: response
      };
    } catch (error) {
      console.error('❌ Gemini connection test failed:', error.message);
      return {
        success: false,
        message: 'Gemini connection test failed',
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new GeminiService();
