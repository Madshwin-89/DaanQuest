"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getProvider } from "@/lib/web3-utils"

export default function BlockchainStatus() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string>("Unknown")
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const checkBlockchainStatus = async () => {
      try {
        const provider = getProvider()

        // Get current block number
        const currentBlock = await provider.getBlockNumber()
        setBlockNumber(currentBlock)

        // Get network information
        const network = await provider.getNetwork()
        setNetworkName(network.name || `Chain ID: ${network.chainId}`)

        setIsConnected(true)
        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error checking blockchain status:", error)
        setIsConnected(false)
      }
    }

    // Check immediately
    checkBlockchainStatus()

    // Then check every 30 seconds
    const interval = setInterval(checkBlockchainStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <Badge variant="outline" className="text-xs">
              {networkName}
              {blockNumber && ` • Block ${blockNumber.toLocaleString()}`}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected
              ? `Connected to EDUChain • Last updated: ${lastUpdated?.toLocaleTimeString()}`
              : "Not connected to EDUChain"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

