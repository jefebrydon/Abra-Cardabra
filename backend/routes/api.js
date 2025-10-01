const express = require('express');
const openaiService = require('../services/openai');
const geminiService = require('../services/gemini');
const router = express.Router();

/**
 * POST /api/generate-concepts
 * Generate 3 card concepts using GPT-5 based on form data and prompt
 */
router.post('/generate-concepts', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract data from request
    const { formData, prompt } = req.body;

    // Validate request data
    if (!formData || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data: formData and prompt are required',
        debug: {
          receivedData: req.body,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Validate form data structure
    const validationResult = validateFormData(formData);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error,
        debug: {
          formData,
          validationErrors: validationResult.errors,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Validate prompt
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be a non-empty string',
        debug: {
          prompt,
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log('🎯 Processing card generation request');
    console.log('📝 Recipient:', formData.recipientName);
    console.log('🎉 Occasion:', formData.occasion);
    console.log('🎭 Tone:', formData.tone);
    console.log('📄 Prompt length:', prompt.length, 'characters');

    // Call OpenAI service to generate card concepts
    const result = await openaiService.generateCardConcepts(prompt);

    const endTime = Date.now();
    const totalProcessingTime = endTime - startTime;

    // Add request timing to debug info
    result.debug.requestProcessingTime = totalProcessingTime;
    result.debug.requestTimestamp = new Date().toISOString();

    console.log('✅ Card concepts generated successfully');
    console.log('⏱️ Total processing time:', totalProcessingTime, 'ms');
    console.log('📊 Generated', result.card_concepts.length, 'card concepts');

    // Return successful response
    res.json({
      success: true,
      card_concepts: result.card_concepts,
      debug: result.debug
    });

  } catch (error) {
    const endTime = Date.now();
    const totalProcessingTime = endTime - startTime;

    console.error('❌ Error generating card concepts:', error.message);
    console.error('🔍 Error details:', error);

    // Return error response with debug information
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        errorCode: error.code || 'UNKNOWN_ERROR',
        processingTime: totalProcessingTime,
        timestamp: new Date().toISOString(),
        requestData: {
          formData: req.body.formData,
          promptLength: req.body.prompt ? req.body.prompt.length : 0
        }
      }
    });
  }
});

/**
 * Validate form data structure and content
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation result with valid flag and errors
 */
function validateFormData(formData) {
  const errors = [];
  
  // Check required fields
  if (!formData.recipientName || typeof formData.recipientName !== 'string' || formData.recipientName.trim().length === 0) {
    errors.push('recipientName is required and must be a non-empty string');
  }

  if (!formData.occasion || typeof formData.occasion !== 'string' || formData.occasion.trim().length === 0) {
    errors.push('occasion is required and must be a non-empty string');
  }

  if (!formData.tone || typeof formData.tone !== 'string' || formData.tone.trim().length === 0) {
    errors.push('tone is required and must be a non-empty string');
  }

  if (!formData.aboutRecipient || typeof formData.aboutRecipient !== 'string' || formData.aboutRecipient.trim().length === 0) {
    errors.push('aboutRecipient is required and must be a non-empty string');
  }

  // Validate tone value
  const validTones = ['Funny', 'Sweet', 'Formal', 'Whimsical', 'Sarcastic'];
  if (formData.tone && !validTones.includes(formData.tone)) {
    errors.push(`tone must be one of: ${validTones.join(', ')}`);
  }

  // Sanitize string inputs
  if (formData.recipientName) {
    formData.recipientName = formData.recipientName.trim().substring(0, 100);
  }
  if (formData.aboutRecipient) {
    formData.aboutRecipient = formData.aboutRecipient.trim().substring(0, 1000);
  }

  return {
    valid: errors.length === 0,
    errors,
    error: errors.length > 0 ? errors.join('; ') : null
  };
}

/**
 * POST /api/generate-images
 * Generate images for illustration prompts using Gemini API
 */
router.post('/generate-images', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Extract illustration prompts from request
    const { illustrationPrompts } = req.body;

    // Validate request data
    if (!illustrationPrompts || !Array.isArray(illustrationPrompts)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data: illustrationPrompts must be an array',
        debug: {
          receivedData: req.body,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (illustrationPrompts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one illustration prompt is required',
        debug: {
          illustrationPrompts,
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log('🎨 Processing image generation request');
    console.log('📝 Number of prompts:', illustrationPrompts.length);
    illustrationPrompts.forEach((prompt, index) => {
      console.log(`📝 Prompt ${index + 1}:`, prompt.substring(0, 100) + '...');
    });

    // Call Gemini service to generate images
    const result = await geminiService.generateImages(illustrationPrompts);

    const endTime = Date.now();
    const totalProcessingTime = endTime - startTime;

    // Add request timing to debug info
    result.debug.requestProcessingTime = totalProcessingTime;
    result.debug.requestTimestamp = new Date().toISOString();

    console.log('✅ Images generated successfully');
    console.log('⏱️ Total processing time:', totalProcessingTime, 'ms');
    console.log('📊 Generated', result.successfulCount, 'out of', illustrationPrompts.length, 'images');

    // Return successful response
    res.json({
      success: true,
      images: result.images,
      successfulCount: result.successfulCount,
      failedCount: result.failedCount,
      debug: result.debug
    });

  } catch (error) {
    const endTime = Date.now();
    const totalProcessingTime = endTime - startTime;

    console.error('❌ Error generating images:', error.message);
    console.error('🔍 Error details:', error);

    // Return error response with debug information
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        errorCode: error.code || 'UNKNOWN_ERROR',
        processingTime: totalProcessingTime,
        timestamp: new Date().toISOString(),
        requestData: {
          illustrationPromptsCount: req.body.illustrationPrompts ? req.body.illustrationPrompts.length : 0
        }
      }
    });
  }
});

/**
 * GET /api/test-openai
 * Test endpoint to verify OpenAI connection
 */
router.get('/test-openai', async (req, res) => {
  try {
    const testResult = await openaiService.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.message,
      debug: {
        timestamp: new Date().toISOString(),
        error: testResult.error || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * GET /api/test-gemini
 * Test endpoint to verify Gemini connection
 */
router.get('/test-gemini', async (req, res) => {
  try {
    const testResult = await geminiService.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.message,
      debug: {
        timestamp: new Date().toISOString(),
        error: testResult.error || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;
