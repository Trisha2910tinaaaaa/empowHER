"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Icons } from "./icons";
import { Send, ThumbsUp, ThumbsDown, Briefcase, MapPin, Calendar, DollarSign, BadgeCheck } from "lucide-react";

// Define interfaces
interface JobBasic {
  title: string;
  company: string;
  location?: string;
  job_type?: string;
  posting_date?: string;
  salary_range?: string;
  application_url: string;
  is_women_friendly?: boolean;
  skills?: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  jobs?: JobBasic[];
}

export function JobChatbot() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I can help you find job opportunities tailored to your skills and preferences. What kind of job are you looking for?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [jobResults, setJobResults] = useState<JobBasic[]>([]);
  const [showTips, setShowTips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions for quick responses
  const suggestions = [
    "Software Engineer jobs",
    "Remote Data Science positions",
    "Entry level UX Designer",
    "Tech internships for women",
    "Jobs at women-friendly companies"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle form submission
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Let UI update before handling submission
    setTimeout(() => {
      handleSubmit(input);
    }, 100);
    
    // Safety timeout to ensure typing indicator stops
    setTimeout(() => {
      const currentMsgCount = messages.length + 1; // +1 for the message we just added
      
      // Set an interval to check if new messages have been added
      const intervalId = setInterval(() => {
        if (messages.length > currentMsgCount) {
          // New message appeared, stop typing and clear interval
          setIsTyping(false);
          clearInterval(intervalId);
        }
      }, 500);
      
      // Ensure typing stops after 10 seconds regardless
      setTimeout(() => {
        setIsTyping(false);
        clearInterval(intervalId);
      }, 10000);
    }, 500);
  };

  // Handle a suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Create a synthetic event for handleSubmit
    setTimeout(() => {
      handleSubmit(suggestion);
    }, 100);
    
    // Safety timeout for typing indicator
    setTimeout(() => {
      const currentMsgCount = messages.length + 1;
      const intervalId = setInterval(() => {
        if (messages.length > currentMsgCount) {
          setIsTyping(false);
          clearInterval(intervalId);
        }
      }, 500);
      
      setTimeout(() => {
        setIsTyping(false);
        clearInterval(intervalId);
      }, 10000);
    }, 500);
  };

  // Handle the actual search submission
  const handleSubmit = async (query: string) => {
    try {
      // Prepare search parameters
      const searchParams = {
        query: query,
        max_results: 5,
        women_friendly_only: query.toLowerCase().includes('women') || query.toLowerCase().includes('female')
      };
      
      // API call
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      const jobs = data.results || [];
      
      // Update job results
      setJobResults(jobs);
      
      // Format response with job recommendations
      let responseContent = '';
      
      if (jobs.length === 0) {
        responseContent = "I couldn't find any jobs matching your criteria. Could you try a different search or be more specific?";
      } else {
        responseContent = `I found ${jobs.length} job opportunities that might interest you:\n\n## Job Recommendations\n\n`;
        
        // Add jobs to the response content
        jobs.forEach((job: JobBasic, index: number) => {
          const womenFriendly = job.is_women_friendly ? '✓ Women-friendly workplace' : '';
          const skills = job.skills && job.skills.length > 0 
            ? `\nSkills: ${job.skills.join(', ')}`
            : '';
          
          responseContent += `**${job.title}** at ${job.company}\n`;
          if (job.location) responseContent += `📍 ${job.location}\n`;
          if (job.job_type) responseContent += `💼 ${job.job_type}\n`;
          if (job.salary_range) responseContent += `💰 ${job.salary_range}\n`;
          if (womenFriendly) responseContent += `${womenFriendly}\n`;
          if (skills) responseContent += `${skills}\n`;
          
          // Add application link (will be rendered as clickable in the message component)
          responseContent += `[Apply Here](${job.application_url})\n\n`;
        });
        
        responseContent += "Would you like more specific results? You can refine your search with location, job type, or specific skills.";
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        jobs: jobs,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Hide tips after first successful search
      setShowTips(false);
    } catch (error) {
      console.error('Error searching for jobs:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting to the job search service. Please try again later or rephrase your query.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  // Format message content with markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Replace job titles with badges
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')
      .replace(/^## (.*?)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
      
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Render job card for better visual presentation
  const renderJobCard = (job: JobBasic) => (
    <Card className="mb-4 border border-blue-100 hover:border-blue-300 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarFallback className="bg-primary/10 text-primary">
              {job.company.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2 w-full">
            <div>
              <h4 className="font-semibold text-base">{job.title}</h4>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.location}</span>
                </div>
              )}
              
              {job.job_type && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{job.job_type}</span>
                </div>
              )}
              
              {job.posting_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{job.posting_date}</span>
                </div>
              )}
              
              {job.salary_range && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{job.salary_range}</span>
                </div>
              )}
            </div>
            
            {job.is_women_friendly && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <BadgeCheck className="h-3 w-3" />
                <span>Women-friendly workplace</span>
              </div>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                className="flex items-center gap-1"
                asChild
              >
                <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                  Apply <Icons.arrowRight className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto border rounded-lg overflow-hidden bg-background">
      {/* Chat header */}
      <div className="p-4 border-b flex justify-between items-center bg-primary/5">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/chatbot-avatar.png" alt="Chatbot" />
            <AvatarFallback className="bg-primary">JB</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Job Search Assistant</h3>
            <p className="text-xs text-muted-foreground">Finding your perfect tech role</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/images/chatbot-avatar.png" alt="Chatbot" />
                  <AvatarFallback className="bg-primary">JB</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.jobs && message.jobs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="mb-2">
                      {formatMessageContent(message.content.split('## Job Recommendations')[0])}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">Job Recommendations</h3>
                    
                    {message.jobs.map((job, jobIndex) => (
                      renderJobCard(job)
                    ))}
                    
                    <div className="mt-2">
                      {formatMessageContent(message.content.split('Would you like more specific results?')[1] || 
                        "Would you like more specific results? You can refine your search with location, job type, or specific skills.")}
                    </div>
                  </div>
                ) : (
                  formatMessageContent(message.content)
                )}
                
                <div className="mt-1 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
          </div>
        ))}

          {isTyping && (
            <div className="flex justify-start gap-2">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src="/images/chatbot-avatar.png" alt="Chatbot" />
                <AvatarFallback className="bg-primary">JB</AvatarFallback>
              </Avatar>
              
              <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.6s]"></div>
                </div>
              </div>
          </div>
        )}
          
        <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Tips panel */}
      {showTips && (
        <div className="mx-4 my-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-100 dark:border-blue-900 text-sm transition-all duration-300">
          <h4 className="font-medium mb-1">Search Tips:</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Include location for local jobs: "Software jobs in Boston"</li>
            <li>• Specify experience level: "Entry level data analyst"</li>
            <li>• Add "women-friendly" to prioritize inclusive workplaces</li>
            <li>• Mention specific technologies: "React developer positions"</li>
          </ul>
        </div>
      )}

      {/* Suggestion chips */}
      <div className="p-2 overflow-x-auto flex gap-2 border-t">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="whitespace-nowrap text-xs h-8"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={onSubmit} className="p-4 border-t flex gap-2">
          <Input
          ref={inputRef}
            value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about job opportunities..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
          </Button>
        </form>
    </div>
  );
}

