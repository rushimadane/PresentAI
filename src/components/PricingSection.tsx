
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'For individuals just getting started',
    features: [
      '5 presentations per month',
      'Basic AI designs',
      'Export to PDF',
      'Standard templates',
      'Email support'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    popular: false
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For professionals and small teams',
    features: [
      'Unlimited presentations',
      'Advanced AI designs',
      'Export to PowerPoint & PDF',
      'Premium templates',
      'Priority support',
      'Brand customization',
      'Presentation analytics'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'default',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '49',
    description: 'For organizations and large teams',
    features: [
      'Unlimited presentations',
      'Advanced AI designs',
      'All export options',
      'Custom templates',
      '24/7 support',
      'Brand management',
      'Advanced analytics',
      'SSO & advanced security',
      'Dedicated success manager'
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-xl border ${plan.popular ? 'border-primary shadow-lg relative' : 'border-gray-200'} overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <Button 
                  variant={plan.buttonVariant as "default" | "outline"} 
                  className={`w-full ${plan.buttonVariant === 'default' ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
              
              <div className="bg-gray-50 p-8">
                <p className="font-medium mb-4">What's included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-2">
            Need a custom plan for your team?
          </p>
          <Button variant="link" className="text-primary hover:text-primary/90">
            Contact our sales team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
