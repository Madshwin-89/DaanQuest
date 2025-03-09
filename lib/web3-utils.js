import { ethers } from "ethers"
import DonationContractABI from "../contracts/abis/DonationContract.json"
import EDUTokenABI from "../contracts/abis/EDUToken.json"

// Contract addresses from environment variables
const DONATION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DONATION_CONTRACT_ADDRESS
const EDU_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_EDU_TOKEN_ADDRESS
const EDUCHAIN_RPC_URL = process.env.NEXT_PUBLIC_EDUCHAIN_RPC_URL

// Function to get provider
export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }

  // Fallback to the public RPC endpoint for EDUChain
  return new ethers.JsonRpcProvider(EDUCHAIN_RPC_URL)
}

// Function to get signer
export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

// Function to get donation contract instance
export function getDonationContract(signerOrProvider) {
  if (!DONATION_CONTRACT_ADDRESS) {
    console.error("Donation contract address not set in environment variables")
    throw new Error("Donation contract address not configured")
  }

  return new ethers.Contract(DONATION_CONTRACT_ADDRESS, DonationContractABI, signerOrProvider || getProvider())
}

// Function to get EDU token contract instance
export function getEDUTokenContract(signerOrProvider) {
  if (!EDU_TOKEN_ADDRESS) {
    console.error("EDU token address not set in environment variables")
    throw new Error("EDU token address not configured")
  }

  return new ethers.Contract(EDU_TOKEN_ADDRESS, EDUTokenABI, signerOrProvider || getProvider())
}

// Function to check if MetaMask is installed
export function isMetaMaskInstalled() {
  return typeof window !== "undefined" && window.ethereum !== undefined
}

// Function to connect to MetaMask with better error handling
export async function connectToMetaMask() {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const provider = getProvider()
    const accounts = await provider.send("eth_requestAccounts", [])
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
    const provider = getProvider()
    const accounts = await provider.send("eth_accounts", [])
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

// Function to create a campaign
export async function createCampaign(campaignData) {
  try {
    const signer = await getSigner()
    const contract = getDonationContract(signer)

    const tx = await contract.createCampaign(
      campaignData.title,
      campaignData.description,
      campaignData.category,
      campaignData.metadataURI || "",
      ethers.parseEther(campaignData.targetAmount.toString()),
      Math.floor(new Date(campaignData.endDate).getTime() / 1000),
    )

    const receipt = await tx.wait()

    // Get campaign ID from event logs
    const event = receipt.logs
      .filter((log) => log.fragment && log.fragment.name === "CampaignCreated")
      .map((log) => contract.interface.parseLog(log))[0]

    const campaignId = event.args.campaignId

    // Store campaign in local storage for demo purposes
    const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
    campaigns.push({
      id: campaignId.toString(),
      creator: await signer.getAddress(),
      createdAt: Date.now(),
      status: "active",
      donationsReceived: 0,
      donorCount: 0,
      ...campaignData,
    })
    localStorage.setItem("campaigns", JSON.stringify(campaigns))

    return {
      id: campaignId.toString(),
      ...campaignData,
    }
  } catch (error) {
    console.error("Error creating campaign:", error)
    throw new Error(`Failed to create campaign: ${error.message}`)
  }
}

// Function to get all campaigns
export async function getAllCampaigns() {
  try {
    const contract = getDonationContract()
    const campaignCount = await contract.getCampaignCount()

    const campaigns = []
    for (let i = 1; i <= campaignCount; i++) {
      const campaignData = await contract.getCampaign(i)
      campaigns.push({
        id: campaignData.id.toString(),
        creator: campaignData.creator,
        title: campaignData.title,
        description: campaignData.description,
        category: campaignData.category,
        metadataURI: campaignData.metadataURI,
        targetAmount: ethers.formatEther(campaignData.targetAmount),
        raisedAmount: ethers.formatEther(campaignData.raisedAmount),
        withdrawnAmount: ethers.formatEther(campaignData.withdrawnAmount),
        startDate: new Date(campaignData.startDate * 1000).toISOString(),
        endDate: new Date(campaignData.endDate * 1000).toISOString(),
        status: ["active", "paused", "completed", "cancelled"][campaignData.status],
        donorCount: campaignData.donorCount,
      })
    }

    return campaigns
  } catch (error) {
    console.error("Error getting campaigns:", error)

    // Fallback to local storage for demo purposes
    return JSON.parse(localStorage.getItem("campaigns") || "[]")
  }
}

// Function to get campaign by ID
export async function getCampaignById(id) {
  try {
    const contract = getDonationContract()
    const campaignData = await contract.getCampaign(id)

    return {
      id: campaignData.id.toString(),
      creator: campaignData.creator,
      title: campaignData.title,
      description: campaignData.description,
      category: campaignData.category,
      metadataURI: campaignData.metadataURI,
      targetAmount: ethers.formatEther(campaignData.targetAmount),
      raisedAmount: ethers.formatEther(campaignData.raisedAmount),
      withdrawnAmount: ethers.formatEther(campaignData.withdrawnAmount),
      startDate: new Date(campaignData.startDate * 1000).toISOString(),
      endDate: new Date(campaignData.endDate * 1000).toISOString(),
      status: ["active", "paused", "completed", "cancelled"][campaignData.status],
      donorCount: campaignData.donorCount,
    }
  } catch (error) {
    console.error("Error getting campaign:", error)

    // Fallback to local storage for demo purposes
    const campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]")
    return campaigns.find((campaign) => campaign.id === id) || null
  }
}

