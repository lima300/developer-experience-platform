import { Skeleton, ErrorFallback } from '@dxp/ui';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { FlatDocEntry } from '../types/docs.js';

interface DocPageProps {
  doc: FlatDocEntry | undefined;
  isLoading?: boolean;
}

export function DocPage({ doc, isLoading }: DocPageProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 flex-1">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex-1">
        <ErrorFallback mfeName="docs" error={new Error('Page not found')} />
      </div>
    );
  }

  return (
    <article className="flex-1 prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-8 mb-3 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-foreground/80">{children}</p>
          ),
          code: ({
            className,
            children,
            ...props
          }: {
            node?: unknown;
            className?: string | undefined;
            children?: React.ReactNode;
          }) => {
            const isInline = !className?.startsWith('language-');
            return isInline ? (
              <code className="font-mono text-sm bg-dxp-muted px-1.5 py-0.5 rounded-dxp" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-dxp-surface-elevated border border-dxp-border rounded-dxp p-4 overflow-x-auto my-4 text-sm font-mono">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-dxp-border rounded-dxp text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-dxp-border px-3 py-2 bg-dxp-muted text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-dxp-border px-3 py-2">{children}</td>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-dxp-muted-foreground my-4">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 ml-2">{children}</ol>
          ),
          li: ({ children }) => <li className="text-foreground/80">{children}</li>,
        }}
      >
        {doc.content}
      </ReactMarkdown>
    </article>
  );
}
