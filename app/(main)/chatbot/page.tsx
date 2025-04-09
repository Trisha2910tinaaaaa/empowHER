import { Metadata } from "next";
import { JobChatbot } from "@/components/job-chatbot";

export const metadata: Metadata = {
  title: "Career Assistant | Women in Tech Jobs",
  description: "Interactive job search assistant for women in tech. Find opportunities tailored to your skills and career goals with personalized recommendations.",
  openGraph: {
    title: "Tech Career Assistant | Women in Tech Jobs",
    description: "Interactive job search assistant for women in tech. Find opportunities tailored to your skills and career goals with personalized recommendations.",
    images: ["/images/career-assistant-og.jpg"],
  },
};

export default function ChatbotPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-6 md:mb-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Career Assistant
        </h1>
        <p className="text-xl text-muted-foreground">
          Find your perfect tech job with our AI-powered assistant that specializes in women-friendly workplaces
        </p>
      </div>
      
      <div className="mb-12">
        <JobChatbot />
      </div>
      
      <div className="mt-8 mx-auto max-w-3xl p-6 bg-muted/50 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-4">How to Get the Most Out of Your Job Search</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-medium">Be Specific About:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Job titles you're interested in</li>
              <li>Your preferred location or remote options</li>
              <li>Experience level (entry, mid, senior)</li>
              <li>Specific technologies or skills</li>
              <li>Company size preferences</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Tips for Success:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ask for women-friendly companies</li>
              <li>Inquire about salary ranges</li>
              <li>Request jobs with specific benefits</li>
              <li>Ask for detailed job descriptions</li>
              <li>Follow up on interesting opportunities</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Our career assistant uses real-time job data from various sources to provide you with the most current opportunities. All recommendations are tailored to women in tech, with special focus on inclusive workplaces.</p>
        </div>
      </div>
    </div>
  );
}