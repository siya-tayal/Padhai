import { useState, useMemo, useRef } from "react";
import {
  Atom, FlaskConical, Calculator, Leaf, Users2, Brain,
  Lock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Flame, Star, Zap, Home, Settings as SettingsIcon, Trophy,
  ArrowRight, GraduationCap, School, Check, X, CheckCircle2,
  BookOpen, Feather, MessageCircle, Sparkles, Award, RotateCcw,
  Loader2, Send, Quote, Crown, Wand2, Waves, Music2, Scale,
  PenLine, Layers, ScrollText,
} from "lucide-react";

// ===========================================================================
// DESIGN TOKENS (kept consistent with the existing PadhAI visual language)
// ===========================================================================

const C = {
  primary: "#FC8019",
  primaryDark: "#DE6A0F",
  primarySoft: "#FFF1E6",
  ink: "#1F2937",
  inkSoft: "#6B7280",
  inkFaint: "#9CA3AF",
  success: "#16A34A",
  successSoft: "#EAFBEF",
  error: "#EF4444",
  errorSoft: "#FEECEC",
  amber: "#D97706",
  amberSoft: "#FEF3E2",
  gold: "#CA8A04",
  goldSoft: "#FEF9E7",
  orange: "#EA580C",
  accent: "#FFC93C",
  bg: "#FFFFFF",
  bgSoft: "#F7F7F9",
  border: "#E9E9EC",
  cardShadow: "0 1px 2px rgba(20,20,30,0.04), 0 4px 14px rgba(20,20,30,0.05)",
};

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      .padhai-root { font-family: 'Inter', sans-serif; color: ${C.ink}; }
      .padhai-display { font-family: 'Baloo 2', sans-serif; }
      .padhai-mono { font-family: 'IBM Plex Mono', monospace; }
      .ph-btn-primary:hover { background: ${C.primaryDark} !important; }
      .ph-card:hover { transform: translateY(-2px); box-shadow: 0 4px 4px rgba(20,20,30,0.05), 0 10px 22px rgba(20,20,30,0.08) !important; }
      .ph-shell { display: flex; min-height: 100vh; }
      .ph-sidebar { width: 220px; flex: none; display: flex; flex-direction: column; }
      .ph-main { flex: 1; min-width: 0; }
      .ph-side-btn { display: flex; align-items: center; gap: 11px; width: 100%; text-align: left; }
      .ph-fade-in { animation: phFadeIn .25s ease; }
      .ph-tab { transition: all .15s; }
      .ph-spin { animation: phSpin .8s linear infinite; }
      @keyframes phSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes phFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 760px) {
        .ph-shell { flex-direction: column; }
        .ph-sidebar { width: 100%; flex-direction: row; position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; overflow-x: auto; }
        .ph-sidebar-brand, .ph-sidebar-footnote { display: none; }
        .ph-side-btn { flex-direction: column; gap: 3px; justify-content: center; text-align: center; }
        .ph-main { padding-bottom: 64px; }
      }
    `}</style>
  );
}

const secondaryBtnStyle = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 16px", borderRadius: 999,
  border: `2px solid ${C.ink}`, background: C.bg,
  color: C.ink, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
};

const primaryBtnStyle = {
  display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
  padding: "12px 20px", borderRadius: 999, border: "none",
  background: C.primary, color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
};

function Pill({ active, children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 18px", borderRadius: 999,
        border: `2px solid ${active ? C.primary : C.border}`,
        background: active ? C.primary : C.bg,
        color: active ? "#fff" : disabled ? C.inkFaint : C.ink,
        fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap", opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Crumb({ items }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, fontSize: 13, color: C.inkSoft, marginBottom: 18 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <ChevronRight size={13} />}
          {it.onClick ? (
            <button onClick={it.onClick} style={{ background: "none", border: "none", padding: 0, color: C.inkSoft, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {it.label}
            </button>
          ) : (
            <span style={{ color: C.ink, fontWeight: 700 }}>{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function LinearBar({ pct, color = C.success, height = 7 }) {
  return (
    <div style={{ height, borderRadius: height, background: C.bgSoft, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: height, transition: "width .3s" }} />
    </div>
  );
}

function StreakBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: C.primarySoft }}>
        <Flame size={15} color={C.primary} fill={C.primary} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark }}>5</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "#FFF9E8" }}>
        <Star size={15} color={C.accent} fill={C.accent} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#8A6A0F" }}>120 XP</span>
      </div>
    </div>
  );
}

function SectionCard({ children, style }) {
  return (
    <div style={{ border: `2px solid ${C.border}`, borderRadius: 18, background: C.bg, boxShadow: C.cardShadow, padding: "20px 22px", ...style }}>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <h2 className="padhai-display" style={{ fontSize: 17, fontWeight: 800, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={17} color={C.primary} />} {children}
    </h2>
  );
}

// ===========================================================================
// BOARDS / GRADES / SUBJECTS — scoped to this release: ICSE only, Grades
// 11 & 12 only. CBSE and every subject except English render as
// "Coming soon" rather than being hidden, so students can see the roadmap.
// ===========================================================================

const BOARDS = [
  { id: "ICSE", name: "ICSE / ISC", blurb: "Council for the Indian School Certificate Examinations", enabled: true },
  { id: "CBSE", name: "CBSE", blurb: "Central Board of Secondary Education", enabled: false },
];

const GRADES = [11, 12];

const SUBJECTS = [
  { id: "english", name: "English", icon: BookOpen, color: "#FC8019", bg: "#FFF1E6", enabled: true },
  { id: "sociology", name: "Sociology", icon: Users2, color: "#8B5CF6", bg: "#F3EEFF", enabled: false },
  { id: "economics", name: "Economics", icon: Scale, color: "#0EA5E9", bg: "#E8F7FF", enabled: false },
  { id: "physics", name: "Physics", icon: Atom, color: "#3B82F6", bg: "#EAF2FF", enabled: false },
  { id: "biology", name: "Biology", icon: Leaf, color: "#16A34A", bg: "#EAFBEF", enabled: false },
  { id: "math", name: "Mathematics", icon: Calculator, color: "#D97706", bg: "#FEF3E2", enabled: false },
  { id: "psychology", name: "Psychology", icon: Brain, color: "#DB2777", bg: "#FDECF3", enabled: false },
];

// ===========================================================================
// CONTENT — SHORT STORIES (ICSE/ISC Classes XI-XII: "Reverie" prose section)
// Each story is written up the way a teacher builds a lesson: context first,
// then theme, a plot walk-through in beats (not the full text — a taught
// summary), character sketches, the literary devices worth quoting in an
// exam, and an exam tip. Sample lines are short, paraphrased teaching cues,
// not reproductions of the original text.
// ===========================================================================

const SHORT_STORIES = [
  {
    id: "build-fire",
    title: "To Build a Fire",
    author: "Jack London",
    context: "A naturalist adventure story set in the brutal cold of the Yukon during the Klondike gold rush, when men travelled alone through country that does not forgive mistakes.",
    theme: "Nature is indifferent, not cruel — it simply does not care about human confidence. The story argues that survival depends on respecting instinct and experience over pride in one's own reasoning.",
    summary: [
      { heading: "The setting out", text: "An unnamed newcomer to the Yukon sets off alone at seventy below zero to meet his friends at camp, ignoring an old-timer's warning that no one should travel alone in such cold." },
      { heading: "Overconfidence", text: "He notices the cold but treats it only as a physical fact, never as a threat — he trusts his own judgement over the accumulated experience of the men who've survived this land." },
      { heading: "The first fire", text: "He breaks through hidden ice into a spring, soaking his legs, and manages to build a fire under a spruce tree to dry out and save himself." },
      { heading: "The fire goes out", text: "Snow sliding from the tree's branches smothers the fire completely, and his numbed hands make a second fire almost impossible to build." },
      { heading: "The end", text: "Panicked, he tries running to restore circulation, briefly considers killing his dog for warmth, and finally accepts death with a strange, quiet dignity, letting go of fear." },
    ],
    characters: [
      { name: "The man", traits: "Practical, unimaginative, and overconfident; he thinks in facts, not consequences, which is exactly what dooms him." },
      { name: "The dog", traits: "Guided by instinct rather than reasoning; it senses the danger the man dismisses, and survives because it trusts that instinct completely." },
      { name: "The old-timer (offstage)", traits: "Represents inherited wisdom and experience — the voice of caution the man chose to ignore." },
    ],
    devices: [
      { device: "Naturalism", example: "London deliberately strips the story of sentimentality — the cold is described almost scientifically, reinforcing that nature has no motive, good or bad." },
      { device: "Foreshadowing", example: "Early references to the man's lack of imagination quietly predict his failure to imagine what could go wrong." },
      { device: "Irony", example: "The man's practical confidence, his supposed strength, is precisely what removes his ability to sense danger the way the dog can." },
    ],
    quotes: [
      { quote: "he was quick and alert in the things of life, but only in the things, and not in the significances", explain: "This single line is the thesis of the whole story: the man notices facts but never grasps what they mean for his survival." },
      { quote: "the trouble with him was that he was without imagination", explain: "London names the man's fatal flaw directly — imagination here means the ability to picture consequences, not fantasy." },
    ],
    examTip: "When asked about theme, always connect the man's death to his personality flaw (lack of imagination), not merely to 'the cold' — examiners reward causal reasoning, not plot repetition.",
  },
  {
    id: "story-of-an-hour",
    title: "The Story of an Hour",
    author: "Kate Chopin",
    context: "A very short, tightly compressed story from the late nineteenth century, written at a time when a married woman's identity was almost entirely defined by her husband.",
    theme: "The story explores the difference between grief and the deeper, more dangerous emotion beneath it: a longing for selfhood and freedom that marriage, even a kind one, can suppress.",
    summary: [
      { heading: "The news", text: "Mrs Mallard is told gently, because of her weak heart, that her husband Brently has died in a railroad accident, and she weeps at once, openly." },
      { heading: "Alone in the room", text: "She goes upstairs alone and, staring out of an open window at the spring day, feels something rising in her that she initially tries to suppress." },
      { heading: "The realisation", text: "She recognises the feeling as freedom, not sorrow — she whispers 'free, free, free' and begins imagining a future of years that will belong only to her." },
      { heading: "Coming downstairs", text: "She descends, transformed, describing herself to her sister as feeling almost joyful, like a 'goddess of Victory'." },
      { heading: "The twist", text: "Brently Mallard walks in, alive and unharmed — he had not even been near the accident — and Mrs Mallard dies instantly, of what the doctors call 'joy that kills'." },
    ],
    characters: [
      { name: "Louise Mallard", traits: "Outwardly a devoted, fragile wife; inwardly someone who has, perhaps for the first time, tasted the idea of independence." },
      { name: "Josephine", traits: "Louise's well-meaning sister, whose gentleness in breaking the news shows how fragile society assumes women to be." },
      { name: "Brently Mallard", traits: "Not unkind, but his mere existence as 'husband' is enough to represent the loss of Louise's autonomy — the story is not really about his character at all." },
    ],
    devices: [
      { device: "Irony (situational)", example: "The final line's 'joy that kills' is read by the other characters as joy at her husband's survival, but the reader knows it is the shock of losing her freedom." },
      { device: "Symbolism", example: "The open window and the spring imagery outside represent the new life and possibility Louise briefly imagines for herself." },
      { device: "Compression", example: "Chopin fits an entire emotional arc — grief, awakening, joy, collapse — into roughly an hour of story time, mirroring the title." },
    ],
    quotes: [
      { quote: "free, free, free!", explain: "The repetition marks the exact moment Louise stops performing grief and admits what she actually feels." },
      { quote: "a monstrous joy", explain: "Chopin uses 'monstrous' deliberately — Louise herself is shocked and half-ashamed at how strong her relief is." },
    ],
    examTip: "Do not summarise this story as 'a woman is happy her husband died' — examiners want you to distinguish between Louise's specific longing for autonomy and any dislike of Brently as a person; the story is feminist in structure, not a story of a bad marriage.",
  },
  {
    id: "singing-lesson",
    title: "The Singing Lesson",
    author: "Katherine Mansfield",
    context: "Set in a girls' school, the story uses a single ordinary singing class to dramatise the emotional whiplash of heartbreak and reconciliation.",
    theme: "Emotion colours perception — the same music, the same room, the same students look utterly different to Miss Meadows depending on whether she believes her engagement is broken or restored.",
    summary: [
      { heading: "The blow", text: "Miss Meadows arrives to teach her singing class having just received a note from her fiancé Basil breaking off their engagement, and her despair spreads into how she conducts the lesson." },
      { heading: "Grief through song", text: "She makes the girls sing a mournful song about life being 'a Tragedy, a Tragedy', projecting her own devastation onto the classroom." },
      { heading: "Interruption", text: "A second telegram arrives from Basil taking back his words, claiming he wrote in a moment of nervousness, and asking to buy a hat-trimming as if nothing happened." },
      { heading: "The transformation", text: "Miss Meadows is instantly and completely happy again, and she has the girls switch abruptly to a cheerful song about a lark on the wing." },
      { heading: "The irony of the ending", text: "The students, confused by the sudden mood swing, simply adjust and sing along — the adult world of romantic anxiety passes over them entirely." },
    ],
    characters: [
      { name: "Miss Meadows", traits: "Emotionally intense and quick to catastrophise; her self-worth is dangerously tied to Basil's approval." },
      { name: "Basil", traits: "Never directly present, but his casual, almost trivial tone in both letters reveals someone less invested than Miss Meadows — the relationship is unequal." },
      { name: "The students", traits: "A collective character whose bewildered obedience highlights how oblivious the young are to adult emotional turmoil, and how quickly a teacher's mood can dictate a whole room." },
    ],
    devices: [
      { device: "Mood-as-structure", example: "Mansfield builds the entire plot around a mood swing rather than external action — the 'event' of the story is emotional, not physical." },
      { device: "Symbolism through song choice", example: "The two songs the class sings ('Tragedy' and the lark song) work as an emotional barometer, literally set to music." },
      { device: "Irony", example: "The comic, almost callous ease with which Basil undoes his own heartbreaking letter satirises how disproportionate Miss Meadows's despair was to the actual stability of the relationship." },
    ],
    quotes: [
      { quote: "life... a Tragedy, a Tragedy", explain: "Miss Meadows has the class over-emphasise this line, showing how she is using the lesson to perform her own pain." },
      { quote: "buy a hat-trimming", explain: "This throwaway detail in Basil's reconciliation telegram is what makes his character seem casual rather than genuinely remorseful." },
    ],
    examTip: "Examiners like candidates to notice that Mansfield never shows Basil directly — you're expected to infer his character purely from the tone of his letters, so always quote his exact phrasing when discussing him.",
  },
  {
    id: "sound-machine",
    title: "The Sound Machine",
    author: "Roald Dahl",
    context: "A science-fiction-tinted story about a man who builds a device to hear sounds beyond the normal range of human hearing, blurring the line between scientific curiosity and obsession.",
    theme: "The story questions what we choose not to notice — Klausner's machine reveals that ordinary, everyday violence (cutting flowers, felling trees) may cause suffering we've simply trained ourselves to ignore.",
    summary: [
      { heading: "The invention", text: "Klausner, a nervous, obsessive amateur scientist, finishes building a machine designed to convert high-frequency sound into something the human ear can hear." },
      { heading: "The scream of the flowers", text: "Testing it in his garden, he hears an anguished scream when his neighbour Mrs Saunders cuts roses, and later when he himself slices through a stem." },
      { heading: "The tree", text: "He asks a gardener to cut down a large tree and hears, through the machine, a deep, terrible groan as the axe bites in — a sound of far greater suffering than the flowers." },
      { heading: "Dismissal", text: "Klausner tries to explain what he's discovered to his doctor, Dr Scott, who treats him kindly but sceptically, clearly viewing him as unwell rather than as a discoverer." },
      { heading: "The ending", text: "Klausner, undeterred and increasingly consumed by his discovery, prepares to keep listening, hinting that his obsession — and his isolation from a world that won't listen — will only deepen." },
    ],
    characters: [
      { name: "Klausner", traits: "Highly strung, intelligent, and isolated; his sensitivity to a truth others can't perceive makes him seem visionary and unstable at once." },
      { name: "Dr Scott", traits: "Calm, rational, and dismissive; represents conventional science and social respectability, unwilling to entertain what he cannot measure through familiar tools." },
      { name: "Mrs Saunders", traits: "An ordinary, cheerful neighbour whose casual rose-cutting becomes, unknowingly, the story's first act of 'violence'." },
      { name: "The tree (non-living)", traits: "Functions almost as a character — ancient, silent, and suddenly given a voice of agony through the machine, making the reader reconsider what 'silence' actually means." },
    ],
    devices: [
      { device: "Personification", example: "Plants and trees are given the capacity to scream and groan, forcing the reader to question the boundary between living pain and inanimate matter." },
      { device: "Ambiguity", example: "Dahl never confirms whether Klausner is a misunderstood genius or simply losing his grip on reality, and the story is stronger for refusing to decide for the reader." },
      { device: "Tone shift", example: "The story moves from clinical, technical description of the machine to something closer to horror once the screaming begins." },
    ],
    quotes: [
      { quote: "a piercing, almost inhuman shriek", explain: "The violence of this description for something as ordinary as cutting a rose is what unsettles the reader and Klausner both." },
      { quote: "a deep, low, agonising groan", explain: "The tree's sound is described in far more visceral terms than the flowers', building the story's escalation toward the final act of felling it." },
    ],
    examTip: "When discussing Klausner, avoid simply calling him 'mad' — ICSE examiners reward answers that weigh both possibilities (genuine discovery vs. mental breakdown) using evidence from the text.",
  },
  {
    id: "b-wordsworth",
    title: "B. Wordsworth",
    author: "V. S. Naipaul",
    context: "Set in Port of Spain, Trinidad, and narrated by a boy looking back on his childhood, the story is part of Naipaul's 'Miguel Street' collection about ordinary, eccentric lives in a colonial Caribbean neighbourhood.",
    theme: "The story is about the quiet dignity of an unfulfilled dream, and about how a child's encounter with a gentle eccentric can teach him to see the world, and poetry, differently.",
    summary: [
      { heading: "The strange visitor", text: "A thin, gentle stranger calling himself 'B. Wordsworth' — after William Wordsworth — appears at the narrator's house asking to watch bees, and the boy's mother almost sends him away." },
      { heading: "Building a friendship", text: "B. Wordsworth returns, and the boy is drawn into his unhurried, poetic way of seeing ordinary things — a falling leaf, moonlight, the calls of vendors — as if they were poems in progress." },
      { heading: "The greatest poem in the world", text: "B. Wordsworth tells the boy he is writing one line of a great poem every month, so that it will be finished, and perfect, only after thirty years." },
      { heading: "His past", text: "He reveals a buried grief: a wife and child he loved and lost, which explains the sorrow beneath his gentle, playful exterior." },
      { heading: "The ending", text: "Years later B. Wordsworth dies, and the narrator learns his poem never existed — yet the memory of him, and of a house and mango tree now demolished, remains the truest thing left behind." },
    ],
    characters: [
      { name: "B. Wordsworth", traits: "Gentle, whimsical, and quietly heartbroken; he chooses to live inside beauty and imagination because reality once wounded him too deeply." },
      { name: "The narrator (as a boy)", traits: "Curious and impressionable; his growing attachment to B. Wordsworth shapes his early understanding of poetry, loss, and kindness." },
      { name: "The narrator's mother", traits: "Practical and suspicious of idleness, representing the ordinary adult world that has little patience for dreamers." },
    ],
    devices: [
      { device: "Frame narration / retrospect", example: "The adult narrator looks back on childhood, letting the story carry both a child's wonder and an adult's understanding of what was really happening." },
      { device: "Symbolism", example: "The mango tree and the house symbolise B. Wordsworth's inner world; their demolition at the story's end mirrors the disappearance of the man himself." },
      { device: "Bittersweet/tragicomic tone", example: "Naipaul mixes humour (the eccentric bee-watching) with real sorrow (the lost family), so the story never settles into pure comedy or pure tragedy." },
    ],
    quotes: [
      { quote: "the greatest poem in the world", explain: "This phrase captures both B. Wordsworth's gentle self-mockery and the sincerity of his devotion to an impossible, perfect idea." },
      { quote: "I am also a poet", explain: "His simple self-introduction to the boy sets up his whole philosophy — that a poet's job is noticing, not necessarily finishing anything." },
    ],
    examTip: "When writing on B. Wordsworth's character, always connect his 'eccentricity' back to his grief — examiners specifically look for candidates who explain the cause of his behaviour, not just describe it.",
  },
  {
    id: "fritz",
    title: "Fritz",
    author: "Satyajit Ray",
    context: "A ghost story narrated by the author's alter-ego Sandip, set on a holiday trip, drawing on the classic device of a childhood object that returns with a supernatural charge.",
    theme: "The story examines how the past — even something as small as a broken toy — can hold an emotional claim on us long after we think we've forgotten it.",
    summary: [
      { heading: "The reunion trip", text: "Sandip and his old school friend Jayanto travel together, and Jayanto recalls Fritz, a wooden doll he owned as a child in Shillong and once broke in anger, burying it near a stream." },
      { heading: "Returning to Shillong", text: "The two revisit the old house, and Jayanto is drawn, almost against his will, to search for the spot where he buried Fritz decades earlier." },
      { heading: "The unsettling find", text: "Improbably, they discover the doll again, intact, and strange, unexplainable things begin happening around Jayanto afterward." },
      { heading: "Escalation", text: "Jayanto grows disturbed and ill, as though the doll's return has reopened something from his childhood that was never fully resolved." },
      { heading: "The ambiguous ending", text: "The story ends without fully explaining whether Fritz is truly supernatural or a symptom of Jayanto's own guilt and memory, leaving the reader unsettled rather than reassured." },
    ],
    characters: [
      { name: "Jayanto", traits: "Outwardly successful and rational as an adult, but still carrying unresolved childhood guilt over how he treated Fritz." },
      { name: "Sandip (the narrator)", traits: "Calm and observant; his measured narration makes the strange events feel more, not less, credible." },
      { name: "Fritz (non-living)", traits: "A doll that functions almost as a character in its own right — small, inanimate, yet carrying enough emotional weight to unsettle a grown man." },
    ],
    devices: [
      { device: "The uncanny", example: "Ray builds dread not through monsters but through the wrongness of an ordinary object — a childhood toy — reappearing exactly where it was buried." },
      { device: "Ambiguity", example: "The story deliberately withholds a clear supernatural explanation, letting guilt and the paranormal remain equally possible readings." },
      { device: "Restrained, understated style", example: "Ray keeps the prose calm and factual even as events grow strange, which makes the horror feel more real rather than theatrical." },
    ],
    quotes: [
      { quote: "buried and forgotten", explain: "This description of Fritz early in the story turns out to be ironic — nothing about the doll, or Jayanto's guilt, was ever really forgotten." },
      { quote: "something was not right", explain: "The narrator's understated unease is typical of the story's restrained horror, letting suggestion do the frightening rather than explicit description." },
    ],
    examTip: "For 'Fritz', examiners often ask whether the ending is supernatural or psychological — the strongest answers argue both readings using specific details, rather than picking one side outright.",
  },
  {
    id: "quality",
    title: "Quality",
    author: "John Galsworthy",
    context: "Written in early twentieth-century England, the story is a quiet elegy for traditional craftsmanship being pushed out by mass production and advertising.",
    theme: "The story mourns the death of individual craftsmanship and integrity in a world increasingly driven by speed, price, and marketing rather than quality.",
    summary: [
      { heading: "Introducing Mr Gessler", text: "The narrator describes Mr Gessler, a German bootmaker in London whose handmade boots are things of rare, almost artistic quality, made slowly and to exact measure." },
      { heading: "A shrinking trade", text: "Over repeated visits across years, the narrator notices Gessler's shop growing shabbier and his brothers' branches disappearing, as cheaper, mass-produced boots from big firms take over the market." },
      { heading: "Gessler's stubborn integrity", text: "Despite worsening business, Gessler refuses to lower his standards, still insisting on months of careful work for a single perfect pair of boots." },
      { heading: "Decline", text: "The narrator, feeling guilty for having quietly bought boots elsewhere once or twice out of convenience, notices Gessler looking increasingly aged, hungry, and worn down." },
      { heading: "The ending", text: "The narrator learns that Gessler has died, essentially of slow starvation, having worked without rest to complete orders even as larger firms undercut him — he was, in the narrator's words, killed by 'competition'." },
    ],
    characters: [
      { name: "Mr Gessler", traits: "Meticulous, proud, and quietly heroic in his refusal to compromise on craftsmanship, even at the cost of his own survival." },
      { name: "The narrator", traits: "An admiring but somewhat complicit customer, whose occasional lapses into buying cheaper boots elsewhere mirror society's broader betrayal of true craftsmen." },
      { name: "The big firms (collective/non-living force)", traits: "Never given individual characters, but function as the story's real antagonist — impersonal, efficient, and utterly indifferent to the human cost of undercutting Gessler's trade." },
    ],
    devices: [
      { device: "Symbolism", example: "Gessler's boots symbolise integrity and individual craftsmanship, while the shrinking shopfront symbolises the retreat of that older world." },
      { device: "Understatement", example: "Gessler's death is reported plainly, almost in passing, which makes its quiet tragedy hit harder than a dramatic description would." },
      { device: "Social commentary", example: "Galsworthy uses one small bootmaker's story to critique the entire economic shift toward mass production and advertising in his era." },
    ],
    quotes: [
      { quote: "it was slow death", explain: "This phrase, describing Gessler's decline, ties his physical starvation directly to the commercial pressures that squeezed his shop out of business." },
      { quote: "made them fit", explain: "Repeated praise for how perfectly Gessler's boots fit is the story's shorthand for personal care versus impersonal, one-size-for-all manufacturing." },
    ],
    examTip: "In answers on 'Quality', always name the specific cause of Gessler's death (undercutting by mass-production firms) rather than writing vaguely about 'sadness' — examiners want the economic argument, not just the emotional one.",
  },
];

// ===========================================================================
// CONTENT — POETRY ("Reverie: A Collection of ISC Poems")
// ===========================================================================

const POEMS = [
  {
    id: "darkling-thrush",
    title: "The Darkling Thrush",
    poet: "Thomas Hardy",
    context: "Written right at the turn of the twentieth century (dated 31 December 1900), the poem stands at the exact hinge between an old century ending and a new one beginning.",
    theme: "The poem sets a bleak, dying landscape against one small, illogical burst of hope — a thrush's song — asking whether hope can exist without a visible reason.",
    structure: "Two stanzas of pure desolation followed by two stanzas built around the thrush's song, in steady rhymed quatrains that mimic a hymn-like, almost resigned tone.",
    stanzaNotes: [
      "Stanza 1 paints a frost-grey, corpse-like winter landscape, with the speaker leaning on a gate at dusk.",
      "Stanza 2 extends the imagery of death, comparing the century's end to a corpse laid out, and calling every living thing around the speaker 'fervourless'.",
      "Stanza 3 introduces the thrush suddenly — old, frail, and small — yet singing with unexpected joy into the gloom.",
      "Stanza 4 admits there is 'so little cause for carolings', and concludes the bird might know some 'blessed Hope' the speaker cannot perceive.",
    ],
    message: "Hope, the poem suggests, does not need to be justified by visible circumstances to be real — it may simply exist, carried by something as fragile as a bird's song.",
    devices: [
      { device: "Personification/pathetic fallacy", example: "The dying century is described almost as a corpse, so that the landscape itself seems to mourn." },
      { device: "Contrast", example: "The frail, aged thrush is deliberately set against the vastness of its 'ecstatic sound', making the hope feel disproportionate and therefore more striking." },
    ],
  },
  {
    id: "birches",
    title: "Birches",
    poet: "Robert Frost",
    context: "A reflective, conversational New England poem that begins with an ordinary rural sight — bent birch trees — and moves into memory and philosophy.",
    theme: "The poem is about the pull between the responsibilities of adult life ('Earth') and a longing for imaginative escape (climbing toward 'Heaven'), while never fully wanting to leave the world behind.",
    structure: "Written in blank verse (unrhymed iambic pentameter), giving it the loose, thinking-aloud quality of natural speech rather than a formal song.",
    stanzaNotes: [
      "The poem opens by noticing birches permanently bent, and playfully imagines a boy swinging on them caused the bending, before admitting ice storms are the real cause.",
      "The speaker then indulges the boyhood fantasy anyway, describing a boy who climbs and swings the birches as a form of mastery and joyful escape.",
      "The speaker admits he was 'once' that boy himself, and wishes he could return to that kind of play when 'weary of considerations'.",
      "The final lines resolve the tension: the speaker wants to climb 'toward heaven' briefly, but insists Earth is 'the right place for love' and he wants to come back down.",
    ],
    message: "Imagination and escape are valuable, even necessary, but Frost ultimately affirms commitment to ordinary, grounded life over permanent flight from it.",
    devices: [
      { device: "Extended metaphor", example: "Climbing birches becomes a metaphor for temporarily escaping life's burdens without abandoning life itself." },
      { device: "Conversational blank verse", example: "The unrhymed, flexible rhythm mimics natural thought, making the poem feel like someone reasoning aloud rather than reciting." },
    ],
  },
  {
    id: "crossing-the-bar",
    title: "Crossing the Bar",
    poet: "Alfred, Lord Tennyson",
    context: "Written late in Tennyson's life and, by his own request, placed as the final poem in every collection of his work — it was intended as his farewell.",
    theme: "The poem reimagines death not as something to fear but as a calm sea voyage out of the harbour of life, guided by a 'Pilot' the speaker hopes to meet 'face to face'.",
    structure: "Four short quatrains with a gentle, rocking rhyme scheme that mirrors the calm tide the poem describes.",
    stanzaNotes: [
      "Stanza 1 asks for 'one clear call' and a calm sea, so the speaker can set out without the 'moaning of the bar' (a sandbar, associated with a rough, mournful crossing).",
      "Stanza 2 describes a tide 'too full for sound and foam', suggesting a death so peaceful it returns the speaker to where they came from without struggle.",
      "Stanza 3 accepts the coming of 'twilight and evening bell', and 'after that the dark', without protest.",
      "Stanza 4 hopes to see the 'Pilot' — a figure representing God or a guiding force — in person once the crossing is complete.",
    ],
    message: "Death, approached with faith and calm acceptance, can be as gentle as a boat quietly leaving harbour on a still tide.",
    devices: [
      { device: "Extended metaphor", example: "The entire poem sustains a single metaphor of death as sailing out to sea, avoiding any direct or frightening language about dying." },
      { device: "Symbolism", example: "The 'Pilot' symbolises a divine guide the speaker trusts to be waiting beyond the crossing." },
    ],
  },
  {
    id: "dover-beach",
    title: "Dover Beach",
    poet: "Matthew Arnold",
    context: "Written as Victorian confidence in religious faith was being shaken by science and doubt, the poem is spoken as though to a companion, looking out over the English Channel at night.",
    theme: "The poem mourns the retreat of religious faith ('the Sea of Faith') from the modern world, and proposes human love and loyalty as the only steady comfort left in an uncertain, often violent world.",
    structure: "Irregular, unrhymed-feeling free verse with shifting line lengths, mirroring the poem's own theme of a world that has lost its settled 'certitude'.",
    stanzaNotes: [
      "The opening describes a calm, moonlit sea at Dover, but the calm is undercut by the 'grating roar' of pebbles as waves pull back, introducing an 'eternal note of sadness'.",
      "The poem recalls Sophocles hearing the same sad sound in the Aegean, linking human sorrow across history.",
      "The central image describes faith as a sea that was once full ('like the folds of a bright girdle furled') but is now retreating, leaving 'naked shingles of the world'.",
      "The final stanza turns directly to the speaker's companion, asking for mutual love and 'true' faithfulness, since the world, for all its apparent beauty, has 'really neither joy, nor love, nor light... nor certitude'.",
    ],
    message: "In a world where larger certainties (religious faith, meaning) are retreating, Arnold suggests that private human love and loyalty are what people must hold onto instead.",
    devices: [
      { device: "Extended metaphor", example: "The 'Sea of Faith' metaphor turns an abstract crisis of belief into a physical image of a tide pulling away from the shore." },
      { device: "Allusion", example: "The reference to Sophocles links Arnold's personal Victorian anxiety to a much older, universal human sadness." },
      { device: "Auditory imagery", example: "The 'grating roar' of the pebbles is used to physically embody sorrow, so the reader hears the sadness as well as reads about it." },
    ],
  },
  {
    id: "music-makers",
    title: "We Are the Music Makers",
    poet: "Arthur O'Shaughnessy",
    context: "An ode to artists, dreamers and visionaries, claiming for them a quiet but decisive power over the course of history and civilisation.",
    theme: "The poem argues that poets, musicians and dreamers — though they may look idle or impractical — are actually the ones who imagine the future before anyone else builds it.",
    structure: "Flowing, musical stanzas with a strong regular rhyme and rhythm, appropriately 'singable' given the poem's subject.",
    stanzaNotes: [
      "The opening stanza famously claims the music makers are 'the movers and shakers / Of the world for ever, it seems', despite seeming to just 'dream' by lonely rivers.",
      "Later stanzas describe how empires, cities and great deeds all began as a dreamer's 'song' before anyone else believed in them.",
      "The poem insists that each new age is built out of one dreamer's 'dying' and another's fresh idea, so the dreamers of today are quietly shaping tomorrow.",
      "The final stanza reasserts the poem's claim with confidence: the imagination of artists directs the real, practical achievements of the wider world.",
    ],
    message: "Artistic imagination is not decorative or secondary to 'real' achievement — it is the hidden origin of every achievement that follows.",
    devices: [
      { device: "Anaphora/refrain", example: "Repeated structures like 'We are the...' build the poem's chant-like, almost prophetic confidence." },
      { device: "Hyperbole", example: "Crediting dreamers with literally building 'the world's great cities' is a deliberate overstatement used to make the reader take imagination seriously." },
    ],
  },
  {
    id: "the-tiger",
    title: "The Tiger",
    poet: "William Blake",
    context: "Part of Blake's 'Songs of Experience', written as a companion and contrast to his earlier, gentler 'The Lamb' from 'Songs of Innocence'.",
    theme: "The poem questions how a single Creator could make both something as fearsome as the tiger and something as gentle as the lamb, confronting the coexistence of beauty, violence and mystery in creation.",
    structure: "Short, hammering rhymed couplets in a strong, insistent rhythm that mimics the beat of a blacksmith's hammer — appropriate to the poem's forging imagery.",
    stanzaNotes: [
      "The famous opening ('Tiger Tiger, burning bright') sets the tiger as something almost supernatural, glowing 'in the forests of the night'.",
      "The middle stanzas imagine the tiger's creation in industrial, blacksmith terms — 'what the hammer? what the chain?' — as though it were forged rather than born.",
      "One stanza directly asks whether the same God who made the lamb also made the tiger, the poem's central unresolved question.",
      "The final stanza repeats the opening almost exactly, but the repeated question now carries the full weight of the poem's unresolved awe and fear.",
    ],
    message: "Blake refuses to resolve the tension between innocence and experience, gentleness and violence — the poem's power lies in holding the question open rather than answering it.",
    devices: [
      { device: "Rhetorical questions", example: "The poem is built almost entirely out of unanswered questions, forcing the reader to sit with the mystery rather than receive a moral." },
      { device: "Industrial/forging imagery", example: "Words like 'hammer', 'anvil' and 'furnace' describe the tiger's creation as something manufactured and deliberate, deepening its menace." },
    ],
  },
];

// ===========================================================================
// CONTENT — THE TEMPEST (William Shakespeare)
// A dedicated "chapter" with sub-chapters (context, act-by-act, themes,
// style), a slide-by-slide visual retelling, and expandable character
// profile cards (verbs used to describe them + AI-style trait bullets with
// a textual example for each trait). Two entries are deliberately
// non-living: Ariel (a spirit) and the Island itself.
// ===========================================================================

const TEMPEST = {
  id: "tempest",
  title: "The Tempest",
  author: "William Shakespeare",
  icon: Wand2,
  subChapters: [
    {
      id: "context",
      name: "Context & Background",
      paragraphs: [
        "Believed to be Shakespeare's last solo-written play, probably first performed in 1611. It is often read as his personal farewell to the stage, since Prospero gives up his 'magic' — his art — at the end, much as Shakespeare was retiring from playwriting.",
        "The play draws on real accounts of a 1609 shipwreck off Bermuda, and on the wider Renaissance fascination with distant islands, colonisation, and the encounter between 'civilised' Europeans and 'foreign' inhabitants.",
        "It belongs to Shakespeare's late 'romances' — plays that mix tragedy, comedy and magic, and that resolve in reconciliation and forgiveness rather than in death.",
      ],
    },
    {
      id: "act1",
      name: "Act I — The storm and the backstory",
      paragraphs: [
        "A violent storm wrecks a ship carrying King Alonso of Naples and his court. We soon learn the storm was conjured by Prospero, the rightful Duke of Milan, using his magical powers.",
        "Prospero explains to his daughter Miranda that his brother Antonio, helped by Alonso, usurped his dukedom twelve years earlier and set them adrift at sea; they survived and landed on this island, where Prospero has ruled ever since with the help of his spirit servant Ariel and his slave Caliban.",
        "Prospero uses Ariel to lure young Ferdinand, the King's son, toward Miranda, setting the young couple's romance — and his own plan for reconciliation — into motion.",
      ],
    },
    {
      id: "act2",
      name: "Act II — Plots within plots",
      paragraphs: [
        "The shipwrecked nobles wander the island. Antonio persuades Sebastian (Alonso's brother) to murder the sleeping King so Sebastian can seize the throne, mirroring Antonio's own earlier betrayal of Prospero — Ariel intervenes just in time to wake the King.",
        "Meanwhile the comic subplot begins: the jester Trinculo and the drunken butler Stephano meet Caliban, who — dazzled by Stephano's liquor — proposes they kill Prospero and take over the island themselves.",
      ],
    },
    {
      id: "act3",
      name: "Act III — Courtship and comic conspiracy",
      paragraphs: [
        "Ferdinand, made to labour by Prospero as a test of sincerity, declares his love for Miranda, and she accepts him — Prospero secretly watches and approves.",
        "Caliban, Stephano and Trinculo's plot against Prospero becomes increasingly farcical and drunken, providing comic relief while echoing the play's serious theme of rebellion against authority.",
        "Ariel, invisible, torments the conspiracy plotters and later appears as a harpy to confront Alonso, Antonio and Sebastian with their guilt over wronging Prospero.",
      ],
    },
    {
      id: "act4",
      name: "Act IV — The masque and the warning",
      paragraphs: [
        "Prospero blesses Ferdinand and Miranda's engagement with a magical masque performed by spirits, celebrating fertility and marriage.",
        "He breaks off the masque abruptly, remembering Caliban's plot, and famously reflects that 'we are such stuff / As dreams are made on' — the illusion of the masque dissolving becomes a meditation on the fleeting nature of life itself.",
        "Prospero and Ariel use illusions (glittering clothes) to distract and capture the drunken conspirators.",
      ],
    },
    {
      id: "act5",
      name: "Act V — Forgiveness and the final release",
      paragraphs: [
        "Prospero, urged by Ariel's account of the nobles' suffering, decides that 'the rarer action is / In virtue than in vengeance' and chooses forgiveness over revenge.",
        "He reveals himself to Alonso and the court, restores Ferdinand to his father, and announces the marriage of Ferdinand and Miranda, reconciling the two dukedoms.",
        "Prospero breaks his staff and drowns his magic book, giving up his power; he frees Ariel from service, and asks the audience for applause and release in the closing epilogue.",
      ],
    },
    {
      id: "themes",
      name: "Themes",
      list: [
        { theme: "Power and legitimate authority", explain: "The play repeatedly tests who deserves to rule — Prospero's stolen dukedom, Antonio's usurpation, Caliban's claim to the island, and the comic plot to crown a drunken butler all interrogate what makes power legitimate." },
        { theme: "Colonialism", explain: "Prospero's control over Caliban and the island invites reading as an allegory of European colonisation — Caliban's resentment ('this island's mine') gives the 'colonised' figure a real, if limited, voice." },
        { theme: "Forgiveness over revenge", explain: "Prospero has every means to destroy his enemies but chooses reconciliation, making the play's resolution about mercy rather than punishment." },
        { theme: "Illusion and reality / art and magic", explain: "Prospero's magic mirrors the theatre itself — spectacle, illusion, and control over an audience — and his giving up magic parallels Shakespeare's own retirement from playwriting." },
      ],
    },
    {
      id: "style",
      name: "Style & dramatic devices",
      list: [
        { theme: "The unities", explain: "Unusually for Shakespeare, the play roughly obeys the classical unities of time, place and action — the entire plot unfolds on one island within a few hours." },
        { theme: "Masque form", explain: "Prospero's wedding masque in Act IV borrows from the courtly masque tradition, blending drama with music, dance and spectacle." },
        { theme: "Verse vs prose", explain: "Prospero, Miranda and Ferdinand mostly speak in blank verse (marking nobility and seriousness), while the comic conspirators Stephano and Trinculo speak in prose, marking their lower status and comic role." },
      ],
    },
  ],
  slides: [
    { title: "A ship, and a storm", text: "A violent tempest tosses a royal ship near a mysterious island — but the storm is not natural. It is Prospero's doing.", iconKey: "storm" },
    { title: "The Duke who lost everything", text: "Prospero tells his daughter Miranda the truth: he was once Duke of Milan, betrayed by his own brother Antonio and set adrift at sea twelve years ago.", iconKey: "crown" },
    { title: "Ariel, the spirit of the air", text: "Prospero commands Ariel, an airy spirit he freed from imprisonment, to carry out the shipwreck and guide events on the island exactly as he plans.", iconKey: "spirit" },
    { title: "Caliban, the island's first inhabitant", text: "Caliban, son of the witch Sycorax, was ruling the island before Prospero arrived; now he serves Prospero bitterly, resenting his loss of freedom.", iconKey: "island" },
    { title: "Two young hearts", text: "Ferdinand, the King's son, is led by Ariel's music to Miranda. The two fall in love almost instantly — exactly as Prospero intended.", iconKey: "love" },
    { title: "A murder plotted", text: "Ashore, Antonio persuades Sebastian to kill the sleeping King Alonso and seize his crown — echoing Antonio's own crime against Prospero years earlier.", iconKey: "plot" },
    { title: "A drunken rebellion", text: "Caliban meets the shipwrecked Stephano and Trinculo, and — dazzled by wine — convinces them to help him murder Prospero and rule the island.", iconKey: "comic" },
    { title: "A test of love", text: "Prospero forces Ferdinand to carry logs as a trial. Ferdinand endures it gladly for Miranda's sake, proving his love is real.", iconKey: "labour" },
    { title: "Spirits and a vanishing feast", text: "Ariel appears as a monstrous harpy before the guilty nobles, reminding them of their crime against Prospero and vanishing their magical banquet before their eyes.", iconKey: "harpy" },
    { title: "A wedding blessing dissolves", text: "Prospero conjures spirits to bless Ferdinand and Miranda's engagement, then breaks the vision off mid-celebration, reflecting that we are 'such stuff as dreams are made on'.", iconKey: "masque" },
    { title: "Mercy, not revenge", text: "With his enemies finally in his power, Prospero chooses forgiveness: 'the rarer action is in virtue than in vengeance.'", iconKey: "forgive" },
    { title: "Breaking the staff", text: "Prospero reveals himself, restores the dukedom, blesses the marriage, frees Ariel, and finally gives up his magic for good — burying his staff and drowning his book.", iconKey: "release" },
  ],
  characters: [
    {
      name: "Prospero",
      isLiving: true,
      role: "The rightful Duke of Milan, now ruler of the island through magic",
      verbs: ["usurped", "commands", "orchestrates", "forgives", "renounces"],
      traits: [
        { trait: "Controlling and manipulative", bullet: "Prospero stage-manages almost every event on the island — the storm, the young couple's romance, even the nobles' guilt — treating people as pieces in his plan.", example: "He deliberately makes Ferdinand carry logs as an artificial 'test', even though he already approves of the match, purely to control the pace of events." },
        { trait: "Capable of real growth", bullet: "Despite total power over his enemies, he ultimately chooses mercy over revenge, marking a genuine change from the bitterness he shows early in the play.", example: "His line about 'virtue' rather than 'vengeance' marks the turning point where his character grows beyond simple retribution." },
        { trait: "Identified with the artist/magician", bullet: "His magic is repeatedly compared to theatrical illusion, and his decision to give it up is widely read as Shakespeare's own farewell to playwriting.", example: "He calls the vanishing masque an 'insubstantial pageant', directly comparing his magic to a stage performance." },
      ],
    },
    {
      name: "Ariel",
      isLiving: false,
      role: "A spirit of the air, bound to serve Prospero in exchange for freedom",
      verbs: ["obeys", "enchants", "torments", "yearns", "is freed"],
      traits: [
        { trait: "Obedient but longing for freedom", bullet: "Ariel serves faithfully but constantly reminds Prospero of the promise to be released, showing service under duress rather than loyalty alone.", example: "Ariel repeatedly asks Prospero, 'Is there more toil?', pressing for the freedom he was promised." },
        { trait: "Morally sensitive, despite being non-human", bullet: "Ariel is the one who suggests Prospero should feel compassion for the suffering nobles, nudging the human character toward mercy.", example: "Ariel tells Prospero that if he himself, being 'but air', would feel for the men's suffering, then Prospero — being human — should feel it more." },
        { trait: "Playful and theatrical", bullet: "Ariel enjoys performing illusions — music, the harpy, the vanishing banquet — treating magic almost like an art form rather than mere duty.", example: "Ariel's transformation into a screeching harpy to frighten the guilty lords is staged with theatrical relish rather than simple menace." },
      ],
    },
    {
      name: "Caliban",
      isLiving: true,
      role: "Son of the witch Sycorax; the island's original inhabitant, now Prospero's resentful servant",
      verbs: ["resents", "curses", "plots", "worships (mistakenly)", "repents"],
      traits: [
        { trait: "Justifiably resentful", bullet: "Caliban has a real grievance — his island and freedom were taken from him — which gives his anger a moral weight the play doesn't fully dismiss.", example: "He insists 'this island's mine, by Sycorax my mother', directly asserting a claim of ownership Prospero has ignored." },
        { trait: "Easily deceived", bullet: "Despite his intelligence, he is quick to mistake Stephano's wine for godhood, showing how desperate he is for any escape from servitude.", example: "He kneels to Stephano and offers to 'kiss thy foot', mistaking a drunken butler for a god." },
        { trait: "Capable of poetic sensitivity", bullet: "Surprisingly, Caliban is given some of the play's most lyrical lines about the island's beauty, complicating any simple reading of him as merely a 'monster'.", example: "He describes the island as full of 'sounds and sweet airs, that give delight and hurt not', a startlingly gentle image from a character otherwise defined by resentment." },
      ],
    },
    {
      name: "Miranda",
      isLiving: true,
      role: "Prospero's daughter, raised on the island since early childhood",
      verbs: ["marvels", "pities", "falls in love", "obeys", "questions"],
      traits: [
        { trait: "Innocent and compassionate", bullet: "Having grown up isolated from society, she reacts to the shipwrecked strangers with pure sympathy rather than suspicion.", example: "Her famous exclamation 'O brave new world, that has such people in't!' shows unguarded wonder at humanity she has barely encountered." },
        { trait: "Quietly assertive", bullet: "Though obedient to her father, she is willing to speak up for Ferdinand and to offer him help against Prospero's orders, showing an independent will beneath her innocence.", example: "She offers to carry logs for Ferdinand herself, directly defying her father's imposed task for him." },
      ],
    },
    {
      name: "Ferdinand",
      isLiving: true,
      role: "Son of King Alonso of Naples",
      verbs: ["grieves", "endures", "loves", "proves himself"],
      traits: [
        { trait: "Sincere and patient", bullet: "He accepts Prospero's harsh test of log-carrying without complaint, proving his love for Miranda is not shallow infatuation.", example: "He says the labour is made light because he thinks of Miranda while performing it, reframing hardship as devotion." },
      ],
    },
    {
      name: "The Island",
      isLiving: false,
      role: "The isolated setting of the entire play — as much a presence as a place",
      verbs: ["enchants", "isolates", "conceals", "transforms"],
      traits: [
        { trait: "A world of illusion and control", bullet: "The island itself seems to bend to Prospero's will, filled with strange music, visions and magic that make it impossible for characters to trust their own senses.", example: "Multiple characters comment on the island's mysterious music, which seems to come from everywhere and nowhere at once." },
        { trait: "A mirror for each character", bullet: "The island shows different things to different people — a paradise to Gonzalo, a prison to Caliban, a romance to Ferdinand — suggesting the setting reflects each character's inner state rather than having one fixed meaning.", example: "Gonzalo praises the island's fertility and ease, while in the very same scene Antonio and Sebastian see only opportunity for murder." },
      ],
    },
  ],
};

// ===========================================================================
// CONTENT — THE MERCHANT OF VENICE (William Shakespeare)
// ===========================================================================

const MERCHANT = {
  id: "merchant",
  title: "The Merchant of Venice",
  author: "William Shakespeare",
  icon: Scale,
  subChapters: [
    {
      id: "context",
      name: "Context & Background",
      paragraphs: [
        "Written around 1596-97, the play is usually classed as a comedy because it ends in marriages and reconciliation, but its treatment of Shylock has made it one of Shakespeare's most debated and uncomfortable plays for modern readers.",
        "Venice in the play is shown as a wealthy trading city built on international commerce and strict contract law — the bond at the centre of the plot only works because Venetian law is expected to honour agreements to the letter.",
        "Elizabethan attitudes toward Jewish people (who had been officially expelled from England for centuries) shape Shylock's portrayal; modern productions and classrooms often read the play as exposing, rather than simply endorsing, the prejudice of Venice's Christian characters.",
      ],
    },
    {
      id: "act1",
      name: "Act I — The bond is struck",
      paragraphs: [
        "Antonio, a wealthy but melancholy merchant, agrees to help his friend Bassanio, who needs money to travel to Belmont and court the wealthy heiress Portia.",
        "Since Antonio's own money is tied up in ships at sea, he borrows three thousand ducats from Shylock, a Jewish moneylender he has long insulted and spat on for lending at interest.",
        "Shylock, concealing deep resentment, proposes the bond 'in a merry sport': if Antonio cannot repay in time, Shylock may cut a pound of flesh from nearest his heart.",
      ],
    },
    {
      id: "act2",
      name: "Act II — Suitors and an elopement",
      paragraphs: [
        "In Belmont, Portia's suitors must choose correctly among gold, silver and lead caskets to win her hand, as decreed by her late father's will; the Prince of Morocco and the Prince of Arragon both choose wrongly and are rejected.",
        "In Venice, Shylock's daughter Jessica, ashamed of her father's house, elopes with the Christian Lorenzo, taking money and jewels with her — deepening Shylock's bitterness.",
      ],
    },
    {
      id: "act3",
      name: "Act III — The bond falls due",
      paragraphs: [
        "Bassanio chooses the lead casket correctly, reasoning that true worth is not in outward show, and wins Portia; his friend Gratiano simultaneously becomes engaged to Portia's companion Nerissa.",
        "News arrives that all of Antonio's ships are lost, meaning he cannot repay Shylock, who — now doubly wounded by Jessica's elopement and years of Christian contempt — refuses mercy and insists on the letter of the bond.",
        "Shylock's famous 'Hath not a Jew eyes?' speech argues that Jewish people share the same humanity, and the same capacity for revenge, as those who have mistreated them.",
      ],
    },
    {
      id: "act4",
      name: "Act IV — The trial scene",
      paragraphs: [
        "At the Venetian court, Shylock demands his pound of flesh despite offers of far more money, and the Duke is unable to legally deny him without breaking Venice's own commercial law.",
        "Portia, disguised as a young lawyer named Balthazar, first urges Shylock toward mercy ('The quality of mercy is not strained'), and when he refuses, finds a legal loophole: the bond permits flesh but no blood, so any spilled blood forfeits Shylock's estate.",
        "Shylock is left with nothing: his bond is void, his estate is halved (one part to Antonio, one to the state), and he is forced to convert to Christianity — a harsh, unresolved punishment that troubles many readers.",
      ],
    },
    {
      id: "act5",
      name: "Act V — Rings and reconciliation",
      paragraphs: [
        "Back in Belmont, the play shifts into pure comedy: Portia and Nerissa, still disguised, trick their new husbands Bassanio and Gratiano over the rings they swore never to give away.",
        "The couples are reconciled with laughter, and news arrives that Antonio's ships have, after all, returned safely — the play ends in marriage and restored fortune for everyone except Shylock, whose absence from this final happiness is conspicuous.",
      ],
    },
    {
      id: "themes",
      name: "Themes",
      list: [
        { theme: "Mercy versus justice", explain: "The trial scene stages a direct conflict between the strict letter of the law (which Shylock demands) and the Christian ideal of mercy (which Portia appeals to) — though the 'mercy' shown to Shylock himself is famously incomplete." },
        { theme: "Prejudice and revenge", explain: "Shylock's cruelty is shown as, at least partly, a response to years of Christian contempt and humiliation, complicating any simple 'villain' reading of his character." },
        { theme: "Appearance versus reality", explain: "The casket plot (gold and silver look valuable but are wrong; lead looks poor but is right) runs throughout the play, including in Portia's disguise as a male lawyer." },
        { theme: "Love and friendship", explain: "Antonio's extraordinary sacrifice for Bassanio, and Portia's devotion once married, both test how far love and loyalty should extend." },
      ],
    },
    {
      id: "style",
      name: "Style & dramatic devices",
      list: [
        { theme: "Dual settings", explain: "Venice (commerce, law, conflict) and Belmont (romance, harmony, riddles) are deliberately contrasted, and the plot alternates between them." },
        { theme: "Disguise and dramatic irony", explain: "Portia and Nerissa's disguise as lawyer and clerk lets the audience enjoy dramatic irony the other characters don't share, especially in the ring trick." },
        { theme: "Rhetorical set-pieces", explain: "Both Shylock's 'Hath not a Jew eyes?' and Portia's 'quality of mercy' speeches are built as persuasive set-piece arguments, ideal for close quotation in exam answers." },
      ],
    },
  ],
  slides: [
    { title: "A merchant's favour", text: "Antonio, a wealthy Venetian merchant, agrees to help his friend Bassanio win the heart of the wealthy Portia by borrowing money on his behalf.", iconKey: "ship" },
    { title: "A dangerous bond", text: "With his own fortune tied up at sea, Antonio borrows from Shylock, a moneylender he has long scorned — the loan is sealed with a bond: a pound of flesh if it isn't repaid in time.", iconKey: "bond" },
    { title: "Three caskets", text: "In Belmont, Portia's suitors must choose between gold, silver and lead caskets to win her hand, as her father's will demands.", iconKey: "casket" },
    { title: "A daughter runs away", text: "Shylock's daughter Jessica, ashamed of her father, elopes with Lorenzo, taking gold and jewels — wounding Shylock further.", iconKey: "elope" },
    { title: "The right choice", text: "Bassanio chooses the plain lead casket, reasoning that true worth doesn't need a glittering surface, and wins Portia.", iconKey: "love" },
    { title: "Ships lost at sea", text: "Word arrives that all of Antonio's ships have been wrecked — he cannot repay Shylock, and the bond falls due.", iconKey: "storm" },
    { title: "'Hath not a Jew eyes?'", text: "Shylock, wounded by years of contempt, refuses mercy and defends his right to revenge with one of Shakespeare's most powerful speeches on shared humanity.", iconKey: "speech" },
    { title: "A courtroom drama", text: "At the trial, the Duke cannot overturn Venetian law, and Shylock demands his pound of flesh despite offers of far greater payment.", iconKey: "court" },
    { title: "A lawyer in disguise", text: "Portia, secretly disguised as a young lawyer, first begs Shylock for mercy, then finds a legal trap: the bond allows flesh, but not one drop of blood.", iconKey: "disguise" },
    { title: "The tables turn", text: "Unable to take his pound of flesh without spilling blood, Shylock loses the case entirely — his wealth is divided and he is forced to convert to Christianity.", iconKey: "verdict" },
    { title: "A trick with rings", text: "Back in Belmont, Portia and Nerissa — still in disguise — trick their new husbands into giving up the rings they swore to keep forever.", iconKey: "ring" },
    { title: "Fortune restored", text: "The rings are revealed as a playful trick, and news comes that Antonio's ships have safely returned — the play ends in laughter and reunion, for everyone except Shylock.", iconKey: "resolve" },
  ],
  characters: [
    {
      name: "Shylock",
      isLiving: true,
      role: "A Jewish moneylender in Venice, and Jessica's father",
      verbs: ["is scorned", "lends", "insists", "argues", "is defeated"],
      traits: [
        { trait: "Wounded and vengeful", bullet: "Shylock's demand for the pound of flesh is driven as much by years of humiliation as by simple cruelty, giving his revenge a disturbing logic.", example: "He recalls being called 'dog' and spat on 'about my beard' by Antonio, directly linking his coldness to specific, remembered insults." },
        { trait: "Capable of powerful, humanising rhetoric", bullet: "His most famous speech insists on the shared humanity of Jewish people with everyone else in Venice, undercutting any simple 'monster' reading of his character.", example: "He asks, 'if you prick us, do we not bleed?', turning physical similarity into an argument for equal humanity." },
        { trait: "Rigid and legalistic", bullet: "His insistence on the exact letter of the bond, even against huge sums of money, shows both his stubbornness and his (ultimately fatal) trust in the law protecting him.", example: "He repeatedly refuses larger payments, saying 'I will have my bond', prioritising the letter of the contract over any material gain." },
      ],
    },
    {
      name: "Portia",
      isLiving: true,
      role: "A wealthy heiress of Belmont, bound by her father's casket-choosing will",
      verbs: ["is courted", "disguises herself", "argues", "outwits", "reconciles"],
      traits: [
        { trait: "Intelligent and resourceful", bullet: "She singlehandedly saves Antonio's life by finding a legal loophole none of the professional men in the courtroom noticed.", example: "Her realisation that the bond permits flesh but not blood turns Shylock's own contract against him." },
        { trait: "Eloquent", bullet: "Her plea for mercy is one of the play's most quoted passages, showing her command of persuasive, poetic language even in disguise.", example: "She describes mercy as something that 'droppeth as the gentle rain from heaven', appealing to Shylock before resorting to legal trickery." },
        { trait: "Playful beneath her seriousness", bullet: "After the high tension of the trial, she orchestrates the lighthearted ring trick on her own husband, showing a teasing, confident side to her character.", example: "She deliberately asks Bassanio for his ring as 'payment' while disguised, setting up the joke she springs on him later in Belmont." },
      ],
    },
    {
      name: "Antonio",
      isLiving: true,
      role: "The 'merchant' of the title, a wealthy but melancholy Venetian",
      verbs: ["grieves", "sacrifices", "insults", "is condemned", "is spared"],
      traits: [
        { trait: "Selflessly loyal", bullet: "He risks his life on the bond purely to help Bassanio's courtship succeed, showing extraordinary, arguably excessive, devotion to friendship.", example: "He tells Bassanio his 'purse, my person' are entirely at his friend's disposal, before the bond is even proposed." },
        { trait: "Openly prejudiced", bullet: "His history of insulting and spitting on Shylock is presented candidly, complicating any reading of him as simply an innocent victim.", example: "Shylock reminds him directly that he has called him 'misbeliever, cut-throat dog' in the past." },
      ],
    },
    {
      name: "Bassanio",
      isLiving: true,
      role: "Antonio's friend, suitor to Portia",
      verbs: ["borrows", "courts", "chooses", "is tested"],
      traits: [
        { trait: "Values substance over appearance", bullet: "His reasoning for choosing the plain lead casket over the flashier gold and silver ones reveals a thoughtful character beneath his initial dependence on borrowed money.", example: "He rejects the gold casket's showy inscription, arguing that 'the world is still deceived with ornament'." },
      ],
    },
    {
      name: "Jessica",
      isLiving: true,
      role: "Shylock's daughter",
      verbs: ["is ashamed", "elopes", "abandons", "assimilates"],
      traits: [
        { trait: "Torn between two worlds", bullet: "Her elopement and conversion to marry Lorenzo can be read either as an escape from an oppressive home or as a betrayal of her father, and the play leaves this genuinely ambiguous.", example: "She calls her own home a 'hell' before running away, yet the theft of her father's belongings on the way out complicates any purely sympathetic reading." },
      ],
    },
    {
      name: "The Bond (non-living)",
      isLiving: false,
      role: "The legal contract for a pound of flesh, at the centre of the entire plot",
      verbs: ["binds", "threatens", "is honoured", "is defeated"],
      traits: [
        { trait: "A symbol of the letter versus the spirit of the law", bullet: "The bond is written in a way that seems monstrous yet is entirely legal, forcing every character — and the audience — to confront how literally law should be applied.", example: "The Duke of Venice himself admits he cannot deny Shylock's claim without undermining Venetian law's authority over all future contracts." },
        { trait: "A mirror of Shylock's own literalism", bullet: "The bond's ultimate defeat comes from the same rigid literalism Shylock used to demand it — flesh is permitted, but not one drop of blood — making its downfall ironic rather than accidental.", example: "Portia's ruling exploits the bond's silence on blood precisely because Shylock always insisted on reading it to the exact letter." },
      ],
    },
  ],
};

const PLAYS = [TEMPEST, MERCHANT];

// ===========================================================================
// CONTENT — Q&A PRACTICE BANK
// Model answers are written the way an ICSE board-checker expects: an
// introduction, an explanation paragraph with evidence, and a conclusion.
// `keywords` are matched (case-insensitive, whole word/phrase) and rendered
// bold + underlined + orange inside the answer text.
// ===========================================================================

const QA_BANK = [
  {
    id: "qa-fire-1", textTitle: "To Build a Fire", category: "Short Story", marks: 6,
    question: "Why does the man in 'To Build a Fire' die, and what does his death suggest about the story's theme?",
    keywords: ["lack of imagination", "instinct", "overconfidence", "naturalism", "indifferent"],
    answer: {
      intro: "The man in Jack London's 'To Build a Fire' dies because of a fatal combination of extreme cold and his own personal failing, and his death is used by London to make a wider point about humanity's place in nature.",
      explanation: "On the surface, the man dies because he breaks through river ice, soaks his legs, and cannot restart a fire after snow smothers it. But London makes clear the real cause is the man's lack of imagination: he never truly pictures what could go wrong, ignoring the old-timer's warning and trusting his own practical judgement over inherited experience. His dog, guided purely by instinct, survives precisely because it senses the danger the man's overconfidence blinds him to. The story is written in a naturalistic style, describing the cold almost scientifically, to stress that nature is indifferent rather than malicious — it does not punish the man out of cruelty, it simply does not care whether he lives or dies.",
      conclusion: "The man's death therefore is not really a story about bad luck in bad weather, but about the danger of overconfidence in the face of a natural world that offers no mercy and no explanation, only consequences.",
    },
  },
  {
    id: "qa-fire-2", textTitle: "To Build a Fire", category: "Short Story", marks: 4,
    question: "Contrast the man and the dog in 'To Build a Fire'.",
    keywords: ["instinct", "reasoning", "imagination", "experience"],
    answer: {
      intro: "London builds the story around a clear contrast between the man's reliance on reasoning and the dog's reliance on instinct.",
      explanation: "The man judges the cold as a fact to be managed practically, trusting his own experience and dismissing warnings; this reasoning ultimately fails him because he cannot truly imagine the danger he is in. The dog, by contrast, has no capacity for such reasoning, but its instinct correctly senses that travelling is unsafe, and it survives by trusting that instinct completely, even resisting the man's commands.",
      conclusion: "The contrast suggests that inherited instinct and experience can sometimes be more reliable guides to survival than confident, individual human reasoning.",
    },
  },
  {
    id: "qa-hour-1", textTitle: "The Story of an Hour", category: "Short Story", marks: 6,
    question: "How does Kate Chopin use irony in 'The Story of an Hour', and what effect does it create?",
    keywords: ["situational irony", "freedom", "joy that kills", "autonomy"],
    answer: {
      intro: "Kate Chopin builds 'The Story of an Hour' almost entirely around situational irony, most powerfully in its final line.",
      explanation: "Louise Mallard is told her husband has died and, after initial grief, secretly experiences a rush of joy at the freedom and autonomy this loss will give her. When her husband returns alive, she collapses and dies; the doctors conclude she died of 'joy that kills', assuming she was overjoyed at his survival. The reader, however, knows the devastating irony is reversed: her true joy was at the idea of his death, and what actually kills her is the sudden loss of that imagined freedom. This irony forces the reader to see the gap between how society interprets a woman's emotions (as devotion to her husband) and what she may actually feel (a longing for independence).",
      conclusion: "The irony therefore does more than create a twist ending — it exposes how limited a married woman's freedom was assumed to be, making the story a compact but powerful comment on autonomy.",
    },
  },
  {
    id: "qa-hour-2", textTitle: "The Story of an Hour", category: "Short Story", marks: 4,
    question: "What role does the open window play in 'The Story of an Hour'?",
    keywords: ["symbolism", "freedom", "spring"],
    answer: {
      intro: "The open window Louise sits before is one of the story's central symbols.",
      explanation: "Looking out at the spring day — trees, birdsong, patches of blue sky — Louise begins to feel a new sense of possibility rising in her, separate from her grief. The window functions as a boundary between her old, constrained life indoors and an imagined future of open, independent living, its imagery of new spring life reinforcing the idea of personal rebirth.",
      conclusion: "The window therefore visually stages Louise's inner transformation, turning an ordinary domestic detail into the symbolic threshold of her brief taste of freedom.",
    },
  },
  {
    id: "qa-singing-1", textTitle: "The Singing Lesson", category: "Short Story", marks: 6,
    question: "How does Katherine Mansfield use the singing lesson itself to reflect Miss Meadows's emotions?",
    keywords: ["mood", "song", "irony", "emotional"],
    answer: {
      intro: "Mansfield structures the entire story around a single singing lesson, using the songs the class performs as a direct mirror of Miss Meadows's shifting emotional state.",
      explanation: "At the start, devastated by Basil's letter breaking their engagement, Miss Meadows has the girls sing a mournful song describing life as 'a Tragedy', clearly projecting her own despair onto an ordinary classroom exercise. When a second telegram arrives reversing the break-up, her mood flips instantly, and she abruptly switches the class to a cheerful song about a lark, with no explanation to the bewildered students. The stark contrast between the two songs, chosen entirely by an adult's private emotional crisis, exposes how disproportionately a teacher's inner turmoil can shape a lesson meant to be about music, not romance.",
      conclusion: "Mansfield uses this device to comically, but pointedly, show how personal emotion can completely override professional composure, with the students left simply to follow along.",
    },
  },
  {
    id: "qa-sound-1", textTitle: "The Sound Machine", category: "Short Story", marks: 6,
    question: "Is Klausner in 'The Sound Machine' a visionary or a man losing his sanity? Support your view with evidence.",
    keywords: ["ambiguity", "obsession", "perception", "isolated"],
    answer: {
      intro: "Roald Dahl deliberately leaves Klausner's true state ambiguous, and a strong answer should weigh both possibilities rather than choosing only one.",
      explanation: "As evidence for genuine discovery, Klausner's machine is described with careful technical plausibility, and the sounds he hears — flowers screaming, a tree groaning as it is felled — are consistent and repeatable rather than random hallucinations. As evidence of instability, his nervous, obsessive personality is established from the outset, and Dr Scott's calm, dismissive response frames him as unwell rather than credible, reflecting how conventional science reacts to claims it cannot measure. Dahl never resolves which reading is correct, using this uncertainty to unsettle the reader rather than offer comfort.",
      conclusion: "The strongest reading of the story is that Dahl refuses to choose for us: Klausner may be uncovering a real, uncomfortable truth about hidden suffering, or he may be an isolated, obsessive man spiralling into breakdown, and the story's power lies precisely in that unresolved tension.",
    },
  },
  {
    id: "qa-bwordsworth-1", textTitle: "B. Wordsworth", category: "Short Story", marks: 6,
    question: "What does the character of B. Wordsworth teach the narrator about poetry and about life?",
    keywords: ["grief", "imagination", "gentle", "poet"],
    answer: {
      intro: "B. Wordsworth teaches the young narrator to notice beauty in ordinary things, while also, without either of them naming it directly, teaching him something about grief.",
      explanation: "Through their unhurried walks and conversations, B. Wordsworth shows the boy that a falling leaf, moonlight, or a street vendor's call can be treated as poetry simply through close, patient attention — his claim to be writing 'the greatest poem in the world' one line a month reveals a philosophy that values noticing and process over finished achievement. Only later does the narrator learn that B. Wordsworth's gentle, playful manner conceals real sorrow: the loss of a wife and child. This context reframes his entire character, suggesting his devotion to small beauties is partly a way of surviving grief he cannot otherwise express.",
      conclusion: "By the story's end, the narrator — and the reader — understand that B. Wordsworth's imaginative way of seeing the world was never simple eccentricity, but a quiet, dignified response to loss.",
    },
  },
  {
    id: "qa-fritz-1", textTitle: "Fritz", category: "Short Story", marks: 6,
    question: "How does Satyajit Ray build a sense of the uncanny in 'Fritz' without relying on an explicit monster or ghost?",
    keywords: ["uncanny", "ambiguity", "restrained", "ordinary"],
    answer: {
      intro: "Ray builds dread in 'Fritz' through the wrongness of an entirely ordinary object rather than through any conventional monster.",
      explanation: "The unsettling core of the story is the impossible reappearance of Fritz, a childhood doll Jayanto buried decades earlier — its return in exactly the place he left it turns something small and familiar into something deeply uncanny. Ray's restrained, factual narration style, delivered through the calm observer Sandip, refuses to sensationalise events, which paradoxically makes the strangeness feel more credible rather than theatrical. The story also withholds a clear explanation, letting Jayanto's buried childhood guilt and a genuinely supernatural reading remain equally possible.",
      conclusion: "This combination of an ordinary object, calm narration, and deliberate ambiguity is what allows 'Fritz' to unsettle the reader without ever showing anything conventionally monstrous.",
    },
  },
  {
    id: "qa-quality-1", textTitle: "Quality", category: "Short Story", marks: 6,
    question: "What social change does John Galsworthy critique through the story of Mr Gessler in 'Quality'?",
    keywords: ["craftsmanship", "mass production", "competition", "integrity"],
    answer: {
      intro: "Through the quiet tragedy of Mr Gessler's decline, Galsworthy critiques the rise of mass production and advertising at the expense of individual craftsmanship.",
      explanation: "Gessler's handmade boots, made slowly and to exact personal measure, represent an older standard of quality and integrity that refuses to compromise even as cheaper, factory-made boots from larger firms take over the market. The narrator's own occasional lapses — quietly buying boots elsewhere out of convenience — mirror how ordinary customers, without any malice, contribute to destroying the very craftsmanship they admire. Gessler's eventual death, effectively from overwork and near-starvation, is presented not as personal misfortune but as the direct cost of a market that no longer rewards patient, individual quality.",
      conclusion: "Galsworthy therefore uses one small bootmaker's story to mourn a broader historical shift, arguing that economic 'progress' through mass production has a real human cost that is easy for society to overlook.",
    },
  },
  {
    id: "qa-darkling-1", textTitle: "The Darkling Thrush", category: "Poem", marks: 5,
    question: "How does Thomas Hardy use the image of the thrush to explore the idea of hope?",
    keywords: ["hope", "contrast", "bleak", "frail"],
    answer: {
      intro: "Hardy sets a bleak, dying winter landscape against the sudden, unexplained song of an old, frail thrush to explore whether hope needs a visible reason to exist.",
      explanation: "The poem's first half describes a corpse-like, 'fervourless' landscape at the close of a century, offering the reader no obvious grounds for optimism. Into this scene the thrush appears, described as aged and worn, yet it sings with an 'ecstatic sound' that seems entirely disproportionate to its surroundings and even its own frailty. Hardy admits there is 'so little cause for carolings', and can only guess that the bird senses some 'blessed Hope' invisible to the speaker.",
      conclusion: "Through this deliberate contrast, Hardy suggests that hope may not depend on visible justification at all — it can exist quietly, almost illogically, in the smallest and least likely of places.",
    },
  },
  {
    id: "qa-birches-1", textTitle: "Birches", category: "Poem", marks: 5,
    question: "Explain the central conflict Robert Frost presents in 'Birches'.",
    keywords: ["escape", "earth", "responsibility", "imagination"],
    answer: {
      intro: "'Birches' is built around Frost's tension between the pull of imaginative escape and his ultimate commitment to grounded, ordinary life.",
      explanation: "The image of a boy swinging on birch trees becomes an extended metaphor for temporarily rising above life's burdens, and the speaker admits he would like to climb 'toward heaven' again when 'weary of considerations'. Yet Frost resists any permanent escape, insisting Earth is 'the right place for love' and that he wants only to swing away briefly before coming back down.",
      conclusion: "The poem therefore resolves its central conflict not by rejecting escape, but by affirming that imagination is most valuable as a temporary relief, not a replacement for ordinary, grounded living.",
    },
  },
  {
    id: "qa-bar-1", textTitle: "Crossing the Bar", category: "Poem", marks: 5,
    question: "How does Tennyson present death in 'Crossing the Bar'?",
    keywords: ["metaphor", "calm", "pilot", "acceptance"],
    answer: {
      intro: "Tennyson presents death not as something to be feared, but as a calm, natural sea voyage guided by faith.",
      explanation: "The extended metaphor of setting sail on a still tide, with 'no moaning of the bar', reframes dying as a peaceful departure rather than a violent ending. The speaker asks only for a calm crossing and hopes to meet the 'Pilot' — a symbol for God or a guiding force — face to face once the journey is complete, expressing quiet acceptance rather than dread.",
      conclusion: "Through this sustained metaphor, Tennyson transforms death from an event to be feared into a gentle, faith-guided transition, fitting for a poem intended as his personal farewell.",
    },
  },
  {
    id: "qa-dover-1", textTitle: "Dover Beach", category: "Poem", marks: 5,
    question: "What does the 'Sea of Faith' symbolise in 'Dover Beach', and what does Arnold offer in its place?",
    keywords: ["sea of faith", "doubt", "love", "certitude"],
    answer: {
      intro: "The 'Sea of Faith' is Arnold's central symbol for a religious certainty he believes is retreating from the modern world.",
      explanation: "He describes faith as once full, 'like the folds of a bright girdle furled', but now withdrawing, leaving only 'naked shingles' behind — a bare, comfortless world stripped of settled belief. Facing a world that has 'really neither joy, nor love, nor light... nor certitude', Arnold turns instead to his companion, asking for mutual, private love and faithfulness as the only steady comfort left.",
      conclusion: "In place of a lost, collective religious certainty, Arnold offers a smaller, human-scaled substitute: loyal love between two people, as a fragile defence against a confusing and often violent world.",
    },
  },
  {
    id: "qa-music-1", textTitle: "We Are the Music Makers", category: "Poem", marks: 5,
    question: "According to O'Shaughnessy, why do 'dreamers' matter to the world?",
    keywords: ["dreamers", "imagination", "movers and shakers"],
    answer: {
      intro: "O'Shaughnessy argues that dreamers and artists, though they may appear idle, are actually responsible for shaping the future of civilisation.",
      explanation: "He directly calls poets and music makers the 'movers and shakers / Of the world for ever', insisting that great cities, empires and achievements all began as a dreamer's imagined 'song' long before anyone else believed in them or built them in reality. The poem's confident, almost prophetic tone treats imagination as the hidden origin of all later practical achievement.",
      conclusion: "Dreamers therefore matter, in the poem's argument, because imagination is not a decorative afterthought to real achievement but its essential and often unacknowledged starting point.",
    },
  },
  {
    id: "qa-tiger-1", textTitle: "The Tiger", category: "Poem", marks: 5,
    question: "What central question does Blake leave unanswered in 'The Tiger', and why is this effective?",
    keywords: ["rhetorical questions", "creation", "unresolved", "fearful symmetry"],
    answer: {
      intro: "Blake leaves unanswered the question of how the same Creator could make both the fearsome tiger and the gentle lamb.",
      explanation: "The poem is built almost entirely from rhetorical questions — 'What immortal hand or eye / Could frame thy fearful symmetry?' — describing the tiger's creation in violent, industrial, forging imagery without ever supplying a clear answer about the Creator's intention. By repeating the opening stanza almost unchanged at the poem's close, Blake signals that the question remains exactly as open and as awe-filled as when it was first asked.",
      conclusion: "This refusal to resolve the question is effective because it forces the reader to sit with the genuine mystery of how beauty, violence and creation coexist, rather than settling for a tidy moral answer.",
    },
  },
  {
    id: "qa-tempest-1", textTitle: "The Tempest", category: "Drama", marks: 8,
    question: "Trace how Prospero moves from a desire for revenge to an act of forgiveness in 'The Tempest'.",
    keywords: ["revenge", "forgiveness", "virtue", "vengeance", "ariel"],
    answer: {
      intro: "Prospero begins the play in a position to take total revenge on those who wronged him, but ends it by choosing forgiveness instead.",
      explanation: "For twelve years, Prospero has nursed his grievance against his brother Antonio and King Alonso, and he engineers the shipwreck specifically to bring his enemies within his power. Throughout the play he orchestrates their suffering and confusion through Ariel's magic, including the terrifying harpy vision that confronts them with their guilt. The turning point comes when Ariel, though merely a spirit, suggests that Prospero — being human — should feel compassion for the nobles' evident suffering; Prospero agrees that 'the rarer action is / In virtue than in vengeance' and resolves to forgive rather than punish.",
      conclusion: "This shift from vengeance to virtue is what allows the play to end in reconciliation rather than tragedy, and it is central to reading 'The Tempest' as a story about the possibility of moral growth even in someone who has been deeply wronged.",
    },
  },
  {
    id: "qa-tempest-2", textTitle: "The Tempest", category: "Drama", marks: 6,
    question: "How does Shakespeare use Caliban to complicate the audience's sympathies in 'The Tempest'?",
    keywords: ["resentment", "colonial", "sympathetic", "monster"],
    answer: {
      intro: "Shakespeare deliberately gives Caliban both monstrous behaviour and a genuinely sympathetic grievance, complicating any simple judgement of his character.",
      explanation: "On one hand, Caliban plots Prospero's murder and is easily fooled into worshipping a drunken butler, inviting the label of a comic or menacing 'monster'. On the other hand, his claim that 'this island's mine, by Sycorax my mother' gives real weight to his resentment at being dispossessed and enslaved by Prospero, inviting a colonial reading of his situation. Shakespeare even grants him some of the play's most lyrical language, describing the island's 'sounds and sweet airs' with a sensitivity that sits uneasily alongside his supposed monstrousness.",
      conclusion: "By refusing to make Caliban either purely villainous or purely victim, Shakespeare forces the audience to hold both sympathy and discomfort at once, deepening the play's exploration of power and legitimacy.",
    },
  },
  {
    id: "qa-tempest-3", textTitle: "The Tempest", category: "Drama", marks: 6,
    question: "What is the significance of Prospero giving up his magic at the end of 'The Tempest'?",
    keywords: ["magic", "illusion", "renounces", "epilogue"],
    answer: {
      intro: "Prospero's decision to break his staff and drown his book marks the deliberate end of his magical control over the island and everyone on it.",
      explanation: "Throughout the play, his magic has functioned much like theatrical illusion — conjuring storms, visions, and a wedding masque that he himself calls an 'insubstantial pageant'. By renouncing this power once his plans for reconciliation succeed, Prospero chooses to re-enter ordinary human life, accepting its limits rather than remaining a godlike controller of events. His closing epilogue, asking the audience directly for release through their applause, reinforces the parallel between Prospero's magic and Shakespeare's own theatrical craft.",
      conclusion: "The renunciation of magic therefore signals both a personal resolution for Prospero and a symbolic farewell from Shakespeare to the art of stage illusion itself.",
    },
  },
  {
    id: "qa-merchant-1", textTitle: "The Merchant of Venice", category: "Drama", marks: 8,
    question: "Discuss how Shakespeare presents Shylock as both a villain and a victim in 'The Merchant of Venice'.",
    keywords: ["prejudice", "revenge", "humanity", "victim", "villain"],
    answer: {
      intro: "Shakespeare constructs Shylock as a genuinely dual figure, capable of real cruelty while also being shaped by real, sustained prejudice.",
      explanation: "As evidence of villainy, Shylock refuses every offer of increased repayment and insists on the literal, gruesome terms of his bond even once Antonio's life is clearly at stake. As evidence of victimhood, he reminds Antonio directly of being called 'misbeliever, cut-throat dog' and spat on in the past, and his famous 'Hath not a Jew eyes?' speech argues persuasively that his capacity for revenge is simply the mirror of the cruelty shown to him. His daughter's elopement, taking his money and jewels, deepens his bitterness immediately before the trial, suggesting his hard-line stance in court is not motiveless cruelty but the culmination of accumulated humiliation.",
      conclusion: "By presenting both the cruelty of his revenge and the legitimacy of his grievance, Shakespeare resists a simple villain reading, making Shylock one of the play's most complex and debated characters.",
    },
  },
  {
    id: "qa-merchant-2", textTitle: "The Merchant of Venice", category: "Drama", marks: 6,
    question: "How does Portia's 'quality of mercy' speech function within the trial scene?",
    keywords: ["mercy", "persuasion", "quality of mercy", "refuses"],
    answer: {
      intro: "Portia's 'quality of mercy' speech is her first attempt to persuade Shylock to abandon his claim before she resorts to legal trickery.",
      explanation: "She describes mercy as something that 'droppeth as the gentle rain from heaven', blessing both giver and receiver, appealing to Shylock's better nature rather than to law or force. When Shylock explicitly refuses this appeal and insists on the bond's exact terms, the speech's failure justifies Portia's subsequent, far harsher legal manoeuvre — exploiting the bond's silence on spilled blood to defeat him entirely.",
      conclusion: "The speech therefore works dramatically as a genuine moral appeal that is deliberately shown to fail, setting up the far more decisive, and more troubling, legal victory that follows.",
    },
  },
  {
    id: "qa-merchant-3", textTitle: "The Merchant of Venice", category: "Drama", marks: 6,
    question: "What is the dramatic purpose of the ring trick in Act V of 'The Merchant of Venice'?",
    keywords: ["comic relief", "disguise", "loyalty", "dramatic irony"],
    answer: {
      intro: "The ring trick in the final act shifts the play back into pure comedy after the tension of the trial scene.",
      explanation: "Because the audience already knows Portia and Nerissa were the disguised lawyer and clerk who accepted the rings as 'payment', their husbands' confused, guilty reactions in Belmont create sustained dramatic irony rather than real conflict. The device also tests, in a much lighter register, the same themes of promise-keeping and loyalty that dominated the bond plot, but resolves painlessly through laughter rather than punishment.",
      conclusion: "The ring trick therefore provides necessary comic relief and closure, letting the play end, as a comedy should, in reconciliation and good humour rather than lingering tension.",
    },
  },
];

// ===========================================================================
// HELPER — highlight keywords bold + underlined + orange inside a paragraph
// ===========================================================================

function HighlightedText({ text, keywords }) {
  if (!keywords || keywords.length === 0) return <>{text}</>;
  const escaped = [...keywords].sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <strong key={i} style={{ color: C.orange, textDecoration: "underline", textDecorationColor: C.orange, textUnderlineOffset: 3 }}>
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

function ModelAnswer({ answer, keywords }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, lineHeight: 1.65 }}>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Introduction</div>
        <p style={{ margin: 0 }}><HighlightedText text={answer.intro} keywords={keywords} /></p>
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Explanation</div>
        <p style={{ margin: 0 }}><HighlightedText text={answer.explanation} keywords={keywords} /></p>
      </div>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Conclusion</div>
        <p style={{ margin: 0 }}><HighlightedText text={answer.conclusion} keywords={keywords} /></p>
      </div>
    </div>
  );
}

// ===========================================================================
// CHARACTER PROFILE CARD — tap to expand: verbs used to describe the
// character, then AI-style bullet points on personality traits, each with
// a textual example. Works for non-living "characters" too (a spirit, an
// island, a bond) — isLiving controls only the badge shown.
// ===========================================================================

function CharacterCard({ character }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="ph-card"
      style={{
        border: `2px solid ${open ? C.primary : C.border}`, borderRadius: 16, background: C.bg,
        boxShadow: C.cardShadow, overflow: "hidden", cursor: "pointer", transition: "all .15s",
      }}
      onClick={() => setOpen((o) => !o)}
    >
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="padhai-display" style={{ fontSize: 16, fontWeight: 800 }}>{character.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
              background: character.isLiving ? C.successSoft : C.amberSoft,
              color: character.isLiving ? C.success : C.amber,
            }}>
              {character.isLiving ? "Living character" : "Non-living presence"}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{character.role}</div>
        </div>
        {open ? <ChevronUp size={18} color={C.inkFaint} /> : <ChevronDown size={18} color={C.inkFaint} />}
      </div>

      {open && (
        <div className="ph-fade-in" style={{ padding: "0 18px 18px", borderTop: `2px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
          <div style={{ marginTop: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
              Verbs the text uses to describe them
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {character.verbs.map((v) => (
                <span key={v} className="padhai-mono" style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: C.primarySoft, color: C.primaryDark, fontWeight: 600 }}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <Sparkles size={12} color={C.primary} /> Personality traits
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {character.traits.map((t, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: C.bgSoft }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>{t.trait}</div>
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, marginBottom: 6 }}>{t.bullet}</div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft, fontStyle: "italic", display: "flex", gap: 6 }}>
                    <Quote size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{t.example}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// SLIDE VIEWER — slide-by-slide visual storytelling for the two plays.
// Each slide gets a simple, generated SVG icon (no external images) plus a
// short narration line. Character profile cards sit underneath.
// ===========================================================================

const SLIDE_ICONS = {
  storm: Waves, crown: Crown, spirit: Sparkles, island: Layers, love: Feather,
  plot: MessageCircle, comic: Music2, labour: PenLine, harpy: Wand2, masque: Star,
  forgive: CheckCircle2, release: Award, ship: Waves, bond: ScrollText, casket: Award,
  elope: Feather, speech: MessageCircle, court: Scale, disguise: Wand2, verdict: Scale,
  ring: Star, resolve: CheckCircle2,
};

function SlideViewer({ slides }) {
  const [idx, setIdx] = useState(0);
  const slide = slides[idx];
  const Icon = SLIDE_ICONS[slide.iconKey] || BookOpen;

  return (
    <div>
      <div style={{
        border: `2px solid ${C.border}`, borderRadius: 20, background: `linear-gradient(160deg, ${C.primarySoft}, ${C.bg})`,
        boxShadow: C.cardShadow, padding: "34px 26px", textAlign: "center", minHeight: 260,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: C.bg, border: `3px solid ${C.primary}`,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
        }}>
          <Icon size={32} color={C.primary} />
        </div>
        <div className="padhai-mono" style={{ fontSize: 11.5, fontWeight: 700, color: C.primaryDark, marginBottom: 8 }}>
          Slide {idx + 1} of {slides.length}
        </div>
        <h3 className="padhai-display" style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, maxWidth: 480 }}>{slide.title}</h3>
        <p style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.6, maxWidth: 480 }}>{slide.text}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{ ...secondaryBtnStyle, opacity: idx === 0 ? 0.4 : 1, cursor: idx === 0 ? "not-allowed" : "pointer" }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div style={{ display: "flex", gap: 5 }}>
          {slides.map((_, i) => (
            <button
              key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 999, border: "none", background: i === idx ? C.primary : C.border, cursor: "pointer", transition: "all .15s" }}
            />
          ))}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(slides.length - 1, i + 1))}
          disabled={idx === slides.length - 1}
          className="ph-btn-primary"
          style={{ ...primaryBtnStyle, opacity: idx === slides.length - 1 ? 0.4 : 1, cursor: idx === slides.length - 1 ? "not-allowed" : "pointer" }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// "QUOTE DETECTIVE" — tap a quote to reveal its explanation. Used instead
// of flashcards for short stories and poems (English doesn't need
// front/back recall drills the way factual subjects do).
// ===========================================================================

function QuoteReveal({ quote, explain }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      style={{
        display: "block", width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14,
        border: `2px solid ${open ? C.primary : C.border}`, background: open ? C.primarySoft : C.bg,
        cursor: "pointer", marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Quote size={15} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
        <span className="padhai-display" style={{ fontSize: 14.5, fontWeight: 700, fontStyle: "italic" }}>
          "{quote}"
        </span>
      </div>
      {open && (
        <p className="ph-fade-in" style={{ fontSize: 13, color: C.inkSoft, marginTop: 10, marginBottom: 0, lineHeight: 1.6, paddingLeft: 23 }}>
          {explain}
        </p>
      )}
      {!open && <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 6, paddingLeft: 23 }}>Tap to reveal what this shows about the story</div>}
    </button>
  );
}

