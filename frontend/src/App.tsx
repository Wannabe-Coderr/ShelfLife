import { FormEvent, useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import DataTable from "./components/DataTable";
import api from "./services/api";

type Book = {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
};

type Member = {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
};

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [token, setToken] = useState(() => localStorage.getItem("shelflife-token") || "");
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksResponse, membersResponse] = await Promise.all([
        api.getBooks({ page: 1, limit: 20 }),
        api.getMembers()
      ]);
      setBooks((booksResponse.data as Book[]) || []);
      setMembers((membersResponse.data as Member[]) || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load library data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCatalog();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      setLoading(true);
      setError(null);
      const result = await api.login(email, password);
      setToken(result.token);
      localStorage.setItem("shelflife-token", result.token);
      setMessage("Librarian login successful.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      setLoading(true);
      setError(null);
      await api.createBook({
        title: String(formData.title || ""),
        author: String(formData.author || ""),
        isbn: String(formData.isbn || ""),
        genre: String(formData.genre || ""),
        totalCopies: Number(formData.totalCopies || 1),
        availableCopies: Number(formData.availableCopies || 1)
      });
      setMessage("Book added successfully.");
      form.reset();
      await fetchCatalog();
    } catch (createBookError) {
      setError(createBookError instanceof Error ? createBookError.message : "Unable to add book.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      setLoading(true);
      setError(null);
      await api.createMember({
        name: String(formData.name || ""),
        email: String(formData.email || ""),
        membershipId: String(formData.membershipId || "")
      });
      setMessage("Member registered successfully.");
      form.reset();
      await fetchCatalog();
    } catch (createMemberError) {
      setError(createMemberError instanceof Error ? createMemberError.message : "Unable to register member.");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bookId = String(formData.get("bookId") || "");
    const memberId = String(formData.get("memberId") || "");

    if (!bookId || !memberId || !token) {
      setError("Please choose a book and member, and log in first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.issueBook(bookId, memberId, token);
      setMessage("Book issued successfully.");
      event.currentTarget.reset();
      await fetchCatalog();
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "Unable to issue book.");
    } finally {
      setLoading(false);
    }
  };

  const bookColumns = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "genre", label: "Genre" },
    { key: "availableCopies", label: "Available" },
    {
      key: "status",
      label: "Status",
      render: (row: Book) => (row.availableCopies > 0 ? "Available" : "Out of stock")
    }
  ];

  const memberColumns = [
    { key: "name", label: "Member Name" },
    { key: "email", label: "Email" },
    { key: "membershipId", label: "Membership ID" }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">College library platform</p>
          <h1>ShelfLife</h1>
        </div>
        <nav className="nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/members">Members</NavLink>
        </nav>
      </header>

      {message && <div className="message-banner">{message}</div>}
      {error && <div className="message-banner error-banner">{error}</div>}

      <Routes>
        <Route
          path="/"
          element={
            <main className="grid-layout">
              <section className="panel">
                <h2>Library login</h2>
                <form onSubmit={handleLogin} className="stack">
                  <input name="email" defaultValue="librarian@shelflife.com" placeholder="Email" />
                  <input name="password" type="password" defaultValue="librarian123" placeholder="Password" />
                  <button type="submit" disabled={loading}>Login</button>
                </form>
                <p className="status-pill">{token ? "Authenticated librarian" : "Login required"}</p>
              </section>

              <section className="panel">
                <h2>Add new book</h2>
                <form onSubmit={handleAddBook} className="stack">
                  <input name="title" placeholder="Title" required />
                  <input name="author" placeholder="Author" required />
                  <input name="isbn" placeholder="ISBN" required />
                  <input name="genre" placeholder="Genre" required />
                  <div className="inline-fields">
                    <input name="totalCopies" type="number" min={1} defaultValue={1} placeholder="Total copies" required />
                    <input name="availableCopies" type="number" min={0} defaultValue={1} placeholder="Available copies" required />
                  </div>
                  <button type="submit" disabled={loading}>Save book</button>
                </form>
              </section>

              <section className="panel">
                <h2>Register member</h2>
                <form onSubmit={handleAddMember} className="stack">
                  <input name="name" placeholder="Member name" required />
                  <input name="email" type="email" placeholder="Email" required />
                  <input name="membershipId" placeholder="Membership ID" required />
                  <button type="submit" disabled={loading}>Register member</button>
                </form>
              </section>

              <section className="panel">
                <h2>Issue book</h2>
                <form onSubmit={handleIssueBook} className="stack">
                  <select name="bookId" defaultValue="" required>
                    <option value="">Select book</option>
                    {books.map((book) => (
                      <option key={book._id} value={book._id}>
                        {book.title} ({book.availableCopies} available)
                      </option>
                    ))}
                  </select>
                  <select name="memberId" defaultValue="" required>
                    <option value="">Select member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.membershipId})
                      </option>
                    ))}
                  </select>
                  <button type="submit" disabled={loading || !token}>Issue book</button>
                </form>
              </section>
            </main>
          }
        />

        <Route
          path="/books"
          element={
            <section className="panel">
              <div className="section-header">
                <h2>Books</h2>
                <Link to="/" className="inline-link">Back to dashboard</Link>
              </div>
              <DataTable columns={bookColumns} rows={books} loading={loading} error={error} emptyMessage="No books available." />
            </section>
          }
        />

        <Route
          path="/members"
          element={
            <section className="panel">
              <div className="section-header">
                <h2>Members</h2>
                <Link to="/" className="inline-link">Back to dashboard</Link>
              </div>
              <DataTable columns={memberColumns} rows={members} loading={loading} error={error} emptyMessage="No members found." />
            </section>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
