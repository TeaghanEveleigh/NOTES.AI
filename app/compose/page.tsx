'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuillEditor from '@/components/QuillEditor';
import AiChat from '@/components/AiChat';

export default function Compose() {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          contentHtml: content,
        }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        console.error('Error creating note');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiInsert = (html: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const length = quill.getLength();
      quill.clipboard.dangerouslyPasteHTML(length - 1, html);
    }
  };

  const getCurrentContent = () => {
    return content;
  };

  if (status === 'loading') {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <>
      <style jsx global>{`
        .compose-container {
          width: 90%;
          max-width: 980px;
          margin: 24px auto;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          background: #fff;
          border-radius: 14px;
        }

        @media (prefers-color-scheme: dark) {
          .compose-container {
            background: #1f1f1f;
            color: #eaeaea;
          }
        }

        .compose-container h1 {
          text-align: center;
          margin-bottom: 20px;
        }

        .form-control {
          border-radius: 10px;
          padding: 10px;
          width: 100%;
          border: 1px solid #ccc;
        }

        .btn-primary {
          background: rgb(77, 77, 192);
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 10px 20px;
          cursor: pointer;
          margin-top: 10px;
        }

        .btn-primary:hover {
          background: rgb(60, 60, 160);
        }

        .mb-3 {
          margin-bottom: 15px;
        }

        .form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
      `}</style>

      <div className="compose-container">
        <h1>Compose</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              id="title"
              type="text"
              name="titleOfPost"
              autoComplete="off"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="editor" className="form-label">
              New note
            </label>
            <QuillEditor
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder="Write your note..."
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      <AiChat onInsert={handleAiInsert} getContext={getCurrentContent} />
    </>
  );
}
