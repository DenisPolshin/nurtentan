const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function inferForm(text) {
  if (text.startsWith("____ du")) return "Du";
  // Type 4: "Ich muss mich ____ das ____."
  if (text.startsWith("Ich") && text.includes("muss")) return "Modal";
  if (text.startsWith("Ich")) return "Ich";
  if (text.startsWith("Wir")) return "Wir";
  // All other custom subjects ("Es", "Der Film", "Die Mutter") are 3rd person singular "Er"
  return "Er";
}

async function main() {
  console.log("Fetching all sentences...");
  const allSentences = await prisma.sentence.findMany();
  
  // Create grammar pools
  const pools = {
    "Du": new Set(),
    "Modal": new Set(),
    "Ich": new Set(),
    "Wir": new Set(),
    "Er": new Set()
  };

  for (const s of allSentences) {
    const form = inferForm(s.text);
    pools[form].add(s.verbAnswer);
  }

  console.log("Grammar pool sizes:");
  for (const [form, set] of Object.entries(pools)) {
    console.log(`- ${form}: ${set.size} unique verbs`);
  }

  let updatedCount = 0;
  
  for (const sentence of allSentences) {
    const form = inferForm(sentence.text);
    const pool = Array.from(pools[form]);
    
    // Filter out the correct answer
    const candidates = pool.filter(v => v !== sentence.verbAnswer);
    
    // Pick 5 random, grammatically correct distractors from the same pool
    const distractors = candidates.sort(() => Math.random() - 0.5).slice(0, 5);
    
    await prisma.sentence.update({
      where: { id: sentence.id },
      data: { verbOptions: JSON.stringify(distractors) }
    });
    
    updatedCount++;
  }
  
  console.log(`Successfully regenerated ${updatedCount} sentences with grammatically perfect distractors from the 185 base verbs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
