import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";
import { CAMPOS_OBRIGATORIOS, perguntas } from "../perguntas";

const pageClass =
  "min-h-full bg-[#f4e7f6] px-6 pb-16 pt-12 text-base text-[#17131c] md:px-10 max-[600px]:px-4 max-[600px]:pb-12 max-[600px]:pt-8";

const inputOptionClass =
  "mt-[0.08rem] h-[1.05rem] w-[1.05rem] shrink-0 cursor-pointer accent-[#360e53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#360e53]";

const buttonClass =
  "cursor-pointer rounded-full border-0 bg-[#e00000] px-[2.6rem] py-3 text-base font-bold text-white transition hover:bg-[#b00000] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#360e53]";

const panicButtonClass =
  "fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full bg-[#d50000] px-5 py-3 text-sm font-bold text-white shadow-[0_0.8rem_2rem_rgba(213,0,0,0.35)] transition hover:bg-[#a00000] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#360e53] max-[600px]:bottom-4 max-[600px]:right-3 max-[600px]:px-4 max-[600px]:py-2.5";

const erroClass = "mt-[0.55rem] text-sm font-bold text-[#a4001b]";

function BotaoPanico() {
  return (
    <button
      type="button"
      onClick={() => window.location.replace("https://www.tudogostoso.com.br/")}
      className={panicButtonClass}
      title="Sair imediatamente desta página"
    >
      <span aria-hidden="true">✕</span>
      Saída rápida
    </button>
  );
}

