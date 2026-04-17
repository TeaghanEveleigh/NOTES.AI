export default function Contact() {
  return (
    <>
      <style jsx>{`
        .contact-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          padding: 20px;
        }

        .contact-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
          background-color: #fff;
          width: 400px;
          max-width: 100%;
        }

        .email-link {
          margin-top: 1rem;
          color: #333;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .email-link:hover {
          background-color: #333;
          color: #fff;
        }
      `}</style>

      <div className="container">
        <div className="contact-container">
          <div className="contact-box">
            <h2>Contact Us</h2>
            <p>Have questions or feedback? Reach out to us!</p>
            <a href="mailto:support@notes.ai" className="email-link">
              Email Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
