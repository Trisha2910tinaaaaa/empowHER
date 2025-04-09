"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Bell, BellOff, ChevronRight } from "lucide-react"

// Enhanced community groups with more details and interaction capabilities
const communityGroups = [
  {
    id: 1,
    name: "Women in Tech",
    members: 2483,
    description: "Support and networking for women in technology fields",
    tags: ["Tech", "Networking", "Career Growth"],
    isPopular: true,
  },
  {
    id: 2,
    name: "Career Changers",
    members: 1756,
    description: "Resources and support for those transitioning to new careers",
    tags: ["Transitions", "Support", "Resources"],
    isPopular: true,
  },
  {
    id: 3,
    name: "Entrepreneurship",
    members: 1242,
    description: "For women building their own businesses and startups",
    tags: ["Business", "Startups", "Networking"],
    isPopular: false,
  },
  {
    id: 4,
    name: "Remote Work",
    members: 1893,
    description: "Tips and opportunities for remote and flexible work",
    tags: ["Remote", "Work-Life Balance", "Jobs"],
    isPopular: true,
  },
  {
    id: 5,
    name: "Leadership Skills",
    members: 1105,
    description: "Developing leadership abilities in professional settings",
    tags: ["Leadership", "Skills", "Development"],
    isPopular: false,
  },
]

export default function CommunityGroups() {
  const [joinedGroups, setJoinedGroups] = useState<number[]>([1])
  const [notifiedGroups, setNotifiedGroups] = useState<number[]>([1])
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)

  const handleJoinGroup = (groupId: number) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter((id) => id !== groupId))
      setNotifiedGroups(notifiedGroups.filter((id) => id !== groupId))
    } else {
      setJoinedGroups([...joinedGroups, groupId])
      setNotifiedGroups([...notifiedGroups, groupId])
    }
  }

  const handleToggleNotifications = (groupId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (notifiedGroups.includes(groupId)) {
      setNotifiedGroups(notifiedGroups.filter((id) => id !== groupId))
    } else if (joinedGroups.includes(groupId)) {
      setNotifiedGroups([...notifiedGroups, groupId])
    }
  }

  const toggleExpanded = (groupId: number) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null)
    } else {
      setExpandedGroup(groupId)
    }
  }

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="space-y-3">
      {communityGroups.map((group) => (
        <Card 
          key={group.id} 
          className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
            joinedGroups.includes(group.id) ? 'border-l-pink-500' : 'border-l-transparent'
          }`}
          onClick={() => toggleExpanded(group.id)}
        >
          <CardHeader className="p-3 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-pink-800 text-base flex items-center">
                  {group.name}
                  {group.isPopular && (
                    <Badge className="ml-2 bg-pink-100 text-pink-700 text-xs">Popular</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {formatMembers(group.members)} members
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1">
                {joinedGroups.includes(group.id) ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={(e) => handleToggleNotifications(group.id, e)}
                  >
                    {notifiedGroups.includes(group.id) ? (
                      <Bell className="h-3 w-3 text-pink-600" />
                    ) : (
                      <BellOff className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                ) : null}
                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                  expandedGroup === group.id ? "rotate-90" : ""
                }`} />
              </div>
            </div>
          </CardHeader>
          
          {expandedGroup === group.id && (
            <>
              <CardContent className="p-3 pt-2">
                <p className="text-gray-600 text-sm">{group.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {group.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs bg-gray-50 border-gray-200 text-gray-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0">
                <Button
                  size="sm"
                  variant={joinedGroups.includes(group.id) ? "outline" : "default"}
                  className={`w-full text-xs ${
                    joinedGroups.includes(group.id)
                      ? "border-pink-200 text-pink-700 hover:bg-pink-50"
                      : "bg-pink-600 hover:bg-pink-700 text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(group.id);
                  }}
                >
                  {joinedGroups.includes(group.id) ? (
                    "Leave Group"
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-3 w-3" />
                      Join Group
                    </>
                  )}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}

