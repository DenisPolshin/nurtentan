const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const languages = ["RU", "TR", "SR", "SQ", "UK", "PL"];
  
  for (const lang of languages) {
    console.log(`\n--- SAMPLE FOR ${lang} ---`);
    const translations = await prisma.sentenceTranslation.findMany({
      where: { language: lang },
      take: 5,
      include: { sentence: true }
    });
    
    translations.forEach((t, i) => {
      console.log(`${i+1}. DE: ${t.sentence.translation}`);
      console.log(`   ${lang}: ${t.text}`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
