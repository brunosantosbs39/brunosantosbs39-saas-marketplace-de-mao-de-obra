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
  return (
    <div className="min-h-screen bg-[#faf6ee] text-[#111111]">
      <header className="border-b border-[#e0e5e1] bg-[#faf6ee]">
        <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between px-4 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-[#5f6862] md:flex"><a href="#como-funciona">Como funciona</a><a href="#seguranca">Segurança</a><a href="#categorias">Categorias</a></nav>
          <div className="flex items-center gap-2"><Link href={rotas.entrar} className="rounded-xl px-4 py-2.5 text-sm font-extrabold">Entrar</Link><Link href={rotas.entrar} className="rounded-xl bg-[#006241] px-4 py-2.5 text-sm font-extrabold text-white">Começar agora</Link></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#e0e5e1]">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#e5e9e6_1px,transparent_1px),linear-gradient(90deg,#e5e9e6_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto grid max-w-[1360px] gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfd6d1] bg-white px-3 py-2 text-xs font-black uppercase tracking-[.12em]"><span className="size-2 rounded-full bg-[#006241]"/>Marketplace local de mão de obra</div>
              <h1 className="text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-6xl lg:text-[78px]">Quem precisa encontra.<br/><span className="text-[#006241]">Quem faz trabalha.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#657069]">Encontre profissionais próximos, publique uma necessidade ou mostre sua disponibilidade. Negocie, acompanhe e finalize tudo em um só lugar.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href={rotas.entrar} className="inline-flex items-center gap-2 rounded-2xl bg-[#006241] px-6 py-4 text-sm font-black text-white">Encontrar profissional <ArrowRight className="size-4"/></Link><Link href={rotas.entrar} className="inline-flex items-center gap-2 rounded-2xl border border-[#cfd6d1] bg-white px-6 py-4 text-sm font-black">Oferecer meu trabalho <Briefcase className="size-4"/></Link></div>
              <div className="mt-10 flex flex-wrap gap-6 text-xs font-bold text-[#657069]"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#006241]"/>Perfis verificados</span><span className="flex items-center gap-2"><MapPin className="size-4 text-[#006241]"/>Busca por proximidade</span><span className="flex items-center gap-2"><MessageCircle className="size-4 text-[#006241]"/>Negociação protegida</span></div>
            </div>

            <div className="relative min-h-[520px]">
              <div className="absolute inset-0 rotate-[-2deg] rounded-[34px] border border-[#dce2de] bg-white shadow-[0_30px_80px_rgba(20,30,23,.12)]" />
              <div className="absolute inset-4 overflow-hidden rounded-[28px] bg-[#d4e9e2]">
                <div className="absolute inset-0 [background-image:linear-gradient(32deg,transparent_45%,rgba(255,255,255,.95)_46%,rgba(255,255,255,.95)_49%,transparent_50%),linear-gradient(125deg,transparent_40%,rgba(255,255,255,.9)_41%,rgba(255,255,255,.9)_44%,transparent_45%)] [background-size:160px_150px,210px_190px]"/>
                <div className="absolute left-[12%] top-[17%] rounded-2xl bg-white p-3 shadow-lg"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#dff6ff] text-[#007aa7]"><Wrench className="size-5"/></span><div><p className="text-xs font-black">Carlos M.</p><p className="text-[10px] text-[#7b837d]">Eletricista · 1,8 km</p></div></div></div>
                <div className="absolute right-[7%] top-[42%] rounded-2xl bg-[#006241] p-3 text-white shadow-xl"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#d4e9e2] text-[#111111]"><Hammer className="size-5"/></span><div><p className="text-xs font-black">Vaga urgente</p><p className="text-[10px] text-white/60">Pedreiro · hoje</p></div></div></div>
                <div className="absolute bottom-[13%] left-[20%] rounded-2xl bg-white p-3 shadow-lg"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#f6ebff] text-[#7b3cac]"><Sparkles className="size-5"/></span><div><p className="text-xs font-black">Ana L.</p><p className="text-[10px] text-[#7b837d]">Diarista · disponível</p></div></div></div>
                <span className="absolute left-[43%] top-[30%] grid size-11 place-items-center rounded-full bg-[#d4e9e2] text-[#111111] shadow-xl"><MapPin className="size-5"/></span>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-[1360px] px-4 py-20 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#006241]">Fluxo simples</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em]">Do pedido ao serviço concluído.</h2></div><div className="grid gap-3 sm:grid-cols-3">{[["01","Publique ou encontre","Crie uma vaga, informe sua disponibilidade ou use o Radar."],["02","Converse e combine","Receba propostas e negocie no chat da plataforma."],["03","Acompanhe e avalie","Registre evidências, conclua o serviço e avalie a experiência."]].map(([n,t,d])=><article key={n} className="rounded-[24px] border border-[#dfe4e0] bg-white p-6"><span className="text-xs font-black text-[#87908a]">{n}</span><h3 className="mt-10 text-lg font-black">{t}</h3><p className="mt-2 text-sm leading-6 text-[#727a75]">{d}</p></article>)}</div></div>
        </section>
      </main>
    </div>
  );
}

