const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const akkusativVerbs = [
  ["abstimmen", "über"],
  ["achten", "auf"],
  ["ankommen", "auf"],
  ["antworten", "auf"],
  ["sich anpassen", "an"],
  ["sich ärgern", "über"],
  ["aufpassen", "auf"],
  ["sich aufregen", "über"],
  ["ausgeben", "für"],
  ["sich bedanken", "für"],
  ["sich beklagen", "über"],
  ["sich bemühen", "um"],
  ["beraten", "über"],
  ["berichten", "über"],
  ["beschließen", "über"],
  ["sich beschweren", "über"],
  ["sich bewerben", "um"],
  ["sich beziehen", "auf"],
  ["bitten", "um"],
  ["bürgen", "für"],
  ["danken", "für"],
  ["denken", "an"],
  ["diskutieren", "über"],
  ["sich drehen", "um"],
  ["sich eignen", "für"],
  ["sich entscheiden", "für"],
  ["sich entschuldigen", "für"],
  ["erinnern", "an"],
  ["sich erinnern", "an"],
  ["ersetzen", "durch"],
  ["folgen", "auf"],
  ["sich freuen", "auf"],
  ["sich freuen", "über"],
  ["garantieren", "für"],
  ["gehen", "um"],
  ["geraten", "in"],
  ["geraten", "unter"],
  ["sich gewöhnen", "an"],
  ["glauben", "an"],
  ["halten", "für"],
  ["sich halten", "an"],
  ["herrschen", "über"],
  ["hören", "auf"],
  ["hoffen", "auf"],
  ["informieren", "über"],
  ["sich informieren", "über"],
  ["sich interessieren", "für"],
  ["kämpfen", "für"],
  ["kämpfen", "gegen"],
  ["kämpfen", "um"],
  ["klagen", "über"],
  ["kommen", "auf"],
  ["sich konzentrieren", "auf"],
  ["sich kümmern", "um"],
  ["lächeln", "über"],
  ["lachen", "über"],
  ["nachdenken", "über"],
  ["protestieren", "gegen"],
  ["sich rächen", "für"],
  ["reagieren", "auf"],
  ["rechnen", "auf"],
  ["reden", "über"],
  ["schimpfen", "über"],
  ["schreiben", "an"],
  ["schreiben", "über"],
  ["sein", "für"],
  ["sein", "gegen"],
  ["sorgen", "für"],
  ["sich sorgen", "um"],
  ["sprechen", "über"],
  ["staunen", "über"],
  ["stehen", "auf"],
  ["sterben", "für"],
  ["stimmen", "für"],
  ["stimmen", "gegen"],
  ["streiten", "über"],
  ["sich streiten", "um"],
  ["tun", "für"],
  ["sich unterhalten", "über"],
  ["unterrichten", "über"],
  ["sich verlassen", "auf"],
  ["sich verlieben", "in"],
  ["vermieten", "an"],
  ["sich vertiefen", "in"],
  ["vertrauen", "auf"],
  ["verzichten", "auf"],
  ["sich vorbereiten", "auf"],
  ["wählen", "in"],
  ["warten", "auf"],
  ["sich wenden", "an"],
  ["sich wundern", "über"],
  ["sich handeln", "um"]
];

const dativVerbs = [
  ["abhängen", "von"],
  ["abheben", "von"],
  ["ändern", "an"],
  ["anfangen", "mit"],
  ["auffordern", "zu"],
  ["aufhören", "mit"],
  ["sich auseinandersetzen", "mit"],
  ["sich bedanken", "bei"],
  ["sich befreien", "von"],
  ["sich befreien", "aus"],
  ["beginnen", "mit"],
  ["sich beklagen", "bei"],
  ["berichten", "von"],
  ["sich beschäftigen", "mit"],
  ["bestehen", "aus"],
  ["sich beschweren", "bei"],
  ["einladen", "zu"],
  ["sich entschließen", "zu"],
  ["sich entschuldigen", "bei"],
  ["sich entwickeln", "zu"],
  ["sich erholen", "von"],
  ["erkennen", "an"],
  ["sich erkundigen", "nach"],
  ["sich erkundigen", "bei"],
  ["erzählen", "von"],
  ["erziehen", "zu"],
  ["fehlen", "an"],
  ["folgen", "aus"],
  ["fragen", "nach"],
  ["führen", "zu"],
  ["sich fürchten", "vor"],
  ["gehören", "zu"],
  ["gratulieren", "zu"],
  ["halten", "von"],
  ["handeln", "mit"],
  ["handeln", "von"],
  ["helfen", "bei"],
  ["hindern", "an"],
  ["hören", "von"],
  ["sich hüten", "vor"],
  ["sich irren", "in"],
  ["kämpfen", "mit"],
  ["kommen", "zu"],
  ["leben", "von"],
  ["leiden", "an"],
  ["leiden", "unter"],
  ["liegen", "an"],
  ["meinen", "zu"],
  ["sich melden", "bei"],
  ["passen", "zu"],
  ["profitieren", "von"],
  ["sich rächen", "an"],
  ["raten", "zu"],
  ["rechnen", "mit"],
  ["reden", "von"],
  ["reden", "mit"],
  ["sich richten", "nach"],
  ["riechen", "nach"],
  ["rufen", "nach"],
  ["sich schützen", "vor"],
  ["schimpfen", "mit"],
  ["schließen", "aus"],
  ["schmecken", "nach"],
  ["schreiben", "an"],
  ["sehen", "nach"],
  ["sich sehnen", "nach"],
  ["sprechen", "mit"],
  ["sprechen", "von"],
  ["sterben", "an"],
  ["sich streiten", "mit"],
  ["teilnehmen", "an"],
  ["telefonieren", "mit"],
  ["träumen", "von"],
  ["sich treffen", "mit"],
  ["sich trennen", "von"],
  ["überreden", "zu"],
  ["sich unterhalten", "mit"],
  ["sich unterscheiden", "von"],
  ["sich verabreden", "mit"],
  ["verbinden", "mit"],
  ["vergleichen", "mit"],
  ["sich verloben", "mit"],
  ["verstehen", "von"],
  ["sich verstehen", "mit"],
  ["verwechseln", "mit"],
  ["wählen", "zu"],
  ["wählen", "zwischen"],
  ["warnen", "vor"],
  ["werden", "zu"],
  ["wissen", "von"],
  ["zweifeln", "an"],
  ["zwingen", "zu"],
  ["zu tun haben", "mit"]
];

function blanksCount(text) {
  return (text.match(/____/g) || []).length;
}

function fillSentence(text, verbAnswer, prepAnswer) {
  return text.replace("____", verbAnswer).replace("____", prepAnswer);
}

function inferForm(text) {
  if (text.startsWith("____ du")) return "Du";
  if (text.startsWith("Ich") && text.includes("muss")) return "Modal";
  if (text.startsWith("Ich")) return "Ich";
  if (text.startsWith("Wir")) return "Wir";
  return "Er";
}

// Generate distractors logic using grammar pools
function getVerbDistractors(correctAnswer, allSentences, currentSentenceText) {
  const form = inferForm(currentSentenceText);
  
  // Extract all verbAnswers from sentences of the exact same grammatical form
  const pool = Array.from(new Set(
    allSentences
      .filter(s => inferForm(s.text) === form)
      .map(s => s.verbAnswer)
  ));
  
  const candidates = pool.filter(v => v !== correctAnswer);
  return candidates.sort(() => Math.random() - 0.5).slice(0, 5);
}