export default function Denuncia() {
  const [respostas, setRespostas] = useState({});
  const [email, setEmail] = useState("");
  const [declaracao, setDeclaracao] = useState(false);
  const [erros, setErros] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { hash } = useLocation();

  const temErros = Object.keys(erros).length > 0;

  useEffect(() => {
    if (!hash) {
      return;
    }

    const elemento = document.querySelector(hash);

    if (elemento) {
      requestAnimationFrame(() => {
        elemento.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hash]);

  function limparErro(id) {
    setErros((prev) => {
      if (!prev[id]) {
        return prev;
      }

      const proximo = { ...prev };
      delete proximo[id];
      return proximo;
    });
  }

  function selecionar(id, valor) {
    setRespostas((prev) => {
      const proximo = { ...prev, [id]: valor };

      if (id === "q5" && valor === "Não") {
        delete proximo.q6;
      }

      if (id === "q9" && valor === "Não") {
        delete proximo.q10;
      }

      return proximo;
    });

    limparErro(id);

    if (id === "q5" && valor === "Não") {
      limparErro("q6");
    }

    if (id === "q9" && valor === "Não") {
      limparErro("q10");
    }
  }

  function alternar(id, valor) {
    setRespostas((prev) => {
      const atuais = prev[id] || [];
      const opcaoExclusiva =
        id === "q2" ? "Não sei identificar" : "Não procurei ajuda";

      let proximos;

      if (valor === opcaoExclusiva) {
        proximos = atuais.includes(valor) ? [] : [valor];
      } else {
        const semExclusiva = atuais.filter((item) => item !== opcaoExclusiva);
        proximos = semExclusiva.includes(valor)
          ? semExclusiva.filter((item) => item !== valor)
          : [...semExclusiva, valor];
      }

      return { ...prev, [id]: proximos };
    });

    limparErro(id);
  }

  function validar() {
    const novosErros = {};

    CAMPOS_OBRIGATORIOS.forEach((id) => {
      const valor = respostas[id];

      if (!valor || (Array.isArray(valor) && valor.length === 0)) {
        novosErros[id] = "Selecione uma opção para continuar.";
      }
    });

    if (respostas.q5 === "Sim" && (!respostas.q6 || respostas.q6.length === 0)) {
      novosErros.q6 = "Informe onde você procurou ajuda.";
    }

    if (respostas.q9 === "Sim" && !respostas.q10) {
      novosErros.q10 = "Selecione a principal ajuda jurídica que você procura.";
    }

    if (!email.trim()) {
      novosErros.email = "Informe um e-mail para contato.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!declaracao) {
      novosErros.declaracao = "É necessário confirmar a declaração para enviar.";
    }

    return novosErros;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (enviando) return;

    const novosErros = validar();

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setSubmitError("");

      requestAnimationFrame(() => {
        document
          .querySelector('.denuncia-form [aria-invalid="true"]')
          ?.focus();
      });

      return;
    }

    const emailLimpo = email.trim();
    setEmail(emailLimpo);
    setErros({});
    setSubmitError("");
    setEnviando(true);

    try {
      await api("/denuncias", "POST", { email: emailLimpo, answers: respostas });
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function enviarOutraSolicitacao() {
    setRespostas({});
    setEmail("");
    setDeclaracao(false);
    setErros({});
    setSubmitError("");
    setEnviado(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (enviado) {
    return (
      <div className={pageClass}>
        <BotaoPanico />

        <div
          className="mx-auto w-full max-w-[640px] rounded-xl bg-white p-10 shadow-[0_0.5rem_2rem_rgba(54,14,83,0.12)] max-[600px]:px-5 max-[600px]:py-7"
          role="status"
          aria-live="polite"
        >
          <p className="mb-4 inline-block rounded-full bg-[#e9f7ec] px-[0.8rem] py-[0.35rem] text-sm font-bold uppercase tracking-[0.04em] text-[#1d6b34]">
            Solicitação recebida
          </p>

          <h1 className="mb-4 text-2xl font-bold leading-tight text-[#360e53]">
            Obrigada por confiar na Rede Mulher.
          </h1>

          <p className="mb-4 text-base leading-7">
            Suas informações foram registradas com segurança. A equipe da RMVM
            Advogados entrará em contato pelo e-mail <strong>{email}</strong>{" "}
            para prestar a orientação solicitada.
          </p>

          <p className="mb-4 border-l-4 border-[#ffae0d] bg-[#fff4e5] px-4 py-[0.8rem] text-base leading-7">
            Se você estiver em risco imediato, ligue <strong>190</strong>{" "}
            (Polícia Militar) ou <strong>180</strong> (Central de Atendimento à
            Mulher).
          </p>

          <button
            type="button"
            className={`mt-2 ${buttonClass}`}
            onClick={enviarOutraSolicitacao}
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <BotaoPanico />
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="sr-only">Solicitação de orientação jurídica</h1>

        <form className="denuncia-form w-full" onSubmit={handleSubmit} noValidate>
          {temErros && (
            <div
              className="mb-7 border-l-4 border-[#a4001b] bg-[#fbe3e6] px-4 py-[0.8rem] text-sm text-[#6d0012]"
              role="alert"
            >
              Revise os campos destacados antes de enviar.
            </div>
          )}

          {perguntas.map((pergunta) => {
            const erro = erros[pergunta.id];

            return (
              <fieldset
                key={pergunta.id}
                id={pergunta.id === "q2" ? "tipos" : undefined}
                className="m-0 mb-8 min-w-0 border-0 p-0 max-[600px]:mb-[1.6rem]"
                aria-describedby={erro ? `${pergunta.id}-erro` : undefined}
              >
                <legend className="mb-[0.8rem] p-0 text-base font-bold leading-6">
                  {pergunta.numero}. {pergunta.titulo}{" "}
                  {pergunta.subtitulo && (
                    <span className="font-normal">{pergunta.subtitulo}</span>
                  )}
                </legend>

                <div className="flex flex-col gap-[0.6rem]">
                  {pergunta.opcoes.map((opcao) => {
                    const marcado = Array.isArray(respostas[pergunta.id])
                      ? respostas[pergunta.id].includes(opcao)
                      : respostas[pergunta.id] === opcao;

                    return (
                      <label
                        className="flex cursor-pointer items-start gap-[0.55rem] text-base leading-6"
                        key={opcao}
                      >
                        <input
                          type={pergunta.tipo}
                          name={pergunta.id}
                          value={opcao}
                          checked={marcado}
                          onChange={() =>
                            pergunta.tipo === "checkbox"
                              ? alternar(pergunta.id, opcao)
                              : selecionar(pergunta.id, opcao)
                          }
                          aria-invalid={Boolean(erro)}
                          className={inputOptionClass}
                        />
                        <span>{opcao}</span>
                      </label>
                    );
                  })}
                </div>

                {erro && (
                  <p className={erroClass} id={`${pergunta.id}-erro`}>
                    {erro}
                  </p>
                )}
              </fieldset>
            );
          })}

          <div className="mb-9">
            <label
              className="mb-[0.6rem] block text-base font-bold"
              htmlFor="email"
            >
              12. E-mail para contato
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                limparErro("email");
              }}
              autoComplete="email"
              aria-invalid={Boolean(erros.email)}
              aria-describedby={erros.email ? "email-erro" : undefined}
              className="block w-full max-w-[340px] rounded-none border border-[#4d4d3f] bg-[#e9ebdd] px-[0.6rem] py-[0.45rem] font-[inherit] text-base text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#360e53] max-[600px]:max-w-full"
            />

            {erros.email && (
              <p className={erroClass} id="email-erro">
                {erros.email}
              </p>
            )}
          </div>

          <div className="mb-9">
            <h2 className="mb-[0.9rem] text-lg font-bold">Declaração</h2>

            <p
              className="max-w-[48rem] text-base leading-7"
              id="declaracao-texto"
            >
              Confirmo que as informações fornecidas são verdadeiras e autorizo
              o contato da equipe da Rede Mulher para fins de orientação
              relacionada à minha solicitação.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-[0.55rem] text-base leading-6">
              <input
                type="checkbox"
                checked={declaracao}
                onChange={(event) => {
                  setDeclaracao(event.target.checked);
                  limparErro("declaracao");
                }}
                aria-label="Confirmo a declaração"
                aria-invalid={Boolean(erros.declaracao)}
                aria-describedby={
                  erros.declaracao ? "declaracao-erro" : "declaracao-texto"
                }
                className={inputOptionClass}
              />
            </label>

            {erros.declaracao && (
              <p className={erroClass} id="declaracao-erro">
                {erros.declaracao}
              </p>
            )}
          </div>

          {submitError && (
            <div
              className="mb-6 border-l-4 border-[#a4001b] bg-[#fbe3e6] px-4 py-[0.8rem] text-sm text-[#6d0012]"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Denunciar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
