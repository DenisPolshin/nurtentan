const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sentences = await prisma.sentence.findMany({
    where: {
      OR: [
        { verbAnswer: { contains: "vorvor" } },
        { verbAnswer: { contains: "aufauf" } },
        { verbAnswer: { contains: "abab" } },
        { verbAnswer: { contains: "anan" } }
      ]
    },
    select: { text: true, verbAnswer: true, prepAnswer: true }
  });

  console.log("Sentences with duplicated prefixes in verbAnswer:");
  sentences.forEach(s => {
    console.log(`Text: ${s.text}`);
    console.log(`VerbAnswer: ${s.verbAnswer}`);
    console.log(`PrepAnswer: ${s.prepAnswer}`);
    console.log("---");
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
