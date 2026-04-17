import Link from 'next/link';

export default function GetStarted() {
  return (
    <>
      <style jsx>{`
        .start-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .feature-card {
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .cta-button {
          display: inline-block;
          margin-top: 30px;
          padding: 12px 30px;
          background-color: rgb(77, 77, 192);
          color: white;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .cta-button:hover {
          background-color: rgb(60, 60, 160);
          color: white;
          text-decoration: none;
        }

        .hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .hero h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .hero p {
          font-size: 1.2em;
          color: #666;
        }
      `}</style>

      <div className="container">
        <div className="start-container">
          <div className="hero">
            <h1>Welcome to Notes.ai</h1>
            <p>Your intelligent note-taking companion</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span className="material-icons" style={{ fontSize: '48px', color: 'rgb(77, 77, 192)' }}>
                edit_note
              </span>
              <h3>Easy Note Taking</h3>
              <p>Create and edit notes with a rich text editor</p>
            </div>

            <div className="feature-card">
              <span className="material-icons" style={{ fontSize: '48px', color: 'rgb(77, 77, 192)' }}>
                smart_toy
              </span>
              <h3>AI-Powered</h3>
              <p>Get writing assistance and suggestions from AI</p>
            </div>

            <div className="feature-card">
              <span className="material-icons" style={{ fontSize: '48px', color: 'rgb(77, 77, 192)' }}>
                cloud_sync
              </span>
              <h3>Cloud Sync</h3>
              <p>Access your notes from anywhere, anytime</p>
            </div>

            <div className="feature-card">
              <span className="material-icons" style={{ fontSize: '48px', color: 'rgb(77, 77, 192)' }}>
                search
              </span>
              <h3>Quick Search</h3>
              <p>Find your notes instantly with powerful search</p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/signup" className="cta-button">
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
