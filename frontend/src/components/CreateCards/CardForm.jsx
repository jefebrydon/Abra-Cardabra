import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CardForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    occasion: '',
    tone: '',
    illustrationStyle: '',
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
    'Sweet',
    'Formal',
    'Whimsical',
    'Sarcastic'
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

    if (!formData.illustrationStyle) {
      newErrors.illustrationStyle = 'Please select an illustration style';
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

  const isFormValid = Boolean(
    formData.recipientName.trim() &&
    formData.occasion &&
    formData.tone &&
    formData.illustrationStyle &&
    formData.aboutRecipient.trim()
  );

  const isSubmitDisabled = isLoading || !isFormValid;

  return (
    <div className="w-full rounded-[20px] border border-[#F7D9B8] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] sm:p-5">
      {/* Form Title */}
      <h2 className="text-left font-serif text-[20px] font-semibold leading-[28px] text-[#4F433A]">
        Enter Some Details
      </h2>
      
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* Recipient Name */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="recipientName"
            className="text-left text-[14px] font-semibold leading-5 text-[#6B5E55]"
          >
            Recipient(s) Name
          </Label>
          <Input
            id="recipientName"
            value={formData.recipientName}
            onChange={(e) => handleInputChange('recipientName', e.target.value)}
            disabled={isLoading}
            placeholder="First Name(s)"
            className={errors.recipientName ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-[rgba(248,113,113,0.25)]' : ''}
          />
          {errors.recipientName && (
            <p className="text-left text-xs font-medium text-red-500">{errors.recipientName}</p>
          )}
        </div>

        {/* Occasion */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="occasion"
            className="text-left text-[14px] font-semibold leading-5 text-[#6B5E55]"
          >
            Occasion
          </Label>
          <Select
            value={formData.occasion}
            onValueChange={(value) => handleInputChange('occasion', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.occasion ? 'border-red-400 focus:border-red-400 focus:ring-[rgba(248,113,113,0.25)]' : ''}>
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
            <p className="text-left text-xs font-medium text-red-500">{errors.occasion}</p>
          )}
        </div>

        {/* Tone */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="tone"
            className="text-left text-[14px] font-semibold leading-5 text-[#6B5E55]"
          >
            Tone
          </Label>
          <Select
            value={formData.tone}
            onValueChange={(value) => handleInputChange('tone', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.tone ? 'border-red-400 focus:border-red-400 focus:ring-[rgba(248,113,113,0.25)]' : ''}>
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
            <p className="text-left text-xs font-medium text-red-500">{errors.tone}</p>
          )}
        </div>

        {/* Illustration Style */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="illustrationStyle"
            className="text-left text-[14px] font-semibold leading-5 text-[#6B5E55]"
          >
            Illustration Style
          </Label>
          <Select
            value={formData.illustrationStyle}
            onValueChange={(value) => handleInputChange('illustrationStyle', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={errors.illustrationStyle ? 'border-red-400 focus:border-red-400 focus:ring-[rgba(248,113,113,0.25)]' : ''}>
              <SelectValue placeholder="Select an illustration style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Birthday">Birthday</SelectItem>
              <SelectItem value="Cartoon">Cartoon</SelectItem>
              <SelectItem value="Minimalist">Minimalist</SelectItem>
              <SelectItem value="Watercolor">Watercolor</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
          {errors.illustrationStyle && (
            <p className="text-left text-xs font-medium text-red-500">{errors.illustrationStyle}</p>
          )}
        </div>

        {/* About the Recipient */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="aboutRecipient"
            className="text-left text-[14px] font-semibold leading-5 text-[#6B5E55]"
          >
            About the Recipient
          </Label>
          <Textarea
            id="aboutRecipient"
            value={formData.aboutRecipient}
            onChange={(e) => handleInputChange('aboutRecipient', e.target.value)}
            disabled={isLoading}
            placeholder="Enter 2 - 4 details"
            className={errors.aboutRecipient ? 'border-red-400 focus-visible:border-red-400 focus-visible:ring-[rgba(248,113,113,0.25)]' : ''}
          />
          <p className="text-left text-xs text-[#8A7F76]">
            These details are used to create the card's theme.
          </p>
          {errors.aboutRecipient && (
            <p className="text-left text-xs font-medium text-red-500">{errors.aboutRecipient}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="mt-2 w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent"></div>
              Summoning Cards...
            </div>
          ) : (
            'Summon Cards'
          )}
        </Button>
      </form>
    </div>
  );
};

export default CardForm;
