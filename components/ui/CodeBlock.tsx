'use client'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({
  code,
  language = 'bash',
  filename,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group', className)}>
      {filename && (
        <div className="bg-refinex-navy-dark border border-refinex-cyan/20 border-b-0 rounded-t-lg px-4 py-2 text-sm text-refinex-cyan font-mono">
          {filename}
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-4 top-4 p-2 rounded-lg bg-refinex-navy-light/50 border border-refinex-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-refinex-cyan/10"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-semantic-success" />
          ) : (
            <Copy className="w-4 h-4 text-refinex-cyan" />
          )}
        </button>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: filename ? '0 0 0.5rem 0.5rem' : '0.5rem',
            background: '#000814',
            border: '1px solid rgba(79, 232, 255, 0.2)',
            padding: '1.5rem',
            fontSize: '0.875rem',
          }}
          showLineNumbers={showLineNumbers}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
