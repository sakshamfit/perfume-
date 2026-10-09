"use client";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  X,
  Menu,
  Plus,
  Minus,
  ChevronDown,
  Check,
  MoveDown,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
type Panel = "search" | "bag" | "product" | "menu" | "journal" | "care" | null;
type Language = "en" | "fr";
const assets = {
  hero: "/assets/hero-clear.webp",
  bottle: "/assets/bottle-clear.webp",
  notes: "/assets/notes-clear.webp",
};
const content = {
  en: {
    collections: "Collections",
    shop: "Shop",
    story: "Our story",
    journal: "Journal",
    language: "Language",
    heroOne: "The essence of",
    heroTwo: "subtle romance",
    heroCopy:
      "A luminous blend of peach, jasmine and soft woods. Crafted for moments that stay with you.",
    explore: "Explore the collection",
    scroll: "A world of quiet wonder",
    label: "The art of feeling",
    statement:
      "A touch of peach. A whisper of jasmine. The warmth of soft woods. Éclat is a little golden light, held close to the skin.",
    storySmall:
      "An invitation to slow down. To notice the light. To carry a beautiful moment with you.",
    notesLabel: "The composition",
    notesTitle: "A feeling, in three notes.",
    peach: "Sun-warmed peach",
    peachSub: "The first impression",
    peachCopy:
      "Luminous and softly sweet. A golden opening, like the last light of a summer afternoon.",
    jasmine: "A whisper of jasmine",
    jasmineSub: "At the heart",
    jasmineCopy:
      "Delicate white petals. An intimate floral heart that unfolds gently against the skin.",
    wood: "The warmth of woods",
    woodSub: "What stays with you",
    woodCopy:
      "Soft, quietly enveloping woods. A warm finish that turns a passing moment into a memory.",
    signature: "The signature fragrance",
    bottleTitle: "Golden light.\nBottled.",
    bottleCopy:
      "Éclat captures the beauty of an unhurried moment. Luminous peach meets jasmine, settling into the quiet warmth of soft woods.",
    discover: "Discover Éclat",
    scent: "Floral · Fruity · Woody",
    eau: "Eau de parfum",
    size: "100 ml / 3.4 fl. oz.",
    worldLabel: "The world of VELORA",
    worldTitle: "For moments\nthat stay.",
    worldCopy:
      "A fragrance can hold a place, a feeling, a fleeting instant. VELORA is an ode to those small, beautiful things — warm light on stone, flowers in the evening, a memory you return to.",
    worldCta: "Enter our world",
    journalLabel: "Notes from the maison",
    journalTitle: "The beauty of the everyday.",
    articleOne: "The poetry of golden hour",
    articleTwo: "A fragrance, worn your way",
    read: "Read the story",
    closing: "Leave a little\nof yourself.",
    closingCta: "Find your signature",
    footerLine: "Fragrance for moments that stay with you.",
    back: "Back to the beginning",
    care: "Fragrance care",
    privacy: "Privacy & your bag",
    searchTitle: "What speaks to you?",
    searchPlaceholder: "Search Éclat, peach, jasmine…",
    searchEmpty: "No matches. Try Éclat, peach, jasmine, woods or our story.",
    bagTitle: "Your selection",
    bagEmpty: "A little beauty awaits.",
    bagEmptyCopy: "Discover Éclat and add it to your selection.",
    add: "Add to bag",
    added: "Added to your bag",
    remove: "Remove",
    save: "Save your selection",
    saved: "Your selection has been downloaded.",
    purchaseInfo:
      "Online ordering is not open yet. Save your selection to keep your fragrance details.",
    quantity: "Quantity",
    noteTabs: ["Opening", "Heart", "Trail"],
  },
  fr: {
    collections: "Collections",
    shop: "Boutique",
    story: "Notre histoire",
    journal: "Journal",
    language: "Langue",
    heroOne: "L’essence d’une",
    heroTwo: "douce romance",
    heroCopy:
      "Un accord lumineux de pêche, de jasmin et de bois doux. Pour les instants qui restent.",
    explore: "Explorer la collection",
    scroll: "Un monde de douceur",
    label: "L’art de ressentir",
    statement:
      "Une touche de pêche. Un souffle de jasmin. La chaleur des bois doux. Éclat est une lumière dorée, tout près de la peau.",
    storySmall:
      "Une invitation à ralentir. À regarder la lumière. À garder un bel instant près de soi.",
    notesLabel: "La composition",
    notesTitle: "Une émotion, en trois notes.",
    peach: "La pêche au soleil",
    peachSub: "La première impression",
    peachCopy:
      "Lumineuse et délicatement sucrée. Une ouverture dorée comme la dernière lumière d’un après-midi d’été.",
    jasmine: "Un souffle de jasmin",
    jasmineSub: "Au cœur",
    jasmineCopy:
      "De délicats pétales blancs. Un cœur floral intime qui s’épanouit doucement sur la peau.",
    wood: "La chaleur des bois",
    woodSub: "Ce qui reste",
    woodCopy:
      "Des bois doux et enveloppants. Une chaleur qui transforme un instant en souvenir.",
    signature: "Le parfum signature",
    bottleTitle: "La lumière dorée.\nEn flacon.",
    bottleCopy:
      "Éclat capture la beauté d’un instant suspendu. La pêche lumineuse rencontre le jasmin et s’installe dans la chaleur des bois doux.",
    discover: "Découvrir Éclat",
    scent: "Floral · Fruité · Boisé",
    eau: "Eau de parfum",
    size: "100 ml / 3,4 fl. oz.",
    worldLabel: "L’univers VELORA",
    worldTitle: "Pour les instants\nqui restent.",
    worldCopy:
      "Un parfum peut garder un lieu, une émotion, un instant. VELORA célèbre ces petites beautés : la lumière sur la pierre, les fleurs du soir, un souvenir que l’on aime retrouver.",
    worldCta: "Entrer dans notre univers",
    journalLabel: "Les notes de la maison",
    journalTitle: "La beauté du quotidien.",
    articleOne: "La poésie de l’heure dorée",
    articleTwo: "Un parfum à votre image",
    read: "Lire l’histoire",
    closing: "Laissez un peu\nde vous.",
    closingCta: "Trouver votre signature",
    footerLine: "Des parfums pour les instants qui restent.",
    back: "Retour au début",
    care: "Prendre soin du parfum",
    privacy: "Confidentialité et sélection",
    searchTitle: "Qu’est-ce qui vous inspire ?",
    searchPlaceholder: "Chercher Éclat, pêche, jasmin…",
    searchEmpty:
      "Aucun résultat. Essayez Éclat, pêche, jasmin, bois ou histoire.",
    bagTitle: "Votre sélection",
    bagEmpty: "Un peu de beauté vous attend.",
    bagEmptyCopy: "Découvrez Éclat et ajoutez-le à votre sélection.",
    add: "Ajouter au panier",
    added: "Ajouté à votre panier",
    remove: "Retirer",
    save: "Enregistrer la sélection",
    saved: "Votre sélection a été téléchargée.",
    purchaseInfo:
      "La commande en ligne n’est pas encore ouverte. Enregistrez votre sélection pour garder les détails du parfum.",
    quantity: "Quantité",
    noteTabs: ["Envolée", "Cœur", "Sillage"],
  },
};
function Brand() {
  return (
    <span className="brand-crop" role="img" aria-label="VELORA Paris">
      <img src="/assets/brand-reference.png" alt="" width="1600" height="900" />
    </span>
  );
}
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span className="text-mask" key={i}>
          <span className="reveal-line">{line}</span>
        </span>
      ))}
    </>
  );
}
export default function Home() {
  const [lang, setLang] = useState<Language>("en"),
    [panel, setPanel] = useState<Panel>(null),
    [query, setQuery] = useState(""),
    [bag, setBag] = useState(0),
    [note, setNote] = useState(0),
    [article, setArticle] = useState(0),
    [toast, setToast] = useState(""),
    [ready, setReady] = useState(false),
    [sticky, setSticky] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    lenis = useRef<Lenis | null>(null);
  const t = content[lang];
  const notes = [
    { name: t.peach, sub: t.peachSub, copy: t.peachCopy },
    { name: t.jasmine, sub: t.jasmineSub, copy: t.jasmineCopy },
    { name: t.wood, sub: t.woodSub, copy: t.woodCopy },
  ];
  useEffect(() => {
    try {
      const b = Number(localStorage.getItem("velora-selection"));
      if (Number.isInteger(b) && b >= 0 && b <= 20) setBag(b);
      if (localStorage.getItem("velora-language") === "fr") setLang("fr");
    } catch {}
    const timeout = setTimeout(() => setReady(true), 1800);
    const scroll = () => setSticky(window.scrollY > 60);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("velora-language", lang);
    } catch {}
  }, [lang]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (panel && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
      lenis.current?.stop();
    }
    if (!panel) {
      dialog.current?.close();
      lenis.current?.start();
    }
  }, [panel]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReady(true);
      return;
    }
    const smooth = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1,
      anchors: true,
    });
    lenis.current = smooth;
    smooth.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => smooth.raf(time * 1000);
    gsap.ticker.add(tick);
    const ctx = gsap.context(() => {
      gsap.to(".hero-photo", {
        yPercent: 15,
        scale: 1.13,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
      gsap.to(".hero-copy", {
        y: -110,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "15% top",
          end: "85% top",
          scrub: 0.6,
        },
      });
      gsap.to(".hero-wordmark", {
        yPercent: -28,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      gsap.fromTo(
        ".statement-word",
        { opacity: 0.2 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: ".statement",
            start: "top 82%",
            end: "bottom 45%",
            scrub: 0.6,
          },
        },
      );
      gsap.utils.toArray<HTMLElement>(".scent-card").forEach((card, i) =>
        gsap.fromTo(
          card,
          { y: [150, 260, 170, 240][i] },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: ".scent-grid",
              start: "top 95%",
              end: "center 48%",
              scrub: 0.8,
            },
          },
        ),
      );
      gsap.utils.toArray<HTMLElement>(".reveal-line").forEach((el) =>
        gsap.from(el, {
          yPercent: 110,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 95%", once: true },
        }),
      );
      gsap.matchMedia().add("(min-width: 800px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".signature",
            start: "top top",
            end: "+=1100",
            pin: ".signature-stage",
            scrub: 1,
          },
        });
        tl.fromTo(
          ".signature-bottle",
          { y: 55, rotation: -8, scale: 0.84 },
          { y: -25, rotation: 5, scale: 1.06, duration: 2.2, ease: "none" },
          0,
        )
          .fromTo(
            ".signature-ghost",
            { xPercent: -7 },
            { xPercent: 8, duration: 2.2, ease: "none" },
            0,
          )
          .fromTo(
            ".signature-info",
            { y: 80 },
            { y: -35, duration: 2.2, ease: "none" },
            0,
          );
      });
      gsap.fromTo(
        ".world-image img",
        { yPercent: -10, scale: 1.15 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: ".world",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
      gsap.fromTo(
        ".closing-image",
        { scale: 1.2 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".closing",
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    const timer = setTimeout(refresh, 2500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", refresh);
      ctx.revert();
      smooth.destroy();
      gsap.ticker.remove(tick);
      lenis.current = null;
    };
  }, [lang]);
  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    };
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Tool,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      {
        name: "get_eclat_details",
        description:
          "Read the VELORA Éclat fragrance details. Does not place an order.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          name: "Éclat",
          brand: "VELORA Paris",
          concentration: "Eau de parfum",
          volume: "100 ml",
          notes: ["peach", "jasmine", "soft woods"],
          orderingAvailable: false,
        }),
      },
      {
        name: "set_fragrance_selection",
        description:
          "Set the device-local Éclat bag quantity and open the bag. Does not purchase or submit an order.",
        inputSchema: {
          type: "object",
          properties: {
            quantity: { type: "integer", minimum: 0, maximum: 20 },
          },
          required: ["quantity"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async (input: unknown) => {
          const q = (input as { quantity?: unknown })?.quantity;
          if (typeof q !== "number" || !Number.isInteger(q) || q < 0 || q > 20)
            throw new Error("Quantity must be an integer from 0 to 20.");
          updateBag(q);
          setPanel("bag");
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
          return {
            fragrance: "Éclat",
            quantity: q,
            scope: "this browser",
            orderPlaced: false,
          };
        },
      },
    ];
    for (const tool of tools) {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    }
    return () => lifecycle.abort();
  }, []);
  function updateBag(value: number) {
    const next = Math.max(0, Math.min(20, value));
    setBag(next);
    try {
      localStorage.setItem("velora-selection", String(next));
    } catch {}
  }
  function add() {
    updateBag(bag + 1);
    setToast(t.added);
    setPanel("bag");
  }
  function go(id: string) {
    setPanel(null);
    setTimeout(() => {
      if (lenis.current) lenis.current.scrollTo(id, { offset: -90 });
      else
        document.querySelector(id)?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
    }, 30);
  }
  function saveBag() {
    const text = `VELORA PARIS\n\nÉCLAT — Eau de parfum\n100 ml / 3.4 fl. oz.\n${t.quantity}: ${bag}\n\nPeach · Jasmine · Soft woods\n\n${t.purchaseInfo}\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "VELORA-my-selection.txt";
    a.click();
    URL.revokeObjectURL(url);
    setToast(t.saved);
  }
  const searchItems = [
    {
      title: "Éclat — " + t.eau,
      sub: t.scent,
      keywords:
        "eclat éclat peach pêche jasmine jasmin woods bois fragrance parfum",
      action: () => setPanel("product"),
      image: assets.bottle,
    },
    {
      title: t.notesTitle,
      sub: t.notesLabel,
      keywords: "notes peach pêche jasmine jasmin woods bois composition",
      action: () => go("#notes"),
      image: assets.notes,
    },
    {
      title: t.worldTitle.replace("\n", " "),
      sub: t.story,
      keywords: "story histoire velora paris maison",
      action: () => go("#story"),
      image: assets.hero,
    },
  ].filter(
    (item) =>
      !query ||
      (item.title + item.keywords).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div ref={root} className={`site ${ready ? "is-ready" : "is-loading"}`}>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <filter id="velora-mark-light" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.98  0 0 0 0 0.945  0 0 0 0 0.875  -1.8 -1.8 -1.8 0 3.6"
            />
          </filter>
          <filter id="velora-mark-dark" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.259  0 0 0 0 0.173  0 0 0 0 0.125  -1.8 -1.8 -1.8 0 3.6"
            />
          </filter>
        </defs>
      </svg>
      <a className="skip-link" href="#main">
        {lang === "en" ? "Skip to content" : "Aller au contenu"}
      </a>
      <div className="intro-curtain" aria-hidden="true">
        <div className="intro-inner">
          <Brand />
          <span className="intro-line" />
          <span className="eyebrow">PARIS · ÉCLAT</span>
        </div>
      </div>
      <header className={`header ${sticky ? "is-scrolled" : ""}`}>
        <nav className="nav-left" aria-label="Collections">
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              go("#collection");
            }}
          >
            {t.collections}
            <ChevronDown size={12} />
          </a>
          <button onClick={() => setPanel("product")}>
            {t.shop}
            <ChevronDown size={12} />
          </button>
        </nav>
        <button
          className="mobile-menu icon-button"
          aria-label={lang === "en" ? "Open menu" : "Ouvrir le menu"}
          onClick={() => setPanel("menu")}
        >
          <Menu size={22} />
        </button>
        <a
          className="header-brand"
          href="#top"
          aria-label="VELORA Paris — home"
          onClick={(e) => {
            e.preventDefault();
            go("#top");
          }}
        >
          <Brand />
        </a>
        <nav className="nav-right" aria-label="Maison">
          <a
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              go("#story");
            }}
          >
            {t.story}
          </a>
          <a
            href="#journal"
            onClick={(e) => {
              e.preventDefault();
              go("#journal");
            }}
          >
            {t.journal}
          </a>
        </nav>
        <div className="nav-tools">
          <button
            className="icon-button"
            onClick={() => setPanel("search")}
            aria-label={lang === "en" ? "Search" : "Rechercher"}
          >
            <Search size={21} />
          </button>
          <label className="language-label">
            <span>{t.language}</span>
            <select
              aria-label={t.language}
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
          </label>
          <button
            className="bag-button"
            onClick={() => setPanel("bag")}
            aria-label={`${t.bagTitle} (${bag})`}
          >
            <ShoppingBag size={21} />
            <span>({bag})</span>
          </button>
        </div>
      </header>
      <main id="main">
        <section id="top" className="hero" aria-labelledby="hero-title">
          <div
            className="hero-scene"
            onPointerMove={(e) => {
              if (
                e.pointerType === "mouse" &&
                !matchMedia("(prefers-reduced-motion: reduce)").matches
              ) {
                const rect = e.currentTarget.getBoundingClientRect();
                gsap.to(e.currentTarget, {
                  x: (e.clientX / rect.width - 0.5) * -9,
                  y: (e.clientY / rect.height - 0.5) * -5,
                  duration: 1.6,
                });
              }
            }}
            onPointerLeave={(e) =>
              gsap.to(e.currentTarget, { x: 0, y: 0, duration: 1.6 })
            }
          >
            <img
              className="hero-photo"
              src={assets.hero}
              alt="VELORA Éclat, surrounded by peach and jasmine in the golden light of a Mediterranean sunset"
              fetchPriority="high"
              width="1672"
              height="941"
            />
          </div>
          <div className="hero-shade" />
          <div className="hero-copy">
            <h1 id="hero-title">
              <span>{t.heroOne}</span>
              <strong>{t.heroTwo}</strong>
            </h1>
            <p>{t.heroCopy}</p>
            <a
              className="pill light"
              href="#collection"
              onClick={(e) => {
                e.preventDefault();
                go("#collection");
              }}
            >
              {t.explore}
              <span className="pill-dot">
                <Plus size={20} />
              </span>
            </a>
          </div>
          <div className="hero-caption">
            <span>ÉCLAT</span>
            <span>{t.eau} · 100 ml</span>
          </div>
          <span className="hero-wordmark" aria-hidden="true">
            velora
          </span>
          <button className="scroll-cue" onClick={() => go("#notes")}>
            <span>{t.scroll}</span>
            <MoveDown size={15} />
          </button>
        </section>
        <section id="notes" className="notes-section">
          <div className="story-intro">
            <div className="section-index">
              <span className="tiny-flower">✳</span>
              <span className="eyebrow">01 / {t.label}</span>
            </div>
            <div className="intro-copy">
              <span className="eyebrow">VELORA PARIS</span>
              <h2 className="statement">
                {t.statement.split(" ").map((word, i) => (
                  <span className="statement-word" key={i}>
                    {word}{" "}
                  </span>
                ))}
              </h2>
              <p>{t.storySmall}</p>
            </div>
          </div>
          <div className="scent-grid">
            <button
              className="scent-card wood-card"
              onClick={() => {
                setNote(2);
                go("#composition");
              }}
            >
              <span className="card-tag">03 / {t.noteTabs[2]}</span>
              <img
                src={assets.notes}
                alt="Warm woods in golden light"
                loading="lazy"
                width="1536"
                height="1024"
              />
              <div className="card-copy">
                <h3>{t.wood}</h3>
                <span>{t.woodSub}</span>
              </div>
              <span className="card-plus">
                <Plus size={20} />
              </span>
            </button>
            <button
              className="scent-card bottle-card"
              onClick={() => setPanel("product")}
            >
              <span className="card-tag">{t.signature}</span>
              <img
                src={assets.bottle}
                alt="Éclat eau de parfum"
                loading="lazy"
                width="1086"
                height="1448"
              />
              <div className="card-copy">
                <h3>Éclat</h3>
                <span>{t.eau}</span>
              </div>
              <span className="card-plus">
                <Plus size={20} />
              </span>
            </button>
            <button
              className="scent-card peach-card"
              onClick={() => {
                setNote(0);
                go("#composition");
              }}
            >
              <span className="card-tag">01 / {t.noteTabs[0]}</span>
              <img
                src={assets.notes}
                alt="Fresh peach and white jasmine"
                loading="lazy"
                width="1536"
                height="1024"
              />
              <div className="card-copy">
                <h3>{t.peach}</h3>
                <span>{t.peachSub}</span>
              </div>
              <span className="card-plus">
                <Plus size={20} />
              </span>
            </button>
            <button
              className="scent-card jasmine-card"
              onClick={() => {
                setNote(1);
                go("#composition");
              }}
            >
              <span className="card-tag">02 / {t.noteTabs[1]}</span>
              <div className="jasmine-image">
                <img
                  src={assets.notes}
                  alt="Delicate white jasmine flowers"
                  loading="lazy"
                  width="1536"
                  height="1024"
                />
              </div>
              <div className="card-copy">
                <h3>{t.jasmine}</h3>
                <span>{t.jasmineSub}</span>
              </div>
              <span className="card-plus">
                <Plus size={20} />
              </span>
            </button>
          </div>
          <div className="notes-foot">
            <span>PEACH · JASMINE · SOFT WOODS</span>
            <span>LA COLLECTION ÉCLAT</span>
          </div>
        </section>
        <section id="collection" className="signature">
          <div className="signature-stage">
            <span className="signature-ghost" aria-hidden="true">
              Éclat
            </span>
            <div className="signature-label">
              <span className="eyebrow">02 / {t.signature}</span>
              <span className="eyebrow">VELORA PARIS</span>
            </div>
            <div className="signature-product">
              <img
                className="signature-bottle"
                src={assets.bottle}
                alt="The VELORA Éclat fragrance bottle"
                loading="lazy"
                width="1086"
                height="1448"
              />
              <span className="product-caption">ÉCLAT · {t.eau} · 100 ML</span>
            </div>
            <div className="signature-info">
              <span className="eyebrow">{t.scent}</span>
              <h2>
                <Lines text={t.bottleTitle} />
              </h2>
              <p>{t.bottleCopy}</p>
              <button className="pill dark" onClick={() => setPanel("product")}>
                {t.discover}
                <span className="pill-dot">
                  <Plus size={20} />
                </span>
              </button>
              <span className="product-size">
                {t.eau} · {t.size}
              </span>
            </div>
          </div>
        </section>
        <section className="composition" id="composition">
          <div className="composition-image">
            <img
              src={assets.notes}
              alt="The fragrance palette of peach, jasmine and soft woods"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <span className="image-caption">LES NOTES D’ÉCLAT</span>
          </div>
          <div className="composition-content">
            <span className="eyebrow">{t.notesLabel}</span>
            <h2>{t.notesTitle}</h2>
            <div className="note-tabs" role="tablist" aria-label={t.notesLabel}>
              {t.noteTabs.map((tab, i) => (
                <button
                  role="tab"
                  aria-selected={note === i}
                  aria-controls={`note-panel-${i}`}
                  id={`note-tab-${i}`}
                  tabIndex={note === i ? 0 : -1}
                  key={tab}
                  onClick={() => setNote(i)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const next =
                        (note + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                      setNote(next);
                      document.getElementById(`note-tab-${next}`)?.focus();
                    }
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                  <span>{tab}</span>
                </button>
              ))}
            </div>
            <div
              className="note-description"
              role="tabpanel"
              id={`note-panel-${note}`}
              aria-labelledby={`note-tab-${note}`}
              key={note}
            >
              <span className="eyebrow">{notes[note].sub}</span>
              <h3>{notes[note].name}</h3>
              <p>{notes[note].copy}</p>
            </div>
          </div>
        </section>
        <section className="world" id="story">
          <div className="world-copy">
            <span className="eyebrow">03 / {t.worldLabel}</span>
            <h2>
              <Lines text={t.worldTitle} />
            </h2>
            <p>{t.worldCopy}</p>
            <a
              className="text-link"
              href="#journal"
              onClick={(e) => {
                e.preventDefault();
                go("#journal");
              }}
            >
              {t.worldCta}
              <Plus size={16} />
            </a>
            <span className="world-signature">avec amour, velora</span>
          </div>
          <div className="world-image">
            <img
              src={assets.hero}
              alt="The warm, sunlit world of VELORA"
              width="1672"
              height="941"
              loading="lazy"
            />
            <span className="image-caption">L’ART DES INSTANTS PRÉCIEUX</span>
          </div>
        </section>
        <section className="journal" id="journal">
          <div className="journal-heading">
            <span className="eyebrow">04 / {t.journalLabel}</span>
            <h2>{t.journalTitle}</h2>
          </div>
          <div className="journal-grid">
            {[0, 1].map((i) => (
              <button
                key={i}
                className="journal-card"
                onClick={() => {
                  setArticle(i);
                  setPanel("journal");
                }}
              >
                <div className={`journal-picture ${i === 1 ? "second" : ""}`}>
                  <img
                    src={i === 0 ? assets.hero : assets.notes}
                    alt={
                      i === 0
                        ? "Golden light over the Mediterranean"
                        : "Jasmine, peach and golden wood"
                    }
                    width="1536"
                    height="1024"
                    loading="lazy"
                  />
                  <span className="journal-circle">
                    <Plus size={24} />
                  </span>
                </div>
                <div className="journal-card-info">
                  <span className="eyebrow">
                    0{i + 1} /{" "}
                    {i === 0
                      ? "Inspiration"
                      : lang === "en"
                        ? "Rituals"
                        : "Rituels"}
                  </span>
                  <h3>{i === 0 ? t.articleOne : t.articleTwo}</h3>
                  <span className="text-link">{t.read}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="closing">
          <img
            className="closing-image"
            src={assets.hero}
            alt=""
            width="1672"
            height="941"
            loading="lazy"
          />
          <div className="closing-shade" />
          <div className="closing-content">
            <span className="eyebrow">VELORA PARIS</span>
            <h2>
              {t.closing.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h2>
            <button className="pill light" onClick={() => setPanel("product")}>
              {t.closingCta}
              <span className="pill-dot">
                <Plus size={20} />
              </span>
            </button>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <div>
            <Brand />
            <p>{t.footerLine}</p>
          </div>
          <nav aria-label="Footer">
            <button onClick={() => setPanel("product")}>{t.collections}</button>
            <a
              href="#story"
              onClick={(e) => {
                e.preventDefault();
                go("#story");
              }}
            >
              {t.story}
            </a>
            <a
              href="#journal"
              onClick={(e) => {
                e.preventDefault();
                go("#journal");
              }}
            >
              {t.journal}
            </a>
          </nav>
          <div className="footer-service">
            <button
              onClick={() => {
                setArticle(0);
                setPanel("care");
              }}
            >
              {t.care}
            </button>
            <button
              onClick={() => {
                setArticle(1);
                setPanel("care");
              }}
            >
              {t.privacy}
            </button>
            <button onClick={() => go("#top")}>{t.back}</button>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          velora
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VELORA PARIS</span>
          <span>L’ESSENCE DES BEAUX INSTANTS</span>
          <span>EN / FR</span>
        </div>
        <div className="footer-made">
          <span>
            Made by{" "}
            <a
              href="https://github.com/sakshamfit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>sakshamfit</strong>
            </a>
          </span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className={`modal ${panel === "bag" || panel === "menu" ? "side-modal" : ""}`}
        onClose={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPanel(null);
        }}
        aria-label={
          panel === "bag"
            ? t.bagTitle
            : panel === "search"
              ? t.searchTitle
              : panel === "product"
                ? "Éclat"
                : "VELORA Paris"
        }
      >
        <div className="modal-inner" data-lenis-prevent>
          <button
            className="modal-close icon-button"
            onClick={() => setPanel(null)}
            aria-label={lang === "en" ? "Close" : "Fermer"}
          >
            <X size={24} />
          </button>
          {panel === "search" && (
            <div className="search-panel">
              <span className="eyebrow">VELORA PARIS</span>
              <h2>{t.searchTitle}</h2>
              <div className="search-input">
                <Search size={24} />
                <input
                  autoFocus
                  aria-label={t.searchPlaceholder}
                  placeholder={t.searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="search-results">
                {searchItems.length ? (
                  searchItems.map((item) => (
                    <button key={item.title} onClick={item.action}>
                      <img src={item.image} alt="" width="75" height="90" />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.sub}</small>
                      </span>
                      <Plus size={20} />
                    </button>
                  ))
                ) : (
                  <p>{t.searchEmpty}</p>
                )}
              </div>
            </div>
          )}
          {panel === "product" && (
            <div className="product-modal">
              <div className="product-modal-picture">
                <span className="product-modal-word">Éclat</span>
                <img
                  src={assets.bottle}
                  alt="VELORA Éclat eau de parfum"
                  width="1086"
                  height="1448"
                />
              </div>
              <div className="product-modal-copy">
                <span className="eyebrow">{t.signature}</span>
                <h2>Éclat</h2>
                <p className="product-scent">{t.scent}</p>
                <p>{t.bottleCopy}</p>
                <div className="size-option">
                  <Check size={16} />
                  <span>{t.size}</span>
                </div>
                <button className="pill solid" onClick={add}>
                  {t.add}
                  <ShoppingBag size={18} />
                </button>
                <p className="ordering-note">{t.purchaseInfo}</p>
                <div className="product-notes">
                  <span>01 — {t.peach}</span>
                  <span>02 — {t.jasmine}</span>
                  <span>03 — {t.wood}</span>
                </div>
              </div>
            </div>
          )}
          {panel === "bag" && (
            <div className="bag-panel">
              <span className="eyebrow">VELORA PARIS</span>
              <h2>
                {t.bagTitle} <sup>({bag})</sup>
              </h2>
              {bag ? (
                <>
                  <div className="bag-item">
                    <div className="bag-image">
                      <img
                        src={assets.bottle}
                        alt="Éclat"
                        width="180"
                        height="240"
                      />
                    </div>
                    <div>
                      <h3>Éclat</h3>
                      <p>
                        {t.eau}
                        <br />
                        100 ml
                      </p>
                      <div className="quantity">
                        <button
                          aria-label={
                            lang === "en"
                              ? "Decrease quantity"
                              : "Réduire la quantité"
                          }
                          onClick={() => updateBag(bag - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <output>{bag}</output>
                        <button
                          disabled={bag >= 20}
                          aria-label={
                            lang === "en"
                              ? "Increase quantity"
                              : "Augmenter la quantité"
                          }
                          onClick={() => updateBag(bag + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button className="remove" onClick={() => updateBag(0)}>
                        {t.remove}
                      </button>
                    </div>
                  </div>
                  <p className="bag-information">{t.purchaseInfo}</p>
                  <button className="pill solid" onClick={saveBag}>
                    {t.save}
                    <Check size={18} />
                  </button>
                </>
              ) : (
                <div className="empty-bag">
                  <ShoppingBag size={32} />
                  <h3>{t.bagEmpty}</h3>
                  <p>{t.bagEmptyCopy}</p>
                  <button
                    className="pill dark"
                    onClick={() => setPanel("product")}
                  >
                    {t.discover}
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
          {panel === "menu" && (
            <div className="mobile-panel">
              <Brand />
              <nav>
                <button onClick={() => go("#collection")}>
                  {t.collections}
                </button>
                <button onClick={() => setPanel("product")}>{t.shop}</button>
                <button onClick={() => go("#story")}>{t.story}</button>
                <button onClick={() => go("#journal")}>{t.journal}</button>
              </nav>
              <button className="text-link" onClick={() => setPanel("search")}>
                <Search size={17} />
                {t.searchTitle}
              </button>
              <label className="mobile-language">
                {t.language}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Language)}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </label>
            </div>
          )}
          {panel === "journal" && (
            <article className="article-panel">
              <img
                src={article === 0 ? assets.hero : assets.notes}
                alt="The world of VELORA"
                width="1536"
                height="1024"
              />
              <span className="eyebrow">{t.journalLabel}</span>
              <h2>{article === 0 ? t.articleOne : t.articleTwo}</h2>
              {(lang === "en"
                ? article === 0
                  ? [
                      "There is a moment just before the sun slips away when the world seems to soften. Stone turns honey-coloured. The air is warm, and everything feels a little closer.",
                      "This is the feeling at the heart of Éclat: the luminous sweetness of peach, the quiet beauty of jasmine, the familiar warmth of soft woods. A composition inspired by the light we wish we could keep.",
                      "Some moments pass. Others become part of us.",
                    ]
                  : [
                      "A fragrance is a personal ritual. A pause before the day begins, a small finishing touch before an evening out, or simply something beautiful for yourself.",
                      "Let Éclat settle naturally on the skin. Notice the bright opening, the floral heart, and the soft warmth that follows. Each part of the composition has its own moment.",
                      "Wear it for the occasion. Or let it be the occasion.",
                    ]
                : article === 0
                  ? [
                      "Juste avant que le soleil disparaisse, le monde semble s’adoucir. La pierre devient couleur de miel. L’air est chaud et tout paraît plus proche.",
                      "C’est l’émotion au cœur d’Éclat : la douceur lumineuse de la pêche, la beauté discrète du jasmin, la chaleur familière des bois doux.",
                      "Certains instants passent. D’autres deviennent une part de nous.",
                    ]
                  : [
                      "Le parfum est un rituel personnel. Une pause avant de commencer la journée, une touche avant de sortir, ou simplement un plaisir pour soi.",
                      "Laissez Éclat se poser naturellement sur la peau. Découvrez son envolée lumineuse, son cœur floral et la chaleur douce qui suit.",
                      "Portez-le pour une occasion. Ou faites-en l’occasion.",
                    ]
              ).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <button className="text-link" onClick={() => setPanel("product")}>
                {t.discover}
                <Plus size={16} />
              </button>
            </article>
          )}
          {panel === "care" && (
            <div className="care-panel">
              <span className="eyebrow">VELORA PARIS</span>
              <h2>{article === 0 ? t.care : t.privacy}</h2>
              <p>
                {article === 0
                  ? lang === "en"
                    ? "Keep your fragrance away from direct sunlight and heat. Store the bottle upright with the cap in place, in a cool, dry setting. Let the fragrance dry naturally on the skin."
                    : "Gardez votre parfum à l’abri du soleil et de la chaleur. Rangez le flacon debout et fermé dans un endroit frais et sec. Laissez le parfum sécher naturellement sur la peau."
                  : lang === "en"
                    ? "Your fragrance selection and language preference are saved only in this browser. Search is performed on this page. No payment, order or account is created. Clearing your browser’s site data removes your saved selection."
                    : "Votre sélection et votre langue sont enregistrées uniquement dans ce navigateur. La recherche s’effectue sur cette page. Aucun paiement, commande ou compte n’est créé. Effacer les données du site supprime votre sélection."}
              </p>
              {article === 1 && (
                <button
                  className="pill dark"
                  onClick={() => {
                    updateBag(0);
                    setToast(
                      lang === "en"
                        ? "Your selection has been cleared."
                        : "Votre sélection a été effacée.",
                    );
                  }}
                >
                  {lang === "en"
                    ? "Clear my selection"
                    : "Effacer ma sélection"}
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </dialog>
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        <Check size={16} />
        {toast}
      </div>
    </div>
  );
}
