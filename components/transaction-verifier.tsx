"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Search } from "lucide-react"
import { getTransactionByHash } from "@/lib/transaction-service"
import TransactionHashDisplay from "./transaction-hash-display"

export default function TransactionVerifier() {
  const [hash, setHash] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState("")

  const verifyTransaction = async () => {
    if (!hash) {
      setError("Please enter a transaction hash")
      return
    }

    setIsVerifying(true)
    setError("")
    setTransaction(null)

    try {
      const result = await getTransactionByHash(hash)

      if (result) {
        setTransaction(result)
      } else {
        setError("Transaction not found. Please check the hash and try again.")
      }
    } catch (err) {
      setError("An error occurred while verifying the transaction. Please try again.")
      console.error(err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify Transaction</CardTitle>
        <CardDescription>
          Enter a transaction hash to verify its authenticity on the EDUChain blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hash">Transaction Hash</Label>
          <div className="flex space-x-2">
            <Input id="hash" placeholder="0x..." value={hash} onChange={(e) => setHash(e.target.value)} />
            <Button onClick={verifyTransaction} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
              {!isVerifying && <Search className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {transaction && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Transaction Verified</AlertTitle>
              <AlertDescription>This transaction exists on the EDUChain blockchain and is valid.</AlertDescription>
            </Alert>

            <TransactionHashDisplay
              hash={transaction.hash}
              blockNumber={transaction.blockNumber}
              timestamp={transaction.timestamp}
              from={transaction.from}
              to={transaction.to}
              amount={transaction.value}
              status={transaction.status}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