// ===========================================================================
// SHORT STORY LESSON VIEW — taught the way a teacher builds theory:
// context → theme → plot walkthrough → characters → literary devices →
// quote detective → exam tip. A "Mark as learned" button feeds completion
// tracking back up to the dashboard.
// ===========================================================================

function StoryLessonView({ story, learned, onMarkLearned }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 700, marginBottom: 4 }}>Short Story</div>
        <h1 className="padhai-display" style={{ fontSize: 27, fontWeight: 800, marginBottom: 2 }}>{story.title}</h1>
        <div style={{ fontSize: 14, color: C.inkSoft }}>by {story.author}</div>
      </div>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={BookOpen}>Context</SectionHeading>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{story.context}</p>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Sparkles}>Theme</SectionHeading>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{story.theme}</p>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Layers}>Plot walkthrough</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {story.summary.map((beat, i) => (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: C.primarySoft, color: C.primaryDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{beat.heading}</div>
                <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{beat.text}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Users2}>Character sketches</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {story.characters.map((c, i) => (
            <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: C.bgSoft }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>{c.traits}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Feather}>Literary devices to quote in an exam</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {story.devices.map((d, i) => (
            <div key={i}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: C.primaryDark }}>{d.device}: </span>
              <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{d.example}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Quote}>Quote detective</SectionHeading>
        <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: -6, marginBottom: 12 }}>Tap each line to see what it reveals.</p>
        {story.quotes.map((q, i) => <QuoteReveal key={i} quote={q.quote} explain={q.explain} />)}
      </SectionCard>

      <div style={{ padding: "16px 18px", borderRadius: 16, background: C.goldSoft, border: `2px solid ${C.gold}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13.5, color: "#8A6A0F", marginBottom: 4 }}>
          <Award size={15} /> Exam tip
        </div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{story.examTip}</div>
      </div>

      <button
        onClick={onMarkLearned}
        disabled={learned}
        className="ph-btn-primary"
        style={{ ...primaryBtnStyle, width: "100%", background: learned ? C.success : C.primary, cursor: learned ? "default" : "pointer" }}
      >
        {learned ? <><CheckCircle2 size={17} /> Marked as learned</> : <><Check size={17} /> Mark this story as learned</>}
      </button>
    </div>
  );
}

// ===========================================================================
// POEM LESSON VIEW
// ===========================================================================

function PoemLessonView({ poem, learned, onMarkLearned }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 700, marginBottom: 4 }}>Poem · Reverie</div>
        <h1 className="padhai-display" style={{ fontSize: 27, fontWeight: 800, marginBottom: 2 }}>{poem.title}</h1>
        <div style={{ fontSize: 14, color: C.inkSoft }}>by {poem.poet}</div>
      </div>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={BookOpen}>Context</SectionHeading>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{poem.context}</p>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Sparkles}>Theme</SectionHeading>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{poem.theme}</p>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Layers}>Form & structure</SectionHeading>
        <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>{poem.structure}</p>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={MessageCircle}>Stanza-by-stanza notes</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {poem.stanzaNotes.map((n, i) => (
            <div key={i} style={{ display: "flex", gap: 12 }}>
              <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: C.primarySoft, color: C.primaryDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{n}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard style={{ marginBottom: 16 }}>
        <SectionHeading icon={Feather}>Literary devices to quote in an exam</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {poem.devices.map((d, i) => (
            <div key={i}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: C.primaryDark }}>{d.device}: </span>
              <span style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{d.example}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div style={{ padding: "16px 18px", borderRadius: 16, background: C.goldSoft, border: `2px solid ${C.gold}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13.5, color: "#8A6A0F", marginBottom: 4 }}>
          <Sparkles size={15} /> The poem's core message
        </div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.6 }}>{poem.message}</div>
      </div>

      <button
        onClick={onMarkLearned}
        disabled={learned}
        className="ph-btn-primary"
        style={{ ...primaryBtnStyle, width: "100%", background: learned ? C.success : C.primary, cursor: learned ? "default" : "pointer" }}
      >
        {learned ? <><CheckCircle2 size={17} /> Marked as learned</> : <><Check size={17} /> Mark this poem as learned</>}
      </button>
    </div>
  );
}

