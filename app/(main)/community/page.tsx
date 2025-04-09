"use client"

import { useState } from "react"
import { Search, Filter, MessageSquare, Heart, Share2, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import CommunityGroups from "@/components/community-groups"
import { ThemeProvider } from "@/components/theme-provider"

const posts = [
  {
    id: 1,
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Software Engineer at Google",
    },
    content:
      "Just completed my transition from teaching to tech! It's been a challenging but rewarding journey. Happy to share my experience with anyone considering a similar path. #CareerChange #WomenInTech",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    tags: ["Career Change", "Tech", "Software Engineering"],
  },
  {
    id: 2,
    author: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "Healthcare Administrator",
    },
    content:
      "Looking for advice on negotiating salary for a healthcare administration role. Any tips from women who have successfully navigated this conversation? #SalaryNegotiation #Healthcare",
    timestamp: "5 hours ago",
    likes: 18,
    comments: 12,
    tags: ["Healthcare", "Salary Negotiation"],
  },
  {
    id: 3,
    author: {
      name: "Priya Patel",
      avatar: "/placeholder.svg?height=40&width=40",
      title: "UX Designer",
    },
    content:
      "Just updated my portfolio with my latest UX design projects! It's amazing how much I've grown in just one year. If anyone wants feedback on their portfolio, I'd be happy to help! #UXDesign #Portfolio",
    timestamp: "1 day ago",
    likes: 42,
    comments: 8,
    tags: ["UX Design", "Portfolio"],
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("feed")
  const [newPost, setNewPost] = useState("")
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  const handleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId))
    } else {
      setLikedPosts([...likedPosts, postId])
    }
  }

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // In a real app, this would send the post to an API
      alert("Post submitted: " + newPost)
      setNewPost("")
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Community</h1>
            <p className="text-gray-600">Connect with like-minded women and share your career journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="space-y-6">
                <Card className="border-pink-200 shadow-md sticky top-24">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-pink-800 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-pink-600" />
                      Popular Groups
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <CommunityGroups />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="border-pink-200 shadow-md mb-6">
                <CardContent className="pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger
                        value="feed"
                        className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                      >
                        Feed
                      </TabsTrigger>
                      <TabsTrigger
                        value="trending"
                        className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                      >
                        Trending
                      </TabsTrigger>
                      <TabsTrigger
                        value="my-network"
                        className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800"
                      >
                        My Network
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-2 mb-6">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search posts..."
                          className="pl-10 border-pink-200 focus-visible:ring-pink-500"
                        />
                      </div>
                      <Button variant="outline" size="icon" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>

                    <TabsContent value="feed" className="space-y-6">
                      {/* Create Post */}
                      <Card className="border-pink-200">
                        <CardContent className="pt-6">
                          <div className="flex space-x-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg?height=40&width=40" />
                              <AvatarFallback className="bg-pink-100 text-pink-800">JS</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <Textarea
                                placeholder="Share something with the community..."
                                className="min-h-24 border-pink-200 focus-visible:ring-pink-500"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                              />
                              <div className="flex justify-end mt-3">
                                <Button
                                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                                  onClick={handlePostSubmit}
                                  disabled={!newPost.trim()}
                                >
                                  Post <Send className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Posts */}
                      {posts.map((post) => (
                        <Card key={post.id} className="border-pink-200 hover:shadow-lg transition-shadow duration-300">
                          <CardHeader className="pb-2">
                            <div className="flex items-start space-x-3">
                              <Avatar>
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="bg-pink-100 text-pink-800">
                                  {post.author.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-pink-800">{post.author.name}</div>
                                <div className="text-sm text-gray-500">{post.author.title}</div>
                                <div className="text-xs text-gray-400">{post.timestamp}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 mb-4">{post.content}</p>
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-pink-50 text-pink-700 hover:bg-pink-100"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-pink-100 pt-3 flex justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-gray-600 hover:text-pink-700 hover:bg-pink-50 ${
                                likedPosts.includes(post.id) ? "text-pink-600" : ""
                              }`}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart
                                className={`mr-1 h-4 w-4 ${likedPosts.includes(post.id) ? "fill-pink-600" : ""}`}
                              />
                              {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-pink-700 hover:bg-pink-50"
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              {post.comments}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-pink-700 hover:bg-pink-50"
                            >
                              <Share2 className="mr-1 h-4 w-4" />
                              Share
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="trending">
                      <div className="p-8 text-center">
                        <h3 className="text-lg font-medium text-pink-800 mb-2">Trending Topics</h3>
                        <p className="text-gray-600">Coming soon! This feature is under development.</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="my-network">
                      <div className="p-8 text-center">
                        <h3 className="text-lg font-medium text-pink-800 mb-2">Your Network</h3>
                        <p className="text-gray-600">Coming soon! This feature is under development.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

