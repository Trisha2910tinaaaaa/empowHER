"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { 
  Briefcase, User, MapPin, Mail, 
  Calendar, Link2, Pencil, Shield, 
  Building, GraduationCap, Award,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { isLoaded, user } = useUser()
  const [activeTab, setActiveTab] = useState("overview")

  if (!isLoaded || !user) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const fullName = user?.fullName || "User"
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`

  // Mock data for the profile
  const profile = {
    title: "Frontend Developer",
    location: "San Francisco, CA",
    summary: "Passionate frontend developer with 3+ years of experience building modern web applications. Specialized in React, Next.js, and design systems. Looking for new opportunities to grow and make an impact in an inclusive team.",
    skills: ["JavaScript", "React", "Next.js", "TypeScript", "CSS/SCSS", "TailwindCSS", "UI/UX Design", "Responsive Design", "Git", "REST APIs"],
    experience: [
      {
        company: "TechCorp Inc.",
        position: "Frontend Developer",
        duration: "2021 - Present",
        description: "Developing and maintaining client-facing applications with React and TypeScript. Led a team of 3 developers to build a new customer portal.",
      },
      {
        company: "WebStart Agency",
        position: "Junior Developer",
        duration: "2019 - 2021",
        description: "Worked on various client projects implementing responsive designs and interactive UI components.",
      }
    ],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Science in Computer Science",
        duration: "2015 - 2019",
      }
    ],
    applications: [
      {
        company: "InnovateX",
        position: "Senior Frontend Developer",
        status: "Application Review",
        date: "June 10, 2023",
      },
      {
        company: "Future Technologies",
        position: "UI Developer",
        status: "Interview Scheduled",
        date: "June 5, 2023",
      }
    ],
    saved: [
      {
        company: "TechGrowth",
        position: "React Developer",
        location: "Remote",
        salary: "$90K-120K",
      },
      {
        company: "CodeBridge",
        position: "Frontend Engineer",
        location: "New York, NY",
        salary: "$110K-140K",
      }
    ]
  }

  function StatusBadge({ status }: { status: string }) {
    let color
    switch (status) {
      case "Application Review":
        color = "bg-blue-100 text-blue-800"
        break
      case "Interview Scheduled":
        color = "bg-green-100 text-green-800"
        break
      case "Assessment":
        color = "bg-purple-100 text-purple-800"
        break
      case "Rejected":
        color = "bg-red-100 text-red-800"
        break
      default:
        color = "bg-gray-100 text-gray-800"
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 shadow-lg text-white mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-white/10 text-white text-xl">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{fullName}</h1>
            <p className="text-white/80 text-lg mt-1">{profile.title}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 opacity-70" />
                <span className="text-sm">{profile.location}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1 opacity-70" />
                <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 opacity-70" />
                <span className="text-sm">Joined June 2023</span>
              </div>
            </div>
          </div>
          
          <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full">
            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
              <User className="h-4 w-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
              <Briefcase className="h-4 w-4 mr-2" /> Applications
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
              <Shield className="h-4 w-4 mr-2" /> Saved Jobs
            </TabsTrigger>
          </TabsList>
          
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <Link2 className="mr-2 h-4 w-4" /> Share Profile
          </Button>
        </div>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{profile.summary}</p>
            </CardContent>
          </Card>
          
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Professional skills and expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-0">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Professional history and positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.experience.map((job, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.position}</h3>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-600">{job.company}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{job.duration}</span>
                  </div>
                  <p className="mt-2 text-gray-700">{job.description}</p>
                  {index < profile.experience.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
              <CardDescription>Academic background and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <div className="flex items-center mt-1">
                      <GraduationCap className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-gray-600">{edu.institution}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{edu.duration}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
            <Badge className="bg-purple-100 text-purple-800">
              {profile.applications.length} Applications
            </Badge>
          </div>
          
          {profile.applications.map((app, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{app.position}</CardTitle>
                  <CardDescription>{app.company}</CardDescription>
                </div>
                <StatusBadge status={app.status} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-600">Applied on {app.date}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  View Details
                </Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Withdraw
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        {/* Saved Jobs Tab */}
        <TabsContent value="saved" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Saved Opportunities</h2>
            <Badge className="bg-purple-100 text-purple-800">
              {profile.saved.length} Saved Jobs
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.saved.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{job.position}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600">{job.location}</span>
                    </div>
                    <div className="text-sm font-medium text-purple-600">{job.salary}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                    Apply Now <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

