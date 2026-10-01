import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-sql';
import { Copy, Check, Terminal, Database } from 'lucide-react';

interface JavaCodeViewerProps {
  code: string;
  language?: 'java' | 'sql';
}

export const JavaCodeViewer: React.FC<JavaCodeViewerProps> = ({ code, language = 'java' }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = code.trim().split('\n');
  const isSql = language === 'sql';

  return (
    <div className="code-box-wrapper" id="code-snippet-box">
      <div className="code-box-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {isSql ? <Database size={14} color="#06b6d4" /> : <Terminal size={14} color="#6366f1" />}
          <span style={{ color: isSql ? '#67e8f9' : '#a5b4fc', fontWeight: 600 }}>
            {isSql ? 'SQL Query / Schema' : 'Java Code Snippet'}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: '28px', minHeight: '28px' }}
          onClick={handleCopy}
          title="Sao chép mã"
          id="btn-copy-code"
        >
          {copied ? (
            <>
              <Check size={12} color="#10b981" />
              <span style={{ color: '#10b981' }}>Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', background: '#0d1117' }}>
        {/* Line numbers */}
        <div
          style={{
            userSelect: 'none',
            padding: '1rem 0.65rem 1rem 0.85rem',
            textAlign: 'right',
            color: '#484f58',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: '1.6',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <pre className="code-box-pre" style={{ flex: 1 }}>
          <code className={`language-${language}`}>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};
