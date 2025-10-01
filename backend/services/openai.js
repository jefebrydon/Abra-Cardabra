const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  /**
   * Initialize OpenAI client with API key
   */
  initializeClient() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured in environment variables');
      }

      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error.message);
      throw error;
    }
  }

  /**
   * Validate that the prompt meets requirements
   * @param {string} prompt - The prompt to validate
   * @returns {boolean} - Whether the prompt is valid
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    if (prompt.trim().length < 50) {
      throw new Error('Prompt must be at least 50 characters long');
    }

    if (prompt.length > 4000) {
      throw new Error('Prompt must be less than 4000 characters');
    }

    return true;
  }

  /**
   * Generate card concepts using GPT-5
   * @param {string} prompt - The formatted prompt for card generation
   * @returns {Object} - Formatted response with card concepts
   */
  async generateCardConcepts(prompt) {
    const startTime = Date.now();
    
    try {
      // Validate prompt
      this.validatePrompt(prompt);

      // Ensure client is initialized
      if (!this.client) {
        throw new Error('OpenAI client not initialized');
      }

      console.log('🤖 Sending prompt to GPT-5...');
      console.log('📝 Prompt length:', prompt.length, 'characters');

      // Call GPT-5 API
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: prompt,
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      console.log('✅ GPT-5 response received');
      console.log('⏱️ Processing time:', processingTime, 'ms');

      // Parse the response
      const result = this.formatResponse(response, processingTime);
      
      return result;

    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      console.error('❌ Error calling GPT-5:', error.message);
      throw this.handleOpenAIError(error, processingTime);
    }
  }

  /**
   * Format GPT-5 response into expected structure
   * @param {Object} openaiResponse - Raw response from GPT-5
   * @param {number} processingTime - Time taken for the request
   * @returns {Object} - Formatted response
   */
  formatResponse(openaiResponse, processingTime) {
    try {
      // Extract the output text from GPT-5 response
      const outputText = openaiResponse.output_text;
      
      if (!outputText) {
        throw new Error('No output text received from GPT-5');
      }

      console.log('📄 Raw GPT-5 output:', outputText);

      // Parse the JSON response
      let cardConcepts;
      try {
        cardConcepts = JSON.parse(outputText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON from GPT-5:', parseError.message);
        throw new Error('Invalid JSON response from GPT-5');
      }

      // Validate the structure
      if (!cardConcepts.card_concepts || !Array.isArray(cardConcepts.card_concepts)) {
        throw new Error('Invalid response structure: missing card_concepts array');
      }

      if (cardConcepts.card_concepts.length !== 3) {
        console.warn(`⚠️ Expected 3 card concepts, got ${cardConcepts.card_concepts.length}`);
      }

      // Validate each card concept
      const validatedConcepts = cardConcepts.card_concepts.map((concept, index) => {
        if (!concept.card_phrase || !concept.illustration_prompt) {
          throw new Error(`Card concept ${index + 1} is missing required fields`);
        }

        return {
          card_phrase: concept.card_phrase.trim(),
          illustration_prompt: concept.illustration_prompt.trim()
        };
      });

      return {
        success: true,
        card_concepts: validatedConcepts,
        debug: {
          processingTime: processingTime,
          rawResponse: outputText,
          conceptCount: validatedConcepts.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error formatting GPT-5 response:', error.message);
      throw new Error(`Failed to format GPT-5 response: ${error.message}`);
    }
  }

  /**
   * Handle OpenAI API errors with detailed information
   * @param {Error} error - The error from OpenAI API
   * @param {number} processingTime - Time taken before error
   * @returns {Error} - Enhanced error with context
   */
  handleOpenAIError(error, processingTime) {
    let errorMessage = 'Unknown error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code) {
      errorCode = error.code;
    }

    if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific OpenAI error types
    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your configuration.';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.code === 'model_not_found') {
      errorMessage = 'GPT-5 model not found. Please check model availability.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.code = errorCode;
    enhancedError.processingTime = processingTime;
    enhancedError.timestamp = new Date().toISOString();

    return enhancedError;
  }

  /**
   * Test the OpenAI connection
   * @returns {Object} - Test result
   */
  async testConnection() {
    try {
      const testPrompt = 'Generate exactly 3 unique card_concepts in valid JSON format. Each should have card_phrase and illustration_prompt fields.';
      
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: testPrompt,
      });

      return {
        success: true,
        message: 'OpenAI connection test successful',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'OpenAI connection test failed',
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new OpenAIService();
