import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Zap, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Minimalist Tech Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 bg-zinc-900/50 mb-12">
          <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Lexibase Engine v1.0</span>
        </div>

        {/* Hero Section */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white max-w-4xl mb-6 leading-tight">
          Talk to your documents with absolute <span className="text-zinc-500">precision.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12">
          An enterprise-grade, open-source RAG engine. Upload a PDF and instantly query its knowledge base securely without hallucinations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-32">
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-12 px-8 font-medium">
              Start Querying <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <a href="https://github.com/kehinde-durodola/lexibase-rag.git" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="border-zinc-800 bg-transparent text-white hover:bg-zinc-900 h-12 px-8">
              View Source Code
            </Button>
          </a>
        </div>

        {/* Minimalist Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="border border-zinc-800 bg-zinc-900/30 p-8">
            <Lock className="w-6 h-6 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Secure Indexing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Your documents are vectorized locally via pgvector and never used to train external models.</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/30 p-8">
            <Zap className="w-6 h-6 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Instant Retrieval</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Powered by optimized chunking strategies to retrieve the exact paragraph in milliseconds.</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/30 p-8">
            <FileText className="w-6 h-6 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Exact Citations</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Every response guarantees a citation link back to the exact chunk of your uploaded PDF.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
