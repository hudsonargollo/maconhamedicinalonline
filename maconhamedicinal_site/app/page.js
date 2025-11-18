import Link from "next/link";

function Hero() {
  return (
    <section className="section" style={{ paddingTop: "4.5rem", paddingBottom: "3.5rem" }}>
      <div className="container">
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gap: "3rem",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            alignItems: "center",
          }}
        >
          <div className="hero-main">
            <div className="badge">
              <span>🌿 maconhamedicinal.online</span>
              <span>Saúde, dados e cuidado real</span>
            </div>
            <h1
              style={{
                fontSize: "2.8rem",
                lineHeight: 1.1,
                marginTop: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              Acompanhe sua jornada com cannabis medicinal com clareza e segurança.
            </h1>
            <p style={{ color: "#667085", maxWidth: 520, fontSize: "1rem" }}>
              Uma plataforma desenhada para pacientes e profissionais: registre sintomas,
              acompanhe sua evolução e tenha mais controle sobre seu tratamento com cannabis
              medicinal, de forma responsável e orientada.
            </p>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
              <Link href="#contato">
                <button className="btn btn-primary">Quero ser avisado no lançamento</button>
              </Link>
              <Link href="#como-funciona">
                <button className="btn btn-ghost">Ver como funciona</button>
              </Link>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <div className="chip">✅ Diário medicinal inteligente</div>
              <div className="chip">✅ Acompanhamento de sintomas</div>
              <div className="chip">✅ Relatórios para você e seu médico</div>
            </div>
          </div>

          <div>
            <div
              style={{
                background: "linear-gradient(145deg, rgba(23,76,60,0.06), #ffffff)",
                borderRadius: "24px",
                padding: "1.5rem",
                boxShadow: "0 18px 45px rgba(23,76,60,0.16)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#667085" }}>Hoje • Diário medicinal</span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "999px",
                    background: "rgba(203,167,105,0.15)",
                    color: "#8b6a37",
                    fontWeight: 500,
                  }}
                >
                  Em equilíbrio
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gap: "0.85rem",
                  marginBottom: "1.25rem",
                  fontSize: "0.9rem",
                }}
              >
                <div className="card" style={{ padding: "0.9rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Ansiedade</span>
                    <strong style={{ color: "#174C3C" }}>Baixa</strong>
                  </div>
                  <p style={{ marginTop: "0.4rem", color: "#667085", fontSize: "0.8rem" }}>
                    Você relatou menos episódios de inquietação nos últimos 7 dias.
                  </p>
                </div>
                <div className="card" style={{ padding: "0.9rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Sono</span>
                    <strong style={{ color: "#174C3C" }}>6h 45min</strong>
                  </div>
                  <p style={{ marginTop: "0.4rem", color: "#667085", fontSize: "0.8rem" }}>
                    Seu padrão de sono está mais estável desde o início do acompanhamento.
                  </p>
                </div>
                <div className="card" style={{ padding: "0.9rem 1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Dor crônica</span>
                    <strong style={{ color: "#C99072" }}>Moderada</strong>
                  </div>
                  <p style={{ marginTop: "0.4rem", color: "#667085", fontSize: "0.8rem" }}>
                    Houve redução gradual na intensidade da dor em comparação à semana anterior.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  color: "#667085",
                }}
              >
                <span>Próxima consulta sugerida: 12/03</span>
                <span>Exportar relatório ⬇️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: "Diário medicinal inteligente",
      desc: "Registre uso, dosagem, sintomas e percepções diárias em poucos segundos, com gráficos que facilitam a leitura da sua evolução.",
    },
    {
      title: "Acompanhamento baseado em dados",
      desc: "Visualize tendências de humor, sono, dor e bem-estar com relatórios prontos para você e para o profissional que te acompanha.",
    },
    {
      title: "Visão integrada da saúde",
      desc: "Conecte hábitos, rotinas e sintomas em um só lugar, entendendo o impacto da cannabis medicinal na sua qualidade de vida.",
    },
  ];

  return (
    <section id="como-funciona" className="section">
      <div className="container">
        <h2 className="section-title">Como a plataforma funciona na prática</h2>
        <p className="section-subtitle">
          maconhamedicinal.online foi pensada para ser um ponto de apoio diário:
          simples de usar, visual e profunda o suficiente para orientar decisões
          importantes junto ao seu médico ou terapeuta.
        </p>

        <div className="grid grid-3" style={{ marginTop: "2.5rem" }}>
          {items.map((item) => (
            <div key={item.title} className="card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "#667085" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    "Mais clareza sobre o que está funcionando no seu tratamento.",
    "Registro organizado para discutir com seu médico ou terapeuta.",
    "Maior sensação de controle sobre ansiedade, sono e dor.",
    "Evolução acompanhada em vez de tentativas no escuro.",
  ];

  return (
    <section className="section" style={{ background: "rgba(23,76,60,0.03)" }}>
      <div className="container">
        <h2 className="section-title">Por que acompanhar sua jornada faz diferença</h2>
        <p className="section-subtitle">
          A cannabis medicinal é uma ferramenta poderosa, mas o que transforma de verdade
          é o acompanhamento contínuo. Quando você registra, compara e entende seus dados,
          tomar decisões fica muito mais seguro.
        </p>

        <div
          className="card"
          style={{
            marginTop: "2rem",
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            alignItems: "center",
          }}
        >
          <ul style={{ paddingLeft: "1.1rem", fontSize: "0.95rem", color: "#475467" }}>
            {items.map((item) => (
              <li key={item} style={{ marginBottom: "0.7rem" }}>
                {item}
              </li>
            ))}
          </ul>
          <div
            style={{
              borderRadius: "18px",
              padding: "1rem 1.2rem",
              background:
                "radial-gradient(circle at top left, rgba(107,191,140,0.18), rgba(23,76,60,0.9))",
              color: "white",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Pensado para pacientes reais</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.95 }}>
              Nada de telas confusas ou termos complicados. Você registra o essencial,
              a plataforma organiza e traduz em gráficos e insights que fazem sentido.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contato" className="section">
      <div className="container">
        <h2 className="section-title">Entre na lista de interesse</h2>
        <p className="section-subtitle">
          Estamos finalizando a primeira versão da plataforma. Deixe seu melhor e-mail
          para ser avisado no lançamento e receber condições especiais para os primeiros
          usuários.
        </p>

        <div
          className="card"
          style={{
            marginTop: "2rem",
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
            alignItems: "center",
          }}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "grid", gap: "0.9rem" }}
          >
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label htmlFor="nome" style={{ fontSize: "0.85rem", color: "#667085" }}>
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Digite seu nome"
                style={{
                  borderRadius: "999px",
                  border: "1px solid #D0D5DD",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label htmlFor="email" style={{ fontSize: "0.85rem", color: "#667085" }}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                style={{
                  borderRadius: "999px",
                  border: "1px solid #D0D5DD",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <label htmlFor="interesse" style={{ fontSize: "0.85rem", color: "#667085" }}>
                Você é paciente, profissional de saúde ou pesquisador?
              </label>
              <select
                id="interesse"
                style={{
                  borderRadius: "999px",
                  border: "1px solid #D0D5DD",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                  background: "white",
                }}
              >
                <option value="">Selecione uma opção</option>
                <option value="paciente">Paciente</option>
                <option value="profissional">Profissional de saúde</option>
                <option value="pesquisador">Pesquisador(a)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Quero receber novidades
            </button>
            <p style={{ fontSize: "0.75rem", color: "#98A2B3" }}>
              Prometemos não enviar spam. Apenas conteúdos relevantes e notícias sobre o
              lançamento da plataforma.
            </p>
          </form>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              Para quem esta plataforma foi pensada
            </h3>
            <ul style={{ paddingLeft: "1.1rem", fontSize: "0.9rem", color: "#475467" }}>
              <li style={{ marginBottom: "0.4rem" }}>
                Pessoas em tratamento com cannabis medicinal que querem mais clareza.
              </li>
              <li style={{ marginBottom: "0.4rem" }}>
                Profissionais que desejam acompanhar seus pacientes com dados organizados.
              </li>
              <li>
                Pesquisadores e clínicas que buscam uma base estruturada de registros
                para estudos e protocolos.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="section" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div className="container" style={{ fontSize: "0.8rem", color: "#98A2B3" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span>© {new Date().getFullYear()} maconhamedicinal.online • Todos os direitos reservados.</span>
          <span>
            Este site tem caráter informativo e não substitui acompanhamento médico individualizado.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main>
      <Hero />
      <Features />
      <Benefits />
      <ContactSection />
      <Footer />
    </main>
  );
}