// Function to make a donation with native tokens
export async function donateNative(campaignId, amount, message = "") {
  try {
    const signer = await getSigner()
    const contract = getDonationContract(signer)

    const tx = await contract.donateNative(campaignId, message, { value: ethers.parseEther(amount.toString()) })

    const receipt = await tx.wait()

    // Get donation ID from event logs
    const event = receipt.logs
      .filter((log) => log.fragment && log.fragment.name === "DonationReceived")
      .map((log) => contract.interface.parseLog(log))[0]

    const donationId = event.args.donationId

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmations: 1,
      donationId: donationId.toString(),
    }
  } catch (error) {
    console.error("Error donating:", error)
    throw new Error(`Failed to donate: ${error.message}`)
  }
}

// Function to make a donation with ERC20 tokens
export async function donateToken(campaignId, tokenAddress, amount, message = "") {
  try {
    const signer = await getSigner()
    const tokenContract = new ethers.Contract(tokenAddress, EDUTokenABI, signer)
    const contract = getDonationContract(signer)

    // Approve token transfer
    const approveTx = await tokenContract.approve(DONATION_CONTRACT_ADDRESS, ethers.parseEther(amount.toString()))
    await approveTx.wait()

    // Make donation
    const tx = await contract.donateToken(campaignId, tokenAddress, ethers.parseEther(amount.toString()), message)

    const receipt = await tx.wait()

    // Get donation ID from event logs
    const event = receipt.logs
      .filter((log) => log.fragment && log.fragment.name === "DonationReceived")
      .map((log) => contract.interface.parseLog(log))[0]

    const donationId = event.args.donationId

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmations: 1,
      donationId: donationId.toString(),
    }
  } catch (error) {
    console.error("Error donating tokens:", error)
    throw new Error(`Failed to donate tokens: ${error.message}`)
  }
}

// Function to request a withdrawal
export async function requestWithdrawal(campaignId, amount, reason) {
  try {
    const signer = await getSigner()
    const contract = getDonationContract(signer)

    const tx = await contract.requestWithdrawal(campaignId, ethers.parseEther(amount.toString()), reason)

    const receipt = await tx.wait()

    // Get request ID from event logs
    const event = receipt.logs
      .filter((log) => log.fragment && log.fragment.name === "WithdrawalRequested")
      .map((log) => contract.interface.parseLog(log))[0]

    const requestId = event.args.requestId

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      requestId: requestId.toString(),
    }
  } catch (error) {
    console.error("Error requesting withdrawal:", error)
    throw new Error(`Failed to request withdrawal: ${error.message}`)
  }
}

// Function to approve a withdrawal request (admin only)
export async function approveWithdrawal(requestId) {
  try {
    const signer = await getSigner()
    const contract = getDonationContract(signer)

    const tx = await contract.approveWithdrawal(requestId)
    const receipt = await tx.wait()

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    }
  } catch (error) {
    console.error("Error approving withdrawal:", error)
    throw new Error(`Failed to approve withdrawal: ${error.message}`)
  }
}

// Function to get user donations
export async function getUserDonations(address) {
  try {
    const contract = getDonationContract()
    const donationCount = await contract.getDonationCount()

    const donations = []
    for (let i = 1; i <= donationCount; i++) {
      const donation = await contract.getDonation(i)
      if (donation.donor.toLowerCase() === address.toLowerCase()) {
        donations.push({
          id: donation.id.toString(),
          campaignId: donation.campaignId.toString(),
          tokenAddress: donation.tokenAddress,
          amount: ethers.formatEther(donation.amount),
          timestamp: new Date(donation.timestamp * 1000).toISOString(),
          message: donation.message,
        })
      }
    }

    return donations
  } catch (error) {
    console.error("Error getting user donations:", error)

    // Fallback to local storage for demo purposes
    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    return transactions.filter((tx) => tx.sender.toLowerCase() === address.toLowerCase())
  }
}

