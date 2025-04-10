'use client';

import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Coffee, Salad, Pizza, Calendar, ChefHat, Sparkles } from 'lucide-react';

export default function TutorialModal({ userId, onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Tutorial steps content
  const steps = [
    {
      title: "Welcome to Meal Match!",
      content: "Meal Match helps you plan meals by combining pre-prepared components instead of cooking every meal from scratch.",
      icon: <Coffee className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "Component Categories",
      content: "Create balanced meals by choosing components from different categories: proteins, carbs, vegetables, sauces, and extras.",
      icon: <ChefHat className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "Simple Meal Formula",
      content: "Pick 1 protein + 1 carb + 1-2 veggies + 1 sauce + 1-2 extras for each meal. Prep everything in bulk and combine fresh for each meal.",
      icon: <Pizza className="w-20 h-20 text-orange-500 mx-auto mb-4" />
    },
    {
      title: "AI Meal Assistant",
      content: "Use our AI assistant to get meal recommendations, generate weekly meal plans, or ask for cooking advice.",
      icon: <Sparkles className="w-20 h-20 text-orange-500 mx-auto mb-4" />
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
            
            {/* Example visualization for Components Categories */}
            {step === 2 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 w-full max-w-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Component Categories</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="font-medium text-orange-600 mb-1">Proteins</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Roasted chicken</li>
                      <li>• Baked salmon</li>
                      <li>• Tofu</li>
                      <li>• Ground beef</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <p className="font-medium text-yellow-600 mb-1">Carbs</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Rice</li>
                      <li>• Quinoa</li>
                      <li>• Pasta</li>
                      <li>• Sweet potatoes</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-600 mb-1">Vegetables</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Roasted broccoli</li>
                      <li>• Sautéed spinach</li>
                      <li>• Cucumber salad</li>
                      <li>• Coleslaw</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Simple Meal Formula visualization */}
            {step === 3 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 w-full max-w-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Simple Meal Formula</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <div className="bg-orange-100 px-3 py-1 rounded-full text-orange-700 font-medium text-sm">1 Protein</div>
                  <div className="text-gray-400">+</div>
                  <div className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-medium text-sm">1 Carb</div>
                  <div className="text-gray-400">+</div>
                  <div className="bg-green-100 px-3 py-1 rounded-full text-green-700 font-medium text-sm">1-2 Veggies</div>
                  <div className="text-gray-400">+</div>
                  <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium text-sm">1 Sauce</div>
                  <div className="text-gray-400">+</div>
                  <div className="bg-purple-100 px-3 py-1 rounded-full text-purple-700 font-medium text-sm">1-2 Extras</div>
                </div>
                <p className="text-sm text-center italic">Prep once, combine in different ways for up to 15+ unique meals!</p>
              </div>
            )}
            
            {/* AI Assistant visualization */}
            {step === 4 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 w-full max-w-lg">
                <p className="text-sm text-gray-600 mb-2 font-semibold">AI Assistant Features</p>
                <div className="space-y-3">
                  <div className="flex items-start p-2 bg-orange-50 rounded">
                    <div className="bg-orange-100 p-1 rounded mr-2">
                      <Pizza className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Meal Suggestions</p>
                      <p className="text-xs text-gray-600">Get AI-generated meal ideas based on your available components</p>
                    </div>
                  </div>
                  <div className="flex items-start p-2 bg-blue-50 rounded">
                    <div className="bg-blue-100 p-1 rounded mr-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Weekly Template</p>
                      <p className="text-xs text-gray-600">Generate a complete meal plan with components to prepare</p>
                    </div>
                  </div>
                  <div className="flex items-start p-2 bg-purple-50 rounded">
                    <div className="bg-purple-100 p-1 rounded mr-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Chat</p>
                      <p className="text-xs text-gray-600">Ask for cooking advice, food pairings, and recipe ideas</p>
                    </div>
                  </div>
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