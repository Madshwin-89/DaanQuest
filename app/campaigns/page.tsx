"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, Plus, Calendar, Search } from "lucide-react"
import { getCurrentAccount, formatAddress, getAllCampaigns } from "@/lib/wallet-utils"

export default function CampaignsPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [campaigns, setCampaigns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)
      }
    }

    // Get all campaigns
    const fetchCampaigns = () => {
      const allCampaigns = getAllCampaigns()
      setCampaigns(allCampaigns)
    }

    checkWallet()
    fetchCampaigns()
  }, [])

  // Filter campaigns based on search term and category
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate days remaining for a campaign
  const getDaysRemaining = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Calculate progress percentage
  const getProgressPercentage = (raised, target) => {
    return Math.min(Math.round((raised / target) * 100), 100)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="h-6 w-6 text-primary" />
            <span>DaanQuest</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/donate" className="text-sm font-medium transition-colors hover:text-primary">
              Donate
            </Link>
            <Link href="/projects" className="text-sm font-medium transition-colors hover:text-primary">
              Projects
            </Link>
            <Link href="/campaigns" className="text-sm font-medium transition-colors hover:text-primary">
              Campaigns
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
          <div className="ml-4">
            <Button onClick={() => router.push("/connect")}>
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community Campaigns</h1>
            <p className="text-muted-foreground">Support campaigns created by the community</p>
          </div>
          <Button onClick={() => router.push("/campaigns/create")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
              <option value="community">Community</option>
              <option value="technology">Technology</option>
              <option value="arts">Arts & Culture</option>
            </select>
          </div>
        </div>

        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      campaign.imageUrl ||
                      `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(campaign.title)}`
                    }
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="capitalize">{campaign.category}</Badge>
                      {getDaysRemaining(campaign.endDate) === 0 ? (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-200">
                          Ended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raised: {campaign.donationsReceived || 0} EDU</span>
                        <span>Goal: {campaign.targetAmount} EDU</span>
                      </div>
                      <Progress value={getProgressPercentage(campaign.donationsReceived || 0, campaign.targetAmount)} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{campaign.donorCount || 0} donors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{getDaysRemaining(campaign.endDate)} days left</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                    View Campaign
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
            {campaigns.length === 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">Be the first to create a campaign!</p>
                <Button onClick={() => router.push("/campaigns/create")}>Create Campaign</Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No campaigns match your search criteria. Try adjusting your filters.
              </p>
            )}
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">DaanQuest</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} DaanQuest. All rights reserved.
          </p>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/terms" className="text-sm font-medium transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm font-medium transition-colors hover:text-primary">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

