"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Users, Calendar, ArrowLeft, Share2, AlertCircle, Loader2 } from "lucide-react"
import { getCurrentAccount, formatAddress, getCampaignById, makeDonation } from "@/lib/wallet-utils"
import TransactionHashDisplay from "@/components/transaction-hash-display"

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [walletAddress, setWalletAddress] = useState("")
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState("10")
  const [isDonating, setIsDonating] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)
      }
    }

    // Get campaign details
    const fetchCampaign = () => {
      if (params.id) {
        const campaignData = getCampaignById(params.id)
        if (campaignData) {
          setCampaign(campaignData)
        } else {
          setError("Campaign not found")
        }
      }
      setLoading(false)
    }

    checkWallet()
    fetchCampaign()
  }, [params.id])

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

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDonate = async () => {
    if (!walletAddress) {
      router.push("/connect")
      return
    }

    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      setError("Please enter a valid donation amount")
      return
    }

    setIsDonating(true)
    setError("")

    try {
      // Make donation transaction
      const result = await makeDonation(campaign.id, Number.parseFloat(donationAmount), campaign.creator)

      // Update campaign in local storage
      const updatedCampaign = {
        ...campaign,
        donationsReceived: (campaign.donationsReceived || 0) + Number.parseFloat(donationAmount),
        donorCount: (campaign.donorCount || 0) + 1,
      }
      setCampaign(updatedCampaign)

      // Update campaigns in localStorage
      const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
      const updatedCampaigns = campaigns.map((c) => (c.id === campaign.id ? updatedCampaign : c))
      localStorage.setItem("campaigns", JSON.stringify(updatedCampaigns))

      // Set transaction result
      setTransaction({
        hash: result.transactionHash,
        blockNumber: result.blockNumber,
        confirmations: result.confirmations,
        from: walletAddress,
        to: campaign.creator,
        amount: donationAmount,
        timestamp: Date.now(),
        status: "confirmed",
      })
    } catch (err) {
      setError(err.message || "An error occurred while processing your donation")
      console.error(err)
    } finally {
      setIsDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Heart className="h-6 w-6 text-primary" />
              <span>DaanQuest</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Heart className="h-6 w-6 text-primary" />
              <span>DaanQuest</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Campaign not found</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/campaigns")}>Back to Campaigns</Button>
          </div>
        </main>
      </div>
    )
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
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="capitalize">{campaign.category}</Badge>
                {getDaysRemaining(campaign.endDate) === 0 ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    Ended
                  </Badge>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <span>Created by:</span>
                  <span className="font-mono">{formatAddress(campaign.creator)}</span>
                </div>
                <div>{formatDate(campaign.createdAt)}</div>
              </div>

              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={
                    campaign.imageUrl ||
                    `/placeholder.svg?height=400&width=800&text=${encodeURIComponent(campaign.title)}`
                  }
                  alt={campaign.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Raised: {campaign.donationsReceived || 0} EDU</span>
                  <span>Goal: {campaign.targetAmount} EDU</span>
                </div>
                <Progress value={getProgressPercentage(campaign.donationsReceived || 0, campaign.targetAmount)} />
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
            </div>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Campaign</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p>{campaign.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="updates" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No updates yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {transaction ? (
              <Card>
                <CardHeader>
                  <CardTitle>Donation Successful!</CardTitle>
                  <CardDescription>Thank you for supporting this campaign</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionHashDisplay
                    hash={transaction.hash}
                    blockNumber={transaction.blockNumber}
                    timestamp={transaction.timestamp}
                    from={transaction.from}
                    to={transaction.to}
                    amount={transaction.amount}
                    status={transaction.status}
                  />
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setTransaction(null)}>
                    Make Another Donation
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Support this Campaign</CardTitle>
                  <CardDescription>Your donation will be processed on the EDUChain blockchain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Donation Amount (EDU)
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10"
                      min="1"
                      step="1"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setDonationAmount("10")}>
                      10 EDU
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setDonationAmount("50")}>
                      50 EDU
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setDonationAmount("100")}>
                      100 EDU
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button
                    className="w-full"
                    onClick={handleDonate}
                    disabled={isDonating || getDaysRemaining(campaign.endDate) === 0}
                  >
                    {isDonating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : getDaysRemaining(campaign.endDate) === 0 ? (
                      "Campaign Ended"
                    ) : (
                      "Donate Now"
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      alert("Campaign link copied to clipboard!")
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Campaign
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="capitalize">{campaign.category}</span>

                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(campaign.createdAt)}</span>

                  <span className="text-muted-foreground">End Date:</span>
                  <span>{formatDate(campaign.endDate)}</span>

                  <span className="text-muted-foreground">Creator:</span>
                  <span className="font-mono">{formatAddress(campaign.creator)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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