function pickObjects(infinitive, prep, vCase) {
  const key = `${infinitive}|${prep}|${vCase}`;

  const byKey = {
    "abstimmen|über|Akkusativ": ["den Vorschlag", "das neue Gesetz", "das Projekt", "das Budget", "den Plan"],
    "achten|auf|Akkusativ": ["die Regeln", "die Qualität", "deine Gesundheit", "den Verkehr", "die Details"],
    "ankommen|auf|Akkusativ": ["das Wetter", "deine Entscheidung", "die Hilfe", "den Preis", "die Zeit"],
    "antworten|auf|Akkusativ": ["die E-Mail", "die Frage", "den Brief", "die Nachricht", "das Angebot"],
    "sich anpassen|an|Akkusativ": ["das neue Klima", "die Situation", "die Regeln", "die Kultur", "das Team"],
    "sich ärgern|über|Akkusativ": ["den Stau", "das Wetter", "den Fehler", "die Verspätung", "den Lärm"],
    "aufpassen|auf|Akkusativ": ["das Kind", "deine Tasche", "den Hund", "die Schlüssel", "das Haus"],
    "sich aufregen|über|Akkusativ": ["den Lärm", "die Politik", "den Chef", "die Preise", "das Problem"],
    "ausgeben|für|Akkusativ": ["Essen", "Kleidung", "Hobbys", "den Urlaub", "Geschenke"],
    "sich bedanken|für|Akkusativ": ["die Einladung", "die Hilfe", "das Geschenk", "die Unterstützung", "den Tipp"],
    "sich beklagen|über|Akkusativ": ["die schlechte Bedienung", "den Lärm", "das Essen", "die Verspätung", "das Zimmer"],
    "sich bemühen|um|Akkusativ": ["einen neuen Job", "eine Lösung", "einen Termin", "ein Visum", "die Stelle"],
    "beraten|über|Akkusativ": ["das Projekt", "den Plan", "das Budget", "die Strategie", "das Thema"],
    "berichten|über|Akkusativ": ["die Reise", "das Treffen", "den Unfall", "das Spiel", "das Ereignis"],
    "beschließen|über|Akkusativ": ["das Budget", "den Plan", "die Reform", "das Gesetz", "die Regeln"],
    "sich beschweren|über|Akkusativ": ["die Verspätung", "den Lärm", "das Essen", "die Nachbarn", "den Service"],
    "sich bewerben|um|Akkusativ": ["ein Stipendium", "einen Job", "einen Platz", "die Stelle", "ein Praktikum"],
    "sich beziehen|auf|Akkusativ": ["deine E-Mail", "unser Gespräch", "das Dokument", "den Artikel", "den Brief"],
    "bitten|um|Akkusativ": ["einen Gefallen", "Hilfe", "einen Termin", "Geld", "Verzeihung"],
    "bürgen|für|Akkusativ": ["ihn", "die Qualität", "den Kredit", "die Sicherheit", "das Projekt"],
    "danken|für|Akkusativ": ["deine Hilfe", "das Geschenk", "die Einladung", "den Tipp", "die Nachricht"],
    "denken|an|Akkusativ": ["den Termin", "den Urlaub", "die Zukunft", "meine Familie", "dich"],
    "diskutieren|über|Akkusativ": ["das neue Projekt", "die Politik", "das Problem", "den Plan", "das Thema"],
    "sich drehen|um|Akkusativ": ["das Geld", "die Liebe", "das Problem", "die Arbeit", "das Kind"],
    "sich eignen|für|Akkusativ": ["Anfänger", "Kinder", "den Sport", "das Büro", "den Winter"],
    "sich entscheiden|für|Akkusativ": ["den Film", "das Auto", "den Job", "die Pizza", "den Urlaub"],
    "sich entschuldigen|für|Akkusativ": ["den Fehler", "die Verspätung", "das Verhalten", "die Störung", "die Nachricht"],
    "erinnern|an|Akkusativ": ["den Termin", "die Hausaufgaben", "den Geburtstag", "das Treffen", "den Schlüssel"],
    "sich erinnern|an|Akkusativ": ["den Termin", "die Reise", "meine Kindheit", "das Gespräch", "den Namen"],
    "ersetzen|durch|Akkusativ": ["Honig", "Zucker", "die Maschine", "ein neues Modell", "einen Kollegen"],
    "folgen|auf|Akkusativ": ["das Essen", "den Kurs", "die Pause", "den Regen", "den Film"],
    "sich freuen|auf|Akkusativ": ["den Urlaub", "das Wochenende", "die Party", "den Sommer", "dich"],
    "sich freuen|über|Akkusativ": ["das Geschenk", "die Nachricht", "die Blumen", "den Erfolg", "deine Hilfe"],
    "garantieren|für|Akkusativ": ["die Qualität", "die Sicherheit", "den Erfolg", "den Preis", "die Lieferung"],
    "gehen|um|Akkusativ": ["die Frage", "das Problem", "das Geld", "die Zukunft", "die Prüfung"],
    "geraten|in|Akkusativ": ["eine schwierige Situation", "den Stau", "Panik", "Gefahr", "Schwierigkeiten"],
    "geraten|unter|Akkusativ": ["Druck", "Verdacht", "Beobachtung", "Kontrolle", "Einfluss"],
    "sich gewöhnen|an|Akkusativ": ["das Essen", "das Wetter", "die neue Arbeit", "die Stadt", "den Rhythmus"],
    "glauben|an|Akkusativ": ["dich", "Gott", "den Erfolg", "die Zukunft", "das Glück"],
    "halten|für|Akkusativ": ["eine gute Idee", "einen Fehler", "wichtig", "richtig", "einen Experten"],
    "sich halten|an|Akkusativ": ["die Regeln", "den Plan", "die Abmachung", "die Gesetze", "die Diät"],
    "herrschen|über|Akkusativ": ["das Land", "das Volk", "die Region", "das Meer", "die Stadt"],
    "hören|auf|Akkusativ": ["deinen Rat", "die Musik", "die Stimme", "den Lehrer", "die Warnung"],
    "hoffen|auf|Akkusativ": ["eine schnelle Antwort", "besseres Wetter", "Hilfe", "den Erfolg", "Glück"],
    "informieren|über|Akkusativ": ["die Öffnungszeiten", "den Preis", "das Programm", "die Regeln", "das Thema"],
    "sich informieren|über|Akkusativ": ["die Öffnungszeiten", "das Hotel", "den Kurs", "die Preise", "das Wetter"],
    "sich interessieren|für|Akkusativ": ["Sport", "Musik", "Sprachen", "Geschichte", "Politik"],
    "kämpfen|für|Akkusativ": ["den Frieden", "die Freiheit", "die Rechte", "die Umwelt", "den Sieg"],
    "kämpfen|gegen|Akkusativ": ["Ungerechtigkeit", "die Krankheit", "den Feind", "das Problem", "den Plan"],
    "kämpfen|um|Akkusativ": ["Hilfe", "einen Platz", "den Sieg", "die Stelle", "die Macht"],
    "klagen|über|Akkusativ": ["Kopfschmerzen", "die Hitze", "den Lärm", "die Kälte", "das Essen"],
    "kommen|auf|Akkusativ": ["eine gute Idee", "das Thema", "die Lösung", "den Namen", "das Ergebnis"],
    "sich konzentrieren|auf|Akkusativ": ["die Prüfung", "die Arbeit", "das Ziel", "das Gespräch", "den Text"],
    "sich kümmern|um|Akkusativ": ["die Kinder", "die Katze", "die Blumen", "das Problem", "die Gäste"],
    "lächeln|über|Akkusativ": ["das Missgeschick", "den Witz", "die Situation", "das Kind", "das Foto"],
    "lachen|über|Akkusativ": ["den Witz", "den Film", "die Geschichte", "das Missgeschick", "dich"],
    "nachdenken|über|Akkusativ": ["dein Angebot", "das Problem", "die Zukunft", "den Plan", "das Thema"],
    "protestieren|gegen|Akkusativ": ["den Plan", "die Reform", "die Preise", "das Gesetz", "den Krieg"],
    "sich rächen|für|Akkusativ": ["die Beleidigung", "den Verrat", "den Fehler", "die Niederlage", "das Unrecht"],
    "reagieren|auf|Akkusativ": ["die Nachricht", "die Frage", "den Reiz", "das Medikament", "die Kritik"],
    "rechnen|auf|Akkusativ": ["deine Hilfe", "den Erfolg", "einen Sieg", "Glück", "Unterstützung"],
    "reden|über|Akkusativ": ["unseren Urlaub", "das Wetter", "die Arbeit", "das Problem", "den Film"],
    "schimpfen|über|Akkusativ": ["das Wetter", "den Verkehr", "die Preise", "den Chef", "die Politik"],
    "schreiben|an|Akkusativ": ["meine Oma", "den Chef", "die Versicherung", "meine Freunde", "den Lehrer"],
    "schreiben|über|Akkusativ": ["meine Erfahrungen", "das Projekt", "die Reise", "das Buch", "das Thema"],
    "sein|für|Akkusativ": ["den Plan", "die Reform", "die Idee", "den Kandidaten", "das Projekt"],
    "sein|gegen|Akkusativ": ["den Plan", "die Preise", "das Gesetz", "den Krieg", "den Vorschlag"],
    "sorgen|für|Akkusativ": ["die Getränke", "das Essen", "die Musik", "Ordnung", "Sicherheit"],
    "sich sorgen|um|Akkusativ": ["die Zukunft", "die Kinder", "die Gesundheit", "das Geld", "den Job"],
    "sprechen|über|Akkusativ": ["das Gehalt", "den Urlaub", "das Wetter", "das Problem", "die Zukunft"],
    "staunen|über|Akkusativ": ["die schöne Aussicht", "den Preis", "den Erfolg", "die Technik", "das Wunder"],
    "stehen|auf|Akkusativ": ["Actionfilme", "Rockmusik", "Pizza", "den Sommer", "dich"],
    "sterben|für|Akkusativ": ["die Freiheit", "die Heimat", "eine Idee", "das Land", "die Liebe"],
    "stimmen|für|Akkusativ": ["den Kandidaten", "den Plan", "die Reform", "das Projekt", "den Vorschlag"],
    "stimmen|gegen|Akkusativ": ["den Kandidaten", "den Plan", "die Reform", "das Projekt", "den Vorschlag"],
    "streiten|über|Akkusativ": ["Kleinigkeiten", "das Geld", "die Politik", "die Arbeit", "das Wetter"],
    "sich streiten|um|Akkusativ": ["den letzten Keks", "das Erbe", "den Platz", "das Spielzeug", "die Fernbedienung"],
    "tun|für|Akkusativ": ["unsere Freunde", "die Umwelt", "die Gesundheit", "die Schule", "die Stadt"],
    "sich unterhalten|über|Akkusativ": ["das Wetter", "den Film", "die Arbeit", "das Hobby", "die Reise"],
    "unterrichten|über|Akkusativ": ["das Thema", "die Regeln", "das Projekt", "den Plan", "die Geschichte"],
    "sich verlassen|auf|Akkusativ": ["meinen besten Freund", "dich", "mein Team", "mein Glück", "das Auto"],
    "sich verlieben|in|Akkusativ": ["einen Kollegen", "die Stadt", "das Land", "das Leben", "dich"],
    "vermieten|an|Akkusativ": ["einen Studenten", "eine Familie", "Touristen", "den Nachbarn", "einen Freund"],
    "sich vertiefen|in|Akkusativ": ["ein spannendes Buch", "die Arbeit", "das Studium", "das Thema", "den Film"],
    "vertrauen|auf|Akkusativ": ["mein Bauchgefühl", "deine Hilfe", "den Erfolg", "das Glück", "die Zukunft"],
    "verzichten|auf|Akkusativ": ["den Nachtisch", "den Zucker", "das Auto", "den Urlaub", "den Wein"],
    "sich vorbereiten|auf|Akkusativ": ["die Prüfung", "das Interview", "die Reise", "das Meeting", "den Marathon"],
    "wählen|in|Akkusativ": ["den Vorstand", "den Rat", "das Parlament", "die Kommission", "das Team"],
    "warten|auf|Akkusativ": ["den Bus", "die Bahn", "den Brief", "die Antwort", "das Taxi"],
    "sich wenden|an|Akkusativ": ["den Lehrer", "die Polizei", "den Chef", "den Kundenservice", "die Information"],
    "sich wundern|über|Akkusativ": ["die hohen Preise", "das Wetter", "den Erfolg", "die Technik", "das Resultat"],
    "es handelt sich|um|Akkusativ": ["ein Missverständnis", "ein Problem", "einen Fehler", "ein Angebot", "eine Chance"],

    // Dativ
    "abhängen|von|Dativ": ["dem Wetter", "dem Preis", "deiner Entscheidung", "der Hilfe", "der Zeit"],
    "abheben|von|Dativ": ["dem Konto", "der Masse", "dem Rest", "dem Hintergrund", "dem Boden"],
    "ändern|an|Dativ": ["meiner Meinung", "dem Plan", "der Situation", "dem Projekt", "dem Auto"],
    "anfangen|mit|Dativ": ["der Arbeit", "dem Studium", "dem Kurs", "dem Spiel", "dem Essen"],
    "auffordern|zu|Dativ": ["mehr Bewegung", "einer Spende", "Hilfe", "Geduld", "der Arbeit"],
    "aufhören|mit|Dativ": ["dem Rauchen", "der Arbeit", "dem Sport", "dem Kurs", "dem Streit"],
    "sich auseinandersetzen|mit|Dativ": ["dem Thema", "dem Problem", "der Kritik", "der Situation", "der Frage"],
    "sich bedanken|bei|Dativ": ["dem Gastgeber", "dem Chef", "dem Lehrer", "der Kollegin", "den Eltern"],
    "sich befreien|von|Dativ": ["den Sorgen", "den Schulden", "der Last", "dem Stress", "den Problemen"],
    "sich befreien|aus|Dativ": ["einer schwierigen Situation", "der Gefahr", "dem Gefängnis", "dem Netz", "der Falle"],
    "beginnen|mit|Dativ": ["der Aufgabe", "dem Kurs", "dem Projekt", "der Arbeit", "dem Training"],
    "sich beklagen|bei|Dativ": ["der Hausverwaltung", "dem Chef", "dem Lehrer", "der Polizei", "dem Manager"],
    "berichten|von|Dativ": ["dem Erlebnis", "der Reise", "dem Unfall", "dem Treffen", "dem Erfolg"],
    "sich beschäftigen|mit|Dativ": ["den Hausaufgaben", "dem Thema", "dem Problem", "dem Hobby", "der Arbeit"],
    "bestehen|aus|Dativ": ["fünf Personen", "zwei Teilen", "vielen Fragen", "drei Modulen", "verschiedenen Materialien"],
    "sich beschweren|bei|Dativ": ["dem Manager", "dem Chef", "dem Kundenservice", "dem Kellner", "der Polizei"],
    "einladen|zu|Dativ": ["der Party", "dem Essen", "der Hochzeit", "dem Kaffee", "dem Meeting"],
    "sich entschließen|zu|Dativ": ["einem Studium", "einer Reise", "einem Kauf", "dem Job", "der Hochzeit"],
    "sich entschuldigen|bei|Dativ": ["dem Chef", "dem Lehrer", "dem Freund", "der Kollegin", "den Nachbarn"],
    "sich entwickeln|zu|Dativ": ["einem Experten", "einem Erfolg", "einem Problem", "einer Chance", "einem Star"],
    "sich erholen|von|Dativ": ["der Krankheit", "dem Stress", "der Arbeit", "der Reise", "dem Schock"],
    "erkennen|an|Dativ": ["der Stimme", "dem Gesicht", "der Farbe", "dem Geruch", "dem Namen"],
    "sich erkundigen|nach|Dativ": ["dem Preis", "dem Weg", "dem Wetter", "dem Befinden", "der Adresse"],
    "sich erkundigen|bei|Dativ": ["der Rezeption", "der Information", "dem Chef", "der Kollegin", "der Polizei"],
    "erzählen|von|Dativ": ["seiner Familie", "dem Urlaub", "der Arbeit", "der Kindheit", "dem Film"],
    "erziehen|zu|Dativ": ["einem ehrlichen Menschen", "einem Experten", "einem Musiker", "einem Sportler", "einem guten Bürger"],
    "fehlen|an|Dativ": ["Zeit", "Geld", "Erfahrung", "Ideen", "Motivation"],
    "folgen|aus|Dativ": ["der Analyse", "dem Bericht", "der Situation", "dem Problem", "dem Fehler"],
    "fragen|nach|Dativ": ["dem Weg", "dem Namen", "dem Preis", "der Uhrzeit", "der Adresse"],
    "führen|zu|Dativ": ["einem Missverständnis", "einem Erfolg", "einem Problem", "einer Katastrophe", "einer Lösung"],
    "sich fürchten|vor|Dativ": ["Hunden", "der Dunkelheit", "der Prüfung", "der Zukunft", "der Krankheit"],
    "gehören|zu|Dativ": ["mir", "dir", "dem Team", "der Familie", "der Gruppe"],
    "gratulieren|zu|Dativ": ["deinem Geburtstag", "dem Erfolg", "der Hochzeit", "dem Diplom", "dem Sieg"],
    "halten|von|Dativ": ["deinem Vorschlag", "der Idee", "dem Projekt", "dem Plan", "dem Film"],
    "handeln|mit|Dativ": ["Gebrauchtwagen", "Obst", "Gemüse", "Aktien", "Kleidung"],
    "handeln|von|Dativ": ["dem Urlaub", "der Liebe", "dem Krieg", "der Geschichte", "dem Problem"],
    "helfen|bei|Dativ": ["dem Umzug", "den Hausaufgaben", "der Arbeit", "dem Kochen", "der Reparatur"],
    "hindern|an|Dativ": ["der Arbeit", "dem Schlafen", "dem Gehen", "der Konzentration", "der Lösung"],
    "hören|von|Dativ": ["dem neuen Gesetz", "dem Unfall", "dem Projekt", "dem Erfolg", "dem Plan"],
    "sich hüten|vor|Dativ": ["Taschendieben", "Gefahren", "Fehlern", "der Sonne", "Hunden"],
    "sich irren|in|Dativ": ["der Hausnummer", "der Zeit", "dem Datum", "dem Namen", "der Person"],
    "kämpfen|mit|Dativ": ["den Tränen", "dem Problem", "der Krankheit", "den Schwierigkeiten", "der Hitze"],
    "kommen|zu|Dativ": ["dir", "uns", "dem Ergebnis", "der Party", "dem Treffen"],
    "leben|von|Dativ": ["dem Geld", "der Luft", "dem Obst", "der Liebe", "dem Erbe"],
    "leiden|an|Dativ": ["einer Allergie", "einer Krankheit", "Kopfschmerzen", "dem Fieber", "der Grippe"],
    "leiden|unter|Dativ": ["der Hitze", "dem Stress", "dem Lärm", "der Kälte", "der Situation"],
    "liegen|an|Dativ": ["einem Fehler im System", "dem Wetter", "dem Preis", "der Motivation", "dem Zufall"],
    "meinen|zu|Dativ": ["diesem Thema", "dem Plan", "der Idee", "dem Vorschlag", "dem Projekt"],
    "sich melden|bei|Dativ": ["der Polizei", "dem Chef", "der Information", "der Rezeption", "der Kollegin"],
    "passen|zu|Dativ": ["dir", "der Hose", "der Situation", "dem Plan", "dem Team"],
    "profitieren|von|Dativ": ["der Erfahrung", "dem Projekt", "der Reform", "dem Kurs", "der Hilfe"],
    "sich rächen|an|Dativ": ["dem Rivalen", "dem Feind", "dem Nachbarn", "dem Dieb", "der Person"],
    "raten|zu|Dativ": ["einer Versicherung", "einem Studium", "einer Reise", "einem Kauf", "der Diät"],
    "rechnen|mit|Dativ": ["Regen", "Schnee", "Hilfe", "dem Erfolg", "einer Antwort"],
    "reden|von|Dativ": ["früheren Zeiten", "dem Urlaub", "der Zukunft", "der Arbeit", "dem Problem"],
    "reden|mit|Dativ": ["dem Freund", "dem Lehrer", "dem Chef", "der Mutter", "den Nachbarn"],
    "sich richten|nach|Dativ": ["den Wünschen der Kunden", "dem Plan", "den Regeln", "dem Wetter", "der Situation"],
    "riechen|nach|Dativ": ["Kaffee", "Blumen", "Parfüm", "Essen", "Regen"],
    "rufen|nach|Dativ": ["der Kellnerin", "Hilfe", "dem Arzt", "der Polizei", "der Mutter"],
    "sich schützen|vor|Dativ": ["der Sonne", "der Kälte", "der Gefahr", "dem Regen", "dem Lärm"],
    "schimpfen|mit|Dativ": ["dem Kind", "dem Hund", "dem Mitarbeiter", "dem Freund", "den Schülern"],
    "schließen|aus|Dativ": ["den Informationen", "dem Bericht", "dem Verhalten", "dem Resultat", "der Situation"],
    "schmecken|nach|Dativ": ["Erdbeeren", "Schokolade", "Zitrone", "Salz", "Zucker"],
    "schreiben|an|Dativ": ["dem Buch", "dem Bericht", "dem Brief", "dem Projekt", "der Hausarbeit"],
    "sehen|nach|Dativ": ["dem Rechten", "dem Weg", "dem Preis", "der Uhrzeit", "der Adresse"],
    "sich sehnen|nach|Dativ": ["der Heimat", "der Ruhe", "dem Urlaub", "der Familie", "dir"],
    "sprechen|mit|Dativ": ["dem Lehrer", "dem Chef", "dem Freund", "der Mutter", "den Nachbarn"],
    "sprechen|von|Dativ": ["der Zukunft", "dem Urlaub", "der Arbeit", "dem Problem", "der Reise"],
    "sterben|an|Dativ": ["einer Krankheit", "dem Virus", "dem Fieber", "dem Alter", "einem Unfall"],
    "sich streiten|mit|Dativ": ["dem Nachbarn", "dem Chef", "dem Freund", "der Schwester", "dem Bruder"],
    "teilnehmen|an|Dativ": ["dem Kurs", "dem Projekt", "der Konferenz", "dem Wettbewerb", "dem Spiel"],
    "telefonieren|mit|Dativ": ["dem Freund", "dem Chef", "der Mutter", "dem Kunden", "der Bank"],
    "träumen|von|Dativ": ["dem Urlaub", "einem Haus", "dem Erfolg", "der Zukunft", "dir"],
    "sich treffen|mit|Dativ": ["dem Freund", "dem Chef", "der Kollegin", "den Nachbarn", "der Familie"],
    "sich trennen|von|Dativ": ["altem Spielzeug", "dem Partner", "der Arbeit", "der Wohnung", "dem Auto"],
    "überreden|zu|Dativ": ["einem Ausflug", "einem Kauf", "der Reise", "dem Projekt", "dem Essen"],
    "sich unterhalten|mit|Dativ": ["dem Freund", "dem Lehrer", "dem Chef", "der Kollegin", "den Nachbarn"],
    "sich unterscheiden|von|Dativ": ["seinem Bruder", "dem Original", "der Konkurrenz", "dem Standard", "der Masse"],
    "sich verabreden|mit|Dativ": ["einer Freundin", "dem Kollegen", "dem Chef", "dem Arzt", "den Eltern"],
    "verbinden|mit|Dativ": ["dem Internet", "dem Server", "dem WLAN", "dem Computer", "dem Handy"],
    "vergleichen|mit|Dativ": ["dem Original", "der Kopie", "dem Vorjahr", "der Konkurrenz", "dem Standard"],
    "sich verloben|mit|Dativ": ["ihm", "ihr", "meinem Freund", "meiner Freundin", "dem Partner"],
    "verstehen|von|Dativ": ["Musik", "Technik", "Politik", "Kunst", "Sport"],
    "sich verstehen|mit|Dativ": ["den Kollegen", "den Nachbarn", "der Familie", "dem Chef", "dem Team"],
    "verwechseln|mit|Dativ": ["jemand anderem", "seinem Bruder", "der Kopie", "dem Original", "einem anderen Modell"],
    "wählen|zu|Dativ": ["dem Klassensprecher", "dem Vorstand", "dem Sieger", "dem Kandidaten", "dem Experten"],
    "wählen|zwischen|Dativ": ["zwei Optionen", "drei Modellen", "vielen Angeboten", "zwei Wegen", "verschiedenen Farben"],
    "warnen|vor|Dativ": ["dem Hund", "der Gefahr", "dem Sturm", "dem Betrug", "der Kälte"],
    "werden|zu|Dativ": ["einem Lehrer", "einem Erfolg", "einem Problem", "einem Star", "einer Legende"],
    "wissen|von|Dativ": ["der geheimen Party", "dem Unfall", "dem Plan", "dem Termin", "der Nachricht"],
    "zweifeln|an|Dativ": ["der Wahrheit", "dem Erfolg", "deinen Fähigkeiten", "dem Plan", "der Aussage"],
    "zwingen|zu|Dativ": ["einer Entscheidung", "der Arbeit", "einer Pause", "Hilfe", "einer Antwort"],
    "zu tun haben|mit|Dativ": ["dem Thema", "dem Problem", "der Arbeit", "dem Chef", "der Polizei"]
  };

  const mapped = byKey[key];
  if (mapped) return mapped;

  // Generic fallbacks
  if (vCase === "Akkusativ") return ["das Thema", "das Problem", "den Plan", "das Projekt", "die Zukunft"];
  return ["dem Thema", "dem Problem", "dem Plan", "dem Projekt", "der Zukunft"];
}