function Login() {
  const router = useRouter();
  const [role, setRole] = useState<"contratante" | "profissional">("contratante");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  function enter() { setLoading(true); setTimeout(() => router.push(rotas.radar), 450); }
  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#faf6ee] px-4 py-8 text-[#111111] sm:px-8">
      <div className="mx-auto max-w-[1260px]">
        <div className="mb-8 flex items-center justify-between"><Link href={rotas.landing}><Logo /></Link><Link href={rotas.landing} className="text-sm font-bold text-[#69716c]">← Voltar para o início</Link></div>
        <div className="grid overflow-hidden rounded-[30px] border border-[#dde3df] bg-white shadow-[0_24px_70px_rgba(24,32,27,.08)] lg:grid-cols-[1.03fr_.97fr]">
          <section className="p-6 sm:p-10 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#006241]">Acesso seguro</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-.045em]">Entre no Mão Local</h1>
            <p className="mt-2 text-sm leading-6 text-[#737b76]">Acesse como contratante ou profissional. Você poderá alternar de papel depois.</p>
            <div className="mt-7 grid grid-cols-2 rounded-2xl bg-[#d4e9e2] p-1.5">
              <button type="button" onClick={() => setRole("contratante")} className={cx("rounded-xl px-3 py-3 text-sm font-black transition", role === "contratante" ? "bg-white shadow-sm" : "text-[#7a837d]")}>Quero contratar</button>
              <button type="button" onClick={() => setRole("profissional")} className={cx("rounded-xl px-3 py-3 text-sm font-black transition", role === "profissional" ? "bg-white shadow-sm" : "text-[#7a837d]")}>Quero trabalhar</button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3"><button type="button" onClick={enter} className="rounded-xl border border-[#dce2de] px-3 py-3 text-xs font-black">G Google</button><button type="button" onClick={enter} className="rounded-xl border border-[#dce2de] px-3 py-3 text-xs font-black">● Apple</button><button type="button" onClick={enter} className="rounded-xl border border-[#dce2de] px-3 py-3 text-xs font-black">gov.br</button></div>
            <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#9aa19c]"><span className="h-px flex-1 bg-[#e3e7e4]"/>ou continue com e-mail<span className="h-px flex-1 bg-[#e3e7e4]"/></div>
            <form onSubmit={(e) => {e.preventDefault(); enter();}} className="grid gap-4">
              <label className="text-xs font-black text-[#505953]">E-mail, CPF ou CNPJ<input required defaultValue="teste@maolocal.com" className="mt-2 w-full rounded-xl border border-[#d9dfdb] bg-white px-4 py-3.5 text-base outline-none focus:border-[#006241]"/></label>
              <label className="text-xs font-black text-[#505953]">Senha<div className="relative mt-2"><input required type={showPassword ? "text" : "password"} defaultValue="12345678" className="w-full rounded-xl border border-[#d9dfdb] px-4 py-3.5 pr-12 text-base outline-none focus:border-[#006241]"/><button type="button" onClick={() => setShowPassword((v)=>!v)} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-[#7c847f]" aria-label="Mostrar senha">{showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}</button></div></label>
              <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 font-bold text-[#667069]"><input type="checkbox" defaultChecked/>Manter conectado</label><button type="button" className="font-black underline underline-offset-4">Esqueci minha senha</button></div>
              <button disabled={loading} className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#006241] px-4 text-sm font-black text-white disabled:opacity-60">{loading ? "Entrando…" : <>Entrar <ArrowRight className="size-4"/></>}</button>
              <button type="button" onClick={enter} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce2de] text-sm font-black"><Fingerprint className="size-4"/>Entrar com passkey / biometria</button>
            </form>
          </section>
          <aside className="relative overflow-hidden bg-[#006241] p-8 text-white sm:p-12 lg:p-14">
            <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#d4e9e2]/10 blur-2xl"/>
            <div className="relative flex h-full flex-col justify-between gap-12">
              <div><div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-[#d4e9e2]"><ShieldCheck className="size-4"/>Ambiente protegido</div><h2 className="mt-8 max-w-md text-4xl font-black leading-tight tracking-[-.045em]">Confiança para contratar. Credibilidade para trabalhar.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/55">Identidade, histórico, portfólio, avaliações e registro do serviço ajudam as duas partes a tomar decisões melhores.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{[[ShieldCheck,"Conta e perfis verificados"],[Lock,"Dados e conversas protegidos"],[FileCheck,"Registro de cada contratação"],[Wallet,"Fluxo de pagamento preparado"]].map(([Icon,label]) => { const I=Icon as typeof ShieldCheck; return <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><I className="size-5 text-[#d4e9e2]"/><p className="mt-4 text-xs font-black">{String(label)}</p></div>})}</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
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
      <TestNavigator tela={normalized}/>
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
