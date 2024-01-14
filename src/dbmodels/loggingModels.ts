import mongoose from 'mongoose'

const mixedType = mongoose.Schema.Types.Mixed
const transactionSchema = new mongoose.Schema( //Main schema for logging main request/response
  {
    request: {
      url: String,
      method: String,
      body: mixedType,
      headers: {
        type: Map,
        of: String,
      },
    },
    response: {
      status: Number,
      headers: mixedType,
      body: mixedType,
    },
  },
  {
    timestamps: true,
  }
)

export const TransactionSchema = mongoose.model(
  'TransactionsLog',
  transactionSchema
)
