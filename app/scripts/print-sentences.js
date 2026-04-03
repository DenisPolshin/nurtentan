const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const verbs = await prisma.verb.findMany({
    include: { sentences: true },
    orderBy: { infinitive: "asc" }
  });

  for (const v of verbs.slice(0, 120)) {
    const s = v.sentences[0];
    console.log(`${v.case}\t${v.infinitive} + ${v.preposition}\t=>\t${s.translation}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

