import { sha256 } from "js-sha256"

// Generate a unique transaction hash based on transaction details
export function generateTransactionHash(sender, recipient, amount, timestamp) {
  // Combine transaction data into a single string
  const transactionData = `${sender}:${recipient}:${amount}:${timestamp}`

  // Generate SHA-256 hash of the transaction data
  const hash = sha256(transactionData)

  return hash
}

// Verify a transaction hash against provided transaction details
export function verifyTransactionHash(hash, sender, recipient, amount, timestamp) {
  const calculatedHash = generateTransactionHash(sender, recipient, amount, timestamp)
  return calculatedHash === hash
}

// Create a transaction object with hash
export function createTransaction(sender, recipient, amount, projectId) {
  const timestamp = Date.now()
  const hash = generateTransactionHash(sender, recipient, amount, timestamp)

  return {
    hash,
    sender,
    recipient,
    amount,
    projectId,
    timestamp,
    status: "confirmed",
  }
}

// Simulate blockchain transaction submission
export async function submitTransactionToBlockchain(transaction) {
  // In a real implementation, this would submit the transaction to the EDUChain blockchain
  // For now, we'll simulate a network delay and return a success response
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    success: true,
    blockNumber: Math.floor(Math.random() * 1000000) + 1,
    confirmations: 1,
    transactionHash: transaction.hash,
  }
}

// Get transaction details from blockchain by hash
export async function getTransactionByHash(hash) {
  // In a real implementation, this would query the blockchain for transaction details
  // For now, we'll simulate a network delay and return mock data
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Simulate not finding a transaction occasionally
  if (Math.random() < 0.1) {
    return null
  }

  return {
    hash,
    blockNumber: Math.floor(Math.random() * 1000000) + 1,
    timestamp: Date.now() - Math.floor(Math.random() * 10000000),
    from:
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join(""),
    to:
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join(""),
    value: (Math.random() * 10).toFixed(4),
    gas: Math.floor(Math.random() * 100000),
    gasPrice: Math.floor(Math.random() * 100) + 1,
    status: "confirmed",
  }
}

