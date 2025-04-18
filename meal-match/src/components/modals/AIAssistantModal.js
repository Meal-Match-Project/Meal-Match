'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, MessageCircle, Plus, ChevronDown, Trash2, Sparkles, 
  Loader2, SendHorizontal, RotateCcw, CalendarDays
} from 'lucide-react';
import {
  getMealRecommendations,
  getMealRecommendationChat,
  generateWeeklyTemplate,
  getGeneralFoodAdvice
} from '@/actions/mistralAI';

function FormattedMessage({ content }) {
  // Process the content to apply formatting
  const formattedContent = useMemo(() => {
    if (!content) return null;
  
    // Pre-process the content to ensure consistent formatting
    let processedContent = content
      // Make sure section headers have newlines before them
      .replace(/\n(#+\s)/g, '\n\n$1')
      // Ensure list items are preceded by newlines if they aren't already
      .replace(/([^\n])\n-\s/g, '$1\n\n- ')
      // Ensure numbered items are preceded by newlines if they aren't already
      .replace(/([^\n])\n(\d+\.)\s/g, '$1\n\n$2 ');
    
    // Split by double newlines to separate paragraphs
    const paragraphs = processedContent.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Trim the paragraph to remove any leading/trailing whitespace
      const trimmedParagraph = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmedParagraph) return null;
      
      // Check if this is a section header
      if (/^#+\s/.test(trimmedParagraph)) {
        const level = (trimmedParagraph.match(/^#+/)[0] || '').length;
        const title = trimmedParagraph.replace(/^#+\s*/, '');
        
        // Different styling based on header level
        if (level === 1) {
          return (
            <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-orange-600">
              {title}
            </h2>
          );
        } else {
          return (
            <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-gray-800">
              {title}
            </h3>
          );
        }
      }
      
      // Check if this is a bulleted list - look for lines starting with -
      if (trimmedParagraph.includes('\n- ') || trimmedParagraph.startsWith('- ')) {
        const listItems = trimmedParagraph
          .split(/\n-\s*/g)
          .filter(Boolean)
          .map(item => item.trim());
          
        return (
          <ul key={index} className="list-disc pl-5 my-3 space-y-1.5">
            {listItems.map((item, i) => {
              // Process any emphasis within list items
              const processedItem = item.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
              return <li key={i} dangerouslySetInnerHTML={{ __html: processedItem }} />;
            })}
          </ul>
        );
      }
      
      // Check if this is a numbered list - look for lines starting with 1. etc
      if (/\n\d+\.\s/.test('\n' + trimmedParagraph) || /^\d+\.\s/.test(trimmedParagraph)) {
        const listItems = trimmedParagraph
          .split(/\n\d+\.\s*/g)
          .filter(Boolean)
          .map(item => item.trim());
          
        return (
          <ol key={index} className="list-decimal pl-5 my-3 space-y-1.5">
            {listItems.map((item, i) => {
              // Process any emphasis within list items
              const processedItem = item.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
              return <li key={i} dangerouslySetInnerHTML={{ __html: processedItem }} />;
            })}
          </ol>
        );
      }
      
      // Handle emphasis with asterisks
      const processedText = trimmedParagraph.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
      
      // Regular paragraph
      return (
        <p key={index} className="my-2.5" 
           dangerouslySetInnerHTML={{ __html: processedText }} />
      );
    });
  }, [content]);
  
  return (
    <div className="formatted-content prose prose-sm max-w-none">
      {formattedContent}
      
      <style jsx global>{`
        .formatted-content h2 {
          color: #ea580c; /* orange-600 */
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .formatted-content h3 {
          color: #1f2937; /* gray-800 */
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .formatted-content ul, .formatted-content ol {
          margin-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .formatted-content li {
          margin-bottom: 0.25rem;
        }
        .formatted-content p {
          margin-bottom: 0.875rem;
          line-height: 1.6;
        }
        .formatted-content strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default function AIAssistantModal({ userId, isOpen, onClose, onAddMealToPlanner, onApplyTemplate, onSetSuggestions }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [generalChatHistory, setGeneralChatHistory] = useState([]);
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

  const lastProcessedRecommendationsRef = useRef('');
  const lastProcessedTemplateRef = useRef('');
  
  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, generalChatHistory]);

  // Update parent component with example meals if available
  useEffect(() => {
    if (weeklyTemplate && weeklyTemplate.example_meals && onSetSuggestions) {
      const templateId = weeklyTemplate.name || '';
      
      // Only process if this template hasn't been processed yet
      if (templateId !== lastProcessedTemplateRef.current) {
        lastProcessedTemplateRef.current = templateId;
        
        // Format the suggestions in a consistent way
        const formattedSuggestions = weeklyTemplate.example_meals.map(meal => ({
          name: meal.name,
          components: meal.components,
          description: meal.description,
          type: 'template'
        }));
        
        onSetSuggestions(formattedSuggestions);
      }
    }
  }, [weeklyTemplate, onSetSuggestions]);
  
  useEffect(() => {
    if (recommendations && recommendations.length > 0 && onSetSuggestions) {
      // Only run this effect if we have recommendations that haven't been processed yet
      const recommendationIds = recommendations.map(rec => rec.mealName).join(',');
      
      // Store the last processed batch in a ref to prevent infinite loops
      if (recommendationIds !== lastProcessedRecommendationsRef.current) {
        lastProcessedRecommendationsRef.current = recommendationIds;
        
        // Format the meal recommendations to match the expected structure
        const formattedSuggestions = recommendations.map(meal => ({
          name: meal.mealName,
          components: meal.components || [],
          description: meal.preparationInstructions || '',
          additionalIngredients: meal.additionalIngredients || [],
          type: 'recommendation'
        }));
        
        // Send these suggestions to the parent component
        onSetSuggestions(formattedSuggestions);
      }
    }
  }, [recommendations, onSetSuggestions]);

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
      
    } catch (err) {
      setError(`Failed to get response: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneralChatMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user's message to chat history
    const userMessage = { role: 'user', content: inputMessage };
    setGeneralChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the current chat history including the new message
      const currentChatHistory = [...generalChatHistory, userMessage];
      
      // Get response from AI
      const response = await getGeneralFoodAdvice(userId, currentChatHistory);
      
      if (response.success) {
        // Add the AI's response to chat history
        setGeneralChatHistory(prev => [
          ...prev, 
          { role: 'assistant', content: response.message }
        ]);
      } else {
        // Handle error in the response
        setError(`Failed to get response: ${response.error}`);
      }
      
      // Scroll to bottom
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
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
        
        // Format and send recommendations to the sidebar
        const formattedSuggestions = response.recommendations.map(meal => ({
          name: meal.mealName,
          components: meal.components || [],
          description: meal.preparationInstructions || '',
          additionalIngredients: meal.additionalIngredients || [],
          type: 'recommendation',
          nutritionalInfo: meal.nutritionalInfo || {}
        }));
        
        // Update parent component with suggestions
        if (onSetSuggestions) {
          onSetSuggestions(formattedSuggestions);
        }
        
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
      
    } catch (err) {
      setError(`Failed to generate template: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAddMealToPlanner = (meal, dayOfWeek, mealType) => {
  //   setIsLoading(true);
    
  //   try {
  //     onAddMealToPlanner({
  //       ...meal,
  //       dayOfWeek,
  //       mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1)
  //     });
      
  //     // Show success message
  //     setSuccessMessage(`Added ${meal.mealName} to ${dayOfWeek} ${mealType}`);
  //     setTimeout(() => {
  //       setSuccessMessage(null);
  //     }, 3000);
      
  //     setIsLoading(false);
  //   } catch (err) {
  //     setIsLoading(false);
  //     setError(`Failed to add meal: ${err.message}`);
  //   }
  // };

  const handleApplyTemplate = () => {
    if (weeklyTemplate) {
      setIsLoading(true);
      
      try {
        // First step: Apply the template
        onApplyTemplate(weeklyTemplate);
        
        // Show success message
        setSuccessMessage(`Added ${weeklyTemplate.components_to_prepare.length} components to your collection`);
        
        // Update chat history with meal ideas
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
        }
        
        // Keep loading state active during animation
        setTimeout(() => {
          setIsLoading(false);
          onClose(); // Close the modal after success
        }, 2000); // Slightly longer time to ensure loading animation is visible
        
      } catch (err) {
        console.error("Template application error:", err);
        setIsLoading(false);
        setError(`Failed to apply template: ${err.message}`);
      }
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
              {generalChatHistory.length === 0 ? (
                <div className="text-center py-10">
                  <Sparkles className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ask me about food ideas!</h3>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    I can provide general advice about cooking, food pairings, meal planning,
                    and recipe ideas. This is just for information - to add actual meals to your
                    planner, use the Meal Suggestions or Weekly Template tabs.
                  </p>
                </div>
              ) : (
                generalChatHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-orange-100 ml-auto' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      message.content
                    ) : (
                      <FormattedMessage content={message.content} />
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
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Available in sidebar
                        </span>
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
                                <div className="text-sm">{component.notes}</div>
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
                onKeyDown={(e) => e.key === 'Enter' && handleGeneralChatMessage()}
                placeholder="Ask about food ideas, cooking techniques, etc..."
                className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                disabled={isLoading}
              />
              <button
                onClick={handleGeneralChatMessage}
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