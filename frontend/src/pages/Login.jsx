import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, getUser, setToken, setUser } from "../api";
import logo from "../assets/download.png";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loggedUser = getUser();

  if (loggedUser) {
    return (
      <Navigate
        to={loggedUser.role === "admin" ? "/admin" : "/conta"}
        replace
      />
    );
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }

    if (mode === "register") {
      if (form.name.trim().length < 2) {
        setError("Informe seu nome completo.");
        return;
      }
      if (password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (password !== form.confirm) {
        setError("As senhas não conferem.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const data =
        mode === "register"
          ? await api("/auth/register", "POST", {
              name: form.name.trim(),
              email,
              password,
            })
          : await api("/auth/login", "POST", { email, password });

      setToken(data.token);
      setUser(data.user);
      window.location.href = data.user.role === "admin" ? "/admin" : "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-[#F4E7F6] px-4 py-10 sm:px-6 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(54,14,83,0.16)] md:grid-cols-2">
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-[#360E53] via-[#4B057E] to-[#8048A9] p-10 text-white md:flex">
          <div>
            <img
              src={logo}
              alt="RMVM Advogados"
              className="h-16 w-auto"
            />
            <h2 className="mt-10 text-2xl font-semibold leading-tight">
              Área reservada da
              <br />
              RMVM Advogados
            </h2>
            <p className="mt-4 max-w-xs text-base leading-7 text-white/80">
              Acesse sua conta para acompanhar seus dados com segurança.
              Informação, acolhimento e proteção em um só lugar.
            </p>
          </div>

          <ul className="space-y-3 text-base text-white/85">
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
              Área pessoal protegida por senha
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFAB0B]" />
              Alteração de senha a qualquer momento
            </li>
          </ul>
        </aside>

        <div className="p-6 sm:p-10">
          <div className="mb-6 flex rounded-xl bg-[#F4E7F6] p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg px-4 py-2 text-base font-semibold transition-colors ${
                mode === "login"
                  ? "bg-[#360E53] text-white shadow"
                  : "text-[#4B057E] hover:bg-white/70"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 rounded-lg px-4 py-2 text-base font-semibold transition-colors ${
                mode === "register"
                  ? "bg-[#360E53] text-white shadow"
                  : "text-[#4B057E] hover:bg-white/70"
              }`}
            >
              Criar conta
            </button>
          </div>

          <h1 className="text-2xl font-semibold text-[#360E53]">
            {mode === "login" ? "Bem-vinda de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-1 text-base leading-7 text-[#6f5a7c]">
            {mode === "login"
              ? "Entre com seu e-mail e senha para acessar sua conta."
              : "Leva menos de um minuto. A sua conta fica protegida por senha."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <label className="block">
                <span className="mb-1 block text-base font-medium text-[#360E53]">
                  Nome completo
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2.5 text-base text-[#241130] outline-none transition focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                  required
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-base font-medium text-[#360E53]">
                E-mail
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2.5 text-base text-[#241130] outline-none transition focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-base font-medium text-[#360E53]">
                Senha
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder={
                    mode === "register"
                      ? "Mínimo de 8 caracteres"
                      : "Sua senha"
                  }
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2.5 pr-20 text-base text-[#241130] outline-none transition focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[#8048A9] hover:bg-[#F4E7F6]"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            {mode === "register" && (
              <label className="block">
                <span className="mb-1 block text-base font-medium text-[#360E53]">
                  Confirmar senha
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(event) =>
                    updateField("confirm", event.target.value)
                  }
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2.5 text-base text-[#241130] outline-none transition focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                  required
                />
              </label>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#360E53] px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[#4B057E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar minha conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-base text-[#6f5a7c]">
            {mode === "login" ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-[#8048A9] hover:underline"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já possui conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-[#8048A9] hover:underline"
                >
                  Entrar
                </button>
              </>
            )}
          </p>

          <p className="mt-3 text-center text-sm text-[#9a86a4]">
            <Link to="/" className="hover:underline">
              Voltar para a página inicial
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
