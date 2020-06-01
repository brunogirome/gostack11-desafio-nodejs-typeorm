import path from 'path';
import { getRepository, In } from 'typeorm';

import uploadConfig from '../config/upload';
import loadCsvFile from '../util/loadCsvFile';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

class ImportTransactionsService {
  async execute(transactionsFilename: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(
      uploadConfig.directory,
      transactionsFilename,
    );

    const fileTransactions = await loadCsvFile(csvFilePath);

    const fileCategories = fileTransactions.map(
      transaction => transaction.categoryTitle,
    );

    const categoryRepository = getRepository(Category);

    const existedCategories = await categoryRepository.find({
      where: { title: In(fileCategories) },
    });

    const existedCategoriesTitles = existedCategories.map(
      category => category.title,
    );

    const filteredCategories = fileCategories
      .filter(catergory => !existedCategoriesTitles.includes(catergory))
      .filter((value, index, self) => self.indexOf(value) === index);

    const categoriesTitles = filteredCategories.map(categoryTitle => {
      return { title: categoryTitle };
    });

    const createdCategories = categoryRepository.create(categoriesTitles);

    await categoryRepository.save(createdCategories);

    const categories = [...existedCategories, ...createdCategories];

    const importedTransacations = fileTransactions.map(
      ({ title, type, value, categoryTitle }) => {
        const transactionCategory = categories.find(
          category => categoryTitle === category.title,
        );

        return { title, type, value, category: transactionCategory };
      },
    );

    const transactionRepository = getRepository(Transaction);

    const createdTransactions = transactionRepository.create(
      importedTransacations,
    );

    const transactions = await transactionRepository.save(createdTransactions);

    return transactions;
  }
}

export default ImportTransactionsService;
