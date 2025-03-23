'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Coffee, Salad, Pizza, Calendar, ChefHat, Carrot } from 'lucide-react';

export default function TutorialModal({ userId, onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Tutorial steps content
  const steps = [
    {
      title: "Welcome to Meal Match!",
      content: "Let's learn how to streamline your meal planning with our simple drag-and-drop system.",
      icon: <Coffee className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "Components vs. Ingredients",
      content: "Components are prepared foods (like roasted chicken, cooked quinoa, or sautéed vegetables) that are ready to be combined into meals. Unlike raw ingredients, components are already cooked and can be mixed and matched instantly.",
      icon: <ChefHat className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "Plan Your Entire Week",
      content: "Organize breakfast, lunch, and dinner for every day. See your whole week at a glance and prepare components in advance to save time throughout the week!",
      icon: <Calendar className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "Mix & Match for Variety",
      content: "Drag components from the sidebar into meal slots. Create a variety of meals using the same batch-prepared components to save time while avoiding meal fatigue.",
      icon: <Pizza className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    }
  ];

  const handleComplete = () => {
    // Save to localStorage that this user has seen the tutorial
    localStorage.setItem(`tutorial-shown-${userId}`, 'true');
    onClose();
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full relative overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-orange-500 h-1 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-8">
          {/* Step indicator */}
          <div className="text-sm text-gray-500 mb-4">
            Step {step} of {totalSteps}
          </div>

          {/* Content */}
          <div className="flex flex-col items-center">
            {currentStep.icon}
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              {currentStep.title}
            </h2>
            
            <p className="text-gray-600 text-center mb-8 max-w-lg">
              {currentStep.content}
            </p>
            
            {/* Example visualization */}
            {step === 2 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 w-full max-w-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Components vs. Ingredients</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="border-r pr-3">
                    <p className="font-medium text-orange-600 mb-2">Ingredients (Raw)</p>
                    <ul className="space-y-1">
                      <li>• Raw chicken breast</li>
                      <li>• Uncooked rice</li>
                      <li>• Raw vegetables</li>
                      <li>• Dried beans</li>
                    </ul>
                  </div>
                  <div className="pl-3">
                    <p className="font-medium text-green-600 mb-2">Components (Prepared)</p>
                    <ul className="space-y-1">
                      <li>• Roasted chicken thighs</li>
                      <li>• Cooked jasmine rice</li>
                      <li>• Roasted vegetables</li>
                      <li>• Seasoned black beans</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 w-full max-w-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Example: Weekly Meal Plan with Reusable Components</p>
                
                <div className="mb-4">
                  <p className="font-medium text-gray-800">Your Prepared Components:</p>
                  <ul className="text-sm grid grid-cols-2 gap-x-4 mt-1">
                    <li>• Roasted chicken thighs</li>
                    <li>• Baked salmon filets</li>
                    <li>• Cooked quinoa</li>
                    <li>• Roasted sweet potatoes</li>
                    <li>• Steamed broccoli</li>
                    <li>• Cucumber tomato salad</li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-2 text-sm border-t pt-3">
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Monday:</span>
                    <span>Chicken + Quinoa + Broccoli</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Tuesday:</span>
                    <span>Salmon + Sweet Potatoes + Broccoli</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Wednesday:</span>
                    <span>Chicken + Cucumber Salad + Sweet Potatoes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Thursday:</span>
                    <span>Chicken + Quinoa + Cucumber Salad</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 font-medium">Friday:</span>
                    <span>Salmon + Quinoa + Broccoli</span>
                  </div>
                  <p className="text-orange-600 mt-2 italic">Six components = fifteen different meal combinations!</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className={`flex items-center ${
                step === 1 ? 'invisible' : ''
              } px-4 py-2 text-gray-600 hover:text-gray-800`}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            
            <button
              onClick={handleComplete}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Skip Tutorial
            </button>
            
            <button
              onClick={nextStep}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              {step === totalSteps ? 'Get Started' : 'Next'}
              {step !== totalSteps && <ArrowRight className="h-4 w-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}