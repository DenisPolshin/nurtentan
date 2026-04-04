const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sentence = await prisma.sentence.findFirst({
    where: {
      verbAnswer: "vorbereiten"
    }
  });

  if (sentence) {
    console.log(`Text: ${sentence.text}`);
    console.log(`VerbAnswer: ${sentence.verbAnswer}`);
    console.log(`PrepAnswer: ${sentence.prepAnswer}`);
    console.log(`Options: ${sentence.verbOptions}`);
  } else {
    console.log("Sentence not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
