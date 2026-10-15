"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  FileCheck,
  Fingerprint,
  Hammer,
  Home,
  ImagePlus,
  LocateFixed,
  Lock,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  User,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";

const telas = [
  ["landing", "Apresentação"],
  ["entrar", "Login"],
  ["radar", "Radar & Feed"],
  ["publicar", "Publicar"],
  ["perfil", "Perfil"],
  ["oportunidades", "Oportunidades"],
  ["servico", "Serviço"],
] as const;

type Tela = (typeof telas)[number][0];

const rotas: Record<Tela, string> = {
  landing: "/preview/landing",
  entrar: "/preview/entrar",
  radar: "/preview/radar",
  publicar: "/preview/publicar",
  perfil: "/preview/perfil",
  oportunidades: "/preview/oportunidades",
  servico: "/preview/servico",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#d4e9e2] text-[#111111] shadow-[inset_0_0_0_1px_rgba(17,23,19,.12)]">
        <MapPin className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <div className="leading-none">
          <strong className="block text-[15px] font-black tracking-[-0.03em] text-[#111111]">MÃO LOCAL</strong>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#78807a]">perto. rápido. seguro.</span>
        </div>
      )}
    </div>
  );
}

function TestNavigator({ tela }: { tela: Tela }) {
  return (
    <div className="border-b border-[#dde2df] bg-[#006241] text-white">
      <div className="mx-auto flex max-w-[1480px] items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="shrink-0 rounded-full bg-[#d4e9e2] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]">Modo teste</span>
        <span className="hidden shrink-0 text-xs text-white/55 md:inline">Navegue por todas as telas do Figma:</span>
        <nav className="flex shrink-0 gap-1" aria-label="Navegação das telas de teste">
          {telas.map(([slug, label], index) => (
            <Link
              key={slug}
              href={rotas[slug]}
              className={cx(
                "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                tela === slug ? "bg-white text-[#111111]" : "text-white/65 hover:bg-white/10 hover:text-white",
              )}
            >
              <span className="mr-1 text-[10px] opacity-60">{index + 1}</span>{label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function AppHeader({ active }: { active?: Tela }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links: Array<[Tela, string]> = [
    ["radar", "Radar"],
    ["publicar", "Publicar"],
    ["oportunidades", "Oportunidades"],
    ["servico", "Serviços"],
  ];
  return (
    <header className="relative z-20 border-b border-[#e1e6e3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={rotas.radar}><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([slug, label]) => (
            <Link key={slug} href={rotas[slug]} className={cx("rounded-xl px-4 py-2 text-sm font-bold", active === slug ? "bg-[#d4e9e2] text-[#111111]" : "text-[#69716c] hover:bg-[#faf6ee] hover:text-[#111111]")}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Notificações" className="grid size-10 place-items-center rounded-xl border border-[#e1e6e3] text-[#4d5650] hover:bg-[#faf6ee]"><Bell className="size-4.5" /></button>
          <Link href={rotas.perfil} className={cx("flex items-center gap-2 rounded-xl border px-2 py-1.5", active === "perfil" ? "border-[#006241] bg-[#d4e9e2]" : "border-[#e1e6e3]") }>
            <span className="grid size-8 place-items-center rounded-lg bg-[#d4e9e2] text-xs font-black text-[#2f3832]">BS</span>
            <span className="hidden text-left sm:block"><span className="block text-xs font-extrabold text-[#18201b]">Bruno</span><span className="block text-[10px] text-[#7c847f]">Contratante</span></span>
          </Link>
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="grid size-10 place-items-center rounded-xl border border-[#e1e6e3] lg:hidden" aria-label="Abrir menu">{mobileOpen ? <X className="size-5"/> : <Menu className="size-5"/>}</button>
        </div>
      </div>
      {mobileOpen && <nav className="grid gap-1 border-t border-[#e1e6e3] bg-white p-3 lg:hidden">{links.map(([slug,label]) => <Link key={slug} href={rotas[slug]} className="rounded-lg px-3 py-2 text-sm font-bold text-[#38413b]">{label}</Link>)}</nav>}
    </header>
  );
}

function Landing() {
  const [role, setRole] = useState("contratar");
  const [service, setService] = useState("Eletricista Predial");
  const steps = [
    ["Radar & Proximidade", "Geolocalização de alta fidelidade com proteção de privacidade. Localize prestadores disponíveis em raio de 2 a 15 km com confirmação em até 180 segundos.", "Matching por raio ativo", MapPin],
    ["Triagem com IA & Chat Mascarado", "Alinhamento prévio via assistente inteligente de escopo. Negociação em chat protegido que bloqueia vazamento de dados sensíveis antes do aceite mútuo.", "Privacidade Ponta a Ponta", MessageCircle],
    ["Execução & Validação Dual", "Escolha o formato: Vistoria Fotográfica NBR com georreferenciamento para reparos/obras OU Check-out via QR Code dinâmico para diárias e eventos presenciais.", "Laudo com foto ou QR Code", FileCheck],
    ["Liquidação PIX & Garantia", "Aprovação do contratante autoriza a liberação instantânea do saldo em custódia para a chave PIX do profissional. Garantia de 90 dias com cobertura KineticProtege.", "Custódia Escrow Desbloqueada", Wallet],
  ] as const;
  const benefits = [
    { pro: false, title: "Para Contratantes", subtitle: "Empresas, condomínios, eventos & residências", badge: "Contrate com Calma", icon: Briefcase, items: [
      ["Mão de Obra Verificada em Minutos", "Checagem automatizada de antecedentes criminais, certidões negativas e faciais antes de qualquer despacho."],
      ["Dinheiro Protegido até a Entrega", "Seu pagamento não vai para a conta de terceiros: fica alocado em custódia judicial Escrow. O profissional só recebe após seu OK definitivo."],
      ["Cobertura KineticProtege contra Danos", "Seguro patrimonial acoplado para proteção de bens e ressarcimento imediato em caso de inconformidade técnica comprovada."]
    ]},
    { pro: true, title: "Para Profissionais", subtitle: "Técnicos, diaristas, garçons, mestres & prestadores", badge: "Zero Inadimplência", icon: Wrench, items: [
      ["Custódia Garantida Antes de Sair de Casa", "Você só se desloca quando o valor do serviço estiver 100% depositado na conta de garantia escrow do app. Adeus calotes."],
      ["Repasse Instantâneo no PIX", "Finalizou o serviço e fez a leitura do QR Code do cliente? O dinheiro cai diretamente na sua chave bancária cadastrada em segundos."],
      ["Autonomia Total de Agenda & Tarifas", "Defina seu raio de atendimento, filtre horários e defina sua diária ou valor/hora sem imposições arbitrárias."]
    ]}
  ];
  return <div className="institutional">
    <style>{`
      .institutional{--green:#00805b;--navy:#17283e;background:#fff;color:var(--navy);font-family:Arial,Helvetica,sans-serif;font-size:clamp(14px,1.25vw,24px);line-height:1.45}
      .institutional *{box-sizing:border-box}.institutional a{text-decoration:none}.institutional button,.institutional a,.institutional input{font:inherit}.institutional svg{width:1.25em;height:1.25em;flex-shrink:0}
      .institutional .wrap{width:95%;max-width:1824px;margin:auto}.institutional h1,.institutional h2,.institutional h3,.institutional p{margin:0}.institutional h1{font-size:clamp(34px,3.22vw,62px);line-height:1.18;letter-spacing:-.045em;font-weight:750}.institutional h2{font-size:clamp(28px,2.6vw,50px);line-height:1.2;letter-spacing:-.035em;font-weight:700}.institutional h3{font-size:clamp(19px,1.58vw,30px);line-height:1.3;letter-spacing:-.025em;font-weight:700}
      .institutional .muted{color:#70717c}.institutional .green{color:var(--green)}.institutional .pill{display:inline-flex;align-items:center;gap:.45em;padding:.3em .9em;border-radius:50px;font-size:.65em;font-weight:750;letter-spacing:.035em;background:#e4edff}.institutional .pill svg{width:1em;height:1em}
      .institutional .btn{display:inline-flex;align-items:center;justify-content:center;gap:.6em;background:#00805b;color:white;border:0;border-radius:8px;padding:1em 1.7em;font-size:.84em;font-weight:650;cursor:pointer}.institutional .black{background:#050606}.institutional .btn:hover{filter:brightness(1.1)}.institutional a:focus-visible,.institutional button:focus-visible,.institutional input:focus-visible{outline:3px solid #00a779;outline-offset:4px}
      .institutional .brand{display:flex;align-items:center;gap:.55em;font-weight:750;font-size:1.15em;line-height:1.2}.institutional .brandmark{background:#16263a;color:#55d6a6;border-radius:8px;display:grid;place-items:center;width:2.2em;height:2.2em}.institutional .brand small{display:block;font-size:.48em;color:#747d8c;letter-spacing:.07em;margin-top:.3em}.institutional .brand b{display:flex;align-items:center;gap:.2em}.institutional .brand b svg{color:var(--green);width:.7em;height:.7em}
      .institutional .topbar{height:clamp(78px,6.25vw,120px);display:flex;align-items:center;justify-content:space-between;gap:2em}.institutional .toplinks{display:flex;align-items:center;gap:2.5em;font-size:.82em;color:#40434d}.institutional .toplinks a:first-child{color:var(--green);font-weight:700;border-bottom:2px solid var(--green);padding:.6em 0}.institutional .topactions{display:flex;align-items:center;gap:2em;font-size:.85em}.institutional .topactions>a:first-child{display:flex;align-items:center;gap:.3em}
      .institutional .hero{border-top:1px solid #e1e5ee;border-bottom:1px solid #e4e8f0;background:linear-gradient(#f8f8ff 25%,#eef3ff);text-align:center;padding:3.6vw 0 6.2vw}.institutional .hero>.pill{background:white;border:1px solid #dee4eb;font-size:.74em}.institutional .dot{width:.6em;height:.6em;background:#008563;border-radius:100%}.institutional .hero h1{max-width:1320px;width:70%;margin:2vw auto 1.5vw}.institutional .hero h1 em{font-style:normal;color:#00805b;border-bottom:2px solid #86bda8}.institutional .hero .intro{max-width:1000px;width:65%;margin:auto;font-size:1.05em;color:#6c6d78}
      .institutional .searchbox{max-width:1150px;width:60%;margin:1.8vw auto 0;background:white;border:1px solid #e0e5ed;border-radius:26px;padding:1.9vw;box-shadow:0 10px 15px #17283e16;text-align:left}.institutional .roles{display:flex;background:#eef3ff;padding:5px;border:1px solid #e0e7f5;border-radius:14px}.institutional .roles button{width:50%;border:0;border-radius:9px;padding:.8em .3em;font-size:.85em;font-weight:700;display:flex;align-items:center;justify-content:center;gap:.5em;background:transparent;color:#636770;cursor:pointer}.institutional .roles button.active{background:#fff;color:#21252c;box-shadow:0 2px 4px #17283e05}.institutional .searchfields{display:grid;grid-template-columns:1.2fr 1.2fr .8fr;gap:1vw;margin:1.7vw 0 1.2vw}.institutional .field{display:flex;align-items:center;gap:.7em;padding:1em .75em;border:1px solid #dce0e9;border-radius:14px;background:#f8f8fe;font-size:.86em}.institutional .field label{flex:1;min-width:0}.institutional .field small{display:block;font-size:.72em;font-weight:750;color:#78808e;letter-spacing:.05em}.institutional .field input{width:100%;border:0;outline:none;background:transparent;color:#293b50;font-size:1em}.institutional .radius{padding:.25em .5em;background:#e4ecfc;font-size:.8em;white-space:nowrap}.institutional .searchfields .btn{padding:.8em .6em;font-weight:500;box-shadow:0 4px 7px #003c231c}.institutional .suggestions{display:flex;gap:.65em;flex-wrap:wrap}.institutional .suggestions button{font-size:.72em;background:#eef3ff;color:#394559;border:0;padding:.3em .5em;border-radius:4px;cursor:pointer}
      .institutional .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1.8vw;width:70%;max-width:1344px;margin:3.8vw auto 0;text-align:left}.institutional .stat{display:flex;align-items:center;gap:1em;border:1px solid #e4e7ed;background:#ffffffcc;border-radius:16px;padding:1.4vw 1.2vw}.institutional .iconbox{display:grid;place-items:center;background:#e4edff;border-radius:12px;width:3em;height:3em;flex-shrink:0}.institutional .stat strong{display:block;font-size:1.85em;line-height:1.15;letter-spacing:-.035em}.institutional .stat p{font-size:.75em;color:#6e7480;line-height:1.35}
      .institutional .sectionhead{text-align:center}.institutional .sectionhead h2{margin:.85vw 0}.institutional .sectionhead p{color:#6e707a;font-size:1.04em;max-width:1200px;margin:auto}.institutional .workflow{padding:6vw 0}.institutional .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:1.8vw;margin-top:4.8vw}.institutional .step{padding:2vw 1.8vw;background:#f8f8fe;border:1px solid #e4e5ef;border-radius:16px;display:flex;flex-direction:column;min-height:24.3vw}.institutional .stephead{display:flex;align-items:center;justify-content:space-between;color:#00805b;margin-bottom:1.3vw}.institutional .number{display:grid;place-items:center;border-radius:100%;background:#17283e;color:#67deb1;font-size:.8em;font-weight:750;width:2.5em;height:2.5em}.institutional .step p{font-size:.82em;line-height:1.5;color:#737784;margin:.65em 0 2em}.institutional .stepfoot{display:flex;gap:.5em;align-items:center;margin-top:auto;border-top:1px solid #edf0f6;padding-top:1.1em;font-size:.65em;color:#188971;font-weight:650}
      .institutional .advantages{background:#f8f8fe;padding:6vw 0;border-block:1px solid #eff0f5}.institutional .benefits{display:grid;grid-template-columns:1fr 1fr;gap:2.5vw;margin-top:5vw}.institutional .benefit{background:white;border:1px solid #dfe3e9;border-radius:24px;padding:2.5vw;display:flex;flex-direction:column}.institutional .benefit.pro{border-color:#b5d8cc;background:radial-gradient(at top right,#edfff7,transparent 45%),white}.institutional .benefithead{display:flex;align-items:center;gap:1em;padding-bottom:2vw;border-bottom:1px solid #eef0f4}.institutional .benefithead>div:nth-child(2){flex:1}.institutional .benefithead h3{font-size:1.55em}.institutional .benefithead p{font-size:.76em;color:#737780;white-space:nowrap}.institutional .benefithead .pill{font-size:.62em;letter-spacing:0;white-space:nowrap}.institutional .pro .pill{background:#6ef4ba;color:#007c58}.institutional .pro .iconbox{background:#d0fbea;color:#00805b}.institutional .benefit ul{list-style:none;padding:0;margin:2vw 0 3vw}.institutional .benefit li{display:flex;align-items:flex-start;gap:.75em;margin-bottom:1.15em;font-size:.86em}.institutional .benefit li>svg{color:#00805b;fill:#00805b;stroke:#fff;margin-top:.1em}.institutional .benefit li strong{font-weight:700}.institutional .benefit li p{font-size:.94em;color:#757780;line-height:1.4}.institutional .benefit>.btn{width:100%;margin-top:auto}
      .institutional .security{padding:6vw 0}.institutional .securityhead{display:grid;grid-template-columns:1fr 1fr;gap:4vw;align-items:center}.institutional .securityhead .pill{background:#caf9e7;color:#008367}.institutional .securityhead h2{margin:1vw 0}.institutional .securityhead p{color:#6d727d;font-size:1em}.institutional .compliance{display:flex;gap:1.5vw;flex-wrap:wrap}.institutional .compliance span{display:flex;gap:.6em;align-items:center;border:1px solid #e1e4ef;border-radius:8px;padding:.7em 1em;font-size:.76em;font-weight:650;background:#f8f8fe}.institutional .compliance svg{color:#008064}
      .institutional .escrow{margin-top:5vw;background:#eef3ff;border:1px solid #dfe6f5;border-radius:24px;padding:2.5vw}.institutional .escrow>h3{display:flex;gap:.5em;align-items:center;font-size:1.2em}.institutional .escrow>h3 svg{color:#00805b}.institutional .financegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.8vw;margin-top:1.8vw}.institutional .financegrid article{background:white;border:1px solid #e4e7ee;border-radius:14px;padding:1.6vw}.institutional .financegrid small{color:#7b818c;font-size:.7em;font-weight:700}.institutional .financegrid h3{font-size:1.2em;margin:.2em 0 .5em}.institutional .financegrid p{font-size:.8em;color:#757b85;line-height:1.45}
      .institutional .testimonials{margin-top:5vw}.institutional .testimonials>h3{text-align:center;font-size:1.55em}.institutional .quotes{display:grid;grid-template-columns:1fr 1fr;gap:2.5vw;margin-top:2.5vw}.institutional .quote{background:#f8f8fe;border:1px solid #e1e5ef;border-radius:18px;padding:1.8vw}.institutional .quotehead{display:flex;align-items:center;gap:.8em}.institutional .avatar{width:3em;height:3em;border-radius:100%;background:#d4e9e2;display:grid;place-items:center;color:#006241;font-weight:700}.institutional .quotehead h3{font-size:1.14em}.institutional .quotehead p{color:#777e89;font-size:.76em}.institutional .stars{margin-left:auto;color:#ff9d00;font-size:1em;letter-spacing:-.1em}.institutional blockquote{margin:1.3em 0;font-style:italic;color:#737783;font-size:.88em;line-height:1.6}.institutional .quotefoot{display:flex;justify-content:space-between;gap:1em;border-top:1px solid #e9ecf2;padding-top:1em;font-size:.73em;color:#9095a0}.institutional .quotefoot strong{color:#00816a}
      .institutional .closing{padding:6vw 0;background:radial-gradient(at bottom right,#0e393c,transparent 45%),#141c2f;text-align:center;color:white}.institutional .closing .pill{background:#1b363d;color:#5bdcb1;border:1px solid #2e575c}.institutional .closing h2{width:75%;max-width:1450px;margin:1.5vw auto;font-size:clamp(30px,3.2vw,61px);line-height:1.12}.institutional .closing p{width:65%;max-width:1100px;margin:auto;color:#7c8496;font-size:1.03em}.institutional .closingactions{display:flex;justify-content:center;gap:1.2vw;margin:2.5vw auto}.institutional .outline{border:1px solid #546074;background:transparent}.institutional .closingnotes{display:flex;justify-content:center;gap:2.5vw;color:#8790a1;font-size:.75em}.institutional .closingnotes span{display:flex;gap:.5em;align-items:center}.institutional .closingnotes svg{color:#5dd9b4;width:1em}.institutional .spacer{height:9.8vw;background:#f8f8fe}.institutional footer{padding:3.8vw 0;background:#141c2f;color:#abb3c2}.institutional .footerrow{display:flex;justify-content:space-between;align-items:center;gap:3vw}.institutional footer .brand{color:white;font-size:1.1em}.institutional footer .brandmark{font-size:.7em;background:#00805b;color:#142c38;border-radius:5px}.institutional footer p{font-size:.76em;color:#798399;max-width:650px;margin-top:1em}.institutional .footerlinks{display:flex;gap:2vw;align-items:center;flex-wrap:wrap;font-size:.72em;color:#798399}.institutional .status{color:#59d7ac}
      @media(max-width:900px){.institutional .toplinks{display:none}.institutional .hero h1{width:92%}.institutional .hero .intro{width:85%}.institutional .searchbox{width:90%;padding:20px}.institutional .stats{width:90%}.institutional .steps{grid-template-columns:repeat(2,1fr)}.institutional .step{min-height:260px;padding:24px}.institutional .benefits{grid-template-columns:1fr}.institutional .benefit{padding:28px}.institutional .securityhead{grid-template-columns:1fr}.institutional .footerrow{align-items:flex-start;flex-direction:column}.institutional .closingnotes{flex-wrap:wrap}.institutional .hero,.institutional .workflow,.institutional .advantages,.institutional .security,.institutional .closing{padding:55px 0}}
      @media(max-width:560px){.institutional .topactions{gap:10px}.institutional .topbar{gap:10px}.institutional .searchfields{grid-template-columns:1fr;margin:16px 0}.institutional .searchfields .btn{padding:15px}.institutional .roles button{font-size:12px}.institutional .stats,.institutional .steps,.institutional .financegrid,.institutional .quotes{grid-template-columns:1fr;gap:16px}.institutional .stat{padding:18px}.institutional .stats{margin-top:24px}.institutional .benefithead{flex-wrap:wrap}.institutional .benefithead p{white-space:normal}.institutional .escrow{padding:22px;margin-top:35px}.institutional .financegrid article,.institutional .quote{padding:22px}.institutional .closing h2,.institutional .closing p{width:90%}.institutional .closingactions{flex-direction:column;width:90%;gap:12px;margin:24px auto}.institutional .sectionhead p{padding:0 12px}.institutional .topactions>a:first-child{display:none}.institutional .hero>.pill{font-size:10px}.institutional .quotes{margin-top:20px}.institutional .testimonials{margin-top:40px}}
    `}</style>
    <header><div className="wrap topbar">
      <Link href={rotas.landing} className="brand"><span className="brandmark"><LocateFixed/></span><span><b>KineticDispatch <ShieldCheck/></b><small>DESPACHO CONFIÁVEL</small></span></Link>
      <nav className="toplinks"><a href="#como-funciona">Como Funciona</a><a href="#profissionais">Para Profissionais</a><a href="#contratantes">Para Contratantes</a><a href="#seguranca">Segurança & Escrow <span className="pill" style={{background:"#80f2c0",color:"#007854",letterSpacing:0}}>PIX 100%</span></a></nav>
      <div className="topactions"><Link href={rotas.entrar}><Lock/> Entrar</Link><Link className="btn black" href={rotas.entrar}>Cadastrar <ArrowRight/></Link></div>
    </div></header>
    <main>
      <section className="hero">
        <span className="pill"><span className="dot"/>⚡ O Uber da Mão de Obra e Serviços Locais em Tempo Real <span className="green">⌁ Raio Dinâmico</span></span>
        <h1>Conecte-se com profissionais qualificados ou encontre serviços no seu raio <em>em minutos</em></h1>
        <p className="intro">Do socorro emergencial à diária presencial em eventos e obras. Segurança garantida<br/> com retenção em Escrow e validação presencial via QR Code ou laudo com fotos.</p>
        <div className="searchbox">
          <div className="roles"><button className={role==="contratar"?"active":""} onClick={()=>setRole("contratar")}><User/>Preciso Contratar Alguém</button><button className={role==="oferecer"?"active":""} onClick={()=>setRole("oferecer")}><Wrench/>Quero Oferecer meus Serviços</button></div>
          <div className="searchfields"><div className="field"><Wrench/><label><small>QUAL SERVIÇO?</small><input aria-label="Qual serviço?" value={service} onChange={e=>setService(e.target.value)}/></label></div><div className="field"><MapPin className="green"/><label><small>LOCALIDADE / RAIO</small><input aria-label="Localidade" defaultValue="Setor Bueno"/></label><span className="radius">5 km</span></div><Link href={role==="contratar"?rotas.radar:rotas.publicar} className="btn"><LocateFixed/>Disparar Radar</Link></div>
          <div className="suggestions">{["Eletricista Urgente (2 disp.)","Garçom para Evento (Hoje 18h)","Encanador Caça-Vazamento"].map(t=><button key={t} onClick={()=>setService(t)}><span className="green">ϟ</span> {t}</button>)}</div>
        </div>
        <div className="stats"><div className="stat"><span className="iconbox"><CheckCircle2/></span><div><strong>+45.000</strong><p>Serviços executados com<br/> sucesso</p></div></div><div className="stat"><span className="iconbox green"><CheckCircle2/></span><div><strong>99.2%</strong><p>Índice de satisfação apurado</p></div></div><div className="stat"><span className="iconbox green" style={{background:"#bff9e4"}}><ShieldCheck/></span><div><strong className="green">R$ 0 Fraude</strong><p>Blindagem via Custódia Escrow<br/> PIX</p></div></div></div>
      </section>
      <section className="workflow" id="como-funciona"><div className="wrap"><div className="sectionhead"><span className="pill"><SlidersHorizontal/>WORKFLOW DE ALTA PRECISÃO</span><h2>Como o KineticDispatch Funciona</h2><p>Arquitetura bilateral desenhada para velocidade instantânea sem abrir mão do controle financeiro e<br/> técnico estrito.</p></div><div className="steps">{steps.map(([title,desc,foot,Icon],i)=><article className="step" key={title}><div className="stephead"><span className="number">0{i+1}</span><Icon/></div><h3>{title}</h3><p>{desc}</p><div className="stepfoot"><Icon/>{foot}</div></article>)}</div></div></section>
      <section className="advantages"><div className="wrap"><div className="sectionhead"><span className="pill"><Sparkles/>ECOSSISTEMA INTEGRADO</span><h2>Vantagens Claras para Ambos os Lados</h2><p>Projetado para eliminar a assimetria de informações e os riscos financeiros em serviços presenciais.</p></div><div className="benefits">{benefits.map(b=><article id={b.pro?"profissionais":"contratantes"} className={"benefit"+(b.pro?" pro":"")} key={b.title}><div className="benefithead"><span className="iconbox"><b.icon/></span><div><h3>{b.title}</h3><p>{b.subtitle}</p></div><span className="pill">{b.badge}</span></div><ul>{b.items.map(([title,desc])=><li key={title}><CheckCircle2/><div><strong>{title}</strong><p>{desc}</p></div></li>)}</ul><Link href={rotas.entrar} className={"btn"+(b.pro?"":" black")}>{b.pro?"Credenciar Meu Perfil Pro":"Contratar Especialista Agora"}{b.pro?<User/>:<ArrowRight/>}</Link></article>)}</div></div></section>
      <section className="security" id="seguranca"><div className="wrap"><div className="securityhead"><div><span className="pill"><Lock/>COMPLIANCE NÍVEL BANCÁRIO</span><h2>Segurança Institucional & Custódia Escrow PIX</h2><p>Desenvolvemos a mais rígida barreira antifraude do mercado de prestação de serviços presenciais no Brasil, protegida por auditoria de ponta.</p></div><div className="compliance"><span><ShieldCheck/>100% Adequado à LGPD</span><span><Fingerprint/>Biometria 2FA Obrigatória</span><span><Wrench/>Mediação Arbitral Rápida</span></div></div>
      <div className="escrow"><h3><Wallet/>Como funciona a Blindagem do Escrow Financeiro</h3><div className="financegrid">{[["Retenção Provisória","Ao contratar, o valor é debitado via PIX e guardado em conta escrow segregada, regulada pelas diretrizes do Banco Central."],["Bloqueio Protetivo","Nenhuma parte pode cancelar unilateralmente após início presencial sem acionar a triagem de mediação fotográfica."],["Liberação Automatizada","Check-out autenticado pelo contratante dispara imediatamente o repasse líquido sem retenções indevidas."]].map(([t,d],i)=><article key={t}><small>PASSO FINANCEIRO {i+1}</small><h3>{t}</h3><p>{d}</p></article>)}</div></div>
      <div className="testimonials"><h3>Relatos Reais de Quem Usa e Confia</h3><div className="quotes">{[
        ["CV","Dra. Camila Vasconcelos","Gestora Predial no Setor Marista","Precisei de eletricista industrial com urgência em um sábado à noite para religar o quadro de bombas de um condomínio comercial. Em 12 minutos o profissional chegou, e o laudo fotográfico antes/depois no app nos deu total tranquilidade para liberar o PIX.","Serviço: Quadro de Força Trifásico","Verificado via Laudo NBR"],
        ["RM","Roberto Mendes","Técnico em Climatização & Elétrica","O que mudou minha vida foi saber que o dinheiro do cliente já está reservado pelo aplicativo antes mesmo de eu abastecer o carro para ir até o local. Terminei o serviço, escaneei o QR Code e o PIX caiu na hora na minha conta Nubank.","+240 serviços concluídos no raio de Goiânia","Pro Certificado 5.0 ★"]
      ].map(([initial,name,title,quote,foot,badge])=><article className="quote" key={name}><div className="quotehead"><span className="avatar">{initial}</span><div><h3>{name}</h3><p>{title}</p></div><span className="stars">★★★★★</span></div><blockquote>“{quote}”</blockquote><div className="quotefoot"><span>{foot}</span><strong>{badge}</strong></div></article>)}</div></div>
      </div></section>
      <section className="closing"><span className="pill"><Zap/>DESPACHO CONFIÁVEL EM TEMPO REAL</span><h2>Pronto para modernizar como você contrata ou trabalha?</h2><p>Crie sua conta em 60 segundos. Experimente a segurança de transacionar mão de obra<br/> com garantia bancária e suporte técnico operacional 24 horas por dia.</p><div className="closingactions"><Link className="btn" href={rotas.entrar}>Começar Agora Gratuitamente <ArrowRight/></Link><Link className="btn outline" href={rotas.radar}><Eye/>Ver Demonstração ao Vivo</Link></div><div className="closingnotes">{["Sem mensalidade fixa","Cancelamento flexível","Suporte humanizado 24/7"].map(t=><span key={t}><Check/>{t}</span>)}</div></section>
      <div className="spacer"/>
    </main>
    <footer><div className="wrap footerrow"><div><Link href={rotas.landing} className="brand"><span className="brandmark"><LocateFixed/></span>KineticDispatch</Link><p>© 2025 KineticDispatch Inc. Todos os direitos reservados. Pagamentos<br/> seguros via custódia transacional Escrow.</p></div><div className="footerlinks"><a href="#seguranca">Termos de Serviço</a><a href="#seguranca">Privacidade & LGPD</a><a href="#seguranca">Auditoria & Compliance</a><Link href={rotas.oportunidades}>Suporte Operacional 24/7</Link><span className="status">● Status do Sistema</span></div></div></footer>
  </div>;
}


function Login() {
  const router = useRouter();
  const [role,setRole]=useState("contratante");
  const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false);
  const [notice,setNotice]=useState("");
  function enter(){setLoading(true);setTimeout(()=>router.push(rotas.radar),450)}
  return <div className="secure-login">
    <style>{`
      .secure-login{font-family:Arial,Helvetica,sans-serif;color:#14263b;background:#f8f8ff;font-size:clamp(14px,1.15vw,22px);line-height:1.5}
      .secure-login *{box-sizing:border-box}.secure-login h1,.secure-login h2,.secure-login h3,.secure-login p{margin:0}.secure-login button,.secure-login input,.secure-login a{font:inherit}.secure-login button,.secure-login a{cursor:pointer}.secure-login a{text-decoration:none}.secure-login svg{width:1.3em;height:1.3em;flex-shrink:0}
      .secure-login .sl-header{height:6.35vw;min-height:84px;background:white;display:flex;justify-content:space-between;align-items:center;padding:0 2.6vw;border-bottom:1px solid #e3e5ed;gap:20px}.secure-login .sl-brandgroup,.secure-login .sl-brand,.secure-login .sl-back,.secure-login .sl-create{display:flex;align-items:center}.secure-login .sl-brand{font-size:1.4em;font-weight:750;letter-spacing:-.04em;gap:.6em}.secure-login .sl-logo{display:grid;place-items:center;width:2em;height:2em;background:#141d30;color:#65f8c4;border-radius:12px}.secure-login .sl-logo svg{width:1.2em;height:1.2em}.secure-login .sl-back{margin-left:1.8em;padding-left:1.6em;border-left:1px solid #e1e3ea;color:#5e616b;gap:.5em}.secure-login .sl-back svg{transform:rotate(180deg)}.secure-login .sl-create{gap:1.3em;font-size:.9em;color:#656571}.secure-login .sl-create button{background:white;border:1px solid #c7c9d4;border-radius:12px;padding:.6em 1.2em;color:#14263b;font-size:1.1em;font-weight:700}
      .secure-login .sl-grid{display:grid;grid-template-columns:41.666% 58.334%;min-height:73.9vw}.secure-login .sl-aside{position:relative;overflow:hidden;background:#141c2f;color:#fff;padding:4.4vw 4.4vw 4.2vw}.secure-login .sl-orbit{position:absolute;border:1px solid #28514e;border-radius:50%;width:30vw;height:30vw;right:-11.3vw;top:-11.3vw;pointer-events:none}.secure-login .sl-orbit.two{width:18vw;height:23vw;top:-9vw;right:.6vw;opacity:.5}.secure-login .sl-glow{position:absolute;top:0;left:0;width:2.8vw;height:4.7vw;border-radius:50%;background:#1c3a42;opacity:.55}.secure-login .sl-aside>*:not(.sl-orbit):not(.sl-glow){position:relative}.secure-login .sl-live{display:inline-flex;align-items:center;gap:.65em;border:1px solid #326b62;border-radius:40px;color:#66f3bf;padding:.35em .9em;font-size:.88em;font-weight:650;letter-spacing:.025em}.secure-login .sl-dot{width:.6em;height:.6em;border-radius:50%;background:#66f3bf}.secure-login .sl-aside h1{font-size:clamp(30px,2.55vw,49px);line-height:1.2;letter-spacing:-.04em;font-weight:750;margin:2.7vw 0 1vw}.secure-login .sl-lead{color:#80899e;font-size:1.04em;line-height:1.55}.secure-login .sl-benefits{display:grid;gap:1.2vw;margin-top:3.2vw}.secure-login .sl-card{display:flex;align-items:flex-start;gap:1.2em;padding:1.25vw;border:1px solid #404a5c;background:linear-gradient(115deg,#1b2939,#1b2538);border-radius:20px;min-height:7.2vw}.secure-login .sl-icon{display:grid;place-items:center;width:2.8em;height:2.8em;flex-shrink:0;background:#103e3e;border-radius:14px;color:#65f7c2}.secure-login .sl-card h3{font-size:1.04em;font-weight:650;margin:0 0 .1em}.secure-login .sl-card p{font-size:.92em;line-height:1.4;color:#80899e}.secure-login .sl-review-wrap{margin-top:2.6vw;padding-top:2.5vw;border-top:1px solid #3b4355}.secure-login .sl-review{background:#1d2a3e;border:1px solid #455065;border-radius:20px;padding:1.5vw}.secure-login .sl-review-head{display:flex;align-items:center;gap:.8em}.secure-login .sl-avatar{display:grid;place-items:center;background:#00805d;border-radius:100%;width:2.8em;height:2.8em;font-weight:650;flex-shrink:0}.secure-login .sl-review h3{font-weight:650;font-size:1.03em}.secure-login .sl-review p{color:#80899e;font-size:.88em}.secure-login .sl-level{margin-left:auto;display:flex;align-items:center;gap:.3em;background:#294e54;border:1px solid #458f83;border-radius:40px;padding:.4em .7em;font-size:.76em;font-weight:650;line-height:1.3;color:#65edbc}.secure-login .sl-review blockquote{margin:1em 0 0;color:#80899e;font-size:.94em;font-style:italic;line-height:1.45}
      .secure-login .sl-main{padding:7.1vw 6.6vw 5vw}.secure-login .sl-main h2{font-size:clamp(32px,2.65vw,51px);font-weight:750;line-height:1.2;letter-spacing:-.035em}.secure-login .sl-subtitle{color:#646570;font-size:1.04em;margin-top:.45em}.secure-login .sl-roles{display:flex;padding:.45em;border:1px solid #d8deeb;border-radius:20px;background:#eef3ff;margin-top:2.5vw}.secure-login .sl-roles button{width:50%;display:flex;align-items:center;justify-content:center;gap:.5em;padding:.65em .2em;border:0;border-radius:14px;background:transparent;color:#565964;font-weight:650}.secure-login .sl-roles button.active{background:white;color:#14263b;box-shadow:0 2px 3px #15263c05}.secure-login .sl-social{display:grid;grid-template-columns:1fr 1fr;gap:.9vw;margin-top:2.5vw}.secure-login .sl-social button{display:flex;justify-content:center;align-items:center;gap:.8em;border:1px solid #d4d5de;background:white;border-radius:12px;padding:.75em .4em;color:#14263b;font-weight:650;min-height:3.4vw}.secure-login .sl-social .sl-gov{grid-column:1/-1}.secure-login .sl-gov small{font-weight:400;color:#656570;font-size:.87em}.secure-login .sl-br{display:grid;place-items:center;background:#14263b;color:#60f3b7;border-radius:5px;width:1.6em;height:1.6em;font-size:.85em}.secure-login .sl-google{font-weight:800;font-size:1.3em;background:conic-gradient(#4285f4 0 90deg,#34a853 90deg 180deg,#fbbc05 180deg 230deg,#ea4335 230deg 300deg,#4285f4 300deg);color:transparent;background-clip:text}.secure-login .sl-apple{width:1.2em;height:1.2em;fill:#14263b}.secure-login .sl-divider{display:flex;align-items:center;gap:1.2em;color:#686975;font-size:.9em;margin:1.8vw 0}.secure-login .sl-divider:before,.secure-login .sl-divider:after{content:"";height:1px;background:#e0e3ec;flex:1}
      .secure-login .sl-label{display:block;font-size:.9em;font-weight:650;letter-spacing:.01em}.secure-login .sl-field{display:flex;align-items:center;gap:1em;background:white;border:1px solid #c7cbd5;border-radius:10px;margin:.35em 0 1.2em;padding:.75em .8em;color:#83858d}.secure-login .sl-field input{min-width:0;width:100%;background:transparent;border:0;outline:0;color:#14263b;font-size:1.04em}.secure-login .sl-field input::placeholder{color:#898b93;opacity:1}.secure-login .sl-field:focus-within{outline:2px solid #00805b;outline-offset:2px}.secure-login .sl-field button{display:grid;place-items:center;padding:0;border:0;background:transparent;color:#85868d}.secure-login .sl-labelrow{display:flex;align-items:center;justify-content:space-between;gap:1em}.secure-login .sl-forgot{border:0;background:transparent;color:#007c57;font-size:.9em;font-weight:550;padding:0}.secure-login .sl-remember{display:flex;justify-content:space-between;align-items:center;gap:1em;margin:1.25em 0 1.6em;color:#666772;font-size:.9em}.secure-login .sl-remember label{display:flex;align-items:center;gap:.6em}.secure-login .sl-remember input{width:1.2em;height:1.2em;accent-color:#00805b}.secure-login .sl-audit{display:flex;align-items:center;gap:.25em;color:#007c57;font-weight:700;font-size:.86em;white-space:nowrap}.secure-login .sl-submit{display:flex;align-items:center;justify-content:center;gap:.7em;width:100%;background:#000;color:white;border:0;border-radius:12px;padding:1em;font-weight:650}.secure-login .sl-submit:disabled{opacity:.6}.secure-login .sl-passkey{display:flex;align-items:center;justify-content:center;gap:.6em;width:100%;border:1.5px dashed #797d89;background:white;border-radius:12px;padding:.8em .3em;margin-top:3vw;font-weight:650;color:#14263b}.secure-login .sl-passkey svg{color:#00805b}.secure-login .sl-footer{display:flex;justify-content:space-between;align-items:center;gap:1em;border-top:1px solid #e1e4ed;padding-top:1.8vw;margin-top:2.5vw;color:#676976;font-size:.9em}.secure-login .sl-encryption{display:flex;align-items:center;gap:.4em}.secure-login .sl-encryption svg{color:#00805b}.secure-login .sl-footlinks{display:flex;align-items:center;gap:1.3em;white-space:nowrap}.secure-login .sl-footlinks button{border:0;background:transparent;padding:0;color:inherit}.secure-login .sl-footlinks span{color:#c9ccd5}.secure-login .sl-notice{border:1px solid #b6d9cd;background:#eaf8f2;color:#006241;border-radius:10px;padding:.8em;margin-top:1em;font-size:.85em}.secure-login button:focus-visible,.secure-login a:focus-visible{outline:3px solid #00a879;outline-offset:4px}
      @media(max-width:1000px){.secure-login .sl-grid{grid-template-columns:40% 60%}.secure-login .sl-aside{padding:35px 25px}.secure-login .sl-main{padding:50px 30px}.secure-login .sl-aside h1{font-size:30px}.secure-login .sl-card{padding:16px;gap:12px}.secure-login .sl-review{padding:18px}.secure-login .sl-review-head{flex-wrap:wrap}.secure-login .sl-level{margin-left:0}.secure-login .sl-footer{flex-wrap:wrap}.secure-login .sl-roles button{font-size:12px}.secure-login .sl-social .sl-gov{flex-wrap:wrap;gap:8px}.secure-login .sl-back{font-size:14px;margin-left:15px;padding-left:15px}.secure-login .sl-create>span{display:none}}
      @media(max-width:700px){.secure-login .sl-header{padding:15px 20px;min-height:76px;height:auto}.secure-login .sl-brand{font-size:18px}.secure-login .sl-back{font-size:0;border:0;margin-left:12px;padding:0}.secure-login .sl-back svg{font-size:20px}.secure-login .sl-create button{font-size:13px;padding:8px}.secure-login .sl-grid{display:flex;flex-direction:column}.secure-login .sl-main{order:0;padding:40px 22px}.secure-login .sl-aside{order:1;padding:40px 24px}.secure-login .sl-roles{margin-top:28px}.secure-login .sl-roles button{padding:10px 4px}.secure-login .sl-social{margin-top:24px;gap:10px}.secure-login .sl-social button{font-size:13px;padding:14px 8px}.secure-login .sl-divider{margin:24px 0}.secure-login .sl-remember{font-size:12px}.secure-login .sl-passkey{margin-top:28px;padding:14px;font-size:13px}.secure-login .sl-footer{margin-top:30px;padding-top:22px;font-size:12px}.secure-login .sl-benefits{margin-top:28px;gap:16px}.secure-login .sl-aside h1{margin:26px 0 14px}.secure-login .sl-review-wrap{margin-top:28px;padding-top:28px}.secure-login .sl-orbit{width:350px;height:350px;right:-150px;top:-180px}}
    `}</style>
    <header className="sl-header"><div className="sl-brandgroup"><Link href={rotas.landing} className="sl-brand"><span className="sl-logo"><Zap/></span>KineticDispatch</Link><Link href={rotas.landing} className="sl-back"><ArrowRight/>Voltar para o Início</Link></div><div className="sl-create"><span>Ainda não tem conta?</span><button onClick={()=>setNotice("Criação de conta demonstrativa: escolha seu perfil e entre para explorar a prévia.")}>Criar Conta</button></div></header>
    <div className="sl-grid">
      <aside className="sl-aside"><div className="sl-orbit"/><div className="sl-orbit two"/><div className="sl-glow"/>
        <div className="sl-live"><span className="sl-dot"/>Rede Operacional Ativa • Latência &lt; 14ms</div>
        <h1>Sua plataforma segura para serviços e mão de obra local sob demanda.</h1>
        <p className="sl-lead">Conectamos prestadores verificados com contratantes corporativos e residenciais em tempo real com garantia de pagamento.</p>
        <div className="sl-benefits">{[[ShieldCheck,"Custódia Escrow Garantida","Pagamentos 100% protegidos e liquidados após validação técnica ou presencial."],[Fingerprint,"Autenticação Biométrica & 2FA","Verificação de identidade com cartório digital e auditoria em tempo real."],[ArrowRight,"Perfil Híbrido Unificado","Alterne instantaneamente entre Contratante e Prestador com as mesmas credenciais."]].map(([Icon,title,desc])=>{const I=Icon as typeof ShieldCheck;return <article className="sl-card" key={String(title)}><span className="sl-icon"><I/></span><div><h3>{String(title)}</h3><p>{String(desc)}</p></div></article>})}</div>
        <div className="sl-review-wrap"><article className="sl-review"><div className="sl-review-head"><span className="sl-avatar">RC</span><div><h3>Rodrigo Castilho</h3><p>Eletricista Industrial • Goiânia, GO</p></div><span className="sl-level"><ShieldCheck/>Nível 4 Verificado</span></div><blockquote>“Receber através da custódia Escrow eliminou qualquer risco de inadimplência. As ordens chegam com rota otimizada e o repasse cai na conta no mesmo instante da validação.”</blockquote></article></div>
      </aside>
      <main className="sl-main"><h2>Bem-vindo de volta</h2><p className="sl-subtitle">Acesse o radar de chamados, propostas e gestão financeira.</p>
        <div className="sl-roles"><button className={role==="contratante"?"active":""} aria-pressed={role==="contratante"} onClick={()=>setRole("contratante")}><Briefcase/>Sou Contratante / Empresa</button><button className={role==="profissional"?"active":""} aria-pressed={role==="profissional"} onClick={()=>setRole("profissional")}><Wrench/>Sou Profissional Autônomo</button></div>
        <div className="sl-social"><button onClick={enter}><span className="sl-google">G</span>Continuar com Google</button><button onClick={enter}><svg viewBox="0 0 24 24" className="sl-apple" aria-hidden="true"><path d="M17.2 12.6c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 7 1.2 9.2.7 1.1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.9-.7s1.8.7 2.9.7c1.2 0 1.9-1 2.6-2.1.9-1.2 1.3-2.5 1.3-2.6-.1 0-2.4-.9-2.4-4.1ZM15 6.5c.6-.8 1.1-1.9 1-3-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.7-1.3Z"/></svg>Continuar com Apple</button><button className="sl-gov" onClick={enter}><span className="sl-br">BR</span><span>Entrar com Gov.br <small>(Validação Oficial Nível Prata/Ouro)</small></span></button></div>
        <div className="sl-divider">ou com e-mail corporativo / CPF</div>
        <form onSubmit={e=>{e.preventDefault();enter()}}>
          <label className="sl-label" htmlFor="preview-email">E-mail ou CPF/CNPJ</label><div className="sl-field"><User/><input id="preview-email" autoComplete="username" required placeholder="nome@empresa.com.br ou 000.000.000-00"/></div>
          <div className="sl-labelrow"><label className="sl-label" htmlFor="preview-password">Senha de Acesso</label><button type="button" className="sl-forgot" onClick={()=>setNotice("Recuperação de senha demonstrativa. Nesta prévia, preencha os campos para testar o acesso.")}>Esqueceu sua senha?</button></div>
          <div className="sl-field"><Lock/><input id="preview-password" type={showPassword?"text":"password"} autoComplete="current-password" required placeholder="Digite sua chave de segurança"/><button type="button" aria-label={showPassword?"Ocultar senha":"Mostrar senha"} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff/>:<Eye/>}</button></div>
          <div className="sl-remember"><label><input type="checkbox"/>Manter conectado neste computador</label><span className="sl-audit"><ShieldCheck/>Sessão Auditada</span></div>
          <button className="sl-submit" disabled={loading}>{loading?"Entrando…":"Entrar na Plataforma"}<ArrowRight/></button>
        </form>
        <button className="sl-passkey" onClick={enter}><Fingerprint/>Acessar via Chave de Segurança ou Biometria (Passkey / WebAuthn)</button>
        {notice&&<div className="sl-notice" role="status">{notice}</div>}
        <footer className="sl-footer"><span className="sl-encryption"><Lock/>Criptografia SSL de 256 bits ponta a ponta</span><div className="sl-footlinks"><Link href={rotas.oportunidades}>Suporte 24/7</Link><span>•</span><button onClick={()=>setNotice("Tela demonstrativa. Os termos de uso serão disponibilizados na versão funcional.")}>Termos de Uso</button></div></footer>
      </main>
    </div>
  </div>;
}

const oportunidades = [
  { id: 1, title: "Troca de disjuntor e revisão", category: "Eletricista", place: "Setor Bueno", distance: "1,8 km", price: "R$ 280–380", urgent: true, icon: Zap },
  { id: 2, title: "Reparo em muro lateral", category: "Pedreiro", place: "Jardim Goiás", distance: "3,2 km", price: "R$ 450–650", urgent: false, icon: Hammer },
  { id: 3, title: "Montagem de armário", category: "Montador", place: "Marista", distance: "4,1 km", price: "R$ 180–250", urgent: false, icon: Wrench },
  { id: 4, title: "Faxina pós-obra", category: "Diarista", place: "Nova Suíça", distance: "5,4 km", price: "R$ 220–300", urgent: true, icon: Sparkles },
];

function MapPanel({ selected, setSelected }: { selected: number; setSelected: (id:number)=>void }) {
  const pins = [{id:1,x:"27%",y:"34%"},{id:2,x:"58%",y:"24%"},{id:3,x:"68%",y:"61%"},{id:4,x:"38%",y:"72%"}];
  return (
    <div className="relative min-h-[580px] overflow-hidden rounded-[24px] border border-[#dce2de] bg-[#d4e9e2]">
      <div className="absolute inset-0 [background-image:linear-gradient(26deg,transparent_45%,rgba(255,255,255,.92)_46%,rgba(255,255,255,.92)_49%,transparent_50%),linear-gradient(115deg,transparent_38%,rgba(255,255,255,.9)_39%,rgba(255,255,255,.9)_43%,transparent_44%)] [background-size:190px_160px,240px_220px]"/>
      <div className="absolute left-4 top-4 flex gap-2"><button type="button" className="flex items-center gap-2 rounded-xl border border-[#d6ddd8] bg-white px-3 py-2 text-xs font-black shadow-sm"><LocateFixed className="size-4"/>Minha localização</button></div>
      {pins.map((p)=><button type="button" key={p.id} onClick={()=>setSelected(p.id)} style={{left:p.x,top:p.y}} className={cx("absolute grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white shadow-lg transition", selected===p.id?"scale-110 bg-[#006241] text-[#d4e9e2]":"bg-[#d4e9e2] text-[#111111]")} aria-label={`Selecionar oportunidade ${p.id}`}><MapPin className="size-5"/></button>)}
      <div className="absolute bottom-4 left-4 rounded-xl border border-[#d6ddd8] bg-white px-3 py-2 text-[10px] font-bold text-[#737d76] shadow-sm">Área simulada do Radar · Goiânia</div>
      <div className="absolute bottom-4 right-4 grid overflow-hidden rounded-xl border border-[#d6ddd8] bg-white shadow-sm"><button type="button" className="size-9 border-b border-[#e3e7e4] text-lg font-bold">+</button><button type="button" className="size-9 text-lg font-bold">−</button></div>
    </div>
  );
}

function Radar() {
  const router = useRouter();
  const [selected, setSelected] = useState(1);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const item = oportunidades.find((o)=>o.id===selected) ?? oportunidades[0];
  const visible = oportunidades.filter((o)=>(category==="Todos"||o.category===category) && o.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]"><AppHeader active="radar"/>
      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#006241]">Radar local</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">Encontre o que está acontecendo perto de você.</h1></div><button onClick={()=>router.push(rotas.publicar)} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#006241] px-4 text-sm font-black text-white"><Plus className="size-4"/>Nova publicação</button></div>
        <div className="mt-5 flex flex-wrap gap-2">{["Todos","Eletricista","Pedreiro","Montador","Diarista"].map(c=><button type="button" onClick={()=>setCategory(c)} key={c} className={cx("rounded-full border px-4 py-2 text-xs font-black",category===c?"border-[#111111] bg-[#006241] text-white":"border-[#d9dfdb] bg-white text-[#68716b]")}>{c}</button>)}</div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_430px]">
          <MapPanel selected={selected} setSelected={setSelected}/>
          <section className="min-w-0">
            <div className="flex gap-2"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b938e]"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar serviço ou profissional" className="w-full rounded-xl border border-[#dce2de] bg-white py-3 pl-10 pr-3 text-base outline-none"/></label><button type="button" className="grid size-12 place-items-center rounded-xl border border-[#dce2de] bg-white"><SlidersHorizontal className="size-4"/></button></div>
            <div className="mt-3 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[.12em] text-[#848d87]">{visible.length} oportunidades</p><button type="button" className="text-xs font-black">Mais próximas ▾</button></div>
            <div className="mt-3 space-y-3">{visible.map(o=>{const I=o.icon;return <button type="button" key={o.id} onClick={()=>setSelected(o.id)} className={cx("w-full rounded-[20px] border bg-white p-4 text-left transition",selected===o.id?"border-[#006241] shadow-[0_10px_30px_rgba(41,55,45,.08)]":"border-[#dfe4e0] hover:border-[#bdc6bf]")}><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#d4e9e2]"><I className="size-5"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[.1em] text-[#78817b]">{o.category}</span>{o.urgent&&<span className="rounded-full bg-[#fff0e8] px-2 py-1 text-[9px] font-black uppercase text-[#c74d13]">urgente</span>}</div><h2 className="mt-1 font-black leading-tight">{o.title}</h2><p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#79827c]"><span className="flex items-center gap-1"><MapPin className="size-3"/>{o.place}</span><span>{o.distance}</span></p><div className="mt-3 flex items-center justify-between"><strong className="text-sm">{o.price}</strong><span className="text-xs font-black">Ver detalhes →</span></div></div></div></button>})}</div>
            <button type="button" onClick={()=>router.push(`${rotas.oportunidades}?vaga=${item.id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4e9e2] px-4 py-3.5 text-sm font-black">Abrir oportunidade selecionada <ChevronRight className="size-4"/></button>
          </section>
        </div>
      </main>
    </div>
  );
}

function Publicar() {
  const router = useRouter();
  const [kind,setKind]=useState<"contratar"|"disponivel">("contratar");
  const [radius,setRadius]=useState(10);
  const [urgent,setUrgent]=useState(true);
  const [submitted,setSubmitted]=useState(false);
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]"><AppHeader active="publicar"/>
      <main className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6">
        <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.16em] text-[#006241]">Publicação bilateral</p><h1 className="mt-2 text-4xl font-black tracking-[-.045em]">Publique uma necessidade ou sua disponibilidade.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#737c76]">A mesma estrutura atende quem quer contratar e quem está procurando trabalho.</p></div>
        {submitted ? <div className="rounded-[28px] border border-[#dbe2dd] bg-white p-10 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-[#d4e9e2]"><CheckCircle2 className="size-7 text-[#006241]"/></span><h2 className="mt-5 text-2xl font-black">Publicação pronta para o Radar</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#737c76]">Nesta prévia a publicação é simulada. O fluxo visual e a navegação já podem ser testados.</p><div className="mt-6 flex justify-center gap-2"><button onClick={()=>router.push(rotas.radar)} className="rounded-xl bg-[#006241] px-5 py-3 text-sm font-black text-white">Ver no Radar</button><button onClick={()=>setSubmitted(false)} className="rounded-xl border border-[#dce2de] px-5 py-3 text-sm font-black">Criar outra</button></div></div> :
        <form onSubmit={(e)=>{e.preventDefault();setSubmitted(true)}} className="space-y-4">
          <section className="rounded-[24px] border border-[#dde3df] bg-white p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">1 · Tipo de publicação</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setKind("contratar")} className={cx("rounded-2xl border p-5 text-left",kind==="contratar"?"border-[#006241] bg-[#d4e9e2]":"border-[#dfe4e0]")}><Briefcase className="size-5"/><strong className="mt-6 block text-lg">Preciso contratar</strong><span className="mt-1 block text-sm text-[#737c76]">Publique uma vaga ou necessidade.</span></button><button type="button" onClick={()=>setKind("disponivel")} className={cx("rounded-2xl border p-5 text-left",kind==="disponivel"?"border-[#006241] bg-[#d4e9e2]":"border-[#dfe4e0]")}><User className="size-5"/><strong className="mt-6 block text-lg">Estou disponível</strong><span className="mt-1 block text-sm text-[#737c76]">Mostre quando e onde você pode atender.</span></button></div></section>
          <section className="rounded-[24px] border border-[#dde3df] bg-white p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">2 · Serviço</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-black">Categoria<select className="mt-2 w-full rounded-xl border border-[#dce2de] bg-white px-3 py-3.5 text-base"><option>Eletricista</option><option>Pedreiro</option><option>Diarista</option><option>Montador</option><option>Encanador</option></select></label><label className="text-xs font-black">Título<input defaultValue={kind==="contratar"?"Troca de disjuntor e revisão":"Eletricista disponível hoje"} className="mt-2 w-full rounded-xl border border-[#dce2de] px-3 py-3.5 text-base"/></label></div></section>
          <section className="rounded-[24px] border border-[#dde3df] bg-white p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">3 · Localização & raio</p><div className="mt-4 grid gap-5 md:grid-cols-[1fr_.8fr]"><label className="text-xs font-black">Bairro ou referência<div className="relative mt-2"><MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#828b85]"/><input defaultValue="Setor Bueno, Goiânia" className="w-full rounded-xl border border-[#dce2de] py-3.5 pl-10 pr-3 text-base"/></div></label><div><div className="flex justify-between text-xs font-black"><span>Raio de alcance</span><span>{radius} km</span></div><input aria-label="Raio" type="range" min="2" max="50" step="1" value={radius} onChange={(e)=>setRadius(Number(e.target.value))} className="mt-4 w-full accent-[#111111]"/><div className="mt-1 flex justify-between text-[10px] text-[#8a928d]"><span>2 km</span><span>50 km</span></div></div></div></section>
          <section className="rounded-[24px] border border-[#dde3df] bg-white p-5 sm:p-6"><div className="grid gap-5 md:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">4 · Prioridade</p><button type="button" onClick={()=>setUrgent((v)=>!v)} className={cx("mt-4 flex w-full items-center justify-between rounded-2xl border p-4 text-left",urgent?"border-[#e29a72] bg-[#fff6f0]":"border-[#dfe4e0]")}><span><strong className="block text-sm">Preciso com urgência</strong><span className="mt-1 block text-xs text-[#7b837e]">Destaca a publicação no feed.</span></span><span className={cx("relative h-7 w-12 rounded-full transition",urgent?"bg-[#dd6d2d]":"bg-[#d5dbd7]")}><span className={cx("absolute top-1 size-5 rounded-full bg-white transition",urgent?"left-6":"left-1")}/></span></button></div><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">5 · Valor / orçamento</p><div className="mt-4 flex gap-2"><label className="relative flex-1"><DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#828b85]"/><input type="number" defaultValue="320" className="w-full rounded-xl border border-[#dce2de] py-3.5 pl-10 pr-3 text-base"/></label><select className="rounded-xl border border-[#dce2de] bg-white px-3 text-sm font-bold"><option>Negociável</option><option>Valor fixo</option><option>Por hora</option></select></div></div></div></section>
          <section className="rounded-[24px] border border-[#dde3df] bg-white p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[#78817b]">6 · Descrição & fotos</p><textarea rows={5} defaultValue="Descreva aqui os detalhes do serviço, contexto, medidas, materiais ou horários disponíveis." className="mt-4 w-full rounded-xl border border-[#dce2de] p-4 text-base leading-6"/><button type="button" className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#cbd3cd] bg-[#faf6ee] px-4 py-6 text-sm font-black"><ImagePlus className="size-5"/>Adicionar fotos de referência <span className="font-medium text-[#87908a]">(simulado)</span></button></section>
          <div className="flex flex-wrap justify-end gap-2 pb-6"><button type="button" onClick={()=>router.push(rotas.radar)} className="rounded-xl border border-[#d5dcd7] bg-white px-5 py-3 text-sm font-black">Cancelar</button><button className="rounded-xl bg-[#006241] px-6 py-3 text-sm font-black text-white">Publicar agora</button></div>
        </form>}
      </main>
    </div>
  );
}

const portfolio = [
  ["Reforma de quadro elétrico","Residencial · Setor Marista","from-[#243b35] to-[#83a68d]"],
  ["Instalação de iluminação","Comercial · Setor Bueno","from-[#40382f] to-[#bd9d6e]"],
  ["Manutenção preventiva","Residencial · Jardim Goiás","from-[#23313d] to-[#7890a5]"],
  ["Adequação de tomadas","Escritório · Centro","from-[#3f3543] to-[#9b7ca4]"],
];

function Perfil() {
  const [tab,setTab]=useState<"portfolio"|"avaliacoes"|"sobre">("portfolio");
  const [available,setAvailable]=useState(true);
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]"><AppHeader active="perfil"/>
      <main className="mx-auto grid max-w-[1320px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[330px_1fr] lg:px-8">
        <aside className="rounded-[26px] border border-[#dce2de] bg-white p-5 lg:sticky lg:top-5 lg:h-fit">
          <div className="flex items-start justify-between"><div className="grid size-20 place-items-center rounded-[22px] bg-[#d4e9e2] text-xl font-black">CM</div><span className="flex items-center gap-1 rounded-full bg-[#d4e9e2] px-2.5 py-1 text-[10px] font-black text-[#006241]"><ShieldCheck className="size-3"/>Verificado</span></div>
          <h1 className="mt-5 text-2xl font-black tracking-[-.035em]">Carlos Mendes</h1><p className="mt-1 text-sm font-bold text-[#6f7972]">Eletricista residencial e comercial</p><p className="mt-3 flex items-center gap-2 text-xs text-[#7d857f]"><MapPin className="size-3.5"/>Goiânia · atende até 15 km</p>
          <div className="mt-5 grid grid-cols-3 divide-x divide-[#e2e7e3] rounded-2xl bg-[#faf6ee] p-3 text-center"><div><strong className="block text-lg">4,9</strong><span className="text-[10px] text-[#7c857f]">avaliação</span></div><div><strong className="block text-lg">127</strong><span className="text-[10px] text-[#7c857f]">serviços</span></div><div><strong className="block text-lg">98%</strong><span className="text-[10px] text-[#7c857f]">conclusão</span></div></div>
          <button type="button" onClick={()=>setAvailable((v)=>!v)} className="mt-5 flex w-full items-center justify-between rounded-2xl border border-[#dce2de] p-4 text-left"><span><strong className="block text-xs">Disponibilidade</strong><span className="mt-1 block text-[10px] text-[#7d857f]">{available?"Aceitando novos serviços":"Pausada"}</span></span><span className={cx("relative h-7 w-12 rounded-full",available?"bg-[#006241]":"bg-[#d4dad6]")}><span className={cx("absolute top-1 size-5 rounded-full bg-white transition",available?"left-6":"left-1")}/></span></button>
          <div className="mt-5 space-y-3 border-t border-[#e3e7e4] pt-5 text-xs"><p className="flex items-center justify-between"><span className="text-[#7b847e]">Responde em</span><strong>~ 12 min</strong></p><p className="flex items-center justify-between"><span className="text-[#7b847e]">No Mão Local desde</span><strong>2026</strong></p><p className="flex items-center justify-between"><span className="text-[#7b847e]">Identidade</span><strong className="text-[#006241]">Validada</strong></p></div>
          <Link href={rotas.oportunidades} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#006241] px-4 py-3 text-sm font-black text-white"><MessageCircle className="size-4"/>Conversar</Link>
        </aside>
        <section className="min-w-0 rounded-[26px] border border-[#dce2de] bg-white p-5 sm:p-7">
          <div className="flex gap-1 overflow-x-auto border-b border-[#e2e7e3]">{[["portfolio","Portfólio"],["avaliacoes","Avaliações"],["sobre","Sobre & qualificações"]].map(([k,l])=><button type="button" key={k} onClick={()=>setTab(k as typeof tab)} className={cx("shrink-0 border-b-2 px-4 py-3 text-sm font-black",tab===k?"border-[#111111] text-[#111111]":"border-transparent text-[#7c857f]")}>{l}</button>)}</div>
          {tab==="portfolio"&&<div><div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#838c86]">Trabalhos verificados</p><h2 className="mt-1 text-2xl font-black">Portfólio recente</h2></div><button className="rounded-xl border border-[#dce2de] px-3 py-2 text-xs font-black"><Plus className="mr-1 inline size-3"/>Adicionar</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{portfolio.map(([t,s,g],i)=><article key={t} className="overflow-hidden rounded-[20px] border border-[#dfe4e0]"><div className={cx("relative h-48 bg-gradient-to-br",g)}><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(45deg,transparent_47%,white_48%,white_51%,transparent_52%)] [background-size:70px_70px]"/><span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase">{i%2===0?"Antes & depois":"Serviço concluído"}</span></div><div className="p-4"><h3 className="font-black">{t}</h3><p className="mt-1 text-xs text-[#7a837d]">{s}</p><p className="mt-3 flex items-center gap-1 text-[10px] font-black text-[#006241]"><CheckCircle2 className="size-3"/>Vinculado a uma ordem concluída</p></div></article>)}</div></div>}
          {tab==="avaliacoes"&&<div className="mt-6"><div className="grid gap-4 sm:grid-cols-[220px_1fr]"><div className="rounded-2xl bg-[#faf6ee] p-5 text-center"><strong className="text-5xl font-black">4,9</strong><div className="mt-2 flex justify-center gap-1 text-[#006241]">{[1,2,3,4,5].map(n=><Star key={n} className="size-4 fill-current"/>)}</div><p className="mt-2 text-xs text-[#7b847e]">86 avaliações verificadas</p></div><div className="space-y-3">{[5,4,3,2,1].map(n=><div key={n} className="flex items-center gap-3 text-xs"><span className="w-4 font-black">{n}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d4e9e2]"><div className="h-full rounded-full bg-[#006241]" style={{width:`${n===5?88:n===4?9:1}%`}}/></div></div>)}</div></div><div className="mt-6 space-y-3">{[["Mariana S.","Excelente profissional. Explicou tudo e deixou o local organizado."],["Rodrigo A.","Pontual, preço combinado e serviço bem executado."]].map(([n,c])=><article key={n} className="rounded-2xl border border-[#e0e5e1] p-5"><div className="flex items-center justify-between"><strong>{n}</strong><span className="text-xs text-[#006241]">★★★★★</span></div><p className="mt-3 text-sm leading-6 text-[#6f7872]">{c}</p></article>)}</div></div>}
          {tab==="sobre"&&<div className="mt-6 grid gap-5 md:grid-cols-2"><article className="rounded-2xl border border-[#e0e5e1] p-5"><h3 className="font-black">Sobre</h3><p className="mt-3 text-sm leading-6 text-[#707972]">Profissional com experiência em instalações residenciais, manutenção preventiva, quadros elétricos e adequações. Atendimento com foco em segurança, diagnóstico claro e organização.</p></article><article className="rounded-2xl border border-[#e0e5e1] p-5"><h3 className="font-black">Qualificações</h3><ul className="mt-3 space-y-3 text-sm text-[#707972]"><li className="flex gap-2"><Check className="size-4 text-[#006241]"/>NR-10 atualizada</li><li className="flex gap-2"><Check className="size-4 text-[#006241]"/>Instalações de baixa tensão</li><li className="flex gap-2"><Check className="size-4 text-[#006241]"/>Identidade e telefone verificados</li></ul></article></div>}
        </section>
      </main>
    </div>
  );
}

function Oportunidades() {
  const router = useRouter();
  const [selected,setSelected]=useState(1);
  const [messages,setMessages]=useState(["Olá, Carlos! Vi sua proposta.","Olá! Consigo atender hoje às 14h. O valor inclui a revisão e a troca do disjuntor."]);
  const [draft,setDraft]=useState("");
  const [proposalSent,setProposalSent]=useState(false);
  const item = oportunidades.find((o)=>o.id===selected) ?? oportunidades[0];
  const step = proposalSent ? 2 : 1;
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]"><AppHeader active="oportunidades"/>
      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#006241]">Central de oportunidades</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">Propostas, negociação e decisão.</h1></div><span className="hidden rounded-full border border-[#d7ddd9] bg-white px-3 py-2 text-xs font-black text-[#6f7872] sm:block">3 colunas · fluxo completo</span></div>
        <div className="grid min-h-[690px] overflow-hidden rounded-[26px] border border-[#dce2de] bg-white xl:grid-cols-[300px_minmax(420px,1fr)_360px]">
          <aside className="border-b border-[#e2e7e3] p-4 xl:border-b-0 xl:border-r"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b938e]"/><input placeholder="Buscar oportunidades" className="w-full rounded-xl bg-[#d4e9e2] py-3 pl-9 pr-3 text-sm"/></div><div className="mt-4 space-y-2">{oportunidades.slice(0,3).map(o=>{const I=o.icon;return <button type="button" key={o.id} onClick={()=>setSelected(o.id)} className={cx("w-full rounded-2xl border p-3 text-left",selected===o.id?"border-[#006241] bg-[#d4e9e2]":"border-transparent bg-[#faf6ee]")}><div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white"><I className="size-4"/></span><div className="min-w-0"><p className="text-[10px] font-black uppercase text-[#7c857f]">{o.category} · {o.distance}</p><h3 className="mt-1 text-sm font-black leading-tight">{o.title}</h3><p className="mt-2 text-xs font-bold">{o.price}</p></div></div></button>})}</div></aside>
          <section className="min-w-0 border-b border-[#e2e7e3] p-5 sm:p-6 xl:border-b-0 xl:border-r"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.13em] text-[#818a84]">{item.category} · {item.place}</p><h2 className="mt-1 text-2xl font-black tracking-[-.035em]">{item.title}</h2></div><span className="rounded-full bg-[#fff0e8] px-3 py-1.5 text-[10px] font-black uppercase text-[#bd4f19]">{item.urgent?"urgente":"aberta"}</span></div><p className="mt-4 text-sm leading-6 text-[#707973]">Preciso de profissional para atendimento residencial. O local está liberado para avaliação, com preferência para execução no mesmo dia. Materiais principais já estão disponíveis.</p>
            <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#d4e9e2] p-3"><span className="text-[9px] uppercase text-[#858e88]">Orçamento</span><strong className="mt-1 block text-sm">{item.price}</strong></div><div className="rounded-xl bg-[#d4e9e2] p-3"><span className="text-[9px] uppercase text-[#858e88]">Distância</span><strong className="mt-1 block text-sm">{item.distance}</strong></div><div className="rounded-xl bg-[#d4e9e2] p-3"><span className="text-[9px] uppercase text-[#858e88]">Quando</span><strong className="mt-1 block text-sm">Hoje</strong></div></div>
            <div className="mt-6"><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Status da negociação</p><div className="mt-4 flex items-center">{["Interesse","Proposta","Aceite","Serviço"].map((label,i)=><div key={label} className="flex min-w-0 flex-1 items-center last:flex-none"><div className="flex flex-col items-center"><span className={cx("grid size-8 place-items-center rounded-full text-xs font-black",i<=step?"bg-[#006241] text-[#d4e9e2]":"bg-[#d4e9e2] text-[#8b938e]")}>{i<step?<Check className="size-4"/>:i+1}</span><span className="mt-1 text-[9px] font-bold text-[#77817a]">{label}</span></div>{i<3&&<span className={cx("mb-4 h-[2px] flex-1",i<step?"bg-[#006241]":"bg-[#e2e7e3]")}/>}</div>)}</div></div>
            <div className="mt-6 rounded-[20px] border border-[#dce2de] p-5"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-xl bg-[#d4e9e2] font-black">CM</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong>Carlos Mendes</strong><ShieldCheck className="size-4 text-[#006241]"/></div><p className="text-xs text-[#768079]">Eletricista · 4,9 ★ · 127 serviços</p></div><Link href={rotas.perfil} className="text-xs font-black underline underline-offset-4">Ver perfil</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><div><span className="text-[10px] font-black uppercase text-[#818a84]">Proposta</span><p className="mt-1 text-sm text-[#69736c]">Posso ir às 14h. Incluo diagnóstico e mão de obra no valor.</p></div><div className="sm:text-right"><span className="text-[10px] font-black uppercase text-[#818a84]">Valor</span><strong className="mt-1 block text-2xl">R$ 320</strong></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>setProposalSent(true)} className="rounded-xl bg-[#d4e9e2] px-4 py-3 text-xs font-black">{proposalSent?"Proposta selecionada ✓":"Selecionar proposta"}</button><button type="button" className="rounded-xl border border-[#dce2de] px-4 py-3 text-xs font-black">Recusar</button>{proposalSent&&<button type="button" onClick={()=>router.push(rotas.servico)} className="rounded-xl bg-[#006241] px-4 py-3 text-xs font-black text-white">Aceitar e criar serviço</button>}</div></div>
          </section>
          <aside className="flex min-h-[620px] flex-col p-4"><div className="flex items-center gap-3 border-b border-[#e4e8e5] pb-4"><span className="grid size-10 place-items-center rounded-xl bg-[#d4e9e2] text-xs font-black">CM</span><div><strong className="text-sm">Carlos Mendes</strong><p className="text-[10px] text-[#7b847e]">Online agora</p></div></div><div className="flex-1 space-y-3 overflow-y-auto py-4">{messages.map((m,i)=><div key={`${m}-${i}`} className={cx("max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-5",i%2===0?"ml-auto bg-[#006241] text-white":"bg-[#d4e9e2] text-[#3f4942]")}>{m}</div>)}</div><form onSubmit={(e)=>{e.preventDefault();const v=draft.trim();if(!v)return;setMessages([...messages,v]);setDraft("")}} className="flex gap-2 border-t border-[#e4e8e5] pt-3"><input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Escreva uma mensagem" className="min-w-0 flex-1 rounded-xl bg-[#d4e9e2] px-3 py-3 text-base"/><button aria-label="Enviar mensagem" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#006241] text-white"><Send className="size-4"/></button></form></aside>
        </div>
      </main>
    </div>
  );
}

function Servico() {
  const [stage,setStage]=useState(2);
  const [checks,setChecks]=useState([true,true,false,false]);
  const [validated,setValidated]=useState(false);
  const stages=["Contratado","A caminho","Em execução","Vistoria","Concluído"];
  function toggle(i:number){setChecks(checks.map((v,idx)=>idx===i?!v:v))}
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]"><AppHeader active="servico"/>
      <main className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#006241]">OS #ML-2048</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">Troca de disjuntor e revisão</h1><p className="mt-2 text-sm text-[#747d77]">Hoje · Setor Bueno · Carlos Mendes</p></div><span className="rounded-full bg-[#d4e9e2] px-3 py-2 text-xs font-black text-[#006241]">Em andamento</span></div>
        <section className="mt-5 rounded-[22px] border border-[#dce2de] bg-white p-4 sm:p-5"><div className="flex min-w-[620px] items-center overflow-x-auto">{stages.map((s,i)=><div key={s} className="flex min-w-0 flex-1 items-center last:flex-none"><button type="button" onClick={()=>setStage(i)} className="flex flex-col items-center"><span className={cx("grid size-9 place-items-center rounded-full text-xs font-black",i<=stage?"bg-[#006241] text-[#d4e9e2]":"bg-[#d4e9e2] text-[#89918c]")}>{i<stage?<Check className="size-4"/>:i+1}</span><span className="mt-2 whitespace-nowrap text-[10px] font-black text-[#778079]">{s}</span></button>{i<stages.length-1&&<span className={cx("mb-5 h-[2px] flex-1",i<stage?"bg-[#006241]":"bg-[#e1e6e3]")}/>}</div>)}</div></section>
        <div className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-[#dce2de] bg-white p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Profissional responsável</p><div className="mt-4 flex items-center gap-3"><span className="grid size-14 place-items-center rounded-2xl bg-[#d4e9e2] font-black">CM</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong>Carlos Mendes</strong><ShieldCheck className="size-4 text-[#006241]"/></div><p className="mt-1 text-xs text-[#78817b]">Eletricista · 4,9 ★ · Identidade validada</p></div><button className="rounded-xl border border-[#dce2de] px-3 py-2 text-xs font-black"><MessageCircle className="mr-1 inline size-3"/>Chat</button></div></section>
            <section className="rounded-[24px] border border-[#dce2de] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Valor combinado</p><strong className="mt-1 block text-3xl">R$ 320,00</strong></div><span className="grid size-12 place-items-center rounded-2xl bg-[#d4e9e2]"><Wallet className="size-5 text-[#006241]"/></span></div><div className="mt-4 rounded-xl bg-[#faf6ee] p-3 text-xs leading-5 text-[#727b75]"><strong className="text-[#303a33]">Pagamento protegido</strong><br/>Fluxo visual preparado para retenção e liberação após validação. Integração financeira real ainda não é executada nesta prévia.</div></section>
            <section className="rounded-[24px] border border-[#dce2de] bg-white p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Validação do serviço</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setValidated(false)} className={cx("rounded-xl border px-3 py-3 text-xs font-black",!validated?"border-[#111111] bg-[#006241] text-white":"border-[#dce2de]")}>Checklist</button><button type="button" onClick={()=>setValidated(true)} className={cx("rounded-xl border px-3 py-3 text-xs font-black",validated?"border-[#111111] bg-[#006241] text-white":"border-[#dce2de]")}>QR de check-out</button></div>{!validated?<div className="mt-4 space-y-2">{["Área desligada e segura","Disjuntor substituído","Aperto e conexões revisados","Teste final realizado"].map((l,i)=><button type="button" key={l} onClick={()=>toggle(i)} className="flex w-full items-center gap-3 rounded-xl bg-[#faf6ee] p-3 text-left text-xs font-bold"><span className={cx("grid size-5 place-items-center rounded-md border",checks[i]?"border-[#006241] bg-[#006241] text-white":"border-[#cbd3cd] bg-white")}>{checks[i]&&<Check className="size-3"/>}</span>{l}</button>)}</div>:<div className="mt-4 rounded-2xl bg-[#faf6ee] p-5 text-center"><div className="mx-auto grid size-36 place-items-center rounded-2xl border-8 border-[#111111] bg-white"><QrCode className="size-24" strokeWidth={1.5}/></div><p className="mt-4 text-xs font-black">Escaneie para validar a conclusão</p><p className="mt-1 text-[10px] text-[#7c857f]">QR demonstrativo · OS #ML-2048</p></div>}</section>
          </div>
          <div className="space-y-5">
            <section className="rounded-[24px] border border-[#dce2de] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Evidências</p><h2 className="mt-1 text-xl font-black">Antes & depois</h2></div><button className="rounded-xl border border-[#dce2de] px-3 py-2 text-xs font-black"><Camera className="mr-1 inline size-3"/>Adicionar foto</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-[#3d493f] to-[#9ca69e]"><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(45deg,transparent_47%,white_48%,white_51%,transparent_52%)] [background-size:60px_60px]"/><span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase">Antes</span><span className="absolute bottom-3 left-3 text-xs font-black text-white">Quadro original</span></div><div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-[#22372d] to-[#6e947b]"><div className="absolute inset-0 opacity-25 [background-image:linear-gradient(-45deg,transparent_47%,white_48%,white_51%,transparent_52%)] [background-size:60px_60px]"/><span className="absolute left-3 top-3 rounded-full bg-[#d4e9e2] px-2.5 py-1 text-[9px] font-black uppercase">Depois</span><span className="absolute bottom-3 left-3 text-xs font-black text-white">Instalação revisada</span></div></div></section>
            <section className="rounded-[24px] border border-[#dce2de] bg-white p-5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d4e9e2]"><FileCheck className="size-5 text-[#006241]"/></span><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#818a84]">Vistoria & conformidade</p><h2 className="mt-1 text-lg font-black">Registro técnico da execução</h2><p className="mt-2 text-xs leading-5 text-[#747d77]">Checklist e evidências ficam vinculados à ordem para reduzir disputas e documentar o que foi entregue.</p></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{["Fotos com data da OS","Checklist final","Aceite do contratante","Histórico de mensagens"].map(x=><div key={x} className="flex items-center gap-2 rounded-xl bg-[#faf6ee] p-3 text-xs font-bold"><CheckCircle2 className="size-4 text-[#006241]"/>{x}</div>)}</div></section>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-[#006241] p-4 text-white"><div><p className="text-xs font-black">Pronto para finalizar?</p><p className="mt-1 text-[10px] text-white/55">Confirme a vistoria e registre o check-out.</p></div><div className="flex gap-2"><button type="button" onClick={()=>setStage(3)} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-black">Ir para vistoria</button><button type="button" onClick={()=>{setStage(4);setValidated(true)}} className="rounded-xl bg-[#d4e9e2] px-4 py-3 text-xs font-black text-[#111111]">Concluir serviço</button></div></div>
      </main>
    </div>
  );
}

function Unknown() {
  return <div className="grid min-h-[70vh] place-items-center bg-[#faf6ee] p-6 text-center text-[#111111]"><div><Logo/><h1 className="mt-8 text-2xl font-black">Tela não encontrada</h1><Link href={rotas.landing} className="mt-4 inline-block rounded-xl bg-[#006241] px-4 py-3 text-sm font-black text-white">Abrir apresentação</Link></div></div>;
}

export function FigmaPreview({ tela }: { tela: string }) {
  const normalized = useMemo<Tela | null>(() => telas.some(([slug]) => slug === tela) ? tela as Tela : null, [tela]);
  if (!normalized) return <Unknown />;
  return (
    <div className="min-h-screen bg-[#faf6ee] font-sans text-[#111111] selection:bg-[#d4e9e2] selection:text-[#111111]" style={{ fontFamily: '"SoDoSans", Arial, sans-serif' }}>
      {normalized !== "landing" && normalized !== "entrar" && <TestNavigator tela={normalized}/>}
      {normalized === "landing" && <Landing/>}
      {normalized === "entrar" && <Login/>}
      {normalized === "radar" && <Radar/>}
      {normalized === "publicar" && <Publicar/>}
      {normalized === "perfil" && <Perfil/>}
      {normalized === "oportunidades" && <Oportunidades/>}
      {normalized === "servico" && <Servico/>}
    </div>
  );
}
