const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function blanksCount(text) {
  return (text.match(/____/g) || []).length;
}

function hasCyrillic(text) {
  return /[\u0400-\u04FF]/.test(text);
}

async function main() {
  const verbs = await prisma.verb.findMany({ include: { sentences: true } });

  const issues = [];
  const seen = new Set();

  for (const v of verbs) {
    const key = `${v.infinitive}|${v.preposition}|${v.case}`;
    if (seen.has(key)) issues.push({ type: "duplicate_verb", key });
    seen.add(key);

    if (v.translation && hasCyrillic(v.translation)) {
      issues.push({ type: "cyrillic_verb_translation", key, value: v.translation });
    }

    for (const s of v.sentences) {
      if (blanksCount(s.text) !== 2) {
        issues.push({ type: "bad_blanks", key, value: s.text });
      }
      if (s.prepAnswer.trim() !== v.preposition.trim()) {
        issues.push({
          type: "prep_mismatch",
          key,
          value: { verbPreposition: v.preposition, prepAnswer: s.prepAnswer }
        });
      }
      if (s.translation && s.translation.includes("____")) {
        issues.push({ type: "unfilled_translation", key, value: s.translation });
      }
      if (s.translation && hasCyrillic(s.translation)) {
        issues.push({ type: "cyrillic_sentence_translation", key, value: s.translation });
      }
      if (hasCyrillic(s.text)) {
        issues.push({ type: "cyrillic_sentence_text", key, value: s.text });
      }
      if (hasCyrillic(s.verbAnswer) || hasCyrillic(s.prepAnswer)) {
        issues.push({ type: "cyrillic_answer", key, value: { verbAnswer: s.verbAnswer, prepAnswer: s.prepAnswer } });
      }
    }
  }

  const summary = {
    verbs: verbs.length,
    sentences: verbs.reduce((acc, v) => acc + v.sentences.length, 0),
    issues: issues.length
  };

  console.log(JSON.stringify({ summary, issues }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

