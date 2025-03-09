"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Heart, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentAccount, formatAddress, createCampaign } from "@/lib/web3-utils"
import { verifyOCid, hasOCid } from "@/lib/ocid-utils"

export default function CreateCampaignPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [ocidVerified, setOcidVerified] = useState(false)
  const [ocidChecking, setOcidChecking] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("education")
  const [targetAmount, setTargetAmount] = useState("1000")
  const [minDonation, setMinDonation] = useState("10")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount()
        if (account) {
          setWalletAddress(account)

          // Check if user has OCid
          setOcidChecking(true)
          const hasOcid = await hasOCid(account)
          setOcidVerified(hasOcid)
          setOcidChecking(false)
        } else {
          // Redirect to connect wallet page if not connected
          router.push("/connect?redirect=/campaigns/create")
        }
      } catch (err) {
        setError("Failed to connect wallet")
        console.error(err)
        setOcidChecking(false)
      }
    }

    checkWallet()

    // Set default end date to 30 days from now
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    setEndDate(thirtyDaysFromNow.toISOString().split("T")[0])
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate form
      if (!title || !description || !category || !targetAmount || !endDate || !minDonation) {
        throw new Error("Please fill in all required fields")
      }

      if (Number(minDonation) <= 0) {
        throw new Error("Minimum donation amount must be greater than 0")
      }

      if (Number(targetAmount) <= 0) {
        throw new Error("Target amount must be greater than 0")
      }

      // Create campaign
      const campaign = await createCampaign({
        title,
        description,
        category,
        targetAmount: Number.parseFloat(targetAmount),
        minDonation: Number.parseFloat(minDonation),
        endDate: new Date(endDate).getTime(),
        imageUrl: `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(title)}`,
      })

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/admin/campaign/${campaign.id}`)
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to create campaign")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnectOCid = async () => {
    try {
      const verified = await verifyOCid(walletAddress)
      if (verified) {
        setOcidVerified(true)
      } else {
        setError("OCid verification failed")
      }
    } catch (err) {
      setError("Failed to verify OCid")
      console.error(err)
    }
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
          <h1 className="text-3xl font-bold ml-4">Create Campaign</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {success ? (
            <Alert className="mb-8 border-green-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Campaign Created Successfully!</AlertTitle>
              <AlertDescription>
                Your campaign has been created and is now live. Redirecting you to your campaign admin page...
              </AlertDescription>
            </Alert>
          ) : ocidChecking ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3">Checking OCid verification...</span>
            </div>
          ) : !ocidVerified ? (
            <Card>
              <CardHeader>
                <CardTitle>OCid Verification Required</CardTitle>
                <CardDescription>You need to connect your OCid to create a campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <p className="mb-6">
                  To ensure transparency and accountability, campaign creators must verify their identity using OCid. If
                  you don't have an OCid yet, please sign up for one first.
                </p>
                <div className="flex gap-4">
                  <Button onClick={handleConnectOCid}>Connect OCid</Button>
                  <Button variant="outline" onClick={() => router.push("/signup")}>
                    Sign Up for OCid
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Create a Fundraising Campaign</CardTitle>
                  <CardDescription>
                    Fill in the details below to start your own fundraising campaign on the EDUChain blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a clear, descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Campaign Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your campaign and its goals"
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="arts">Arts & Culture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAmount">Target Amount (EDU)</Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        placeholder="1000"
                        min="100"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minDonation">Minimum Donation Amount (EDU)</Label>
                      <Input
                        id="minDonation"
                        type="number"
                        placeholder="10"
                        min="0.01"
                        step="0.01"
                        value={minDonation}
                        onChange={(e) => setMinDonation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => router.push("/campaigns")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
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

