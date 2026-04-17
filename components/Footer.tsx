export default function Footer() {
  return (
    <>
      <div className="footer-padding"></div>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Notes.ai. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
