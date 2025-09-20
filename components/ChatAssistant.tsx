import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { getChatbotResponseStream } from '../services/geminiService';
import { SendIcon, MicrophoneIcon, BotIcon } from './Icons';

declare global {
  interface Window {
    // FIX: Changed from `typeof SpeechRecognition` to `any` to resolve circular type reference error.
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatAssistantProps {
    analysisContext: AnalysisResult;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

// Check for SpeechRecognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}


export const ChatAssistant: React.FC<ChatAssistantProps> = ({ analysisContext }) => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm your AI assistant. I can help you dig deeper into your analysis results. What would you like to know?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = async (messageText: string) => {
        const userMessage = messageText.trim();
        if (!userMessage || isThinking) return;

        setMessages(prev => [
            ...prev,
            { sender: 'user', text: userMessage },
            { sender: 'ai', text: '' }
        ]);
        setInputValue('');
        setIsThinking(true);

        try {
            const stream = await getChatbotResponseStream(analysisContext, userMessage);
            
            for await (const chunk of stream) {
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    if (lastMessage.sender === 'ai') {
                        lastMessage.text += chunk.text;
                    }
                    return updatedMessages;
                });
            }
        } catch (error) {
            setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage?.sender === 'ai' && lastMessage.text === '') {
                     lastMessage.text = "Sorry, I encountered an error. Please try again.";
                }
                return updatedMessages;
            });
        } finally {
            setIsThinking(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            alert('Voice recognition is not supported by your browser.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }
        
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            setIsListening(false);
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    const suggestions = [
        'Explain the improvement suggestions.',
        `Why is the relevance score ${analysisContext.relevanceScore}?`,
        'What are the most critical missing skills?',
    ];


    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-y-auto pr-4 -mr-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <BotIcon className="w-5 h-5 text-primary-600" />
                            </div>
                        )}
                        <div className={`max-w-md p-3 rounded-xl ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-neutral-100 text-neutral-800 rounded-bl-none'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
                <div className="py-4 space-y-3 flex-shrink-0">
                    <p className="text-xs font-medium text-neutral-500 text-center">Or try one of these suggestions:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(s)}
                                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
                                disabled={isThinking}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-200 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="flex-grow p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm bg-white"
                        disabled={isThinking}
                    />
                    {recognition && (
                        <button type="button" onClick={handleVoiceInput} disabled={isThinking} className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}>
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button type="submit" disabled={isThinking || !inputValue.trim()} className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed">
                       <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};