const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sentences = await prisma.sentence.findMany({
    where: {
        text: { contains: "muss" }
    },
    take: 5
  });

  console.log("VerbOptions for Modal sentences:");
  sentences.forEach(s => {
    console.log(`Text: ${s.text}`);
    console.log(`VerbOptions: ${s.verbOptions}`);
    console.log("---");
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
