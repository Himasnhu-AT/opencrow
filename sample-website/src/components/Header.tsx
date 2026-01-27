export default function Header() {
  const handleLogout = () => {
    alert("Logged out");
  };

  return (
    <header className="header">
      <div className="logo">🛍️ ShopDemo</div>
      <div className="user-info">
        <span>
          Welcome, <strong>John Doe</strong>
        </span>
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
