"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Heart, BarChart3, Users, PlusCircle, DollarSign } from "lucide-react"

export default function Home() {
  const router = useRouter()

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
            <Link href="/projects" className="text-sm font-medium transition-colors hover:text-primary">
              Projects
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Transparent Crypto Donations on EDUChain
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  DaanQuest enables transparent, secure, and efficient donations using blockchain technology. Support
                  causes you care about with cryptocurrency.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="DaanQuest Platform"
                  className="rounded-lg object-cover"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What would you like to do?</h2>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                Choose an option to get started with DaanQuest
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="flex flex-col h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Make a Donation
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="mb-6 text-muted-foreground">
                    Support educational campaigns by making a donation. Your contribution will be tracked on the
                    blockchain for complete transparency.
                  </p>
                  <Button className="mt-auto" onClick={() => router.push("/donate")}>
                    Donate Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex flex-col h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-6 w-6 text-primary" />
                    Create a Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="mb-6 text-muted-foreground">
                    Start your own educational fundraising campaign. Set your funding goal, time limit, and track
                    donations in real-time.
                  </p>
                  <Button className="mt-auto" onClick={() => router.push("/campaigns/create")}>
                    Create Campaign
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose DaanQuest?</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Our platform leverages blockchain technology to ensure your donations reach the right hands.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary p-2 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>All transactions are recorded on the EDUChain blockchain, ensuring complete transparency.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary p-2 rounded-full">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Join a community of donors making a real difference through blockchain technology.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary p-2 rounded-full">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Track the impact of your donations in real-time with our dashboard analytics.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
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

