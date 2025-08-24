"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownProps = {
  children: string
  className?: string
}

export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={["markdown-body", className].join("")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: (p) => <h1 className="mb-9 text-lg font-semibold" {...p} />,
          h2: (p) => <h2 className="mb-6 text-base font-semibold" {...p} />,
          h3: (p) => <h3 className="mb-3 text-sm font-semibold" {...p} />,
          // Text - much tighter spacing
          p: (p) => <p className="mb-6 leading-relaxed last:mb-0" {...p} />,
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          // Lists - let ReactMarkdown and default Tailwind styles handle this.
          ul: (p) => <ul className="mb-5 list-disc pl-5" {...p} />,
          ol: (p) => <ol className="mb-3 list-decimal pl-5" {...p} />,
          li: (p) => <li className="mb-0 leading-relaxed" {...p} />,
          // Links
          a: (p) => (
            <a
              className="font-sans text-primary underline underline-offset-2 hover:text-primary/80 break-words"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          // Code
          code: (p) => <code className="font-mono rounded bg-muted px-1 py-0.5 text-xs" {...p} />,
          pre: ({ children }) => (
            <pre className="font-mono mb-2 overflow-x-auto rounded bg-muted p-3 text-xs leading-relaxed">
              {children}
            </pre>
          ),
          // Quotes / rules
          blockquote: (p) => <blockquote className="mb-2 border-l-2 pl-3 italic text-muted-foreground" {...p} />,
          hr: () => <hr className="my-2 border-muted-foreground/20" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}