function conjugate(infinitive, person, isModal = false) {
  if (isModal) {
    const modals = {
      "können": { "Ich": "kann", "Du": "kannst", "Er": "kann", "Wir": "können" },
      "müssen": { "Ich": "muss", "Du": "musst", "Er": "muss", "Wir": "müssen" },
      "dürfen": { "Ich": "darf", "Du": "darfst", "Er": "darf", "Wir": "dürfen" },
      "wollen": { "Ich": "will", "Du": "willst", "Er": "will", "Wir": "wollen" },
      "sollen": { "Ich": "soll", "Du": "sollst", "Er": "soll", "Wir": "sollen" }
    };
    return modals[infinitive] ? modals[infinitive][person] : infinitive;
  }

  if (infinitive === "sein") return { "Ich": "bin", "Du": "bist", "Er": "ist", "Wir": "sind" }[person];
  if (infinitive === "haben") return { "Ich": "habe", "Du": "hast", "Er": "hat", "Wir": "haben" }[person];
  if (infinitive === "werden") return { "Ich": "werde", "Du": "wirst", "Er": "wird", "Wir": "werden" }[person];
  if (infinitive === "wissen") return { "Ich": "weiß", "Du": "weißt", "Er": "weiß", "Wir": "wissen" }[person];
  if (infinitive === "tun") return { "Ich": "tue", "Du": "tust", "Er": "tut", "Wir": "tun" }[person];

  const root = infinitive.replace(/en$/, "").replace(/rn$/, "r").replace(/ln$/, "l");
  const endings = { "Ich": "e", "Du": "st", "Er": "t", "Wir": "en" };
  
  // Special case for -ern/-eln in "Wir"
  if (person === "Wir") {
    if (infinitive.endsWith("ern")) return infinitive;
    if (infinitive.endsWith("eln")) return infinitive;
  }

  let stem = root;
  let hasVowelChange = false;

  if ((person === "Du" || person === "Er")) {
    if (infinitive === "sprechen") { stem = "sprich"; hasVowelChange = true; }
    else if (infinitive === "sehen") { stem = "sieh"; hasVowelChange = true; }
    else if (infinitive === "helfen") { stem = "hilf"; hasVowelChange = true; }
    else if (infinitive === "laufen") { stem = "läuf"; hasVowelChange = true; }
    else if (infinitive === "fahren") { stem = "fähr"; hasVowelChange = true; }
    else if (infinitive === "halten") { stem = "hält"; hasVowelChange = true; }
    else if (infinitive === "raten") { stem = "rät"; hasVowelChange = true; }
    else if (infinitive === "verlassen") { stem = "verläss"; hasVowelChange = true; }
  }

  let ending = endings[person];

  // Rule: s, ss, ß, z, x endings in "Du" -> only "t"
  if (person === "Du" && (stem.endsWith("s") || stem.endsWith("ss") || stem.endsWith("ß") || stem.endsWith("z") || stem.endsWith("x"))) {
    ending = "t";
  }

  // Rule: stem ends in d or t (and NO vowel change happened) -> add "e" before st and t
  if (!hasVowelChange && (stem.endsWith("d") || stem.endsWith("t")) && (person === "Du" || person === "Er")) {
    return stem + "e" + ending;
  }

  // Special case for Er with stem ending in t and vowel change (e.g. er hält, er rät)
  if (hasVowelChange && stem.endsWith("t") && person === "Er") {
    return stem; // already has the t
  }

  return stem + ending;
}

