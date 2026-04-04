const { PrismaClient } = require('@prisma/client');
const translate = require('google-translate-api-x');
const prisma = new PrismaClient();

// Languages to translate to and their Google Translate codes
const TARGET_LANGUAGES = {
  "RU": "ru", // Russian
  "TR": "tr", // Turkish
  "SR": "sr", // Serbian
  "SQ": "sq", // Albanian
  "UK": "uk", // Ukrainian
  "PL": "pl"  // Polish
};

async function main() {
  console.log("Fetching all sentences...");
  const sentences = await prisma.sentence.findMany({
    select: { id: true, translation: true } // 'translation' is the full German sentence
  });

  console.log(`Found ${sentences.length} sentences to translate.`);

  // Process in batches to avoid overwhelming the API
  const BATCH_SIZE = 50;

  for (const [dbLang, gtLang] of Object.entries(TARGET_LANGUAGES)) {
    console.log(`\n🌍 Translating to ${dbLang} (${gtLang})...`);
    
    let successCount = 0;
    
    for (let i = 0; i < sentences.length; i += BATCH_SIZE) {
      const batch = sentences.slice(i, i + BATCH_SIZE);
      const textsToTranslate = batch.map(s => s.translation);
      
      console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1} to ${Math.min(i + BATCH_SIZE, sentences.length)})...`);
      
      try {
        // google-translate-api-x accepts an array and makes a single request
        const res = await translate(textsToTranslate, { from: 'de', to: gtLang });
        
        const translatedTexts = Array.isArray(res) ? res : [res];

        if (translatedTexts.length === batch.length) {
          for (let j = 0; j < batch.length; j++) {
            const sentenceId = batch[j].id;
            const translatedText = translatedTexts[j].text;
            
            await prisma.sentenceTranslation.upsert({
              where: {
                sentenceId_language: {
                  sentenceId,
                  language: dbLang
                }
              },
              update: { text: translatedText },
              create: {
                sentenceId,
                language: dbLang,
                text: translatedText
              }
            });
            successCount++;
          }
        } else {
           console.error(`  ⚠️ Returned translations length doesn't match batch size.`);
        }
      } catch (error) {
        console.error(`  ⚠️ Batch translation failed:`, error.message);
      }
      
      // Delay to respect rate limits (3 seconds between batches)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.log(`✅ Finished translating to ${dbLang}. Saved ${successCount} translations.`);
  }

  console.log("\n🎉 All translations completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
