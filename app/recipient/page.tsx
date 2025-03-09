"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, GraduationCap, DollarSign, AlertTriangle, Loader2 } from "lucide-react"
import { getCurrentAccount, formatAddress, getAllCampaigns, requestWithdrawal } from "@/lib/web3-utils"

export default function RecipientPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [isRecipient, setIsRecipient] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Withdrawal form state
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalReason, setWithdrawalReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if wallet is connected and user is a recipient
    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount()
        if (account) {
          setWalletAddress(account)

          // In a real app, we would check if the user has recipient role
          // For demo purposes, we'll simulate recipient access
          setIsRecipient(true)

          // Load campaigns created by this user
          const allCampaigns = await getAllCampaigns()
          const userCampaigns = allCampaigns.filter(
            (campaign) => campaign.creator.toLowerCase() === account.toLowerCase(),
          )
          setCampaigns(userCampaigns)

          // Simulate withdrawal history for demo
          setWithdrawals([
            {
              id: "1",
              campaignId: userCampaigns[0]?.id || "1",
              amount: "50",
              reason: "Educational supplies",
              requestDate: new Date(Date.now() - 172800000).toISOString(),
              status: "completed",
            },
            {
              id: "2",
              campaignId: userCampaigns[0]?.id || "1",
              amount: "100",
              reason: "Teacher salaries",
              requestDate: new Date(Date.now() - 86400000).toISOString(),
              status: "pending",
            },
          ])
        } else {
          // Redirect to connect wallet page if not connected
          router.push("/connect?redirect=/recipient")
        }
      } catch (err) {
        setError("Failed to load recipient data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkWallet()
  }, [router])

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault()

    if (!selectedCampaign || !withdrawalAmount || !withdrawalReason) {
      setError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await requestWithdrawal(selectedCampaign, withdrawalAmount, withdrawalReason)

      // Add to local state
      setWithdrawals((prev) => [
        {
          id: result.requestId,
          campaignId: selectedCampaign,
          amount: withdrawalAmount,
          reason: withdrawalReason,
          requestDate: new Date().toISOString(),
          status: "pending",
        },
        ...prev,
      ])

      // Reset form
      setSelectedCampaign("")
      setWithdrawalAmount("")
      setWithdrawalReason("")

      alert("Withdrawal request submitted successfully!")
    } catch (err) {
      setError(`Failed to request withdrawal: ${err.message}`)
      console.error(err)
    } finally {
      setIsSubmitting(false)
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
          <p>Loading recipient dashboard...</p>
        </main>
      </div>
    )
  }

  if (!isRecipient) {
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
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You do not have permission to access the recipient dashboard.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push("/")}>Back to Home</Button>
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
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Recipient Dashboard</span>
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
        <h1 className="text-3xl font-bold mb-8">Recipient Dashboard</h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Campaigns</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                {campaigns.filter((c) => c.status === "active").length} active campaigns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, campaign) => sum + Number(campaign.raisedAmount || 0), 0).toFixed(2)} EDU
              </div>
              <p className="text-xs text-muted-foreground">Across all your campaigns</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  campaigns.reduce((sum, campaign) => sum + Number(campaign.raisedAmount || 0), 0) -
                  campaigns.reduce((sum, campaign) => sum + Number(campaign.withdrawnAmount || 0), 0)
                ).toFixed(2)}{" "}
                EDU
              </div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="withdraw" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="withdraw">Request Withdrawal</TabsTrigger>
            <TabsTrigger value="history">Withdrawal History</TabsTrigger>
            <TabsTrigger value="campaigns">Your Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Request Funds Withdrawal</CardTitle>
                <CardDescription>Submit a request to withdraw funds from your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="campaign" className="text-sm font-medium">
                      Select Campaign
                    </label>
                    <select
                      id="campaign"
                      className="w-full p-2 border rounded-md"
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      required
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.title} ({campaign.raisedAmount} EDU raised)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      Withdrawal Amount (EDU)
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reason" className="text-sm font-medium">
                      Reason for Withdrawal
                    </label>
                    <Textarea
                      id="reason"
                      placeholder="Explain how these funds will be used"
                      value={withdrawalReason}
                      onChange={(e) => setWithdrawalReason(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Withdrawal Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Track the status of your withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell>{withdrawal.id}</TableCell>
                          <TableCell>
                            {campaigns.find((c) => c.id === withdrawal.campaignId)?.title || withdrawal.campaignId}
                          </TableCell>
                          <TableCell>{withdrawal.amount} EDU</TableCell>
                          <TableCell>{withdrawal.reason}</TableCell>
                          <TableCell>{new Date(withdrawal.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                withdrawal.status === "pending"
                                  ? "outline"
                                  : withdrawal.status === "completed"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No withdrawal history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Your Campaigns</CardTitle>
                <CardDescription>Manage your educational campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Raised</TableHead>
                        <TableHead>Withdrawn</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>{campaign.title}</TableCell>
                          <TableCell className="capitalize">{campaign.category}</TableCell>
                          <TableCell>{campaign.targetAmount} EDU</TableCell>
                          <TableCell>{campaign.raisedAmount || "0"} EDU</TableCell>
                          <TableCell>{campaign.withdrawnAmount || "0"} EDU</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                campaign.status === "active"
                                  ? "default"
                                  : campaign.status === "completed"
                                    ? "outline"
                                    : "destructive"
                              }
                            >
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/campaigns/${campaign.id}`)}
                              className="h-8"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No campaigns found</p>
                    <Button className="mt-4" onClick={() => router.push("/campaigns/create")}>
                      Create Campaign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

