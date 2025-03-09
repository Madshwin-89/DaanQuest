"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, ArrowUpRight, Clock, BarChart3, Plus } from "lucide-react"
import {
  getCurrentAccount,
  formatAddress,
  getUserTransactions,
  getUserCampaigns,
  disconnectWallet,
} from "@/lib/wallet-utils"
import TransactionHashDisplay from "@/components/transaction-hash-display"
import TransactionVerifier from "@/components/transaction-verifier"

export default function DashboardPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [transactions, setTransactions] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [totalDonated, setTotalDonated] = useState(0)
  const [projectsSupported, setProjectsSupported] = useState(0)
  const [lastDonation, setLastDonation] = useState(null)

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)

        // Get user transactions
        const userTxs = getUserTransactions()
        setTransactions(userTxs)

        // Get user campaigns
        const userCampaigns = getUserCampaigns()
        setCampaigns(userCampaigns)

        // Calculate stats
        if (userTxs.length > 0) {
          // Total donated
          const total = userTxs.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)
          setTotalDonated(total)

          // Projects supported (unique project IDs)
          const uniqueProjects = new Set(userTxs.map((tx) => tx.projectId))
          setProjectsSupported(uniqueProjects.size)

          // Last donation (most recent by timestamp)
          const lastTx = [...userTxs].sort((a, b) => b.timestamp - a.timestamp)[0]
          setLastDonation(lastTx)
        }
      } else {
        // Redirect to connect wallet page if not connected
        router.push("/connect?redirect=/dashboard")
      }
    }

    checkWallet()
  }, [router])

  const handleDisconnect = () => {
    disconnectWallet()
    router.push("/")
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
            <Button onClick={handleDisconnect}>
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/campaigns/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
            <Button onClick={() => router.push("/donate")}>Make a Donation</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletAddress ? `${totalDonated.toFixed(2)} EDU` : "0.00 EDU"}</div>
              <p className="text-xs text-muted-foreground">
                {walletAddress
                  ? `Across ${transactions.length} transactions`
                  : "Connect your wallet to view your donations"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projects Supported</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsSupported}</div>
              <p className="text-xs text-muted-foreground">
                {walletAddress
                  ? `You've supported ${projectsSupported} projects`
                  : "Connect your wallet to view supported projects"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last Donation</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastDonation ? `${Number.parseFloat(lastDonation.amount).toFixed(2)} EDU` : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastDonation
                  ? new Date(lastDonation.timestamp).toLocaleDateString()
                  : "Connect your wallet to view your last donation"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="campaigns">Your Campaigns</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="verify">Verify Transaction</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Your Transactions</CardTitle>
                <CardDescription>View all your donation transactions on the EDUChain blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-6">
                    {transactions.map((tx, index) => (
                      <TransactionHashDisplay
                        key={index}
                        hash={tx.hash}
                        blockNumber={tx.blockNumber}
                        timestamp={tx.timestamp}
                        from={tx.sender}
                        to={tx.recipient}
                        amount={tx.amount}
                        status={tx.status}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {walletAddress
                        ? "You haven't made any donations yet"
                        : "Connect your wallet to view your transaction history"}
                    </p>
                    <Button onClick={() => router.push("/donate")}>Make a Donation</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Your Campaigns</CardTitle>
                <CardDescription>Manage the fundraising campaigns you've created</CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-1/3 h-40">
                            <img
                              src={
                                campaign.imageUrl ||
                                `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(campaign.title)}`
                              }
                              alt={campaign.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-semibold text-lg mb-1">{campaign.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{campaign.description}</p>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Raised: {campaign.donationsReceived || 0} EDU</span>
                              <span>Goal: {campaign.targetAmount} EDU</span>
                            </div>
                            <div className="flex justify-end">
                              <Button size="sm" onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                                View Campaign
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't created any fundraising campaigns yet
                    </p>
                    <Button onClick={() => router.push("/campaigns/create")}>Create Campaign</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects You've Supported</CardTitle>
                <CardDescription>Track the projects you've donated to and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(transactions.map((tx) => tx.projectId))).map((projectId, index) => {
                      const projectTransactions = transactions.filter((tx) => tx.projectId === projectId)
                      const totalAmount = projectTransactions.reduce((sum, tx) => sum + Number.parseFloat(tx.amount), 0)

                      return (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="capitalize">{projectId}</CardTitle>
                            <CardDescription>
                              {projectTransactions.length} donation{projectTransactions.length !== 1 ? "s" : ""}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold mb-2">{totalAmount.toFixed(2)} EDU</div>
                            <p className="text-sm text-muted-foreground">
                              Last donation:{" "}
                              {new Date(
                                Math.max(...projectTransactions.map((tx) => tx.timestamp)),
                              ).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border p-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">You haven't supported any projects yet</p>
                    <Button onClick={() => router.push("/donate")}>Support a Project</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="verify">
            <TransactionVerifier />
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

