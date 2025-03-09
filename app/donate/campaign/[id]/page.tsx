"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Calendar, Users, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { getCurrentAccount, formatAddress, getCampaignById, donateNative } from "@/lib/web3-utils"
import TransactionHashDisplay from "@/components/transaction-hash-display"

export default function DonateToCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const [walletAddress, setWalletAddress] = useState("")
  const [campaign, setCampaign] = useState(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDonating, setIsDonating] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState("")
  const [nftMinted, setNftMinted] = useState(false)

  useEffect(() => {
    const checkWalletAndLoadCampaign = async () => {
      try {
        // Check if wallet is connected
        const account = await getCurrentAccount()
        if (!account) {
          router.push(`/connect?redirect=/donate/campaign/${params.id}`)
          return
        }

        setWalletAddress(account)

        // Load campaign details
        if (params.id) {
          const campaignData = await getCampaignById(params.id)
          if (campaignData) {
            setCampaign(campaignData)
          } else {
            setError("Campaign not found")
          }
        }
      } catch (err) {
        setError("Failed to load campaign data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkWalletAndLoadCampaign()
  }, [params.id, router])

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

  const handleDonate = async () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      setError("Please enter a valid donation amount")
      return
    }

    setIsDonating(true)
    setError("")

    try {
      // Make donation transaction
      const result = await donateNative(params.id, donationAmount, "")

      // Simulate NFT minting
      setTimeout(() => {
        setNftMinted(true)
      }, 2000)

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
      setError(`Failed to process donation: ${err.message}`)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <AlertDescription>{error || "Campaign not found"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/donate")}>Back to Campaigns</Button>
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
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
          <div className="ml-4">
            <Button variant="outline">{formatAddress(walletAddress)}</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/donate")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <h1 className="text-3xl font-bold ml-4">Donate to Campaign</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge className="capitalize">{campaign.category}</Badge>
                  <Badge variant="outline">{getDaysRemaining(campaign.endDate) > 0 ? "Active" : "Ended"}</Badge>
                </div>
                <CardTitle className="mt-4 text-2xl">{campaign.title}</CardTitle>
                <CardDescription>Created by {formatAddress(campaign.creator)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <img
                  src={
                    campaign.imageUrl ||
                    `/placeholder.svg?height=300&width=600&text=${encodeURIComponent(campaign.title) || "/placeholder.svg"}`
                  }
                  alt={campaign.title}
                  className="w-full h-64 object-cover rounded-md"
                />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: {campaign.raisedAmount || 0} EDU</span>
                    <span>Goal: {campaign.targetAmount} EDU</span>
                  </div>
                  <Progress value={getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount)} />
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

                <div>
                  <h3 className="text-lg font-semibold mb-2">About this Campaign</h3>
                  <p className="text-muted-foreground">{campaign.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {transaction ? (
              <Card>
                <CardHeader>
                  <CardTitle>Donation Successful!</CardTitle>
                  <CardDescription>Thank you for your contribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TransactionHashDisplay
                    hash={transaction.hash}
                    blockNumber={transaction.blockNumber}
                    timestamp={transaction.timestamp}
                    from={transaction.from}
                    to={transaction.to}
                    amount={transaction.amount}
                    status={transaction.status}
                  />

                  {nftMinted && (
                    <Alert className="border-green-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle>NFT Receipt Minted</AlertTitle>
                      <AlertDescription>
                        Your donation receipt has been minted as an NFT and sent to your wallet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => router.push("/dashboard")}>
                    View in Dashboard
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                  <CardDescription>Support this educational campaign</CardDescription>
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
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
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
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleDonate}
                    disabled={isDonating || getDaysRemaining(campaign.endDate) <= 0}
                  >
                    {isDonating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : getDaysRemaining(campaign.endDate) <= 0 ? (
                      "Campaign Ended"
                    ) : (
                      "Donate Now"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Connected Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted">
                  <p className="font-mono text-sm">{formatAddress(walletAddress)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Wallet connected and ready for donations</p>
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

