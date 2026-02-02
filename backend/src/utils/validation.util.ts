// backend/src/utils/validation.util.ts
import { Types } from 'mongoose'

export class ValidationUtil {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id)
  }

  static validateObjectId(id: string, fieldName: string = 'ID'): void {
    if (!id) {
      throw new Error(`${fieldName} is required`)
    }
    
    if (!this.isValidObjectId(id)) {
      throw new Error(`Invalid ${fieldName} format`)
    }
  }

  static validatePagination(page?: string, limit?: string): { pageNum: number; limitNum: number } {
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 20

    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Page must be a positive integer')
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new Error('Limit must be between 1 and 100')
    }

    return { pageNum, limitNum }
  }
}