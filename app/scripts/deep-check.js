const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sentences = await prisma.sentence.findMany();

  const prefixes = ["ab", "an", "auf", "aus", "bei", "ein", "mit", "nach", "vor", "zu"];
  let count = 0;

  sentences.forEach(s => {
    const options = JSON.parse(s.verbOptions);
    options.forEach(o => {
      prefixes.forEach(p => {
        if (o.startsWith(p + p)) {
          console.log(`FOUND: ${o} in sentence ${s.text}`);
          count++;
        }
      });
    });
    
    prefixes.forEach(p => {
      if (s.verbAnswer.startsWith(p + p)) {
        console.log(`FOUND in verbAnswer: ${s.verbAnswer} in sentence ${s.text}`);
        count++;
      }
    });
  });

  console.log(`Total found: ${count}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
