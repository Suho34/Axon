import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

import { HiLightningBolt, HiChatAlt2 } from "react-icons/hi";
import { RiBrainLine } from "react-icons/ri";
import { LuMessageSquare, LuBrain } from "react-icons/lu";
import { FiUploadCloud } from "react-icons/fi";
const AxonLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/axon.svg"
                  width={20}
                  height={20}
                  alt="logo of the app"
                  className="w-5 h-5"
                />
              </div>
              <span className="font-semibold text-lg sm:text-xl">Axon</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <a
                href="#features"
                className="hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-blue-600 transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs sm:text-sm"
              >
                🚀 Vector Embeddings
              </Badge>
              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs sm:text-sm"
              >
                🧠 RAG Technology
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8">
              Chat with Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Documents
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
              Upload any document and engage in intelligent conversations. Get
              precise answers using advanced AI technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              >
                <Link href="/get-started">Start Analyzing</Link>
              </Button>
            </div>

            {/* Dashboard Preview */}
            <div className="max-w-5xl mx-auto">
              <Card className="overflow-hidden shadow-2xl border-0 bg-background/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/50 border-b p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center text-xs sm:text-sm text-muted-foreground">
                      Axon Dashboard
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Upload Area */}
                    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-blue-500/50 transition-colors">
                      <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                          <FiUploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                          Drop your document here
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          PDF, DOC, TXT supported
                        </p>
                      </CardContent>
                    </Card>

                    {/* Chat Interface */}
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                              AI
                            </div>
                            <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-2 max-w-xs">
                              <p className="text-xs sm:text-sm">
                                I&apos;ve analyzed your document. What would you
                                like to know?
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-row-reverse">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                              U
                            </div>
                            <div className="bg-blue-600 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2 max-w-xs">
                              <p className="text-xs sm:text-sm">
                                What are the key findings?
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-xs">AI is typing...</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge AI technology for intelligent document
              interaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <RiBrainLine className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  Vector Embeddings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Advanced semantic understanding through high-dimensional
                  vector representations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                  <HiLightningBolt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  RAG Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Retrieval-Augmented Generation for accurate, contextual
                  responses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <HiChatAlt2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Smart Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Natural conversation interface with contextual understanding.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Simple and powerful in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "1",
                title: "Upload Document",
                description:
                  "Drag and drop your document. AI begins processing instantly.",
                icon: <FiUploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />,
              },
              {
                step: "2",
                title: "AI Analysis",
                description:
                  "Advanced embeddings and RAG process your content.",
                icon: <LuBrain className="w-6 h-6 sm:w-8 sm:h-8" />,
              },
              {
                step: "3",
                title: "Start Chatting",
                description:
                  "Ask questions and get precise, contextual answers.",
                icon: <LuMessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />,
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white">
                  {item.icon}
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center mx-auto -mt-7 sm:-mt-8 mb-2 text-white text-xs sm:text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Image
                  src="/axon.svg"
                  width={20}
                  height={20}
                  alt="logo of the app"
                  className="w-3 h-3 sm:w-5 sm:h-5"
                />
              </div>
              <span className="font-semibold text-lg sm:text-xl">Axon</span>
            </div>

            <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
            © 2025 Axon. Built with advanced AI for document intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AxonLanding;
