'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Note {
  _id: string;
  title: string;
  content: string;
  date: string;
}

export default function PostDetail() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const title = decodeURIComponent(params?.title as string);

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchNotes();
    }
  }, [status, router, title]);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.posts) {
        const foundNote = data.posts.find((n: Note) => n.title === title);
        if (foundNote) {
          setNote(foundNote);
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!note) {
    return <div className="container"><p>Note not found.</p></div>;
  }

  return (
    <>
      <style jsx>{`
        .post-detail {
          max-width: 800px;
          margin: 40px auto;
          padding: 30px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
          .post-detail {
            background: #1f1f1f;
            color: #eaeaea;
          }
        }

        .post-detail h1 {
          margin-bottom: 10px;
          border-bottom: 2px solid rgb(77, 77, 192);
          padding-bottom: 15px;
        }

        .post-detail .date {
          color: #888;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .post-content {
          line-height: 1.8;
          font-size: 16px;
        }

        .post-content img {
          max-width: 100%;
          height: auto;
        }

        .back-link {
          display: inline-block;
          margin-top: 30px;
          color: rgb(77, 77, 192);
          text-decoration: none;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .actions {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        @media (prefers-color-scheme: dark) {
          .actions {
            border-top-color: #444;
          }
        }
      `}</style>

      <div className="container">
        <div className="post-detail">
          <h1>{note.title}</h1>
          <p className="date">Last edited: {note.date}</p>

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          <div className="actions">
            <Link href={`/edit/${note._id}`} className="btn btn-primary">
              Edit Note
            </Link>
            <Link href="/" className="back-link">
              &larr; Back to Notes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
