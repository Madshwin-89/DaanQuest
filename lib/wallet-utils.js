import { createTransaction, submitTransactionToBlockchain } from "./transaction-service"

// Function to check if MetaMask is installed
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && window.ethereum !== undefined
}

// Function to connect to MetaMask with better error handling
export async function connectToMetaMask() {
  if (!isMetaMaskInstalled()) {
    // For demo purposes, simulate a connection if MetaMask isn't available
    const mockAddress =
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    localStorage.setItem("connectedWallet", mockAddress)
    return mockAddress
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    const account = accounts[0]

    // Store the connected account in localStorage
    localStorage.setItem("connectedWallet", account)

    return account
  } catch (error) {
    console.error("Failed to connect wallet:", error)
    throw new Error(`Failed to connect to wallet: ${error.message}`)
  }
}

// Function to disconnect wallet
export function disconnectWallet() {
  localStorage.removeItem("connectedWallet")
  return true
}

// Function to get the current connected account
export async function getCurrentAccount() {
  // First check localStorage for a stored connection
  const storedAccount = localStorage.getItem("connectedWallet")
  if (storedAccount) {
    return storedAccount
  }

  // If no stored connection, check if MetaMask is connected
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error("Error getting current account:", error)
    return null
  }
}

// Function to format wallet address for display (truncate middle)
export function formatAddress(address) {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Function to make a donation transaction
export async function makeDonation(projectId, amount, recipientAddress) {
  const senderAddress = await getCurrentAccount()
  if (!senderAddress) {
    throw new Error("No account connected")
  }

  // Create a transaction with hash
  const transaction = createTransaction(
    senderAddress,
    recipientAddress || "0xEDUChainDonationContract", // Default contract address if none provided
    amount,
    projectId,
  )

  // Submit transaction to blockchain
  const result = await submitTransactionToBlockchain(transaction)

  // Store transaction in local storage for demo purposes
  const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  storedTransactions.push({
    ...transaction,
    blockNumber: result.blockNumber,
    confirmations: result.confirmations,
    date: new Date().toISOString(),
  })
  localStorage.setItem("transactions", JSON.stringify(storedTransactions))

  return result
}

// Function to get all transactions for the current user
export function getUserTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  const currentAccount = localStorage.getItem("connectedWallet")

  if (!currentAccount) return []

  return transactions.filter((tx) => tx.sender.toLowerCase() === currentAccount.toLowerCase())
}

// Function to get transaction by hash
export function getTransactionByHashFromStorage(hash) {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
  return transactions.find((tx) => tx.hash === hash) || null
}

// Function to get all campaigns
export function getAllCampaigns() {
  return JSON.parse(localStorage.getItem("campaigns") || "[]")
}

// Function to get campaigns created by the current user
export function getUserCampaigns() {
  const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
  const currentAccount = localStorage.getItem("connectedWallet")

  if (!currentAccount) return []

  return campaigns.filter((campaign) => campaign.creator.toLowerCase() === currentAccount.toLowerCase())
}

// Function to create a new campaign
export async function createCampaign(campaignData) {
  const creator = await getCurrentAccount()
  if (!creator) {
    throw new Error("No account connected")
  }

  const campaign = {
    id: "campaign_" + Date.now(),
    creator,
    createdAt: Date.now(),
    status: "active",
    donationsReceived: 0,
    donorCount: 0,
    ...campaignData,
  }

  const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
  campaigns.push(campaign)
  localStorage.setItem("campaigns", JSON.stringify(campaigns))

  return campaign
}

// Function to get a campaign by ID
export function getCampaignById(id) {
  const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
  return campaigns.find((campaign) => campaign.id === id) || null
}

