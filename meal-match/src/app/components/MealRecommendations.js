'use client';

import { useState, useRef, useEffect } from 'react';
import { getMealRecommendations, getMealRecommendationChat } from '@/app/actions/mistralAI';
import { ChevronRight, ChevronLeft, Send, PlusCircle, Loader2, MessageSquare } from 'lucide-react';

export default function MealRecommendations({ userId, isVisible, onToggleVisibility, onAddMealToPlanner }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial recommendations
  const getInitialRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user request to messages
      setMessages([{ 
        role: 'user', 
        content: 'What meals can I make with my available ingredients?' 
      }]);
      
      const data = await getMealRecommendations(userId);
      
      // Add AI response to messages
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Here are some meal recommendations based on your available ingredients:',
        recommendations: data.recommendations 
      }]);
    } catch (err) {
      setError(err.message || 'Failed to get recommendations');
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${err.message || 'Failed to get recommendations'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Follow-up chat with the AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      setLoading(true);
      
      // Get all previous messages for context
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      chatHistory.push({ role: 'user', content: userMessage });
      
      // Get follow-up recommendations
      const response = await getMealRecommendationChat(userId, chatHistory);
      
      // Add AI response to chat
      if (response.recommendations) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.message || 'Here are some updated recommendations:',
          recommendations: response.recommendations 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.message || 'I hope that helps with your meal planning!'
        }]);
      }
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${err.message || 'Failed to process your request'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Add a recommended meal to the planner
  const addToPlanner = (meal) => {
    if (onAddMealToPlanner) {
      onAddMealToPlanner(meal);
      
      // Add confirmation message
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Added "${meal.mealName}" to your meal planner.` 
      }]);
    }
  };

  // No content if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden h-full w-80 border-l border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-orange-500" />
          AI Meal Suggestions
        </h2>
        <button 
          onClick={onToggleVisibility}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Close meal recommendations"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-orange-300" />
            <p className="mb-1">Need meal ideas?</p>
            <p className="text-sm mb-4">Get AI-powered suggestions based on your available ingredients</p>
            <button
              onClick={getInitialRecommendations}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md flex items-center"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Get Meal Ideas
            </button>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`${
                message.role === 'user' 
                  ? 'bg-orange-100 ml-8' 
                  : message.role === 'system' 
                    ? 'bg-gray-100 border border-gray-300' 
                    : 'bg-white border border-gray-200'
              } p-3 rounded-lg ${message.role !== 'user' ? 'mr-8' : ''}`}
            >
              {/* Message content */}
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Recommendations if present */}
              {message.recommendations && (
                <div className="mt-3 space-y-4">
                  {message.recommendations.map((meal, mealIndex) => (
                    <div key={mealIndex} className="bg-white rounded-md border border-orange-200 p-3 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-orange-700">{meal.mealName}</h3>
                        <button 
                          onClick={() => addToPlanner(meal)}
                          className="text-orange-500 hover:text-orange-700 flex items-center text-xs"
                          title="Add to meal planner"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" /> Add
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-gray-700">Components to Use:</h4>
                        <ul className="list-disc list-inside text-xs ml-1 text-gray-600">
                          {meal.components.map((component, i) => (
                            <li key={i}>{component}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {meal.additionalIngredients?.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-xs font-medium text-gray-700">Additional Ingredients:</h4>
                          <ul className="list-disc list-inside text-xs ml-1 text-gray-600">
                            {meal.additionalIngredients.map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <button 
                          className="text-xs text-orange-500 hover:text-orange-700"
                          onClick={() => {
                            // Toggle expanded state (you would need to add state for this)
                            const expanded = meal.expanded || false;
                            message.recommendations[mealIndex].expanded = !expanded;
                            setMessages([...messages]);
                          }}
                        >
                          {meal.expanded ? 'Hide details' : 'Show details'}
                        </button>
                        
                        {meal.expanded && (
                          <div className="mt-2 text-xs">
                            <h4 className="font-medium text-gray-700">Preparation:</h4>
                            <p className="text-gray-600">{meal.preparationInstructions}</p>
                            
                            <div className="mt-2">
                              <h4 className="font-medium text-gray-700">Nutrition:</h4>
                              <div className="grid grid-cols-2 gap-x-4 text-gray-600">
                                <div>Calories: {meal.nutritionalInfo.calories}</div>
                                <div>Protein: {meal.nutritionalInfo.protein}g</div>
                                <div>Carbs: {meal.nutritionalInfo.carbs}g</div>
                                <div>Fat: {meal.nutritionalInfo.fat}g</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {messages.length > 0 && (
        <div className="p-3 border-t">
          <div className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about other meal options..."
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md disabled:bg-orange-300"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}