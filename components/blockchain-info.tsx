"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProvider, getDonationContract } from "@/lib/web3-utils"

export default function BlockchainInfo() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string>("Unknown")
  const [campaignCount, setCampaignCount] = useState<number | null>(null)
  const [donationCount, setDonationCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlockchainInfo = async () => {
      try {
        setLoading(true)

        // Get provider and contract
        const provider = getProvider()
        const contract = getDonationContract(provider)

        // Get network info
        const network = await provider.getNetwork()
        setNetworkName(network.name || `Chain ID: ${network.chainId}`)

        // Get current block
        const block = await provider.getBlockNumber()
        setBlockNumber(block)

        // Get campaign and donation counts
        try {
          const campaigns = await contract.getCampaignCount()
          setCampaignCount(Number(campaigns))

          const donations = await contract.getDonationCount()
          setDonationCount(Number(donations))
        } catch (err) {
          console.error("Error fetching contract data:", err)
          // Continue with partial data
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching blockchain info:", err)
        setError("Failed to connect to blockchain")
      } finally {
        setLoading(false)
      }
    }

    fetchBlockchainInfo()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBlockchainInfo, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">EDUChain Network Status</CardTitle>
        <CardDescription>
          {error ? <span className="text-red-500">{error}</span> : "Live blockchain information"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge variant="outline" className="font-mono">
              {loading ? "Loading..." : networkName}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Block:</span>
            <span className="font-mono text-sm">
              {loading ? "Loading..." : blockNumber?.toLocaleString() || "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Campaigns:</span>
            <span className="font-mono text-sm">
              {loading ? "Loading..." : campaignCount?.toLocaleString() || "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Donations:</span>
            <span className="font-mono text-sm">
              {loading ? "Loading..." : donationCount?.toLocaleString() || "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`}></div>
              <span className="text-sm">{error ? "Disconnected" : "Connected"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

