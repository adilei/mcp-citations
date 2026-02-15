/**
 * Pre-written LLM-style answers for sci-fi/fantasy book questions.
 *
 * Each answer includes:
 * - A complete natural-language response with markdown citation links
 * - A "verbatim check" phrase to verify pass-through vs. rewriting
 * - Keywords for matching incoming questions
 *
 * Covers both top-level book questions and follow-up sub-topics
 * (characters, themes, comparisons) to simulate an agent with deep knowledge.
 */

export interface Citation {
  uri: string;
  name: string;
  description: string;
}

export interface Answer {
  id: string;
  keywords: string[];
  text: string;
  /** A distinctive real sentence from the text to check for verbatim pass-through */
  verbatimCheck: string;
  citations: Citation[];
}

export const ANSWERS: Answer[] = [
  // ─── Dune ────────────────────────────────────────────────────────────────────
  {
    id: "dune",
    keywords: ["dune", "frank herbert", "arrakis", "spice", "sandworm"],
    text: `Dune, published in 1965 by Frank Herbert, is widely regarded as the greatest science fiction novel ever written. It has sold over 20 million copies worldwide and remains the best-selling science fiction novel in history.

Set on the desert planet Arrakis, the story follows Paul Atreides as his family accepts stewardship of the planet and its most valuable resource — the spice melange. The novel explores complex themes including politics, religion, ecology, and the dangers of charismatic leadership.

Herbert drew inspiration from his research on sand dunes in Oregon, and the ecological themes of the novel were groundbreaking for their time. The Bene Gesserit, the Fremen, and the Spacing Guild remain some of the most iconic fictional organizations in all of literature.

The novel won both the Hugo Award (1966) and the inaugural Nebula Award for Best Novel, cementing its place in the pantheon of speculative fiction.

**Sources:**
- [Dune (novel) — Wikipedia](https://en.wikipedia.org/wiki/Dune_(novel))`,
    verbatimCheck: "Herbert drew inspiration from his research on sand dunes in Oregon",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Dune_(novel)", name: "Dune (novel) — Wikipedia", description: "Wikipedia article on Frank Herbert's Dune" },
    ],
  },
  {
    id: "bene-gesserit",
    keywords: ["bene gesserit", "sisterhood", "reverend mother", "voice", "gom jabbar", "kwisatz haderach"],
    text: `The Bene Gesserit are one of the most fascinating organizations in all of science fiction. They are an ancient and powerful sisterhood in Frank Herbert's Dune universe, operating as a political, religious, and genetic force that has shaped humanity's destiny for thousands of years.

Their abilities include the Voice — a form of vocal manipulation that compels obedience — and a vast repertoire of physical and mental disciplines that make them appear almost superhuman. The Reverend Mothers, the order's senior members, possess Other Memory: the collective experiences of all their female ancestors, accessed through a dangerous spice agony ritual.

Perhaps their most ambitious project is their secret breeding program, spanning millennia, designed to produce the Kwisatz Haderach — a superbeing who can bridge space and time. Paul Atreides is believed to be this figure, though he arrives a generation earlier than planned, throwing the sisterhood's carefully laid schemes into chaos.

Herbert modeled the Bene Gesserit on a combination of the Jesuits, the Beguines, and various historical orders of women who wielded hidden power behind thrones and institutions. Their motto, "Fear is the mind-killer," has become one of the most quoted lines in science fiction.

**Sources:**
- [Bene Gesserit — Wikipedia](https://en.wikipedia.org/wiki/Bene_Gesserit)
- [Dune (novel) — Wikipedia](https://en.wikipedia.org/wiki/Dune_(novel))`,
    verbatimCheck: "Herbert modeled the Bene Gesserit on a combination of the Jesuits, the Beguines",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Bene_Gesserit", name: "Bene Gesserit — Wikipedia", description: "Wikipedia article on the Bene Gesserit" },
      { uri: "https://en.wikipedia.org/wiki/Dune_(novel)", name: "Dune (novel) — Wikipedia", description: "Wikipedia article on Frank Herbert's Dune" },
    ],
  },
  {
    id: "paul-atreides",
    keywords: ["paul atreides", "muad'dib", "paul", "atreides", "messiah", "prescience"],
    text: `Paul Atreides is the protagonist of Frank Herbert's Dune and one of the most complex characters in science fiction. Born the son of Duke Leto Atreides and the Bene Gesserit Lady Jessica, Paul is raised with both the martial training of a noble house and the mental disciplines of the sisterhood.

When his family is betrayed on Arrakis, Paul escapes into the desert and is taken in by the Fremen, who come to see him as their prophesied messiah, Muad'Dib. Through exposure to the spice melange, Paul develops prescience — the ability to see possible futures — making him the most dangerous political figure in the known universe.

What makes Paul remarkable as a literary character is Herbert's subversion of the chosen-one trope. Herbert deliberately wrote Paul as a cautionary tale about the dangers of following charismatic leaders. In the sequel, Dune Messiah, Paul's jihad has killed 61 billion people — more than any tyrant in history — and Paul himself is trapped by his own legend.

Herbert once said, "The bottom line of the Dune trilogy is: beware of heroes. Much better to rely on your own judgment and your own mistakes." This anti-messianic message was revolutionary for 1960s science fiction.

**Sources:**
- [Paul Atreides — Wikipedia](https://en.wikipedia.org/wiki/Paul_Atreides)
- [Dune Messiah — Wikipedia](https://en.wikipedia.org/wiki/Dune_Messiah)`,
    verbatimCheck: "beware of heroes. Much better to rely on your own judgment and your own mistakes",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Paul_Atreides", name: "Paul Atreides — Wikipedia", description: "Wikipedia article on Paul Atreides" },
      { uri: "https://en.wikipedia.org/wiki/Dune_Messiah", name: "Dune Messiah — Wikipedia", description: "Wikipedia article on Dune Messiah" },
    ],
  },

  // ─── Neuromancer ─────────────────────────────────────────────────────────────
  {
    id: "neuromancer",
    keywords: ["neuromancer", "william gibson", "cyberpunk", "cyberspace", "matrix"],
    text: `Neuromancer, published in 1984 by William Gibson, is the seminal cyberpunk novel that defined an entire genre and predicted much of our digital future. It was the first novel to win the "triple crown" of science fiction — the Nebula Award, the Hugo Award, and the Philip K. Dick Award — all in the same year.

The story follows Case, a washed-up computer hacker hired by a mysterious employer named Armitage to pull off the ultimate hack. Set in a dystopian future of mega-corporations, artificial intelligences, and virtual reality, Gibson coined the term "cyberspace" in this novel and envisioned a networked world decades before the modern internet.

The novel's gritty, noir-influenced prose style and its fusion of high technology with street-level culture created the template for cyberpunk fiction. Its influence extends far beyond literature into film (The Matrix), video games (Deus Ex), and our cultural understanding of digital life.

Gibson wrote the novel on a manual typewriter, famously having no personal experience with computers at the time — a fact that makes his prescient vision all the more remarkable.

**Sources:**
- [Neuromancer — Wikipedia](https://en.wikipedia.org/wiki/Neuromancer)`,
    verbatimCheck: "Gibson wrote the novel on a manual typewriter, famously having no personal experience with computers at the time",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Neuromancer", name: "Neuromancer — Wikipedia", description: "Wikipedia article on William Gibson's Neuromancer" },
    ],
  },
  {
    id: "case-character",
    keywords: ["case", "hacker", "chiba", "console cowboy", "sprawl"],
    text: `Case, full name Henry Dorsett Case, is the protagonist of William Gibson's Neuromancer and one of the defining characters of cyberpunk fiction. Once a talented "console cowboy" — a hacker who jacks into cyberspace to steal data for corporate employers — Case was caught skimming from his bosses, who retaliated by damaging his nervous system with a mycotoxin, making him unable to access the matrix.

When we first meet Case, he is living in the slums of Chiba City, Japan, a burned-out addict desperately seeking a cure. He is recruited by a mysterious figure named Armitage, who offers to repair his nervous system in exchange for one last job — a heist that turns out to involve breaking into the most powerful artificial intelligence in existence.

Gibson uses Case to explore themes of addiction, identity, and the blurring line between human consciousness and digital space. Case is not a traditional hero — he is desperate, morally ambiguous, and motivated primarily by his need to jack back into the matrix. His character established the archetype of the troubled hacker protagonist that would appear in countless works from The Matrix to Mr. Robot.

The Sprawl, the urban corridor stretching from Boston to Atlanta where Case operates, became one of science fiction's most influential settings.

**Sources:**
- [Neuromancer — Wikipedia](https://en.wikipedia.org/wiki/Neuromancer)
- [Sprawl trilogy — Wikipedia](https://en.wikipedia.org/wiki/Sprawl_trilogy)`,
    verbatimCheck: "Case is not a traditional hero — he is desperate, morally ambiguous",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Neuromancer", name: "Neuromancer — Wikipedia", description: "Wikipedia article on William Gibson's Neuromancer" },
      { uri: "https://en.wikipedia.org/wiki/Sprawl_trilogy", name: "Sprawl trilogy — Wikipedia", description: "Wikipedia article on the Sprawl trilogy" },
    ],
  },

  // ─── Lord of the Rings ───────────────────────────────────────────────────────
  {
    id: "lotr",
    keywords: ["lord of the rings", "tolkien", "middle-earth", "hobbit", "gandalf", "frodo", "ring"],
    text: `The Lord of the Rings was written by J.R.R. Tolkien, an English author, philologist, and academic at the University of Oxford. The work was written in stages between 1937 and 1949, largely during the Second World War, and was published in three volumes in 1954–1955.

Tolkien originally intended it as a sequel to his children's fantasy novel The Hobbit (1937), but it quickly grew into a much larger and more ambitious work. The story follows the hobbit Frodo Baggins on his quest to destroy the One Ring in the fires of Mount Doom, accompanied by the Fellowship of the Ring.

Tolkien's deep expertise in Old English, Norse mythology, and Finnish language profoundly shaped the languages, cultures, and history of Middle-earth. He spent over a decade constructing the Elvish languages Quenya and Sindarin before writing the narrative itself.

The Lord of the Rings is one of the best-selling books ever written, with over 150 million copies sold. It has been translated into at least 38 languages and has had an immeasurable influence on the fantasy genre and popular culture.

**Sources:**
- [The Lord of the Rings — Wikipedia](https://en.wikipedia.org/wiki/The_Lord_of_the_Rings)
- [J. R. R. Tolkien — Wikipedia](https://en.wikipedia.org/wiki/J._R._R._Tolkien)`,
    verbatimCheck: "He spent over a decade constructing the Elvish languages Quenya and Sindarin before writing the narrative itself",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/The_Lord_of_the_Rings", name: "The Lord of the Rings — Wikipedia", description: "Wikipedia article on Tolkien's The Lord of the Rings" },
      { uri: "https://en.wikipedia.org/wiki/J._R._R._Tolkien", name: "J. R. R. Tolkien — Wikipedia", description: "Wikipedia article on J.R.R. Tolkien" },
    ],
  },
  {
    id: "elvish-languages",
    keywords: ["elvish", "quenya", "sindarin", "language", "tengwar", "elvish language"],
    text: `Tolkien's Elvish languages are among the most fully developed constructed languages in history, and they are central to understanding how Middle-earth was created. Tolkien, a professional philologist, did not invent languages for his stories — he invented stories for his languages.

Quenya, inspired primarily by Finnish and Latin, is the ancient ceremonial language of the High Elves. It functions in Middle-earth much as Latin did in medieval Europe — a language of lore, song, and formal occasions rather than everyday speech.

Sindarin, influenced by Welsh phonology, is the everyday Elvish language heard most often in The Lord of the Rings. Place names like Minas Tirith ("Tower of Guard"), Gondor ("Stone-land"), and Mordor ("Black Land") are all Sindarin.

Tolkien also created the Tengwar writing system, an elegant script with its own internal logic of consonant and vowel representation. The inscription on the One Ring is written in the Black Speech using Tengwar letterforms.

What distinguishes Tolkien's languages from other constructed languages is their historical depth. He created proto-languages, sound-change rules, and dialect variations that mirror real linguistic evolution, giving Middle-earth a sense of historical authenticity unmatched in fantasy literature.

**Sources:**
- [Elvish languages — Wikipedia](https://en.wikipedia.org/wiki/Elvish_languages_(Middle-earth))
- [Quenya — Wikipedia](https://en.wikipedia.org/wiki/Quenya)
- [Sindarin — Wikipedia](https://en.wikipedia.org/wiki/Sindarin)`,
    verbatimCheck: "he invented stories for his languages",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Elvish_languages_(Middle-earth)", name: "Elvish languages — Wikipedia", description: "Wikipedia article on Tolkien's Elvish languages" },
      { uri: "https://en.wikipedia.org/wiki/Quenya", name: "Quenya — Wikipedia", description: "Wikipedia article on the Quenya language" },
      { uri: "https://en.wikipedia.org/wiki/Sindarin", name: "Sindarin — Wikipedia", description: "Wikipedia article on the Sindarin language" },
    ],
  },

  // ─── Hitchhiker's Guide ──────────────────────────────────────────────────────
  {
    id: "hitchhikers",
    keywords: ["hitchhiker", "guide", "galaxy", "douglas adams", "42", "funny", "humor", "comedy", "humorous"],
    text: `The Hitchhiker's Guide to the Galaxy by Douglas Adams is the quintessential comedic science fiction novel, first published in 1979. It originated as a BBC Radio 4 series in 1978 before being adapted into the beloved novel.

The story begins when Arthur Dent's house — and then the entire Earth — is demolished to make way for construction projects. Arthur is rescued by his friend Ford Prefect, who turns out to be an alien researcher for the titular Guide, a sort of interstellar encyclopedia.

The novel is famous for revealing that the Answer to the Ultimate Question of Life, the Universe, and Everything is simply 42, as computed by the supercomputer Deep Thought over 7.5 million years. Adams' wit and philosophical absurdism have made phrases like "Don't Panic" and "So long, and thanks for all the fish" part of the cultural lexicon.

Adams described his creative process as "staring at a blank piece of paper until your forehead bleeds," and his unique blend of British humor, science fiction, and existential philosophy remains utterly unmatched in the genre.

**Sources:**
- [The Hitchhiker's Guide to the Galaxy — Wikipedia](https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy_(novel))`,
    verbatimCheck: "Adams described his creative process as \"staring at a blank piece of paper until your forehead bleeds,\"",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy_(novel)", name: "The Hitchhiker's Guide to the Galaxy — Wikipedia", description: "Wikipedia article on Douglas Adams' The Hitchhiker's Guide to the Galaxy" },
    ],
  },
  {
    id: "deep-thought",
    keywords: ["deep thought", "answer", "meaning of life", "question", "earth computer", "42 meaning"],
    text: `Deep Thought is one of the most memorable fictional computers in science fiction, created by Douglas Adams for The Hitchhiker's Guide to the Galaxy. It is a supercomputer built by a race of hyper-intelligent, pan-dimensional beings to determine the Answer to the Ultimate Question of Life, the Universe, and Everything.

After 7.5 million years of computation, Deep Thought delivers its answer: 42. When the disappointed creators protest, Deep Thought explains that the problem is not the answer but the question — they never actually knew what the Ultimate Question was. Deep Thought then designs an even more powerful computer to determine the Question: the Earth itself, a planet-sized organic computer that runs for 10 million years before being demolished by Vogons five minutes before completing its program.

Adams chose 42 arbitrarily, later saying he simply wanted "an ordinary, smallish number" and that the joke worked precisely because the answer was so anticlimactic. Despite this, fans and mathematicians have spent decades searching for hidden significance in the number. Stephen Fry, a close friend of Adams, has claimed that Adams told him the real reason he chose 42, but that he would take the secret to his grave.

The Deep Thought sequence is a brilliant satire of humanity's search for cosmic meaning, suggesting that we might not even understand the question we are trying to answer.

**Sources:**
- [Deep Thought (The Hitchhiker's Guide to the Galaxy) — Wikipedia](https://en.wikipedia.org/wiki/Deep_Thought_(The_Hitchhiker%27s_Guide_to_the_Galaxy))
- [Phrases from The Hitchhiker's Guide to the Galaxy — Wikipedia](https://en.wikipedia.org/wiki/Phrases_from_The_Hitchhiker%27s_Guide_to_the_Galaxy#The_Answer_to_the_Ultimate_Question_of_Life,_the_Universe,_and_Everything_is_42)`,
    verbatimCheck: "Adams told him the real reason he chose 42, but that he would take the secret to his grave",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Deep_Thought_(The_Hitchhiker%27s_Guide_to_the_Galaxy)", name: "Deep Thought — Wikipedia", description: "Wikipedia article on Deep Thought" },
    ],
  },

  // ─── Comparisons ─────────────────────────────────────────────────────────────
  {
    id: "dune-vs-neuromancer",
    keywords: ["compare", "comparison", "versus", "vs", "difference", "similar", "dune", "neuromancer"],
    text: `Dune (1965) and Neuromancer (1984) are two of the most influential science fiction novels ever written, but they represent radically different visions of the future and approaches to the genre.

**Setting and Worldbuilding:** Dune is set thousands of years in the future on the desert planet Arrakis, depicting a feudal interstellar empire where computers have been banned. Neuromancer takes place in a near-future Earth dominated by mega-corporations, artificial intelligences, and a global computer network called the matrix. Where Dune looks backward to medieval and imperial structures, Neuromancer looks forward to a digital, post-industrial world.

**Themes:** Herbert's primary concerns are ecology, religion, politics, and the danger of charismatic leaders. Gibson explores identity, addiction, the nature of consciousness, and what happens when technology outpaces human ability to control it. Both novels are deeply skeptical of power, but they examine it through entirely different lenses.

**Prose Style:** Dune is dense, philosophical, and ornate — Herbert includes appendices, a glossary, and ecological treatises within the novel. Neuromancer is fast, fragmented, and cinematic — Gibson's prose reads like a noir thriller spliced with technical poetry.

**Legacy:** Dune essentially created the epic science fiction subgenre and influenced everything from Star Wars to Game of Thrones. Neuromancer created the cyberpunk movement and predicted the internet, virtual reality, and hacker culture. Together, they represent the two great poles of modern science fiction: the epic and the intimate, the political and the personal.

**Sources:**
- [Dune (novel) — Wikipedia](https://en.wikipedia.org/wiki/Dune_(novel))
- [Neuromancer — Wikipedia](https://en.wikipedia.org/wiki/Neuromancer)`,
    verbatimCheck: "they represent the two great poles of modern science fiction: the epic and the intimate, the political and the personal",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Dune_(novel)", name: "Dune (novel) — Wikipedia", description: "Wikipedia article on Frank Herbert's Dune" },
      { uri: "https://en.wikipedia.org/wiki/Neuromancer", name: "Neuromancer — Wikipedia", description: "Wikipedia article on William Gibson's Neuromancer" },
    ],
  },

  // ─── 1980s and Foundation ────────────────────────────────────────────────────
  {
    id: "80s-scifi",
    keywords: ["1980s", "80s", "best", "decade", "greatest", "top", "list"],
    text: `The 1980s were a golden age for science fiction literature, producing works that continue to define the genre. The decade saw an unprecedented convergence of literary ambition and cultural relevance.

Here are some of the most important sci-fi novels of the 1980s:

1. **Neuromancer** (1984) by William Gibson — The novel that launched the cyberpunk movement and predicted our digital future. It won the Hugo, Nebula, and Philip K. Dick Awards.

2. **Ender's Game** (1985) by Orson Scott Card — A military science fiction masterpiece about a child genius recruited to command humanity's fleet against an alien threat. Won both the Hugo and Nebula.

3. **The Handmaid's Tale** (1985) by Margaret Atwood — A chilling dystopian novel about a theocratic society that has subjugated women, more relevant today than ever.

4. **Speaker for the Dead** (1986) by Orson Scott Card — The rare sequel that won both Hugo and Nebula, making Card the only author to win both awards in consecutive years.

5. **Hyperion** (1989) by Dan Simmons — A brilliant frame narrative inspired by The Canterbury Tales, set across a far-future interstellar civilization.

The 1980s also saw the rise of cyberpunk as a literary movement, with Bruce Sterling, Pat Cadigan, and Rudy Rucker joining Gibson in exploring the intersection of technology and counterculture.

**Sources:**
- [Neuromancer — Wikipedia](https://en.wikipedia.org/wiki/Neuromancer)
- [Ender's Game — Wikipedia](https://en.wikipedia.org/wiki/Ender%27s_Game)
- [The Handmaid's Tale — Wikipedia](https://en.wikipedia.org/wiki/The_Handmaid%27s_Tale)
- [Hyperion — Wikipedia](https://en.wikipedia.org/wiki/Hyperion_(Simmons_novel))`,
    verbatimCheck: "making Card the only author to win both awards in consecutive years",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Neuromancer", name: "Neuromancer — Wikipedia", description: "Wikipedia article on William Gibson's Neuromancer" },
      { uri: "https://en.wikipedia.org/wiki/Ender%27s_Game", name: "Ender's Game — Wikipedia", description: "Wikipedia article on Orson Scott Card's Ender's Game" },
      { uri: "https://en.wikipedia.org/wiki/The_Handmaid%27s_Tale", name: "The Handmaid's Tale — Wikipedia", description: "Wikipedia article on Margaret Atwood's The Handmaid's Tale" },
      { uri: "https://en.wikipedia.org/wiki/Hyperion_(Simmons_novel)", name: "Hyperion — Wikipedia", description: "Wikipedia article on Dan Simmons' Hyperion" },
    ],
  },
  {
    id: "foundation",
    keywords: ["foundation", "asimov", "psychohistory", "empire", "space opera", "hari seldon"],
    text: `Isaac Asimov's Foundation series is one of the most influential works of science fiction ever created. The original Foundation trilogy — Foundation (1951), Foundation and Empire (1952), and Second Foundation (1953) — was awarded a special Hugo Award in 1966 for "Best All-Time Series," beating out even The Lord of the Rings.

The series is built around the concept of psychohistory, a fictional science that combines history, sociology, and mathematics to predict the behavior of large populations. When mathematician Hari Seldon foresees the collapse of the Galactic Empire and a subsequent 30,000-year dark age, he establishes two Foundations at opposite ends of the galaxy to shorten the interregnum to a mere 1,000 years.

Asimov's genius lies in his exploration of how knowledge, trade, religion, and political power can be wielded to shape the course of civilization. The series influenced everything from Paul Krugman's decision to study economics to Elon Musk's interest in space colonization.

The Foundation saga eventually grew to seven novels, and Asimov ingeniously linked it to his Robot and Empire series, creating a unified future history spanning tens of thousands of years.

**Sources:**
- [Foundation series — Wikipedia](https://en.wikipedia.org/wiki/Foundation_series)`,
    verbatimCheck: "The series influenced everything from Paul Krugman's decision to study economics to Elon Musk's interest in space colonization",
    citations: [
      { uri: "https://en.wikipedia.org/wiki/Foundation_series", name: "Foundation series — Wikipedia", description: "Wikipedia article on Isaac Asimov's Foundation series" },
    ],
  },
];

