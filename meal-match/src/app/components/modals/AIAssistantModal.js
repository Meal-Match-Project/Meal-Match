'use client';

import { useState, useRef, useEffect } from 'react';
import { X, SendHorizontal, Loader2, Sparkles, Calendar, Plus, MessageCircle, CalendarDays, ChevronDown, RotateCcw } from 'lucide-react';
import { getMealRecommendationChat, getMealRecommendations, generateWeeklyTemplate } from '@/app/actions/mistralAI';

export default function AIAssistantModal({ userId, isOpen, onClose, onAddMealToPlanner, onApplyTemplate }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('meal'); // 'chat', 'meal', or 'template'
  const [recommendations, setRecommendations] = useState([]);
  const [weeklyTemplate, setWeeklyTemplate] = useState(null);
  const [templateOptions, setTemplateOptions] = useState({
    additionalPreferences: ''
  });
  const [successMessage, setSuccessMessage] = useState(null);

  
  const messagesEndRef = useRef(null);
  const modalContentRef = useRef(null);
  
  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: inputMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedHistory = [...chatHistory, userMessage];
      const response = await getMealRecommendationChat(userId, updatedHistory);
      
      // Add the AI's response to chat history
      setChatHistory(prev => [
        ...prev, 
        { role: 'assistant', content: response.message, data: response }
      ]);
      
      // If response contains recommendations, update them
      if (response.recommendations && response.recommendations.length > 0) {
        setRecommendations(response.recommendations);
      }
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMealSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getMealRecommendations(userId);
      
      if (response.recommendations && response.recommendations.length > 0) {
        setRecommendations(response.recommendations);
        
        // Add this as a message in the chat
        setChatHistory([
          { 
            role: 'assistant', 
            content: 'Here are some meal recommendations based on your available components:', 
            data: response 
          }
        ]);
      } else {
        setError('No recommendations found. Please try again.');
      }
    } catch (err) {
      setError(`Failed to get meal suggestions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTemplate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const template = await generateWeeklyTemplate(userId, templateOptions);
      setWeeklyTemplate(template);
      
      // Add this as a message in the chat
      setChatHistory([
        { 
          role: 'assistant', 
          content: `I've created a weekly meal plan template called "${template.name}".`, 
          data: { template } 
        }
      ]);
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(`Failed to generate template: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMealToPlanner = (meal, dayOfWeek, mealType) => {
    setIsLoading(true);
    
    try {
      onAddMealToPlanner({
        ...meal,
        dayOfWeek,
        mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1)
      });
      
      // Show success message
      setSuccessMessage(`Added ${meal.mealName} to ${dayOfWeek} ${mealType}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(`Failed to add meal: ${err.message}`);
    }
  };

  const handleApplyTemplate = () => {
    if (weeklyTemplate) {
      setIsLoading(true);
      try {
        onApplyTemplate(weeklyTemplate);
        
        // Show a success message
        setSuccessMessage(`Added ${weeklyTemplate.components_to_prepare.length} components to your collection`);
        
        // Only close the modal after template is applied
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setIsLoading(false);
        setError(`Failed to apply template: ${err.message}`);
      }
    }
    // Add this after successfully applying a template and showing success message
    if (weeklyTemplate && weeklyTemplate.example_meals) {
        setChatHistory([
        { 
            role: 'assistant', 
            content: `I've added ${weeklyTemplate.components_to_prepare.length} components to your collection. Here are some meal ideas you can make with them:`, 
            data: { 
            recommendations: weeklyTemplate.example_meals.map(meal => ({
                mealName: meal.name,
                components: meal.components,
                preparationInstructions: meal.description
            })) 
            } 
        }
        ]);
        
        // Switch to the chat tab to show the meal suggestions
        setActiveTab('chat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] md:w-[80%] lg:w-[70%] max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('meal')}
              className={`px-3 py-1 rounded-md flex items-center ${activeTab === 'meal' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
            >
              <Plus className="h-4 w-4 mr-1" />
              Meal Suggestions
            </button>
            <button 
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1 rounded-md flex items-center ${activeTab === 'template' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Weekly Template
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-md flex items-center ${activeTab === 'chat' ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              AI Chat
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4" ref={modalContentRef}>
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-10">
                  <Sparkles className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ask me about meal planning!</h3>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    I can help you create meals with your available components, suggest new recipes, 
                    or generate a complete weekly meal plan.
                  </p>
                </div>
              ) : (
                chatHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-orange-100 ml-auto' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.content}
                    
                    {/* If this message contains recommendations, show them with add buttons */}
                    {message.role === 'assistant' && message.data?.recommendations && (
                      <div className="mt-4 space-y-3">
                        {message.data.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{rec.mealName}</h4>
                              <div className="relative group">
                                <button className="text-orange-500 hover:text-orange-700">
                                  <Plus className="h-5 w-5" />
                                </button>
                                <div className="absolute right-0 mt-2 hidden group-hover:block bg-white shadow-lg rounded-md p-2 z-10 w-48">
                                  <div className="text-sm font-semibold mb-1">Add to:</div>
                                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="py-1">
                                      <div className="font-medium text-xs text-gray-500">{day}</div>
                                      <div className="flex space-x-2 mt-1">
                                        <button 
                                          onClick={() => handleAddMealToPlanner(rec, day, 'lunch')}
                                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                          Lunch
                                        </button>
                                        <button 
                                          onClick={() => handleAddMealToPlanner(rec, day, 'dinner')}
                                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                        >
                                          Dinner
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 text-sm">
                              <strong>Components:</strong> {rec.components.join(', ')}
                            </div>
                            {rec.additionalIngredients && rec.additionalIngredients.length > 0 && (
                              <div className="mt-1 text-sm">
                                <strong>Additional:</strong> {rec.additionalIngredients.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* If this message contains a template, show a summary with apply button */}
                    {message.role === 'assistant' && message.data?.template && (
                      <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                        <h4 className="font-medium">{message.data.template.name}</h4>
                        <p className="text-sm mt-1">{message.data.template.description}</p>
                        <div className="mt-2">
                          <strong className="text-sm">Components to prepare:</strong> 
                          <span className="text-sm"> {message.data.template.components_to_prepare.length} items</span>
                        </div>
                        <button 
                            onClick={handleApplyTemplate}
                            disabled={isLoading}
                            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full flex items-center justify-center"
                            >
                            {isLoading ? (
                                <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Applying Template...
                                </>
                            ) : (
                                'Apply This Template to My Meal Plan'
                            )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {activeTab === 'meal' && (
            <div>
              <span className="mb-4 flex justify-between">
                <h3 className="text-xl font-semibold mb-4">Meal Recommendations</h3>
                <button onClick={getMealSuggestions} className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded flex items-center"><RotateCcw className="h-4 w-4 mr-2"/>Refresh</button>
              </span>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((meal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-semibold">{meal.mealName}</h4>
                        <div className="relative group">
                          <button className="bg-orange-500 hover:bg-orange-600 text-white p-1 rounded flex items-center">
                            <Plus className="h-4 w-4 mr-1" />
                            <span className="text-sm">Add</span>
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </button>
                          <div className="absolute right-0 mt-1 hidden group-hover:block bg-white shadow-lg rounded-md p-2 z-10 w-48">
                            <div className="text-sm font-semibold mb-1">Add to:</div>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <div key={day} className="py-1">
                                <div className="font-medium text-xs text-gray-500">{day}</div>
                                <div className="flex space-x-2 mt-1">
                                  <button 
                                    onClick={() => handleAddMealToPlanner(meal, day, 'lunch')}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                  >
                                    Lunch
                                  </button>
                                  <button 
                                    onClick={() => handleAddMealToPlanner(meal, day, 'dinner')}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                                  >
                                    Dinner
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div>
                          <span className="font-medium">Components: </span>
                          {meal.components.join(', ')}
                        </div>
                        
                        {meal.additionalIngredients && meal.additionalIngredients.length > 0 && (
                          <div>
                            <span className="font-medium">Additional Ingredients: </span>
                            {meal.additionalIngredients.join(', ')}
                          </div>
                        )}
                        
                        {meal.preparationInstructions && (
                          <div>
                            <span className="font-medium">Preparation: </span>
                            {meal.preparationInstructions}
                          </div>
                        )}
                        
                        {meal.nutritionalInfo && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Nutrition: </span>
                            {meal.nutritionalInfo.calories > 0 && `${meal.nutritionalInfo.calories} cal `}
                            {meal.nutritionalInfo.protein > 0 && `• ${meal.nutritionalInfo.protein}g protein `}
                            {meal.nutritionalInfo.carbs > 0 && `• ${meal.nutritionalInfo.carbs}g carbs `}
                            {meal.nutritionalInfo.fat > 0 && `• ${meal.nutritionalInfo.fat}g fat`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No meal recommendations available.</p>
                  <button 
                    onClick={getMealSuggestions}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                  >
                    Get Recommendations
                  </button>
                </div>
              )}
            </div>
          )}

                {activeTab === 'template' && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Weekly Component Template</h3>
                    
                    {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                    ) : weeklyTemplate ? (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold">{weeklyTemplate.name}</h4>
                        <p className="mt-1">{weeklyTemplate.description}</p>
                        
                        <div className="mt-4">
                            <h5 className="font-medium mb-2">Components to Prepare:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {weeklyTemplate.components_to_prepare.map((component, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border">
                                <div className="font-medium">{component.name}</div>
                                <div className="text-sm">{component.description}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {component.prep_time}min prep • {component.storage_life} days storage
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <h5 className="font-medium mb-2">Example Meal Ideas:</h5>
                            <div className="space-y-3">
                            {weeklyTemplate.example_meals && weeklyTemplate.example_meals.map((meal, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border">
                                <div className="font-medium">{meal.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Components: {meal.components.join(', ')}
                                </div>
                                <div className="text-sm mt-1">
                                    {meal.description}
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleApplyTemplate}
                            disabled={isLoading}
                            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full flex items-center justify-center"
                        >
                            {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Adding Components...
                            </>
                            ) : (
                            'Add These Components to My Collection'
                            )}
                        </button>
                        </div>
                    </div>
                    ) : (
                <div className="space-y-4">
                  <p className="mb-4">
                    Generate a complete weekly meal plan with reusable components. The AI will suggest components to prepare and how to use them for meals throughout the week.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Additional Preferences (Optional)</h4>
                    <textarea
                      value={templateOptions.additionalPreferences}
                      onChange={(e) => setTemplateOptions(prev => ({ ...prev, additionalPreferences: e.target.value }))}
                      placeholder="E.g., quick weeknight dinners, budget-friendly, high-protein, etc."
                      className="w-full border rounded-md p-2 h-24"
                    />
                  </div>
                  
                  <button 
                    onClick={generateTemplate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md w-full"
                  >
                    Generate Weekly Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        {activeTab === 'chat' && (
          <div className="p-4 border-t">
            <div className="flex">
              <input
                id="ai-chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about meal planning or recipes..."
                className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md disabled:bg-orange-300"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
              </button>
              
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
          </div>
        )}
      </div>
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md flex items-center z-50">
            <span className="check-icon mr-2">✓</span>
            {successMessage}
        </div>
      )}
    </div>
  );
}