// ===========================================================================
// PLAY CHAPTER VIEW — a dedicated chapter for a play, with its own
// sub-chapters (context, act-by-act, themes, style), a slide-by-slide
// visual retelling, and expandable character profile cards underneath.
// ===========================================================================

function PlayChapterView({ play, learned, onMarkLearned }) {
  const [tab, setTab] = useState("story"); // "story" | subChapter id | "characters"

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <play.icon size={21} color={C.primary} />
        </div>
        <div>
          <h1 className="padhai-display" style={{ fontSize: 25, fontWeight: 800 }}>{play.title}</h1>
          <div style={{ fontSize: 13, color: C.inkSoft }}>by {play.author}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 20px", overflowX: "auto" }}>
        <button className="ph-tab" onClick={() => setTab("story")} style={{
          padding: "8px 16px", borderRadius: 999, border: `2px solid ${tab === "story" ? C.primary : C.border}`,
          background: tab === "story" ? C.primary : C.bg, color: tab === "story" ? "#fff" : C.ink,
          fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          The story, slide by slide
        </button>
        {play.subChapters.map((sc) => (
          <button key={sc.id} className="ph-tab" onClick={() => setTab(sc.id)} style={{
            padding: "8px 16px", borderRadius: 999, border: `2px solid ${tab === sc.id ? C.primary : C.border}`,
            background: tab === sc.id ? C.primary : C.bg, color: tab === sc.id ? "#fff" : C.ink,
            fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {sc.name}
          </button>
        ))}
        <button className="ph-tab" onClick={() => setTab("characters")} style={{
          padding: "8px 16px", borderRadius: 999, border: `2px solid ${tab === "characters" ? C.primary : C.border}`,
          background: tab === "characters" ? C.primary : C.bg, color: tab === "characters" ? "#fff" : C.ink,
          fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          Characters
        </button>
      </div>

      {tab === "story" && (
        <div className="ph-fade-in">
          <SlideViewer slides={play.slides} />
          <div style={{ marginTop: 24 }}>
            <SectionHeading icon={Users2}>Meet the characters</SectionHeading>
            <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: -6, marginBottom: 12 }}>
              Tap a card to see the verbs the text uses to describe them, and the personality traits those verbs reveal.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {play.characters.map((c) => <CharacterCard key={c.name} character={c} />)}
            </div>
          </div>
        </div>
      )}

      {tab === "characters" && (
        <div className="ph-fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {play.characters.map((c) => <CharacterCard key={c.name} character={c} />)}
        </div>
      )}

      {play.subChapters.map((sc) => tab === sc.id && (
        <SectionCard key={sc.id} className="ph-fade-in">
          {sc.paragraphs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sc.paragraphs.map((p, i) => <p key={i} style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{p}</p>)}
            </div>
          )}
          {sc.list && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sc.list.map((item, i) => (
                <div key={i}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: C.primaryDark, marginBottom: 3 }}>{item.theme}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{item.explain}</div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ))}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={onMarkLearned}
          disabled={learned}
          className="ph-btn-primary"
          style={{ ...primaryBtnStyle, width: "100%", background: learned ? C.success : C.primary, cursor: learned ? "default" : "pointer" }}
        >
          {learned ? <><CheckCircle2 size={17} /> Marked as learned</> : <><Check size={17} /> Mark this play as learned</>}
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// AI GRADING — calls the Anthropic API to grade the student's own-words
// answer the way an ICSE board checker would: looking for key words,
// supporting evidence and structure, then returning a score and feedback.
// ===========================================================================

async function gradeStudentAnswer({ question, marks, modelAnswer, keywords, studentText }) {
  const system = `You are an experienced ICSE/ISC English board examiner grading a Class XI/XII student's written answer.
Question (worth ${marks} marks): ${question}
Model answer for reference (introduction/explanation/conclusion): ${modelAnswer.intro} ${modelAnswer.explanation} ${modelAnswer.conclusion}
Key words a strong answer should contain: ${keywords.join(", ")}.
Grade the student's answer strictly but fairly, the way a real board checker would: look for the presence of key ideas and key words (not exact wording), a clear argument with textual support, and a structure with some kind of introduction, explanation and conclusion.
Respond with ONLY a raw JSON object, no markdown fences, no preamble, in exactly this shape:
{"score": <integer 0 to ${marks}>, "feedback": "<2-3 sentences of specific, constructive feedback>", "missing": ["<short phrase>", "<short phrase>"]}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: `Student's answer:\n${studentText}` }],
    }),
  });
  const data = await response.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return {
    score: Math.max(0, Math.min(marks, Math.round(parsed.score))),
    feedback: parsed.feedback || "",
    missing: Array.isArray(parsed.missing) ? parsed.missing : [],
  };
}