export const FALLBACK_ANSWER: Answer = {
  id: "fallback",
  keywords: [],
  text: `I'm a sci-fi and fantasy book expert! I can help you with questions about classic and modern works of science fiction and fantasy literature.

Try asking me about:
- **Dune** by Frank Herbert — including the Bene Gesserit, Paul Atreides, and the spice melange
- **Neuromancer** by William Gibson — including Case, cyberspace, and the Sprawl
- **The Lord of the Rings** by J.R.R. Tolkien — including the Elvish languages and Middle-earth
- **The Hitchhiker's Guide to the Galaxy** by Douglas Adams — including Deep Thought and the meaning of 42
- **Foundation** by Isaac Asimov — including psychohistory and Hari Seldon
- The best sci-fi books of the 1980s
- How different sci-fi novels compare to each other

I have detailed knowledge about these works including their themes, characters, historical significance, awards, and cultural impact.`,
  verbatimCheck: "I have detailed knowledge about these works",
  citations: [],
};

/**
 * Match a question to the best answer by keyword overlap.
 * Prefers more specific answers (sub-topics, comparisons) over general ones
 * by weighting multi-word keywords higher and preferring later entries on ties.
 */
export function findAnswer(question: string): Answer {
  const q = question.toLowerCase();

  let bestMatch: Answer | null = null;
  let bestScore = 0;

  for (const answer of ANSWERS) {
    // Score: sum of matched keyword lengths (multi-word keywords score higher)
    let score = 0;
    for (const kw of answer.keywords) {
      if (q.includes(kw)) {
        score += kw.split(' ').length; // "bene gesserit" = 2, "dune" = 1
      }
    }
    // On equal scores, prefer later (more specific) entries: >= not >
    if (score >= bestScore && score > 0) {
      bestScore = score;
      bestMatch = answer;
    }
  }

  return bestMatch ?? FALLBACK_ANSWER;
}
