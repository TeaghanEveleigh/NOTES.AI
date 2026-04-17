'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  content: string;
  date: string;
  updatedAt: string;
}

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value) {
      const results = posts.filter((post) =>
        post.title.toLowerCase().includes(value)
      );
      setSearchResults(results);
      setShowResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm }),
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSort = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOption = e.target.value;
    if (!sortOption) return;

    try {
      const res = await fetch('/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOption }),
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Sort error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(posts.filter((post) => post._id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const renderPreview = (content: string) => {
    if (!content) return '';
    // Strip HTML tags for preview
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.slice(0, 200) + (text.length > 200 ? '...' : '');
  };

  if (isLoading) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .search-form-container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 100%;
          max-width: 50%;
          margin: 20px auto;
        }

        .search-form {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .search-input {
          flex-grow: 1;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .search-button {
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #ddd;
          cursor: pointer;
          margin-left: 10px;
        }

        .search-results {
          position: relative;
          top: 20px;
          background-color: #f8f8f8;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 100%;
          display: ${showResults ? 'block' : 'none'};
          z-index: 1000;
          box-sizing: border-box;
        }

        .search-results div:hover {
          background-color: #eee;
          cursor: pointer;
        }
      `}</style>

      <div className="search-form-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            id="search-bar"
            name="searchvalue"
            placeholder="Search..."
            className="search-input"
            autoComplete="off"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
        <div id="search-results" className="search-results">
          {searchResults.map((result) => (
            <div
              key={result._id}
              onClick={() => {
                setSearchTerm(result.title);
                setShowResults(false);
              }}
            >
              {result.title}
            </div>
          ))}
        </div>
      </div>

      <div className="container top-things">
        <h1 className="titleofpage">Your Notes</h1>
        <div className="sort-container">
          <select
            id="sort-options"
            name="sort-option"
            onChange={handleSort}
            defaultValue=""
          >
            <option value="">Sort By...</option>
            <option value="title">Title A-Z</option>
            <option value="date">Last edited</option>
            <option value="title-reverse">Title Z-A</option>
            <option value="date-oldest">Oldest edited</option>
          </select>
        </div>
      </div>

      <div id="posts-container">
        <div className="plus-button" onClick={() => router.push('/compose')}>
          <Link href="/compose">+</Link>
        </div>

        {[...posts].reverse().map((post) => (
          <div key={post._id} className="post" data-id={post._id}>
            <div className="post-icons">
              <div className="icon edit-icon">
                <button
                  className="svg-button"
                  onClick={() => router.push(`/edit/${post._id}`)}
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-pencil-square"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                    <path
                      fillRule="evenodd"
                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                    />
                  </svg>
                </button>
                <span className="icon-text">Edit</span>
              </div>

              <div className="icon delete-icon">
                <button
                  className="svg-button"
                  onClick={() => handleDelete(post._id)}
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash3-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                  </svg>
                </button>
                <span className="icon-text">Delete</span>
              </div>
            </div>

            <h2 className="post-title">{post.title}</h2>
            <div className="post-text">{renderPreview(post.content)}</div>

            <Link href={`/post/${encodeURIComponent(post.title)}`} className="read-more">
              Read More
            </Link>
            <p className="post-date">LAST EDITED: {post.date}</p>
          </div>
        ))}
      </div>
    </>
  );
}