// ===========================================================================
// Q&A PRACTICE ZONE
// Flow: tap a question -> model answer expands below it (keywords bold +
// underlined + orange) -> "I've learned the answer" hides it and opens a
// box for the student's own words -> AI grades like a board checker ->
// score + feedback, unlimited retries -> latest attempt is always saved
// and remains readable (alongside the original model answer) any time.
// ===========================================================================

function QAItem({ qa, saved, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState("answer"); // "answer" | "write" | "result"
  const [draft, setDraft] = useState(saved ? saved.studentText : "");
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(saved || null);

  async function handleSubmit() {
    if (!draft.trim()) return;
    setGrading(true);
    setError(null);
    try {
      const graded = await gradeStudentAnswer({
        question: qa.question, marks: qa.marks, modelAnswer: qa.answer, keywords: qa.keywords, studentText: draft,
      });
      const record = { studentText: draft, ...graded, maxMarks: qa.marks };
      setResult(record);
      onSave(record);
      setPhase("result");
    } catch (e) {
      setError("Couldn't reach the grader just now — check your connection and try again.");
    } finally {
      setGrading(false);
    }
  }

  return (
    <div style={{ border: `2px solid ${expanded ? C.primary : C.border}`, borderRadius: 16, background: C.bg, boxShadow: C.cardShadow, overflow: "hidden" }}>
      <button
        onClick={() => setExpanded((o) => !o)}
        style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: C.primaryDark, background: C.primarySoft, padding: "2px 8px", borderRadius: 999 }}>{qa.textTitle}</span>
            <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 700 }}>{qa.marks} marks</span>
            {result && (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: C.success, background: C.successSoft, padding: "2px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 3 }}>
                <CheckCircle2 size={11} /> {result.score}/{result.maxMarks} saved
              </span>
            )}
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4 }}>{qa.question}</div>
        </div>
        {expanded ? <ChevronUp size={18} color={C.inkFaint} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color={C.inkFaint} style={{ flexShrink: 0 }} />}
      </button>

      {expanded && (
        <div className="ph-fade-in" style={{ padding: "4px 18px 20px", borderTop: `2px solid ${C.border}` }}>
          {phase === "answer" && (
            <div style={{ marginTop: 14 }}>
              <ModelAnswer answer={qa.answer} keywords={qa.keywords} />
              <button
                onClick={() => setPhase("write")}
                className="ph-btn-primary"
                style={{ ...primaryBtnStyle, marginTop: 16 }}
              >
                <PenLine size={16} /> I've learned the answer — let me try it myself
              </button>
              {result && (
                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: C.bgSoft, fontSize: 13 }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>Your last saved attempt ({result.score}/{result.maxMarks})</div>
                  <div style={{ color: C.inkSoft, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{result.studentText}</div>
                </div>
              )}
            </div>
          )}

          {phase === "write" && (
            <div style={{ marginTop: 14 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write the answer in your own words — cover the introduction, explanation and conclusion..."
                rows={7}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `2px solid ${C.border}`, fontSize: 13.5, lineHeight: 1.55, outline: "none", fontFamily: "inherit", resize: "vertical" }}
              />
              {error && <div style={{ color: C.error, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={() => setPhase("answer")} style={secondaryBtnStyle}>
                  <ChevronLeft size={15} /> Back to the answer
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!draft.trim() || grading}
                  className="ph-btn-primary"
                  style={{ ...primaryBtnStyle, opacity: !draft.trim() || grading ? 0.6 : 1, cursor: !draft.trim() || grading ? "not-allowed" : "pointer" }}
                >
                  {grading ? <><Loader2 size={16} className="ph-spin" /> Grading...</> : <><Send size={16} /> Submit for grading</>}
                </button>
              </div>
            </div>
          )}

          {phase === "result" && result && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "14px 16px", borderRadius: 14, marginBottom: 14,
                background: result.score / result.maxMarks >= 0.6 ? C.successSoft : C.errorSoft,
                border: `2px solid ${result.score / result.maxMarks >= 0.6 ? C.success : C.error}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={18} color={result.score / result.maxMarks >= 0.6 ? C.success : C.error} />
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{result.score} / {result.maxMarks} marks</span>
                </div>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10 }}>
                <strong>Feedback: </strong>{result.feedback}
              </div>
              {result.missing && result.missing.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.inkFaint, textTransform: "uppercase", marginBottom: 6 }}>What was missing</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.missing.map((m, i) => (
                      <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: C.errorSoft, color: C.error, fontWeight: 600 }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: "12px 14px", borderRadius: 12, background: C.bgSoft, fontSize: 13, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>Your answer</div>
                <div style={{ color: C.inkSoft, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{result.studentText}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => setPhase("write")} className="ph-btn-primary" style={primaryBtnStyle}>
                  <RotateCcw size={15} /> Edit and try again (unlimited)
                </button>
                <button onClick={() => setPhase("answer")} style={secondaryBtnStyle}>
                  See the model answer again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QAPracticeView({ savedAnswers, onSaveAnswer }) {
  const categories = ["All", "Short Story", "Poem", "Drama"];
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? QA_BANK : QA_BANK.filter((q) => q.category === cat);

  return (
    <div>
      <h1 className="padhai-display" style={{ fontSize: 25, fontWeight: 800, marginBottom: 4 }}>Practice Zone</h1>
      <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 18 }}>
        Read the model answer, then try writing it yourself. An AI board-checker grades it like a real examiner, looking for key words and supporting arguments — try as many times as you like.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((qa) => (
          <QAItem key={qa.id} qa={qa} saved={savedAnswers[qa.id]} onSave={(r) => onSaveAnswer(qa.id, r)} />
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// ENGLISH HUB — the fully built subject. Short Stories, Poetry, the two
// play chapters (each with sub-chapters), and the Practice Zone.
// ===========================================================================

function ListRow({ title, subtitle, onClick, learned, right }) {
  return (
    <button
      onClick={onClick}
      className="ph-card"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, width: "100%",
        padding: "15px 18px", borderRadius: 15, border: `2px solid ${C.border}`, background: C.bg,
        boxShadow: C.cardShadow, cursor: "pointer", textAlign: "left",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14.5 }}>
          {title}
          {learned && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: C.success, background: C.successSoft, padding: "2px 8px", borderRadius: 999 }}>
              <CheckCircle2 size={11} /> Learned
            </span>
          )}
        </div>
        {subtitle && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>{subtitle}</div>}
      </div>
      {right || <ChevronRight size={18} color={C.inkFaint} />}
    </button>
  );
}

const ENGLISH_TABS = [
  { id: "stories", label: "Short Stories", icon: BookOpen },
  { id: "poetry", label: "Poetry", icon: Feather },
  { id: "tempest", label: "The Tempest", icon: Wand2 },
  { id: "merchant", label: "Merchant of Venice", icon: Scale },
  { id: "practice", label: "Practice Zone", icon: MessageCircle },
];

function EnglishHub({ engState, setEngState, learnedItems, markLearned, savedAnswers, onSaveAnswer }) {
  const { tab, storyId, poemId } = engState;

  function openTab(t) { setEngState({ tab: t, storyId: null, poemId: null }); }
  function openStory(id) { setEngState({ tab: "stories", storyId: id, poemId: null }); }
  function openPoem(id) { setEngState({ tab: "poetry", storyId: null, poemId: id }); }
  function back() { setEngState({ tab, storyId: null, poemId: null }); }

  return (
    <div>
      <h1 className="padhai-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>English</h1>
      <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 18 }}>ISC Classes XI & XII · Short stories, poetry ("Reverie"), and full drama chapters for The Tempest and The Merchant of Venice.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22, overflowX: "auto" }}>
        {ENGLISH_TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => openTab(t.id)} className="ph-tab" style={{
              display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999,
              border: `2px solid ${tab === t.id ? C.primary : C.border}`,
              background: tab === t.id ? C.primary : C.bg, color: tab === t.id ? "#fff" : C.ink,
              fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "stories" && !storyId && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SHORT_STORIES.map((s) => (
            <ListRow key={s.id} title={s.title} subtitle={`by ${s.author}`} learned={learnedItems.has(`story-${s.id}`)} onClick={() => openStory(s.id)} />
          ))}
        </div>
      )}
      {tab === "stories" && storyId && (
        <div>
          <button onClick={back} style={{ ...secondaryBtnStyle, marginBottom: 16 }}><ChevronLeft size={15} /> All short stories</button>
          <StoryLessonView
            story={SHORT_STORIES.find((s) => s.id === storyId)}
            learned={learnedItems.has(`story-${storyId}`)}
            onMarkLearned={() => markLearned(`story-${storyId}`)}
          />
        </div>
      )}

      {tab === "poetry" && !poemId && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {POEMS.map((p) => (
            <ListRow key={p.id} title={p.title} subtitle={`by ${p.poet}`} learned={learnedItems.has(`poem-${p.id}`)} onClick={() => openPoem(p.id)} />
          ))}
        </div>
      )}
      {tab === "poetry" && poemId && (
        <div>
          <button onClick={back} style={{ ...secondaryBtnStyle, marginBottom: 16 }}><ChevronLeft size={15} /> All poems</button>
          <PoemLessonView
            poem={POEMS.find((p) => p.id === poemId)}
            learned={learnedItems.has(`poem-${poemId}`)}
            onMarkLearned={() => markLearned(`poem-${poemId}`)}
          />
        </div>
      )}

      {tab === "tempest" && (
        <PlayChapterView play={TEMPEST} learned={learnedItems.has("play-tempest")} onMarkLearned={() => markLearned("play-tempest")} />
      )}
      {tab === "merchant" && (
        <PlayChapterView play={MERCHANT} learned={learnedItems.has("play-merchant")} onMarkLearned={() => markLearned("play-merchant")} />
      )}

      {tab === "practice" && (
        <QAPracticeView savedAnswers={savedAnswers} onSaveAnswer={onSaveAnswer} />
      )}
    </div>
  );
}

// ===========================================================================
// LOGIN
// ===========================================================================

function LoginScreen({ onLogin }) {
  return (
    <div className="padhai-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bgSoft, padding: 20 }}>
      <FontImport />
      <div className="ph-fade-in" style={{ width: 400, background: C.bg, borderRadius: 22, border: `2px solid ${C.border}`, boxShadow: C.cardShadow, padding: "34px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <span className="padhai-display" style={{ fontSize: 21, fontWeight: 800 }}>PadhAI</span>
        </div>
        <h1 className="padhai-display" style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
        <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 20 }}>Log in to keep learning.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          <input placeholder="Email address" style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${C.border}`, fontSize: 14, outline: "none" }} />
          <input placeholder="Password" type="password" style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${C.border}`, fontSize: 14, outline: "none" }} />
        </div>
        <button onClick={onLogin} className="ph-btn-primary" style={{ ...primaryBtnStyle, width: "100%" }}>
          Log in <ArrowRight size={16} />
        </button>
        <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 16, textAlign: "center" }}>
          This is a demo login — any email and password will work.
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// ONBOARDING — board, then grade. ICSE and Grades 11/12 are the only
// selectable options in this release; everything else is visibly "soon".
// ===========================================================================

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [pickedBoard, setPickedBoard] = useState(null);
  const [pickedGrade, setPickedGrade] = useState(null);

  return (
    <div className="padhai-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bgSoft, padding: 20 }}>
      <FontImport />
      <div className="ph-fade-in" style={{ width: 460, background: C.bg, borderRadius: 22, border: `2px solid ${C.border}`, boxShadow: C.cardShadow, padding: "34px 30px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 5, background: C.primary }} />
          <div style={{ flex: 1, height: 5, borderRadius: 5, background: step === 2 ? C.primary : C.border }} />
        </div>

        {step === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <School size={20} color={C.primary} />
              <h1 className="padhai-display" style={{ fontSize: 21, fontWeight: 800 }}>Which board are you studying?</h1>
            </div>
            <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 20 }}>You can change this later from Settings.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {BOARDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => b.enabled && setPickedBoard(b.id)}
                  disabled={!b.enabled}
                  className="ph-card"
                  style={{
                    textAlign: "left", padding: "16px 18px", borderRadius: 14,
                    border: `2px solid ${pickedBoard === b.id ? C.primary : C.border}`,
                    background: pickedBoard === b.id ? C.primarySoft : C.bg,
                    cursor: b.enabled ? "pointer" : "not-allowed", opacity: b.enabled ? 1 : 0.55,
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{b.name}</div>
                    <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{b.blurb}</div>
                  </div>
                  {!b.enabled && <span style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><Lock size={12} /> Coming soon</span>}
                </button>
              ))}
            </div>

            <button
              disabled={!pickedBoard}
              onClick={() => setStep(2)}
              className="ph-btn-primary"
              style={{ ...primaryBtnStyle, width: "100%", opacity: pickedBoard ? 1 : 0.5, cursor: pickedBoard ? "pointer" : "not-allowed" }}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <GraduationCap size={20} color={C.primary} />
              <h1 className="padhai-display" style={{ fontSize: 21, fontWeight: 800 }}>What grade are you in?</h1>
            </div>
            <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 20 }}>Grades 11 & 12 are ready — English is fully built, with more subjects on the way.</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {GRADES.map((g) => (
                <Pill key={g} active={pickedGrade === g} onClick={() => setPickedGrade(g)}>
                  Grade {g}
                </Pill>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ ...secondaryBtnStyle }}>Back</button>
              <button
                disabled={!pickedGrade}
                onClick={() => onComplete(pickedBoard, pickedGrade)}
                className="ph-btn-primary"
                style={{ ...primaryBtnStyle, flex: 1, opacity: pickedGrade ? 1 : 0.5, cursor: pickedGrade ? "pointer" : "not-allowed" }}
              >
                Start learning <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// SETTINGS
// ===========================================================================

function SettingsView({ board, grade, onSave }) {
  const [b, setB] = useState(board);
  const [g, setG] = useState(grade);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h1 className="padhai-display" style={{ fontSize: 27, fontWeight: 800, marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 26 }}>Update your board or grade. This only needs to change if you've moved to a new class.</p>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Board</div>
        <div style={{ display: "flex", gap: 10 }}>
          {BOARDS.map((bd) => (
            <button
              key={bd.id} onClick={() => bd.enabled && setB(bd.id)} disabled={!bd.enabled}
              style={{
                flex: 1, textAlign: "left", padding: "14px 16px", borderRadius: 14,
                border: `2px solid ${b === bd.id ? C.primary : C.border}`,
                background: b === bd.id ? C.primarySoft : C.bg, cursor: bd.enabled ? "pointer" : "not-allowed",
                opacity: bd.enabled ? 1 : 0.55,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800 }}>{bd.name}</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>{bd.enabled ? bd.blurb : "Coming soon"}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Grade</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {GRADES.map((gr) => (
            <Pill key={gr} active={g === gr} onClick={() => setG(gr)}>Grade {gr}</Pill>
          ))}
        </div>
      </div>

      <button
        onClick={() => { onSave(b, g); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="ph-btn-primary" style={{ ...primaryBtnStyle }}
      >
        <Check size={16} /> Save changes
      </button>
      {saved && <span style={{ marginLeft: 12, fontSize: 13, color: C.success, fontWeight: 700 }}>Saved!</span>}
    </div>
  );
}

// ===========================================================================
// SUBJECT GRID — English is fully built; every other subject (and CBSE)
// shows as "Coming soon" rather than being hidden.
// ===========================================================================

function SubjectGrid({ grade, learnedItems, onOpenSubject }) {
  const englishTotal = SHORT_STORIES.length + POEMS.length + 2; // + Tempest + Merchant
  const englishDone = [
    ...SHORT_STORIES.map((s) => `story-${s.id}`),
    ...POEMS.map((p) => `poem-${p.id}`),
    "play-tempest", "play-merchant",
  ].filter((k) => learnedItems.has(k)).length;

  return (
    <div>
      <h1 className="padhai-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 18 }}>Grade {grade} Subjects</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {SUBJECTS.map((s) => {
          const Icon = s.icon;
          if (!s.enabled) {
            return (
              <div key={s.id} style={{
                textAlign: "left", padding: "20px 18px", borderRadius: 18, border: `2px solid ${C.border}`,
                background: C.bg, minHeight: 128, opacity: 0.55, position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon size={21} color={s.color} />
                  </div>
                  <Lock size={14} color={C.inkFaint} />
                </div>
                <div className="padhai-display" style={{ fontSize: 16.5, fontWeight: 700, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkFaint, marginTop: 10 }}>Coming soon</div>
              </div>
            );
          }
          return (
            <button key={s.id} onClick={() => onOpenSubject(s.id)} className="ph-card" style={{
              textAlign: "left", padding: "20px 18px", borderRadius: 18, border: `2px solid ${C.border}`,
              background: C.bg, boxShadow: C.cardShadow, cursor: "pointer", minHeight: 128,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon size={21} color={s.color} />
              </div>
              <div className="padhai-display" style={{ fontSize: 16.5, fontWeight: 700, color: C.ink }}>{s.name}</div>
              <div style={{ marginTop: 10 }}>
                <LinearBar pct={Math.round((englishDone / englishTotal) * 100)} color={s.color} height={6} />
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginTop: 5 }}>{englishDone} of {englishTotal} texts learned</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 26, padding: "16px 20px", borderRadius: 16, border: `2px solid ${C.border}`, background: C.bg, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>
        <strong style={{ color: C.ink }}>This release:</strong> ICSE/ISC, Grades 11 & 12 only. English is fully built — short stories, poetry, and full chapters for The Tempest and The Merchant of Venice, plus the Practice Zone. Sociology, Economics, Physics, Biology, Mathematics, Psychology and CBSE are coming soon.
      </div>
    </div>
  );
}

// ===========================================================================
// APP SHELL
// ===========================================================================

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [board, setBoard] = useState(null);
  const [grade, setGrade] = useState(null);

  const [section, setSection] = useState("dashboard"); // dashboard | settings
  const [subjectId, setSubjectId] = useState(null);
  const [engState, setEngState] = useState({ tab: "stories", storyId: null, poemId: null });

  const [learnedItems, setLearnedItems] = useState(new Set());
  const [savedAnswers, setSavedAnswers] = useState({});

  function markLearned(key) {
    setLearnedItems((prev) => new Set(prev).add(key));
  }
  function saveAnswer(qaId, record) {
    setSavedAnswers((prev) => ({ ...prev, [qaId]: record }));
  }

  function goDashboardHome() { setSection("dashboard"); setSubjectId(null); }
  function goSettings() { setSection("settings"); }

  const crumbItems = useMemo(() => {
    const items = [];
    if (section === "dashboard") {
      items.push({ label: "Dashboard", onClick: subjectId ? goDashboardHome : undefined });
      if (subjectId === "english") {
        items.push({ label: "English" });
      }
    } else if (section === "settings") {
      items.push({ label: "Settings" });
    }
    return items;
  }, [section, subjectId]);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  if (!onboarded) return <OnboardingFlow onComplete={(b, g) => { setBoard(b); setGrade(g); setOnboarded(true); }} />;

  return (
    <div className="padhai-root ph-shell" style={{ background: C.bgSoft }}>
      <FontImport />

      <aside className="ph-sidebar no-print" style={{ background: C.bg, borderRight: `2px solid ${C.border}`, padding: "22px 14px" }}>
        <div className="ph-sidebar-brand" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 26px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span className="padhai-display" style={{ fontSize: 18, fontWeight: 800 }}>PadhAI</span>
        </div>

        <button className="ph-side-btn" onClick={goDashboardHome} style={{
          padding: "11px 12px", borderRadius: 12, border: "none", marginBottom: 4,
          background: section === "dashboard" ? C.primarySoft : "transparent",
          color: section === "dashboard" ? C.primaryDark : C.inkSoft, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        }}>
          <Home size={17} /> Dashboard
        </button>

        <div className="ph-sidebar-footnote" style={{ marginTop: "auto", paddingTop: 20 }}>
          <button className="ph-side-btn" onClick={goSettings} style={{
            padding: "11px 12px", borderRadius: 12, border: "none", marginBottom: 8,
            background: section === "settings" ? C.primarySoft : "transparent",
            color: section === "settings" ? C.primaryDark : C.inkSoft, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          }}>
            <SettingsIcon size={17} /> Settings
          </button>
          <div style={{ fontSize: 11, color: C.inkFaint, lineHeight: 1.5, padding: "0 8px" }}>
            {board} · Grade {grade}
          </div>
        </div>
      </aside>

      <main className="ph-main">
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 20px 60px" }}>
          <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 18 }}>
            <StreakBadge />
          </div>

          <Crumb items={crumbItems} />

          {section === "dashboard" && !subjectId && (
            <SubjectGrid grade={grade} learnedItems={learnedItems} onOpenSubject={(id) => setSubjectId(id)} />
          )}

          {section === "dashboard" && subjectId === "english" && (
            <EnglishHub
              engState={engState}
              setEngState={setEngState}
              learnedItems={learnedItems}
              markLearned={markLearned}
              savedAnswers={savedAnswers}
              onSaveAnswer={saveAnswer}
            />
          )}

          {section === "settings" && (
            <SettingsView board={board} grade={grade} onSave={(b, g) => { setBoard(b); setGrade(g); }} />
          )}
        </div>
      </main>
    </div>
  );
}