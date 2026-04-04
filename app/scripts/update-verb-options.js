const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Generate distractors logic
function getVerbDistractors(correctAnswer, allSentences) {
  const allVerbAnswers = Array.from(new Set(allSentences.map(s => s.verbAnswer)));
  
  const tokens = correctAnswer.split(' ');
  let pattern = '';
  
  if (tokens.length > 1) {
    const lastWord = tokens[tokens.length - 1]; 
    const firstWord = tokens[0]; 
    
    if (firstWord.endsWith('st')) pattern = 'st ' + lastWord;
    else if (firstWord.endsWith('t')) pattern = 't ' + lastWord;
    else if (firstWord.endsWith('en')) pattern = 'en ' + lastWord;
    else if (firstWord.endsWith('e')) pattern = 'e ' + lastWord;
  } else {
    if (correctAnswer.endsWith('st')) pattern = 'st';
    else if (correctAnswer.endsWith('en')) pattern = 'en';
    else if (correctAnswer.endsWith('t')) pattern = 't';
    else if (correctAnswer.endsWith('e')) pattern = 'e';
  }
  
  let candidates = [];
  if (pattern) {
    candidates = allVerbAnswers.filter(v => v !== correctAnswer && v.endsWith(pattern));
  }
  
  if (candidates.length < 5) {
    const remaining = allVerbAnswers.filter(v => v !== correctAnswer && !candidates.includes(v));
    candidates = [...candidates, ...remaining];
  }
  
  return candidates.sort(() => Math.random() - 0.5).slice(0, 5);
}

async function main() {
  console.log("Fetching sentences...");
  const allSentences = await prisma.sentence.findMany();
  
  console.log(`Found ${allSentences.length} sentences. Updating verbOptions where missing...`);
  
  let updatedCount = 0;
  
  for (const sentence of allSentences) {
    if (!sentence.verbOptions || sentence.verbOptions === '[]') {
      const distractors = getVerbDistractors(sentence.verbAnswer, allSentences);
      
      await prisma.sentence.update({
        where: { id: sentence.id },
        data: { verbOptions: JSON.stringify(distractors) }
      });
      
      updatedCount++;
    }
  }
  
  console.log(`Successfully updated ${updatedCount} sentences with new verbOptions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
