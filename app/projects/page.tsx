"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, BookOpen, Leaf, Activity } from "lucide-react"

export default function ProjectsPage() {
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
            <Button onClick={() => (window.location.href = "/connect")}>Connect Wallet</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Badge>Education</Badge>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <CardTitle className="mt-4">Rural Education Initiative</CardTitle>
              <CardDescription>Providing educational resources to underserved rural communities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Rural Education Initiative"
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: 2,500 EDU</span>
                    <span>Goal: 10,000 EDU</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>42 donors</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => (window.location.href = "/donate?project=education")}>
                Donate to this Project
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <Badge>Healthcare</Badge>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <CardTitle className="mt-4">Medical Supplies Fund</CardTitle>
              <CardDescription>Providing essential medical supplies to clinics in need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Medical Supplies Fund"
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: 5,200 EDU</span>
                    <span>Goal: 15,000 EDU</span>
                  </div>
                  <Progress value={35} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>78 donors</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => (window.location.href = "/donate?project=healthcare")}>
                Donate to this Project
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  <Badge>Environment</Badge>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <CardTitle className="mt-4">Reforestation Project</CardTitle>
              <CardDescription>Planting trees to combat deforestation and climate change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src="/placeholder.svg?height=200&width=400"
                  alt="Reforestation Project"
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised: 8,700 EDU</span>
                    <span>Goal: 20,000 EDU</span>
                  </div>
                  <Progress value={43} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>105 donors</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => (window.location.href = "/donate?project=environment")}>
                Donate to this Project
              </Button>
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