function getPartizip(infinitive) {
  const irregulars = {
    "abstimmen": "abgestimmt", "achten": "geachtet", "ankommen": "angekommen", "antworten": "geantwortet",
    "anpassen": "angepasst", "ärgern": "geärgert", "aufpassen": "aufgepasst", "aufregen": "aufgeregt",
    "ausgeben": "ausgegeben", "bedanken": "bedankt", "beklagen": "beklagt", "bemühen": "bemüht",
    "beraten": "beraten", "berichten": "berichtet", "beschließen": "beschlossen", "beschweren": "beschwert",
    "bewerben": "beworben", "beziehen": "bezogen", "bitten": "gebeten", "bürgen": "gebürgt",
    "danken": "gedankt", "denken": "gedacht", "diskutieren": "diskutiert", "drehen": "gedreht",
    "eignen": "geeignet", "entscheiden": "entschieden", "entschuldigen": "entschuldigt", "erinnern": "erinnert",
    "ersetzen": "ersetzt", "folgen": "gefolgt", "freuen": "gefreut", "garantieren": "garantiert",
    "gehen": "gegangen", "geraten": "geraten", "gewöhnen": "gewöhnt", "glauben": "geglaubt",
    "halten": "gehalten", "herrschen": "geherrscht", "hören": "gehört", "hoffen": "gehofft",
    "informieren": "informiert", "interessieren": "interessiert", "kämpfen": "gekämpft", "klagen": "geklagt",
    "kommen": "gekommen", "konzentrieren": "konzentriert", "kümmern": "gekümmert", "lächeln": "gelächelt",
    "lachen": "gelacht", "nachdenken": "nachgedacht", "protestieren": "protestiert", "rächen": "gerächt",
    "reagieren": "reagiert", "rechnen": "gerechnet", "reden": "geredet", "schimpfen": "geschimpft",
    "schreiben": "geschrieben", "sorgen": "gesorgt", "sprechen": "gesprochen", "staunen": "gestaunt",
    "stehen": "gestanden", "sterben": "gestorben", "stimmen": "gestimmt", "streiten": "gestritten",
    "tun": "getan", "unterhalten": "unterhalten", "unterrichten": "unterrichtet", "verlassen": "verlassen",
    "verlieben": "verliebt", "vermieten": "vermietet", "vertiefen": "vertieft", "vertrauen": "vertraut",
    "verzichten": "verzichtet", "vorbereiten": "vorbereitet", "wählen": "gewählt", "warten": "gewartet",
    "wenden": "gewandt", "wundern": "gewundert", "handeln": "gehandelt",
    "abhängen": "abgehangen", "abheben": "abgehoben", "ändern": "geändert", "anfangen": "angefangen",
    "auffordern": "aufgefordert", "aufhören": "aufgehört", "auseinandersetzen": "auseinandergesetzt",
    "befreien": "befreit", "beginnen": "begonnen", "beschäftigen": "beschäftigt", "bestehen": "bestanden",
    "einladen": "eingeladen", "entschließen": "entschlossen", "entwickeln": "entwickelt", "erholen": "erholt",
    "erkennen": "erkannt", "erkundigen": "erkundigt", "erzählen": "erzählt", "erziehen": "erzogen",
    "fehlen": "gefehlt", "fragen": "gefragt", "führen": "geführt", "fürchten": "gefürchtet",
    "gehören": "gehört", "gratulieren": "gratuliert", "helfen": "geholfen", "hindern": "gehindert",
    "hüten": "gehütet", "irren": "geirrt", "leben": "gelebt", "leiden": "gelitten",
    "liegen": "gelegen", "meinen": "gemeint", "melden": "gemeldet", "passen": "gepasst",
    "profitieren": "profitiert", "raten": "geraten", "rechnen": "gerechnet", "richten": "gerichtet",
    "riechen": "gerochen", "rufen": "gerufen", "schützen": "geschützt", "schließen": "geschlossen",
    "schmecken": "geschmeckt", "sehen": "gesehen", "sehnen": "gesehnt", "teilnehmen": "teilgenommen",
    "telefonieren": "telefoniert", "träumen": "geträumt", "treffen": "getroffen", "trennen": "getrennt",
    "überreden": "überredet", "unterscheiden": "unterschieden", "verabreden": "verabredet", "verbinden": "verbunden",
    "vergleichen": "verglichen", "verloben": "verlobt", "verstehen": "verstanden", "verwechseln": "verwechselt",
    "warnen": "gewarnt", "werden": "geworden", "wissen": "gewusst", "zweifeln": "gezweifelt", "zwingen": "gezwungen"
  };

  const simple = infinitive.replace(/^sich /, "");
  return irregulars[simple] || `ge${simple.replace(/en$/, "t")}`;
}

