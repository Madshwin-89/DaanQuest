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
import { Heart, Shield, Users, BarChart3, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { getCurrentAccount, formatAddress, getAllCampaigns, approveWithdrawal } from "@/lib/web3-utils"

export default function AdminPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if wallet is connected and user is admin
    const checkWallet = async () => {
      try {
        const account = await getCurrentAccount()
        if (account) {
          setWalletAddress(account)

          // In a real app, we would check if the user has admin role
          // For demo purposes, we'll simulate admin access
          setIsAdmin(true)

          // Load campaigns and withdrawal requests
          const allCampaigns = await getAllCampaigns()
          setCampaigns(allCampaigns)

          // Simulate withdrawal requests for demo
          setWithdrawalRequests([
            {
              id: "1",
              campaignId: "1",
              recipient: "0x1234567890123456789012345678901234567890",
              amount: "100",
              reason: "Project expenses",
              requestDate: new Date().toISOString(),
              status: "pending",
              approvalCount: 1,
            },
            {
              id: "2",
              campaignId: "2",
              recipient: "0x2345678901234567890123456789012345678901",
              amount: "200",
              reason: "Educational materials",
              requestDate: new Date(Date.now() - 86400000).toISOString(),
              status: "pending",
              approvalCount: 0,
            },
          ])
        } else {
          // Redirect to connect wallet page if not connected
          router.push("/connect?redirect=/admin")
        }
      } catch (err) {
        setError("Failed to load admin data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    checkWallet()
  }, [router])

  const handleApproveWithdrawal = async (requestId) => {
    try {
      await approveWithdrawal(requestId)

      // Update UI
      setWithdrawalRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === requestId ? { ...req, approvalCount: req.approvalCount + 1 } : req)),
      )
    } catch (err) {
      setError(`Failed to approve withdrawal: ${err.message}`)
    }
  }

  const handleRejectWithdrawal = async (requestId) => {
    try {
      // In a real app, we would call the contract
      // For demo purposes, we'll just update the UI
      setWithdrawalRequests((prevRequests) =>
        prevRequests.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)),
      )
    } catch (err) {
      setError(`Failed to reject withdrawal: ${err.message}`)
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
          <p>Loading admin dashboard...</p>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
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
            <AlertDescription>You do not have permission to access the admin dashboard.</AlertDescription>
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
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Admin Dashboard</span>
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

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
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {withdrawalRequests.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Requiring admin approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="withdrawals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Withdrawal Requests</CardTitle>
                <CardDescription>Review and approve withdrawal requests from campaign creators</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.campaignId}</TableCell>
                          <TableCell>{formatAddress(request.recipient)}</TableCell>
                          <TableCell>{request.amount} EDU</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "pending"
                                  ? "outline"
                                  : request.status === "approved"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveWithdrawal(request.id)}
                                  className="h-8 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectWithdrawal(request.id)}
                                  className="h-8"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending withdrawal requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Review and manage all campaigns on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Creator</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Raised</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>{campaign.id}</TableCell>
                          <TableCell>{campaign.title}</TableCell>
                          <TableCell>{formatAddress(campaign.creator)}</TableCell>
                          <TableCell className="capitalize">{campaign.category}</TableCell>
                          <TableCell>{campaign.targetAmount} EDU</TableCell>
                          <TableCell>{campaign.raisedAmount || "0"} EDU</TableCell>
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
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                                className="h-8"
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => {
                                  // In a real app, we would call the contract
                                  alert("This would pause/cancel the campaign")
                                }}
                              >
                                Pause
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No campaigns found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">User management functionality coming soon</p>
                </div>
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

