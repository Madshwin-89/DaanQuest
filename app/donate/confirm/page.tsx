"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Heart, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { makeDonation, getCurrentAccount, formatAddress } from "@/lib/wallet-utils"
import TransactionHashDisplay from "@/components/transaction-hash-display"

export default function ConfirmDonationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState("")
  const [walletAddress, setWalletAddress] = useState("")

  // Get donation details from URL params
  const projectId = searchParams.get("project") || "education"
  const amount = searchParams.get("amount") || "1.0"

  useEffect(() => {
    // Check if wallet is connected
    const checkWallet = async () => {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)
      } else {
        // Redirect to connect wallet page if not connected
        router.push("/connect")
      }
    }

    checkWallet()
  }, [router])

  const handleConfirmDonation = async () => {
    setIsProcessing(true)
    setError("")

    try {
      // Project recipient addresses (in a real app, these would come from a database)
      const projectRecipients = {
        education: "0xEDU123456789AbCdEf123456789AbCdEf123456",
        healthcare: "0xEDU123456789AbCdEf123456789AbCdEf789012",
        environment: "0xEDU123456789AbCdEf123456789AbCdEf345678",
        community: "0xEDU123456789AbCdEf123456789AbCdEf901234",
      }

      // Make the donation transaction
      const result = await makeDonation(projectId, Number.parseFloat(amount), projectRecipients[projectId])

      // Set the transaction result
      setTransaction({
        hash: result.transactionHash,
        blockNumber: result.blockNumber,
        confirmations: result.confirmations,
        from: walletAddress,
        to: projectRecipients[projectId],
        amount: amount,
        timestamp: Date.now(),
        status: "confirmed",
      })
    } catch (err) {
      setError(err.message || "An error occurred while processing your donation")
      console.error(err)
    } finally {
      setIsProcessing(false)
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/donate")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donation
          </Button>
          <h1 className="text-3xl font-bold ml-4">Confirm Donation</h1>
        </div>

        <div className="max-w-md mx-auto">
          {!transaction ? (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Your Donation</CardTitle>
                <CardDescription>Please review your donation details before confirming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Project:</span>
                  <span className="capitalize">{projectId}</span>

                  <span className="font-medium">Amount:</span>
                  <span>{amount} EDU</span>

                  <span className="font-medium">From:</span>
                  <span className="font-mono text-sm">
                    {walletAddress ? formatAddress(walletAddress) : "Not connected"}
                  </span>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/donate")}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmDonation} disabled={isProcessing || !walletAddress}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Donation"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Donation Successful!</AlertTitle>
                <AlertDescription>Your donation of {amount} EDU has been processed successfully.</AlertDescription>
              </Alert>

              <TransactionHashDisplay
                hash={transaction.hash}
                blockNumber={transaction.blockNumber}
                timestamp={transaction.timestamp}
                from={transaction.from}
                to={transaction.to}
                amount={transaction.amount}
                status={transaction.status}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  View Dashboard
                </Button>
                <Button onClick={() => router.push("/donate")}>Make Another Donation</Button>
              </div>
            </div>
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