const custom = {
  "abstimmen|über|Akkusativ": {
    subject: "Wir",
    verbAnswer: "stimmen",
    prepAnswer: "über",
    object: "den Vorschlag",
    particle: "ab"
  },
  "ankommen|auf|Akkusativ": {
    subject: "Es",
    verbAnswer: "kommt",
    prepAnswer: "auf",
    object: "das Wetter",
    particle: "an"
  },
  "abhängen|von|Dativ": {
    subject: "Es",
    verbAnswer: "hängt",
    prepAnswer: "von",
    object: "dem Wetter",
    particle: "ab"
  },
  "abheben|von|Dativ": {
    subject: "Wir",
    verbAnswer: "heben",
    prepAnswer: "von",
    objectBeforePrep: "Geld",
    objectAfterPrep: "dem Konto",
    particle: "ab"
  },
  "ausgeben|für|Akkusativ": {
    subject: "Wir",
    verbAnswer: "geben",
    prepAnswer: "für",
    objectBeforePrep: "viel Geld",
    objectAfterPrep: "Essen",
    particle: "aus"
  },
  "aufpassen|auf|Akkusativ": {
    subject: "Wir",
    verbAnswer: "passen",
    prepAnswer: "auf",
    object: "das Kind",
    particle: "auf"
  },
  "aufhören|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "hören",
    prepAnswer: "mit",
    object: "dem Rauchen",
    particle: "auf"
  },
  "anfangen|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "fangen",
    prepAnswer: "mit",
    object: "der Arbeit",
    particle: "an"
  },
  "einladen|zu|Dativ": {
    subject: "Wir",
    verbAnswer: "laden",
    prepAnswer: "zu",
    objectBeforePrep: "dich",
    objectAfterPrep: "der Party",
    particle: "ein"
  },
  "nachdenken|über|Akkusativ": {
    subject: "Wir",
    verbAnswer: "denken",
    prepAnswer: "über",
    object: "das Problem",
    particle: "nach"
  },
  "teilnehmen|an|Dativ": {
    subject: "Wir",
    verbAnswer: "nehmen",
    prepAnswer: "an",
    object: "dem Kurs",
    particle: "teil"
  },
  "sich vorbereiten|auf|Akkusativ": {
    subject: "Wir",
    verbAnswer: "bereiten",
    prepAnswer: "auf",
    object: "die Prüfung",
    particle: "vor",
    reflexive: "uns"
  },
  "sich auseinandersetzen|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "setzen",
    prepAnswer: "mit",
    object: "dem Thema",
    particle: "auseinander",
    reflexive: "uns"
  },
  "ersetzen|durch|Akkusativ": {
    subject: "Wir",
    verbAnswer: "ersetzen",
    prepAnswer: "durch",
    objectBeforePrep: "Zucker",
    objectAfterPrep: "Honig"
  },
  "halten|für|Akkusativ": {
    subject: "Wir",
    verbAnswer: "halten",
    prepAnswer: "für",
    objectBeforePrep: "das",
    objectAfterPrep: "eine gute Idee"
  },
  "gehen|um|Akkusativ": {
    subject: "Es",
    verbAnswer: "geht",
    prepAnswer: "um",
    object: "die Frage"
  },
  "liegen|an|Dativ": {
    subject: "Es",
    verbAnswer: "liegt",
    prepAnswer: "an",
    object: "dem Wetter"
  },
  "es handelt sich|um|Akkusativ": {
    subject: "Es",
    verbAnswer: "handelt",
    prepAnswer: "um",
    object: "ein Problem",
    reflexive: "sich"
  },
  "zu tun haben|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "haben",
    prepAnswer: "mit",
    object: "dem Thema",
    tail: "zu tun"
  },
  "sein|für|Akkusativ": {
    subject: "Wir",
    verbAnswer: "sind",
    prepAnswer: "für",
    object: "den Plan"
  },
  "sein|gegen|Akkusativ": {
    subject: "Wir",
    verbAnswer: "sind",
    prepAnswer: "gegen",
    object: "den Plan"
  },
  "vermieten|an|Akkusativ": {
    subject: "Wir",
    verbAnswer: "vermieten",
    prepAnswer: "an",
    objectBeforePrep: "die Wohnung",
    objectAfterPrep: "einen Studenten"
  },
  "wählen|in|Akkusativ": {
    subject: "Wir",
    verbAnswer: "wählen",
    prepAnswer: "in",
    objectBeforePrep: "ihn",
    objectAfterPrep: "den Vorstand"
  },
  "wählen|zu|Dativ": {
    subject: "Wir",
    verbAnswer: "wählen",
    prepAnswer: "zu",
    objectBeforePrep: "ihn",
    objectAfterPrep: "dem Klassensprecher"
  },
  "wählen|zwischen|Dativ": {
    subject: "Wir",
    verbAnswer: "wählen",
    prepAnswer: "zwischen",
    object: "zwei Optionen"
  },
  "herrschen|über|Akkusativ": {
    subject: "Der König",
    verbAnswer: "herrscht",
    prepAnswer: "über",
    object: "das Land"
  },
  "folgen|auf|Akkusativ": {
    subject: "Der Nachtisch",
    verbAnswer: "folgt",
    prepAnswer: "auf",
    object: "das Essen"
  },
  "bestehen|aus|Dativ": {
    subject: "Die Gruppe",
    verbAnswer: "besteht",
    prepAnswer: "aus",
    object: "fünf Personen"
  },
  "fehlen|an|Dativ": {
    subject: "Es",
    verbAnswer: "fehlt",
    prepAnswer: "an",
    object: "Zeit"
  },
  "passen|zu|Dativ": {
    subject: "Das",
    verbAnswer: "passt",
    prepAnswer: "zu",
    object: "dir"
  },
  "gehören|zu|Dativ": {
    subject: "Das",
    verbAnswer: "gehört",
    prepAnswer: "zu",
    object: "mir"
  },
  "führen|zu|Dativ": {
    subject: "Das",
    verbAnswer: "führt",
    prepAnswer: "zu",
    object: "Problemen"
  },
  "handeln|von|Dativ": {
    subject: "Der Film",
    verbAnswer: "handelt",
    prepAnswer: "von",
    object: "dem Urlaub"
  },
  "verstehen|von|Dativ": {
    subject: "Wir",
    verbAnswer: "verstehen",
    prepAnswer: "von",
    objectBeforePrep: "etwas",
    objectAfterPrep: "Musik"
  },
  "erziehen|zu|Dativ": {
    subject: "Wir",
    verbAnswer: "erziehen",
    prepAnswer: "zu",
    objectBeforePrep: "die Kinder",
    objectAfterPrep: "selbstständigen Menschen"
  },
  "auffordern|zu|Dativ": {
    subject: "Der Lehrer",
    verbAnswer: "fordert",
    prepAnswer: "zu",
    objectBeforePrep: "uns",
    objectAfterPrep: "mehr Bewegung",
    particle: "auf"
  },
  "sich bedanken|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "bedanken",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "dem Gastgeber"
  },
  "sich entschuldigen|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "entschuldigen",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "dem Chef"
  },
  "sich beklagen|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "beklagen",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "der Hausverwaltung"
  },
  "sich beschweren|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "beschweren",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "dem Manager"
  },
  "helfen|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "helfen",
    prepAnswer: "bei",
    objectBeforePrep: "dir",
    objectAfterPrep: "dem Umzug"
  },
  "sich erkundigen|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "erkundigen",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "der Rezeption"
  },
  "sich melden|bei|Dativ": {
    subject: "Wir",
    verbAnswer: "melden",
    prepAnswer: "bei",
    objectBeforePrep: "uns",
    objectAfterPrep: "der Polizei"
  },
  "vergleichen|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "vergleichen",
    prepAnswer: "mit",
    objectBeforePrep: "das Original",
    objectAfterPrep: "der Kopie"
  },
  "verwechseln|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "verwechseln",
    prepAnswer: "mit",
    objectBeforePrep: "dich",
    objectAfterPrep: "deinem Bruder"
  },
  "verbinden|mit|Dativ": {
    subject: "Wir",
    verbAnswer: "verbinden",
    prepAnswer: "mit",
    objectBeforePrep: "das Handy",
    objectAfterPrep: "dem WLAN"
  },
  "schimpfen|mit|Dativ": {
    subject: "Die Mutter",
    verbAnswer: "schimpft",
    prepAnswer: "mit",
    object: "dem Kind"
  },
  "sich trennen|von|Dativ": {
    subject: "Wir",
    verbAnswer: "trennen",
    prepAnswer: "von",
    objectBeforePrep: "uns",
    objectAfterPrep: "altem Spielzeug"
  },
  "überreden|zu|Dativ": {
    subject: "Wir",
    verbAnswer: "überreden",
    prepAnswer: "zu",
    objectBeforePrep: "dich",
    objectAfterPrep: "einem Ausflug"
  },
  "sich verlieben|in|Akkusativ": {
    subject: "Wir",
    verbAnswer: "verlieben",
    prepAnswer: "in",
    object: "einen Kollegen",
    reflexive: "uns"
  },
  "sich vertiefen|in|Akkusativ": {
    subject: "Wir",
    verbAnswer: "vertiefen",
    prepAnswer: "in",
    object: "ein spannendes Buch",
    reflexive: "uns"
  },
  "sich wenden|an|Akkusativ": {
    subject: "Wir",
    verbAnswer: "wenden",
    prepAnswer: "an",
    object: "den Lehrer",
    reflexive: "uns"
  },
  "sich eignen|für|Akkusativ": {
    subject: "Das Buch",
    verbAnswer: "eignet",
    prepAnswer: "für",
    object: "Anfänger",
    reflexive: "sich"
  },
  "sich gewöhnen|an|Akkusativ": {
    subject: "Wir",
    verbAnswer: "gewöhnen",
    prepAnswer: "an",
    object: "das neue Essen",
    reflexive: "uns"
  },
  "sich anpassen|an|Akkusativ": {
    subject: "Wir",
    verbAnswer: "passen",
    prepAnswer: "an",
    object: "das neue Klima",
    reflexive: "uns",
    particle: "an"
  },
  "sich konzentrieren|auf|Akkusativ": {
    subject: "Wir",
    verbAnswer: "konzentrieren",
    prepAnswer: "auf",
    object: "die Prüfung",
    reflexive: "uns"
  },
  "sich aufregen|über|Akkusativ": {
    subject: "Wir",
    verbAnswer: "regen",
    prepAnswer: "über",
    object: "den Lärm",
    reflexive: "uns",
    particle: "auf"
  },
  "sich ärgern|über|Akkusativ": {
    subject: "Wir",
    verbAnswer: "ärgern",
    prepAnswer: "über",
    object: "den Stau",
    reflexive: "uns"
  }
};

