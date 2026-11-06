import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
} from "react-router-dom";

import { api, getUser, clearToken, clearUser } from "./api";
import { initials, roleLabel } from "./utils";
import logo from "./assets/download.png";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Denuncia from "./pages/Denuncia";
import NotFound from "./pages/NotFound";

const link =
  "flex whitespace-nowrap px-[0.6em] py-[1em] text-white no-underline hover:bg-gray-400 xl:px-[2em] max-[824.98px]:w-full max-[824.98px]:pl-[2.5em] max-[824.98px]:pr-[1.5em]";

function Layout() {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const isAdmin = user?.role === "admin";

  async function sair() {
    try {
      await api("/auth/logout", "POST");
    } catch {
      clearToken();
    }

    clearToken();
    clearUser();
    window.location.href = "/";
  }

  return (
    <>
      <header
        id="t"
        className="relative z-[110] flex h-[5.5rem] items-center justify-between bg-[#360E53] px-4 text-base xl:px-6 xl:text-[1.2rem]"
      >
        <NavLink
          to="/"
          className="flex h-full shrink-0 items-center"
          aria-label="RMVM Jurídica - Página inicial"
        >
          <img
            src={logo}
            alt="RMVM Jurídica"
            className="block h-20 w-auto max-[824.98px]:h-[4.2rem]"
          />
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="ml-auto hidden cursor-pointer border-none bg-[#360e53] p-[1em] text-white max-[824.98px]:block"
        >
          ☰
        </button>

        <nav
          style={{ right: open ? "0px" : undefined }}
          className="flex flex-wrap bg-[#360E53] max-[824.98px]:fixed max-[824.98px]:top-0 max-[824.98px]:z-[120] max-[824.98px]:h-dvh max-[824.98px]:w-[min(80vw,20rem)] max-[824.98px]:-right-full max-[824.98px]:flex-col max-[824.98px]:items-start max-[824.98px]:overflow-y-auto max-[824.98px]:border-l max-[824.98px]:border-gray-400 max-[824.98px]:shadow-2xl max-[824.98px]:transition-[right] max-[824.98px]:duration-300"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="hidden cursor-pointer border-none bg-transparent p-[1em] text-white max-[824.98px]:block"
          >
            X
          </button>

          {!isAdmin && (
            <>
              <a href="/#ar" className={link} onClick={() => setOpen(false)}>
                Áreas de atuação
              </a>
              <a
                href="/#violencia"
                className={link}
                onClick={() => setOpen(false)}
              >
                Tipos de violência
              </a>
              <a
                href="/#noticias"
                className={link}
                onClick={() => setOpen(false)}
              >
                Notícias
              </a>
              <a href="/#con" className={link} onClick={() => setOpen(false)}>
                Contatos
              </a>
            </>
          )}

          {user ? (
            <>
              <NavLink
                className={link}
                to="/conta"
                onClick={() => setOpen(false)}
              >
                Minha conta
              </NavLink>

              {isAdmin && (
                <NavLink
                  className={link}
                  to="/admin"
                  onClick={() => setOpen(false)}
                >
                  Painel admin
                </NavLink>
              )}

              <div className="ml-2 flex items-center gap-2 border-l border-white/20 py-1.5 pl-2 pr-2 xl:ml-3 xl:pl-3 max-[824.98px]:ml-0 max-[824.98px]:w-full max-[824.98px]:border-l-0 max-[824.98px]:border-t max-[824.98px]:border-white/20 max-[824.98px]:px-[2.5em] max-[824.98px]:py-[1em]">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFAB0B] text-[0.7rem] font-bold text-[#3a2200]"
                  aria-hidden="true"
                >
                  {initials(user.name)}
                </span>

                <span className="hidden max-w-36 flex-col leading-[1.15] text-white max-[824.98px]:flex max-[824.98px]:max-w-none max-[824.98px]:flex-1 lg:flex">
                  <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.78rem] font-semibold">
                    {user.name}
                  </strong>
                  <small className="text-[0.65rem] text-[#d9c4e6]">
                    {roleLabel(user.role)}
                  </small>
                </span>

                <button
                  type="button"
                  onClick={sair}
                  className="cursor-pointer rounded-[0.4rem] border border-white/30 bg-transparent px-2.5 py-1.5 text-[0.72rem] font-semibold text-white hover:border-[#FFAB0B] hover:bg-[#FFAB0B] hover:text-[#3a2200]"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <NavLink
              className={link}
              to="/login"
              onClick={() => setOpen(false)}
            >
              Entrar
            </NavLink>
          )}
        </nav>
      </header>

      <main className="min-w-0">
        <Outlet />
      </main>

      <footer className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] items-start gap-x-16 gap-y-8 break-words bg-[#9A479C] px-6 py-8 text-base text-white max-[640px]:grid-cols-1 max-[640px]:gap-6 max-[640px]:px-5">
        <div className="min-w-0">
          <NavLink
            className="inline-flex text-2xl font-bold text-[#FFAE0D] hover:text-[#bb7f07]"
            to="/about"
          >
            Sobre nós
          </NavLink>
          <br />
          <a
            className="mt-2 inline-block text-inherit hover:text-gray-400"
            href="#t"
          >
            Topo
          </a>
        </div>

        <div className="min-w-0">
          <h2 id="con" className="mb-2 text-2xl font-bold text-[#FFAE0D]">
            Contatos
          </h2>
          <p>1234234(23)</p>
        </div>

        <div className="col-span-full flex border-t border-white/30 pt-4">
          <p className="mx-auto text-center text-sm">
            © 2026 RMVM. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}

function PrivateRoute({ children, admin = false }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/conta" replace state={{ denied: true }} />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/denunciar" element={<Denuncia />} />
          <Route
            path="/conta"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute admin>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
