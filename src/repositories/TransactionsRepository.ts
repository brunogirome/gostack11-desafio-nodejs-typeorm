import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((totalIncome, transaction) => {
      return transaction.type === 'income'
        ? totalIncome + transaction.value
        : totalIncome;
    }, 0);

    const outcome = transactions.reduce((totalOutcome, transaction) => {
      return transaction.type === 'outcome'
        ? totalOutcome + transaction.value
        : totalOutcome;
    }, 0);

    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
