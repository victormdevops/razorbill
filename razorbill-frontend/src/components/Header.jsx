import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 ml-8 bg-black/60 text-white shadow-lg relative">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Razorbill Logo" className="h-10 w-auto mr-2" />
          <h1 className="font-playfair text-2xl font-bold tracking-wide">
            Razorbill
          </h1>
        </Link>
      </div>

      {/* Desktop Menu */}
      <nav className="space-x-6 hidden md:flex mr-8">
        <Link to="/" className="font-playfair  hover:underline">
          Home
        </Link>
        <Link to="/matches" className="font-playfair  hover:underline">
          Matches
        </Link>
        <Link to="/sportgpt" className="font-playfair hover:underline">
          SportGPT
        </Link>
        <Link to="/results" className="font-playfair hover:underline">
          Results
        </Link>
        <Link to="/movies" className="font-playfair hover:underline">
          Movies
        </Link>
      </nav>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-0 w-full bg-black/80 text-white p-4 md:hidden z-50">
          <nav className="flex flex-col space-y-4 items-center">
            <Link
              to="/"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/matches"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Matches
            </Link>
            <Link
              to="/sportgpt"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              SportGPT
            </Link>
            <Link
              to="/results"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Results
            </Link>
            <Link
              to="/movies"
              className="hover:underline"
              onClick={() => setMenuOpen(false)}
            >
              Movies
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