function buildSentence({ subject, verbAnswer, prepAnswer, object, reflexive, particle, objectBeforePrep, objectAfterPrep, tail }) {
  let text = "";
  if (objectBeforePrep && objectAfterPrep) {
    text = `${subject} ____ ${objectBeforePrep} ____ ${objectAfterPrep}`;
  } else if (reflexive) {
    text = `${subject} ____ ${reflexive} ____ ${object || ""}`.trim();
  } else {
    text = `${subject} ____ ____ ${object || ""}`.trim();
  }

  if (particle) text = `${text} ${particle}`.trim();
  if (tail) text = `${text} ${tail}`.trim();
  if (!/[.!?]$/.test(text)) text = `${text}.`;

  if (blanksCount(text) !== 2) {
    throw new Error(`Invalid blanks count (${blanksCount(text)}): ${text}`);
  }

  const fullSentence = fillSentence(text, verbAnswer, prepAnswer);

  return {
    text,
    verbAnswer,
    prepAnswer,
    translation: fullSentence
  };
}

const reflexiveMap = {
  "Ich": "mich", "Du": "dich", "Er": "sich", "Sie": "sich", "Es": "sich", "Wir": "uns", "Ihr": "euch", "Der König": "sich", "Die Mutter": "sich", "Das Buch": "sich"
};

