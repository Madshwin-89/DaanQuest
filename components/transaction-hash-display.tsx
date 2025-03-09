"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clipboard, Check, ExternalLink } from "lucide-react"
import { formatAddress } from "@/lib/wallet-utils"

interface TransactionHashDisplayProps {
  hash: string
  blockNumber?: number
  timestamp?: number
  from?: string
  to?: string
  amount?: string
  status?: string
}

export default function TransactionHashDisplay({
  hash,
  blockNumber,
  timestamp,
  from,
  to,
  amount,
  status = "confirmed",
}: TransactionHashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Transaction Hash</CardTitle>
        {status && (
          <CardDescription>
            Status:{" "}
            <span className={status === "confirmed" ? "text-green-500" : "text-amber-500"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <code className="bg-muted p-2 rounded text-xs font-mono break-all">{hash}</code>
          <Button variant="ghost" size="icon" onClick={copyToClipboard} className="ml-2">
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </div>

        {blockNumber && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Block:</span>
            <span className="font-mono">{blockNumber}</span>
          </div>
        )}

        {timestamp && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Time:</span>
            <span>{formatDate(timestamp)}</span>
          </div>
        )}

        {from && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">From:</span>
            <span className="font-mono">{formatAddress(from)}</span>
          </div>
        )}

        {to && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="font-mono">{formatAddress(to)}</span>
          </div>
        )}

        {amount && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span>{amount} EDU</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open(`https://explorer.educhain.example/tx/${hash}`, "_blank")}
        >
          View on Explorer
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

