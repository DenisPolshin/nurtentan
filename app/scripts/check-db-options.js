const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sentences = await prisma.sentence.findMany();

  let count = 0;
  sentences.forEach(s => {
    const options = JSON.parse(s.verbOptions);
    const badOptions = options.filter(o => o.includes("vorvor") || o.includes("aufauf") || o.includes("abab") || o.includes("anan"));
    if (badOptions.length > 0) {
      console.log(`Sentence: ${s.text}`);
      console.log(`Options: ${s.verbOptions}`);
      console.log("---");
      count++;
    }
  });
  console.log(`Total sentences with bad options: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
