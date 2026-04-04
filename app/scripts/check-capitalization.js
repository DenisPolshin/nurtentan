const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-verbs.js');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find articles (any case) followed by a lowercase word (must be lowercase)
const regex = /\b(den|dem|der|die|das|ein|eine|einen|einem|einer|des|uns|euch|mich|dich|sich)\s+([a-zäöüß][a-zäöüß]+)\b/g;

let match;
const issues = [];

while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    const article = match[1];
    const word = match[2];
    
    // Ignore common non-noun lowercase words that can follow articles
    // (e.g., "das gleiche", "die anderen", "der erste", etc.)
    const skipWords = [
        'andere', 'anderen', 'anderes', 'anderem', 'anderer',
        'gleiche', 'gleichen', 'gleiches', 'gleichem', 'gleicher',
        'erste', 'ersten', 'erstes', 'erstem', 'erster',
        'neue', 'neuen', 'neues', 'neuem', 'neuer',
        'viele', 'vielen', 'vieles', 'vielem', 'vieler',
        'ganze', 'ganzen', 'ganzes', 'ganzem', 'ganzer',
        'eigene', 'eigenen', 'eigenes', 'eigenem', 'eigener',
        'letzte', 'letzten', 'letztes', 'letztem', 'letzter',
        'nächste', 'nächsten', 'nächstes', 'nächstem', 'nächster',
        'oben', 'unten', 'links', 'rechts', 'vorne', 'hinten',
        'dich', 'mich', 'sich', 'uns', 'euch', 'ihm', 'ihr', 'ihnen', 'sie', 'es',
        'schlechte', 'schwierige', 'gute', 'schnelle', 'geheimen', 'spannendes', 'ehrlichen', 'hohen',
        'anpassen', 'ärgern', 'aufregen', 'bedanken', 'beklagen', 'bemühen', 'beschweren', 'bewerben', 'beziehen', 'drehen', 'eignen', 'entscheiden', 'entschuldigen', 'erinnern', 'freuen', 'gewöhnen', 'halten', 'informieren', 'interessieren', 'konzentrieren', 'kümmern', 'rächen', 'sorgen', 'streiten', 'unterhalten', 'verlassen', 'verlieben', 'vertiefen', 'vorbereiten', 'wenden', 'wundern', 'auseinandersetzen', 'befreien', 'beschäftigen', 'entschließen', 'entwickeln', 'erholen', 'erkundigen', 'fürchten', 'hüten', 'irren', 'melden', 'richten', 'schützen', 'sehnen', 'treffen', 'trennen', 'unterscheiden', 'verabreden', 'verloben', 'verstehen'
    ];

    if (!skipWords.includes(word.toLowerCase())) {
        issues.push({
            match: fullMatch,
            line: content.substring(0, match.index).split('\n').length
        });
    }
}

if (issues.length > 0) {
    console.log("Potential lowercase nouns found:");
    issues.forEach(issue => {
        console.log(`Line ${issue.line}: ${issue.match}`);
    });
} else {
    console.log("No potential lowercase nouns found.");
}
