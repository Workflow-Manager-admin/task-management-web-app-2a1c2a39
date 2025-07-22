import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/**
 * Load Supabase credentials from environment variables.
 * If variables are missing, throw an error to inform the developer.
 * NOTE: In React scripts, env variables must be prefixed with REACT_APP_ and defined in `.env`.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error("Missing Supabase env variables (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY). Check your .env file and restart the dev server.", { SUPABASE_URL, SUPABASE_ANON_KEY });
  alert("Error: Supabase credentials are not set. Define REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env, then restart.");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------- Utility Functions -----------

// PUBLIC_INTERFACE
function formatDate(dt) {
  /** Format a Date or ISO string as yyyy-mm-dd for display/search */
  const d = new Date(dt);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
}

// ----------- COMPONENTS -----------

// PUBLIC_INTERFACE
function Header({ user, onLogout }) {
  /** Modern, minimal header with navigation and optional user info */
  return (
    <header className="todo-header">
      <nav className="nav">
        <div className="logo-box">
          <span className="logo">📝</span>
          <span className="nav-title">Todo Manager</span>
        </div>
        <div>
          {user ? (
            <button className="btn btn--small btn--secondary" onClick={onLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

// PUBLIC_INTERFACE
function Sidebar({ filters, setFilters, showMobile, setShowMobile }) {
  /**
   * Sidebar for filtering/searching todos.
   * Appears on the left (desktop), hidden behind "Filters" button on mobile.
   */
  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }
  function handleCheckbox(e) {
    setFilters({ ...filters, completed: e.target.checked ? "true" : "" });
  }
  return (
    <aside className={`sidebar${showMobile ? " sidebar--show" : ""}`}>
      <div className="sidebar-header">
        <span>Filters</span>
        <button
          className="btn btn--small btn--icon sidebar-close"
          onClick={() => setShowMobile(false)}
          aria-label="Close filter sidebar"
        >
          ✕
        </button>
      </div>
      <form className="sidebar-form">
        <label>
          Search
          <input
            className="input"
            type="text"
            name="search"
            placeholder="Search todos"
            value={filters.search || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Due Before
          <input
            className="input"
            type="date"
            name="due"
            value={filters.due || ""}
            onChange={handleChange}
          />
        </label>
        <label className="checkbox-container">
          <input
            type="checkbox"
            name="completed"
            checked={filters.completed === "true"}
            onChange={handleCheckbox}
          />
          <span>Show only completed</span>
        </label>
        <button
          type="button"
          className="btn btn--small btn--secondary"
          onClick={() =>
            setFilters({ search: "", due: "", completed: "" })
          }
        >
          Clear Filters
        </button>
      </form>
    </aside>
  );
}

// PUBLIC_INTERFACE
function TodoList({ todos, onEdit, onDelete, onToggleComplete }) {
  /** Main list of todos; modern task cards, accent on incomplete, secondary on completed */
  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <p>No todos found. 🎉</p>
      </div>
    );
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li
          className={`todo-item${todo.is_complete ? " completed" : ""}`}
          key={todo.id}
        >
          <div
            className="todo-check"
            onClick={() => onToggleComplete(todo)}
            role="button"
            aria-label={`Mark as ${todo.is_complete ? "incomplete" : "complete"}`}
          >
            {todo.is_complete ? (
              <span className="checkmark">✔</span>
            ) : (
              <span className="checkmark checkmark--incomplete"></span>
            )}
          </div>
          <div className="todo-main">
            <div className="todo-title-desc">
              <span className="todo-title">{todo.title}</span>
              {todo.description && (
                <span className="todo-desc">{todo.description}</span>
              )}
            </div>
            {todo.due_date && (
              <span
                className={
                  "todo-due" +
                  (todo.is_complete
                    ? " todo-due--completed"
                    : todo.due_date < formatDate(new Date()) ? " todo-due--overdue" : "")
                }
              >
                Due: {formatDate(todo.due_date)}
              </span>
            )}
          </div>
          <div className="todo-actions">
            <button
              className="btn btn--icon"
              aria-label="Edit"
              onClick={() => onEdit(todo)}
            >
              ✏️
            </button>
            <button
              className="btn btn--icon btn--secondary"
              aria-label="Delete"
              onClick={() => onDelete(todo.id)}
            >
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

// PUBLIC_INTERFACE
function TodoModal({ show, onClose, onSave, initial }) {
  /** Modal dialog for creating/editing */
  const [values, setValues] = useState(
    initial || { title: "", description: "", due_date: "", is_complete: false }
  );
  useEffect(() => {
    setValues(initial || { title: "", description: "", due_date: "", is_complete: false });
  }, [initial, show]);
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setValues((vals) => ({
      ...vals,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(values);
  }
  if (!show) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <h2>{initial?.id ? "Edit Todo" : "Add Todo"}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              className="input"
              required
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              maxLength={128}
              placeholder="Task title"
              autoFocus
            />
          </label>
          <label>
            Description
            <textarea
              className="input"
              name="description"
              maxLength={256}
              placeholder="Optional description"
              value={values.description}
              onChange={handleChange}
            ></textarea>
          </label>
          <label>
            Due date
            <input
              className="input"
              type="date"
              name="due_date"
              value={values.due_date}
              onChange={handleChange}
            />
          </label>
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="is_complete"
              checked={!!values.is_complete}
              onChange={handleChange}
            />
            <span>Mark as complete</span>
          </label>
          <div className="modal-actions">
            <button className="btn btn--accent" type="submit">
              {initial?.id ? "Save" : "Add"}
            </button>
            <button
              className="btn btn--secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function Auth({ onAuth }) {
  /**
   * Minimal login/signup using Supabase.
   * Email/password sign in, light and playful.
   */
  const [mode, setMode] = useState("login"); // or signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setErr("");
    try {
      if (mode === "login") {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else {
        // signup mode
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMode("login");
      }
    } catch (err) {
      setErr(err.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
        <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
        <label>
          Email
          <input
            className="input"
            required
            name="email"
            autoComplete="email"
            type="email"
            autoFocus
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            className="input"
            required
            name="password"
            type="password"
            minLength="6"
            autoComplete="current-password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {err ? <div className="auth-error">{err}</div> : null}
        <div className="auth-actions">
          <button className="btn btn--accent" type="submit" disabled={pending}>
            {pending
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Sign up"}
          </button>
        </div>
        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

// ----------- MAIN APP -----------

// PUBLIC_INTERFACE
function App() {
  /** Main entry point. Handles auth and todo CRUD. */
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    due: "",
    completed: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  // SESSION/AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // FETCH TODOS
  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }
    async function fetchTodos() {
      setLoading(true);
      let query = supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (filters.completed === "true") query = query.eq("is_complete", true);
      if (filters.search)
        query = query.ilike("title", `%${filters.search}%`);
      if (filters.due) query = query.lte("due_date", filters.due);
      let { data, error } = await query;
      if (!error) setTodos(data || []);
      setLoading(false);
    }
    fetchTodos();
    // eslint-disable-next-line
  }, [user, filters]);

  // CRUD HANDLERS

  // Error feedback state
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAdd(todo) {
    setErrorMsg("");
    if (!user) return;
    const { data, error } = await supabase
      .from("todos")
      .insert([{ ...todo, user_id: user.id }])
      .select()
      .single();
    if (!error && data) setTodos((t) => [data, ...t]);
    else if (error) setErrorMsg(error.message || "Failed to add todo");
    setModalOpen(false);
  }

  async function handleEdit(todo) {
    setErrorMsg("");
    const { id, ...rest } = todo;
    const { data, error } = await supabase
      .from("todos")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setTodos((t) => t.map((item) => (item.id === id ? data : item)));
    } else if (error) setErrorMsg(error.message || "Failed to update todo");
    setModalOpen(false);
  }

  async function handleDelete(id) {
    setErrorMsg("");
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) setTodos((t) => t.filter((item) => item.id !== id));
    else if (error) setErrorMsg(error.message || "Failed to delete todo");
  }

  async function handleToggleComplete(todo) {
    setErrorMsg("");
    const { id, is_complete, ...rest } = todo;
    const newVal = !is_complete;
    const { data, error } = await supabase
      .from("todos")
      .update({ ...rest, is_complete: newVal })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setTodos((t) => t.map((item) => (item.id === id ? data : item)));
    } else if (error) setErrorMsg(error.message || "Failed to update status");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setTodos([]);
  }

  // ----------- Rendering -----------

  if (!user) {
    return (
      <div className="app-bg">
        <Header />
        <main className="main main--centered">
          <Auth onAuth={() => { }} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-bg">
      <Header user={user} onLogout={handleLogout} />
      <div className="container-main">
        {/* Sidebar for desktop, mobile toggles */}
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          showMobile={sidebarMobile}
          setShowMobile={setSidebarMobile}
        />
        <main className="main">
          <div className="main-toolbar">
            <button
              className="btn btn--accent show-sidebar"
              onClick={() => setSidebarMobile(true)}
            >
              Filters
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                setModalInitial(null);
                setModalOpen(true);
              }}
            >
              ＋ Add Todo
            </button>
          </div>
          <section>
            {errorMsg && (
              <div style={{color: "#c92a2a", marginBottom: "1rem"}} role="alert">
                {errorMsg}
              </div>
            )}
            {loading ? (
              <div style={{ padding: "2rem" }}>Loading…</div>
            ) : (
              <TodoList
                todos={todos}
                onEdit={(todo) => {
                  setModalInitial(todo);
                  setModalOpen(true);
                }}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </section>
        </main>
      </div>
      <TodoModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={modalInitial ? handleEdit : handleAdd}
        initial={modalInitial}
      />
    </div>
  );
}

export default App;
