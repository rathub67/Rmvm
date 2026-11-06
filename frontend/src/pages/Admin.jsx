import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api, getUser } from "../api";
import { formatDateTime, initials, roleLabel } from "../utils";
import { perguntas, respostaTexto } from "../perguntas";

const STATUS = {
  new: { label: "Nova", className: "bg-[#FFF0CC] text-[#7a4f00]" },
  read: { label: "Em análise", className: "bg-[#e4eefc] text-[#1f4a86]" },
  resolved: { label: "Resolvida", className: "bg-emerald-50 text-emerald-700" },
};

function tabClass(active) {
  if (active) {
    return "rounded-md bg-[#360E53] px-3 py-1.5 text-sm font-semibold text-white shadow";
  }

  return "rounded-md px-3 py-1.5 text-sm font-semibold text-[#4B057E] hover:bg-white/70";
}

function respostasDaSolicitacao(item) {
  const answers =
    item.answers && typeof item.answers === "object" ? item.answers : {};

  return perguntas
    .map((pergunta) => ({
      id: pergunta.id,
      numero: pergunta.numero,
      titulo: pergunta.titulo,
      texto: respostaTexto(answers[pergunta.id]),
    }))
    .filter((resposta) => resposta.texto && resposta.texto !== "—");
}

function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api("/admin/denuncias")
      .then((dados) => setDenuncias(dados.denuncias || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(""), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function toggleDetails(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  async function handleStatusChange(item, status) {
    if (status === item.status) return;

    setBusyId(item.id);
    setError("");

    try {
      const dados = await api(
        `/admin/denuncias/${item.id}`,
        "PATCH",
        { status }
      );

      setDenuncias((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, ...dados.denuncia } : entry
        )
      );
      setFeedback("Status da solicitação atualizado.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Excluir a solicitação de ${item.email}?\n\n` +
        "As respostas serão apagadas definitivamente."
    );

    if (!confirmed) return;

    setBusyId(item.id);
    setError("");

    try {
      await api(`/admin/denuncias/${item.id}`, "DELETE");
      setDenuncias((current) => current.filter((entry) => entry.id !== item.id));

      if (expandedId === item.id) {
        setExpandedId(null);
      }

      setFeedback("Solicitação excluída.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4 px-4 py-5 sm:px-5">
      <div>
        <h3 className="text-xl font-semibold text-[#360E53]">
          Solicitações de atendimento
        </h3>
        <p className="text-sm text-[#8b7597]">
          Pedidos enviados pela página “Denuncie”.
        </p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-[#8b7597]">
          Carregando solicitações...
        </p>
      ) : denuncias.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#e0cde8] py-8 text-center text-sm text-[#8b7597]">
          Nenhuma solicitação de atendimento recebida ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {denuncias.map((item) => {
            const meta = STATUS[item.status] || STATUS.new;
            const isExpanded = expandedId === item.id;
            const isBusy = busyId === item.id;
            const respostas = respostasDaSolicitacao(item);

            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-xl border border-[#efe2f4] bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#9a86a4]">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <a
                      href={`mailto:${item.email}`}
                      className="mt-1.5 block break-all font-mono text-sm font-semibold text-[#4B057E] hover:underline"
                    >
                      {item.email}
                    </a>

                    <p className="mt-0.5 text-sm text-[#8b7597]">
                      {respostas.length} resposta
                      {respostas.length === 1 ? "" : "s"} registrada
                      {respostas.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleDetails(item.id)}
                      className="rounded-md border border-[#d8bce8] px-2.5 py-1 text-sm font-semibold text-[#4B057E] transition-colors hover:bg-[#F4E7F6]"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Ocultar respostas" : "Ver respostas"}
                    </button>

                    <select
                      value={item.status}
                      onChange={(event) =>
                        handleStatusChange(item, event.target.value)
                      }
                      disabled={isBusy}
                      aria-label={`Status da solicitação de ${item.email}`}
                      className="rounded-md border border-[#d8bce8] bg-white px-2 py-1 text-sm font-semibold text-[#4B057E] outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20 disabled:opacity-60"
                    >
                      <option value="new">Nova</option>
                      <option value="read">Em análise</option>
                      <option value="resolved">Resolvida</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={isBusy}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {isBusy ? "..." : "Excluir"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#efe2f4] bg-[#faf5fc] px-4 py-4">
                    {respostas.length === 0 ? (
                      <p className="text-sm text-[#8b7597]">
                        Nenhuma resposta registrada nesta solicitação.
                      </p>
                    ) : (
                      <dl className="space-y-3">
                        {respostas.map((resposta) => (
                          <div key={resposta.id}>
                            <dt className="text-sm font-bold text-[#4B057E]">
                              {resposta.numero}. {resposta.titulo}
                            </dt>
                            <dd className="mt-0.5 text-base leading-7 text-[#3d2749]">
                              {resposta.texto}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api("/news")
      .then((dados) => setNews(dados.news || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(""), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setError("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setTitle(item.title);
    setUrl(item.url);
    setError("");
    setFeedback("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanUrl = url.trim();

    if (!cleanTitle || !cleanUrl) {
      setError("Preencha o título e o link da notícia.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const dados = await api(`/news/${editingId}`, "PATCH", {
          title: cleanTitle,
          url: cleanUrl,
        });

        setNews((current) =>
          current.map((item) => (item.id === dados.news.id ? dados.news : item))
        );
        setFeedback("Notícia atualizada.");
      } else {
        const dados = await api("/news", "POST", {
          title: cleanTitle,
          url: cleanUrl,
        });

        setNews((current) => [dados.news, ...current]);
        setFeedback("Notícia publicada.");
      }

      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Excluir a notícia "${item.title}"?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");

    try {
      await api(`/news/${item.id}`, "DELETE");
      setNews((current) => current.filter((entry) => entry.id !== item.id));

      if (editingId === item.id) {
        resetForm();
      }

      setFeedback("Notícia excluída.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4 px-4 py-5 sm:px-5">
      <div>
        <h3 className="text-xl font-semibold text-[#360E53]">
          Notícias publicadas
        </h3>
        <p className="text-sm text-[#8b7597]">
          Cada notícia aparece na secção “Notícias” da home.
        </p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-xl border border-[#efe2f4] bg-[#faf5fc] p-4 lg:grid-cols-[1fr_1.3fr_auto] lg:items-end"
      >
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-[#4B057E]">
            Título
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Novo atendimento jurídico gratuito"
            maxLength={160}
            required
            className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2 text-base outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-[#4B057E]">
            Link da notícia
          </span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            maxLength={2000}
            required
            className="w-full rounded-lg border border-[#e0cde8] bg-white px-3 py-2 text-base outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#360E53] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4B057E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Salvando..."
              : editingId
                ? "Salvar alterações"
                : "Publicar notícia"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-[#d8bce8] px-3 py-2 text-sm font-semibold text-[#4B057E] transition-colors hover:bg-[#F4E7F6] disabled:opacity-60"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="py-8 text-center text-sm text-[#8b7597]">
          Carregando notícias...
        </p>
      ) : news.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#e0cde8] py-8 text-center text-sm text-[#8b7597]">
          Nenhuma notícia publicada ainda.
        </p>
      ) : (
        <ul className="divide-y divide-[#f2e8f6] overflow-hidden rounded-xl border border-[#efe2f4]">
          {news.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-base font-semibold text-[#360E53]">
                  {item.title}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block truncate text-sm text-[#8048A9] hover:underline"
                >
                  {item.url}
                </a>
                <p className="mt-1 text-xs text-[#9a86a4]">
                  {item.authorName || "Administração"} ·{" "}
                  {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-md border border-[#d8bce8] px-2.5 py-1 text-sm font-semibold text-[#4B057E] transition-colors hover:bg-[#F4E7F6]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  {deletingId === item.id ? "..." : "Excluir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Admin() {
  const currentUser = getUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState("denuncias");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api("/admin/users")
      .then((dados) => setUsers(dados.users || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(""), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function refreshUsers() {
    setLoading(true);
    setError("");

    try {
      const dados = await api("/admin/users");
      setUsers(dados.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(target, nextRole) {
    const action =
      nextRole === "admin"
        ? `Promover ${target.name} a administrador?`
        : `Rebaixar ${target.name} para usuário comum?`;

    if (!window.confirm(action)) return;

    setBusyId(target.id);
    setError("");

    try {
      await api(`/admin/users/${target.id}/role`, "PATCH", { role: nextRole });
      setUsers((current) =>
        current.map((item) =>
          item.id === target.id ? { ...item, role: nextRole } : item
        )
      );
      setFeedback(
        nextRole === "admin"
          ? `${target.name} agora é administrador.`
          : `${target.name} agora é usuário comum.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(target) {
    const confirmed = window.confirm(
      `Excluir a conta de ${target.name} (${target.email})?\n\n` +
        "Esta ação não pode ser desfeita."
    );

    if (!confirmed) return;

    setBusyId(target.id);
    setError("");

    try {
      await api(`/admin/users/${target.id}`, "DELETE");
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setFeedback(`Conta de ${target.name} excluída.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const term = search.trim().toLowerCase();
  const filteredUsers = users.filter((item) => {
    if (!term) return true;

    return (
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      roleLabel(item.role).toLowerCase().includes(term)
    );
  });

  return (
    <section className="min-h-[60vh] bg-[#F4E7F6] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#2b0b42] via-[#360E53] to-[#8048A9] px-6 py-6 text-white shadow-lg">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFAB0B]">
              Área administrativa
            </p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Painel de controle
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Gerencie solicitações, notícias e usuários.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/conta"
              className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              Minha conta
            </Link>
            <button
              type="button"
              onClick={refreshUsers}
              disabled={loading}
              className="rounded-lg bg-[#FFAB0B] px-3 py-2 text-sm font-semibold text-[#3a2200] transition-colors hover:bg-[#ffbf3d] disabled:opacity-60"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={refreshUsers}
              className="font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}

        <div className="rounded-2xl border border-[#e3d0eb] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efe2f4] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap gap-1 rounded-lg bg-[#f3e8f8] p-1">
              <button
                type="button"
                onClick={() => setTab("denuncias")}
                className={tabClass(tab === "denuncias")}
              >
                Solicitações
              </button>
              <button
                type="button"
                onClick={() => setTab("news")}
                className={tabClass(tab === "news")}
              >
                Notícias
              </button>
              <button
                type="button"
                onClick={() => setTab("users")}
                className={tabClass(tab === "users")}
              >
                Usuários
              </button>
            </div>

            {tab === "users" && (
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail ou nível..."
                className="w-full max-w-xs rounded-lg border border-[#e0cde8] px-3 py-2 text-sm outline-none focus:border-[#8048A9] focus:ring-2 focus:ring-[#8048A9]/20"
              />
            )}
          </div>

          {tab === "denuncias" ? (
            <AdminDenuncias />
          ) : tab === "news" ? (
            <AdminNews />
          ) : loading ? (
            <p className="px-5 py-10 text-center text-sm text-[#8b7597]">
              Carregando dados...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#8b7597]">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#faf5fc] text-xs uppercase tracking-wide text-[#8b7597]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Usuário</th>
                    <th className="px-5 py-3 font-semibold">Nível</th>
                    <th className="px-5 py-3 font-semibold">Último acesso</th>
                    <th className="px-5 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const isSelf = item.id === currentUser?.id;
                    const isBusy = busyId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-[#f2e8f6] text-[#3d2749]"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eadcf3] text-xs font-bold text-[#4B057E]">
                              {initials(item.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#360E53]">
                                {item.name}
                                {isSelf && (
                                  <span className="ml-2 rounded bg-[#f3e8f8] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase text-[#8048A9]">
                                    você
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-[#8b7597]">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              item.role === "admin"
                                ? "bg-[#FFF0CC] text-[#7a4f00]"
                                : "bg-[#efe6f5] text-[#5b3a6e]"
                            }`}
                          >
                            {roleLabel(item.role)}
                          </span>
                        </td>

                        <td className="px-5 py-3">
                          {formatDateTime(item.lastLoginAt)}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() =>
                                handleRoleChange(
                                  item,
                                  item.role === "admin" ? "user" : "admin"
                                )
                              }
                              className="rounded-md border border-[#d8bce8] px-2.5 py-1 text-xs font-semibold text-[#4B057E] transition-colors hover:bg-[#F4E7F6] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {item.role === "admin"
                                ? "Tornar usuário"
                                : "Tornar admin"}
                            </button>
                            <button
                              type="button"
                              disabled={isSelf || isBusy}
                              onClick={() => handleDelete(item)}
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isBusy ? "..." : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
