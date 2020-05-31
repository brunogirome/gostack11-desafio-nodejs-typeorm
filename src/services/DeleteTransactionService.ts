import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(transaction_id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.findOne(transaction_id);

    if (!transaction) {
      throw new AppError('Transaction does not exists.', 404);
    }

    await transactionsRepository.delete(transaction_id);
  }
}

export default DeleteTransactionService;
