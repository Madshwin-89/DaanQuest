"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowLeft, Clock, BarChart3, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import {
  getCurrentAccount,
  formatAddress,
  getCampaignById,
  getUserDonations,
  requestWithdrawal,
} from "@/lib/web3-utils"
import { getOCidDetails } from "@/lib/ocid-utils"

export default function CampaignAdminPage() {
  const router = useRouter()
  const params = useParams()
  const [walletAddress, setWalletAddress] = useState("")
  const [campaign, setCampaign] = useState(null)
  const [donations, setDonations] = useState([])
  const [ocidDetails, setOcidDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false)

  useEffect(() => {
    const checkWalletAndLoadCampaign = async () => {
      try {
        // Check if wallet is connected
        const account = await getCurrentAccount()
        if (!account) {
          router.push(`/connect?redirect=/admin/campaign/${params.id}`)
          return
        }

        setWalletAddress(account)

        // Load campaign details
        if (params.id) {
          const campaignData = await getCampaignById(params.id)
          if (campaignData) {
            // Check if user is the campaign creator
            if (campaignData.creator.toLowerCase() !== account.toLowerCase()) {
              setError("You are not authorized to view this campaign's admin page")
              setLoading(false)
              return
            }

            setCampaign(campaignData)

            // Load donations for this campaign
            const donationsList = await getUserDonations(campaignData.creator)
            const campaignDonations = donationsList.filter((donation) => donation.campaignId === params.id)
            setDonations(campaignDonations)

            // Get OCid details
            const ocid = await getOCidDetails(account)
            setOcidDetails(ocid)
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

  // Check if campaign is completed (time ended or target reached)
  const isCampaignCompleted = () => {
    if (!campaign) return false

    const isTimeEnded = getDaysRemaining(campaign.endDate) <= 0
    const isTargetReached = Number(campaign.raisedAmount) >= Number(campaign.targetAmount)

    return isTimeEnded || isTargetReached
  }

  // Handle withdrawal request
  const handleWithdraw = async () => {
    if (!campaign) return

    setIsWithdrawing(true)
    setError("")

    try {
      // Calculate available amount (raised - withdrawn)
      const availableAmount = Number(campaign.raisedAmount) - Number(campaign.withdrawnAmount || 0)

      if (availableAmount <= 0) {
        throw new Error("No funds available for withdrawal")
      }

      // Request withdrawal
      await requestWithdrawal(campaign.id, availableAmount.toString(), "Campaign funds withdrawal")

      setWithdrawalSuccess(true)
    } catch (err) {
      setError(`Failed to request withdrawal: ${err.message}`)
      console.error(err)
    } finally {
      setIsWithdrawing(false)
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

  if (error) {
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/campaigns")}>Back to Campaigns</Button>
          </div>
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
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Campaign Not Found</AlertTitle>
            <AlertDescription>The campaign you're looking for doesn't exist or has been removed.</AlertDescription>
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
          <div className="ml-4 flex items-center gap-2">
            <Badge variant="outline">Campaign Admin</Badge>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/campaigns" className="text-sm font-medium transition-colors hover:text-primary">
              Campaigns
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <h1 className="text-3xl font-bold ml-4">Campaign Admin</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
              <Badge variant={isCampaignCompleted() ? "outline" : "default"}>
                {isCampaignCompleted() ? "Completed" : "Active"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.title}</div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{campaign.category} campaign</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Funds Raised</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.raisedAmount || "0"} EDU</div>
              <p className="text-xs text-muted-foreground mt-1">Target: {campaign.targetAmount} EDU</p>
              <Progress
                value={getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount)}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDaysRemaining(campaign.endDate)} days</div>
              <p className="text-xs text-muted-foreground mt-1">
                End date: {new Date(campaign.endDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {withdrawalSuccess && (
          <Alert className="mb-6 border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Withdrawal Request Submitted</AlertTitle>
            <AlertDescription>
              Your withdrawal request has been submitted successfully. The funds will be transferred to your wallet
              after approval.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="donations" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="donations">Donations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="donations">
                <Card>
                  <CardHeader>
                    <CardTitle>Donation History</CardTitle>
                    <CardDescription>All donations received for this campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {donations.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Donor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Transaction</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.map((donation, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(donation.timestamp).toLocaleDateString()}</TableCell>
                              <TableCell className="font-mono">{formatAddress(donation.donor || "Unknown")}</TableCell>
                              <TableCell>{donation.amount} EDU</TableCell>
                              <TableCell className="font-mono">
                                <Link
                                  href={`https://explorer.educhain.example/tx/${donation.id}`}
                                  target="_blank"
                                  className="text-primary hover:underline"
                                >
                                  {donation.id.substring(0, 10)}...
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No donations received yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Analytics</CardTitle>
                    <CardDescription>Performance metrics for your campaign</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Donor Count</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-primary mr-2" />
                            <span className="text-2xl font-bold">{campaign.donorCount || 0}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Average Donation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-primary mr-2" />
                            <span className="text-2xl font-bold">
                              {campaign.donorCount && campaign.raisedAmount
                                ? (Number(campaign.raisedAmount) / Number(campaign.donorCount)).toFixed(2)
                                : "0"}{" "}
                              EDU
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Funding Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-primary mr-2" />
                            <span className="text-2xl font-bold">
                              {getProgressPercentage(campaign.raisedAmount || 0, campaign.targetAmount)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Funds Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-primary mr-2" />
                            <span className="text-2xl font-bold">
                              {(Number(campaign.raisedAmount || 0) - Number(campaign.withdrawnAmount || 0)).toFixed(2)}{" "}
                              EDU
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Actions</CardTitle>
                <CardDescription>Manage your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={
                    isWithdrawing ||
                    !isCampaignCompleted() ||
                    Number(campaign.raisedAmount) <= Number(campaign.withdrawnAmount || 0)
                  }
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCampaignCompleted() ? (
                    "Withdraw Funds"
                  ) : (
                    "Campaign Still Active"
                  )}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                  View Public Campaign Page
                </Button>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                {isCampaignCompleted()
                  ? "Your campaign is complete. You can now withdraw the funds."
                  : "You can withdraw funds once the campaign is complete (time ended or target reached)."}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OCid Verification</CardTitle>
              </CardHeader>
              <CardContent>
                {ocidDetails ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">OCid:</span>
                      <span className="font-mono">{ocidDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span>{ocidDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Verification:</span>
                      <Badge variant={ocidDetails.verified ? "default" : "outline"}>
                        {ocidDetails.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Level:</span>
                      <span>Level {ocidDetails.level}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">OCid information not available</p>
                  </div>
                )}
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