function buildVerb(infinitive, preposition, vCase) {
  const key = `${infinitive}|${preposition}|${vCase}`;
  const objs = pickObjects(infinitive, preposition, vCase);
  const sentences = [];

  const pureVerb = infinitive.replace(/^sich /, "");
  const isReflexive = infinitive.startsWith("sich ");
  const baseCfg = custom[key] || {};
  const particle = baseCfg.particle;

  // 1: Präsens (Wir/Custom)
  const subj1 = baseCfg.subject || "Wir";
  const vAnswer1 = baseCfg.verbAnswer || conjugate(pureVerb, subj1);
  sentences.push(buildSentence({
    subject: subj1,
    verbAnswer: vAnswer1,
    prepAnswer: preposition,
    object: objs[0],
    reflexive: baseCfg.reflexive || (isReflexive ? reflexiveMap[subj1] : undefined),
    particle: particle,
    objectBeforePrep: baseCfg.objectBeforePrep,
    objectAfterPrep: objs[0] || baseCfg.objectAfterPrep,
    tail: baseCfg.tail
  }));

  // 2: Präsens (Ich)
  const coreVerb = baseCfg.verbAnswer || pureVerb;
  const vAnswer2 = conjugate(coreVerb, "Ich");
  sentences.push(buildSentence({
    subject: "Ich",
    verbAnswer: vAnswer2,
    prepAnswer: preposition,
    object: objs[1],
    reflexive: isReflexive ? "mich" : undefined,
    particle: particle,
    objectBeforePrep: baseCfg.objectBeforePrep === "dich" ? "dich" : baseCfg.objectBeforePrep,
    objectAfterPrep: objs[1] || baseCfg.objectAfterPrep
  }));

  // 3: Question (Du)
  const vAnswer3 = conjugate(coreVerb, "Du");
  const qObj = objs[2] || "das";
  const qText = `____ du ${isReflexive ? "dich" : ""} ____ ${qObj} ${particle || ""}?`.replace(/\s+/g, " ").trim();
  sentences.push({
    text: qText,
    verbAnswer: vAnswer3,
    prepAnswer: preposition,
    translation: fillSentence(qText, vAnswer3, preposition)
  });

  // 4: Modal Verb (müssen / Ich)
  const modalIch = conjugate("müssen", "Ich", true);
  const mObj = objs[3] || "das";
  const fullVerb = pureVerb; // Use pureVerb as it is already the full infinitive (e.g. "abstimmen")
  const mText = `Ich ${modalIch} ${isReflexive ? "mich" : ""} ____ ${mObj} ____.`.replace(/\s+/g, " ").trim();
  sentences.push({
    text: mText,
    verbAnswer: fullVerb,
    prepAnswer: preposition,
    translation: fillSentence(mText, preposition, fullVerb) // First blank is Prep, second is Verb
  });

  return {
    infinitive,
    preposition,
    case: vCase,
    translation: null,
    sentences
  };
}

async function main() {
  const resetUsers = process.argv.includes("--reset-users");

  console.log("Start seeding...");

  await prisma.userProgress.deleteMany();

  if (resetUsers) {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }

  await prisma.sentence.deleteMany();
  await prisma.verb.deleteMany();

  const verbs = [
    ...akkusativVerbs.map(([inf, prep]) => buildVerb(inf, prep, "Akkusativ")),
    ...dativVerbs.map(([inf, prep]) => buildVerb(inf, prep, "Dativ"))
  ];

  // Collect all sentences to generate distractors
  const allSentences = verbs.flatMap(v => v.sentences);

  for (const v of verbs) {
    const { sentences, ...verbData } = v;
    
    // Add distractors to each sentence
    const sentencesWithDistractors = sentences.map(s => {
      const distractors = getVerbDistractors(s.verbAnswer, allSentences, s.text);
      return {
        ...s,
        verbOptions: JSON.stringify(distractors)
      };
    });

    await prisma.verb.create({
      data: {
        ...verbData,
        sentences: { create: sentencesWithDistractors }
      }
    });
  }

  console.log(`Seeding finished. Verbs: ${verbs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
