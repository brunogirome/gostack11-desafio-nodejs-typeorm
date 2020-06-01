import csvParse from 'csv-parse';
import fs from 'fs';

interface TransactionLine {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: 'string';
}

export default async function loadCsvFile(
  filePath: string,
): Promise<TransactionLine[]> {
  const readCSVStream = fs.createReadStream(filePath);

  await fs.promises.unlink(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const returnLines: TransactionLine[] | PromiseLike<TransactionLine[]> = [];

  parseCSV.on('data', line => {
    const [title, type, value, categoryTitle] = line;

    if (!title || !type || !value || !categoryTitle) {
      return;
    }

    returnLines.push({ title, type, value, categoryTitle });
  });

  await new Promise(resolve => parseCSV.on('end', resolve));

  return returnLines;
}
