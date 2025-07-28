const fs = require('fs');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const Lemmer = require('lemmer');
const v8 = require('v8');  // Для heap snapshots

let iconv;
try {
  iconv = require('iconv-lite');
} catch (e) {
  console.warn('iconv-lite not installed. Assuming UTF-8 encoding.');
}

// Функция лемматизации (для workers)
const lemmatize = (word) => {
  word = word.toLowerCase().replace('ё', 'е');
  try {
    const lemmas = Lemmer.lemmatize('russian', word);
    if (lemmas && lemmas.length > 0) return lemmas[0];
  } catch (e) {
    console.error(`Error lemmatizing "${word}": ${e.message}`);
  }
  return word;
};

// Worker code (обработка батча)
if (!isMainThread) {
  const { batch, skipLengthCheck } = workerData;
  let skippedLength = 0, skippedRegex = 0;
  const batchLemmas = new Set();

  batch.forEach(word => {
    const lemma = lemmatize(word);

    if (!/^[а-яё]+$/.test(lemma)) {
      skippedRegex++;
      return;
    }

    if (!skipLengthCheck && (lemma.length < 3 || lemma.length > 12)) {
      skippedLength++;
      return;
    }

    batchLemmas.add(lemma);
  });

  parentPort.postMessage({
    lemmas: Array.from(batchLemmas),
    skippedLength,
    skippedRegex,
    processed: batch.length
  });
  process.exit(0);  // Завершить worker
}

// Основная функция (main thread)
async function cleanDictionary(inputFile, outputFile, encoding = 'utf-8', skipLengthCheck = false, batchSize = 50000, enableHeapSnapshots = false) {
  if (enableHeapSnapshots) v8.writeHeapSnapshot(`heap-start.heapsnapshot`);

  let text;
  const buffer = fs.readFileSync(inputFile);
  try {
    text = buffer.toString('utf-8');
    if (text.includes('')) throw new Error('Garbled UTF-8');
  } catch (e) {
    if (iconv) {
      text = iconv.decode(buffer, 'win1251');
      console.log('Switched to win1251.');
    } else {
      text = buffer.toString('utf-8');
      console.warn('Encoding issue? Install iconv-lite.');
    }
  }

  const words = text.split(/\r?\n/).map(w => w.trim()).filter(w => w);
  console.log(`Loaded ${words.length} words. Processing in batches of ${batchSize} with workers...`);

  const finalLemmas = new Set();
  let totalSkippedLength = 0, totalSkippedRegex = 0, totalProcessed = 0;
  const numBatches = Math.ceil(words.length / batchSize);

  // Отладка: первые 10 слов (в main thread)
  words.slice(0, 10).forEach((word, i) => {
    const lemma = lemmatize(word);
    console.log(`Debug [${i}]: Original: "${word}" → Lemma: "${lemma}"`);
  });

  // Запуск workers асинхронно (по одному, чтобы не overload)
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize);

    const worker = new Worker(__filename, { workerData: { batch, skipLengthCheck } });

    const result = await new Promise((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => { if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`)); });
    });

    result.lemmas.forEach(lemma => finalLemmas.add(lemma));
    totalSkippedLength += result.skippedLength;
    totalSkippedRegex += result.skippedRegex;
    totalProcessed += result.processed;

    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${numBatches} (${((i + batchSize) / words.length * 100).toFixed(2)}%)`);

    if (enableHeapSnapshots) v8.writeHeapSnapshot(`heap-batch-${i}.heapsnapshot`);
  }

  const filteredWords = Array.from(finalLemmas).sort();
  fs.writeFileSync(outputFile, `export default ${JSON.stringify(filteredWords)};`, 'utf-8');

  console.log(`Filtered and lemmatized to ${filteredWords.length} words! Saved to ${outputFile}`);
  console.log(`Stats: Processed ${totalProcessed}, Skipped by length: ${totalSkippedLength}, Skipped by regex: ${totalSkippedRegex}`);

  if (enableHeapSnapshots) v8.writeHeapSnapshot(`heap-end.heapsnapshot`);
}

// Запуск в main thread
if (isMainThread) {
  cleanDictionary('russian_dictionary.txt', 'filtered_words.js', 'utf-8', false, 50000, false);  // enableHeapSnapshots=true для отладки
}