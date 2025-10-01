import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CardForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    occasion: '',
    tone: '',
    aboutRecipient: ''
  });

  const [errors, setErrors] = useState({});

  const occasions = [
    'Birthday',
    'Wedding', 
    'Anniversary',
    'New Baby',
    'Graduation',
    'Valentine\'s Day',
    'Mother\'s Day',
    'Father\'s Day'
  ];

  const tones = [
    'Funny',
    'Sentimental', 
    'Casual',
    'Formal'
  ];


  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.occasion) {
      newErrors.occasion = 'Please select an occasion';
    }

    if (!formData.tone) {
      newErrors.tone = 'Please select a tone';
    }

    if (!formData.aboutRecipient.trim()) {
      newErrors.aboutRecipient = 'Please tell us about the recipient';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Create Your Perfect Card</CardTitle>
        <CardDescription>
          Fill out the form below to generate personalized greeting cards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name *</Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              disabled={isLoading}
              placeholder="Enter recipient's name"
              className={errors.recipientName ? 'border-destructive' : ''}
            />
            {errors.recipientName && (
              <p className="text-sm text-destructive">{errors.recipientName}</p>
            )}
          </div>

          {/* Occasion */}
          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion *</Label>
            <Select
              value={formData.occasion}
              onValueChange={(value) => handleInputChange('occasion', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.occasion ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select an occasion" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map(occasion => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.occasion && (
              <p className="text-sm text-destructive">{errors.occasion}</p>
            )}
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone *</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) => handleInputChange('tone', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.tone ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map(tone => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tone && (
              <p className="text-sm text-destructive">{errors.tone}</p>
            )}
          </div>

          {/* About the Recipient */}
          <div className="space-y-2">
            <Label htmlFor="aboutRecipient">About the Recipient *</Label>
            <Textarea
              id="aboutRecipient"
              value={formData.aboutRecipient}
              onChange={(e) => handleInputChange('aboutRecipient', e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder="Tell us about the recipient..."
              className={errors.aboutRecipient ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Enter 2-4 key details or themes that you'd want your card to include.
            </p>
            {errors.aboutRecipient && (
              <p className="text-sm text-destructive">{errors.aboutRecipient}</p>
            )}
          </div>


          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Cards...
                </div>
              ) : (
                'Generate Cards'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CardForm;
