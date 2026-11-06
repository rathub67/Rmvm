import { useState } from "react";
import { useLocation } from "react-router-dom";
import { api, clearToken, clearUser, getUser } from "../api";
import { initials } from "../utils";

export default function Account() {
  const user = getUser();
  const location = useLocation();

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function updatePasswordField(field, value) {
    setPasswords((current) => ({ ...current, [field]: value }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordFeedback("");

    if (!passwords.currentPassword || !passwords.newPassword) {
      setPasswordError("Preencha a senha atual e a nova senha.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("As senhas novas não conferem.");
      return;
    }

    setChangingPassword(true);

    try {
      const data = await api("/auth/password", "POST", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setPasswordFeedback(data.message || "Senha alterada com sucesso.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Informe a sua senha para confirmar.");
      return;
    }

    setDeleting(true);

    try {
      await api("/auth/account", "DELETE", { password: deletePassword });
      clearToken();
      clearUser();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <section className="min-h-[60vh] bg-[#F4E7F6] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-xl space-y-6">
        {location.state?.denied && (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            O painel administrativo é exclusivo para administradores. Você está
            vendo a sua área de usuário.
          </div>
        )}

        <header className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#360E53] to-[#8048A9] px-6 py-6 text-white shadow-lg">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold ring-2 ring-white/30">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">Minha conta</h1>
            <p className="truncate text-sm text-white/75">{user.email}</p>
          </div>
        </header>

        <div className="rounded-2xl border border-[#e3d0eb] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-[#360E53]">
            Redefinir senha
          </h2>

          <form className="mt-4 space-y-3" onSubmit={handlePasswordSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B057E]">
                Senha atual
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
                className="w-full rounded-lg border border-[#e0cde8] px-3 py-2 text-base outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B057E]">
                Nova senha
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwords.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
                className="w-full rounded-lg border border-[#e0cde8] px-3 py-2 text-base outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                minLength={8}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B057E]">
                Confirmar nova senha
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
                className="w-full rounded-lg border border-[#e0cde8] px-3 py-2 text-base outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
                minLength={8}
                required
              />
            </label>

            {passwordError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordError}
              </p>
            )}

            {passwordFeedback && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {passwordFeedback}
              </p>
            )}

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-lg bg-[#360E53] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4B057E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-red-700">Apagar conta</h2>
          <p className="mt-1 text-sm text-[#8b7597]">
            Esta ação é permanente e não pode ser desfeita.
          </p>

          {!deleteOpen ? (
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(true);
                setDeleteError("");
              }}
              className="mt-4 w-full rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              Apagar minha conta
            </button>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={handleDeleteAccount}>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-red-700">
                  Confirme com a sua senha
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-base outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </label>

              {deleteError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {deleteError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePassword("");
                    setDeleteError("");
                  }}
                  className="flex-1 rounded-lg border border-[#d8c4e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#4B057E] transition-colors hover:bg-[#f7f0fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Apagando..." : "Confirmar exclusão"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
