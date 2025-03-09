"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Wallet, AlertCircle, CheckCircle } from "lucide-react"
import { connectToMetaMask, getCurrentAccount, formatAddress } from "@/lib/wallet-utils"

export default function ConnectPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    const checkWallet = async () => {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)
        setSuccess(true)
      }
    }

    checkWallet()
  }, [])

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)
    setError("")

    try {
      const account = await connectToMetaMask()
      setWalletAddress(account)
      setSuccess(true)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      setError(err.message || `Failed to connect to ${walletType}`)
      console.error(err)
    } finally {
      setIsConnecting(false)
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
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold ml-4">Connect Wallet</h1>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Connect your crypto wallet to make donations, create campaigns, and track your impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && walletAddress && (
                <Alert className="mb-4 border-green-500 text-green-500">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>Wallet connected successfully: {formatAddress(walletAddress)}</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={() => handleConnect("MetaMask")}
                disabled={isConnecting || success}
              >
                {isConnecting ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect MetaMask
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={() => handleConnect("WalletConnect")}
                disabled={isConnecting || success}
              >
                <img src="/placeholder.svg?height=20&width=20" alt="WalletConnect" className="h-5 w-5" />
                WalletConnect
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={() => handleConnect("Coinbase Wallet")}
                disabled={isConnecting || success}
              >
                <img src="/placeholder.svg?height=20&width=20" alt="Coinbase Wallet" className="h-5 w-5" />
                Coinbase Wallet
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy
              </p>
              {success && (
                <Button variant="default" className="w-full" onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
              )}
            </CardFooter>
          </Card>
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

