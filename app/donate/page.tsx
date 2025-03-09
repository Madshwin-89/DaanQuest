"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, AlertCircle, Calendar, Users } from "lucide-react"
import { getCurrentAccount, formatAddress, getAllCampaigns } from "@/lib/web3-utils"

export default function DonatePage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Check if wallet is connected
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount()
        if (account) {
          setWalletAddress(account)
          // Fetch campaigns after wallet is connected
          fetchCampaigns()
        } else {
          // Redirect to connect wallet page if not connected
          router.push("/connect?redirect=/donate")
        }
      } catch (err) {
        setError("Failed to connect to wallet")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkWallet()
  }, [router])

  // Fetch all active campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const allCampaigns = await getAllCampaigns()
      // Filter for active campaigns only
      const activeCampaigns = allCampaigns.filter(
        (campaign) => campaign.status === "active" && new Date(campaign.endDate) > new Date(),
      )
      setCampaigns(activeCampaigns)
    } catch (err) {
      setError("Failed to load campaigns")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress percentage
  const getProgressPercentage = (raised, target) => {
    return Math.min(Math.round((raised / target) * 100), 100)
  }

  // Calculate days remaining for a campaign
  const getDaysRemaining = (endDate) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
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
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold ml-4">Make a Donation</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      campaign.imageUrl ||
                      `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(campaign.title) || "/placeholder.svg"}`
                    }
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className="capitalize">{campaign.category}</Badge>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Raised: {campaign.raisedAmount || 0} EDU</span>
                        <span>Goal: {campaign.targetAmount} EDU</span>
                      </div>
                      <Progress value={getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount)} />
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
                  <Button className="w-full" onClick={() => router.push(`/donate/campaign/${campaign.id}`)}>
                    Donate to this Campaign
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle>No Active Campaigns</CardTitle>
              <CardDescription>There are no active campaigns available for donation at this time.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Would you like to create a new campaign to start receiving donations?</p>
              <Button onClick={() => router.push("/campaigns/create")}>Create a Campaign</Button>
            </CardContent>
          </Card>
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

