//javascirpt

// Constants
const SYSTEM_CONFIG = {
  INITIAL_STUDENT_CREDITS: 5000,
  MIN_TRANSACTION_AMOUNT: 1,
  VALID_IDS: {
    student: '1MS24IS053-T',
    vendors: ['1MS24IS006-T', '1MS24IS007-T', '1MS24IS008-T', '1MS24IS009-T']
  }
};

// User authentication and validation
class UserService {
  static validateUserId(userId, userType) {
    if (!userId) {
      return {
        isValid: false,
        error: 'Please enter an ID'
      };
    }

    if (userType === 'student') {
      if (userId !== SYSTEM_CONFIG.VALID_IDS.student) {
        return {
          isValid: false,
          error: `Invalid Student ID. Please use: ${SYSTEM_CONFIG.VALID_IDS.student}`
        };
      }
    } else if (userType === 'vendor') {
      if (!SYSTEM_CONFIG.VALID_IDS.vendors.includes(userId)) {
        return {
          isValid: false,
          error: `Invalid Vendor ID. Please use one of: ${SYSTEM_CONFIG.VALID_IDS.vendors.join(', ')}`
        };
      }
    }

    return {
      isValid: true,
      error: null
    };
  }
}

// Transaction management
class TransactionService {
  static validateTransaction(amount, studentCredits, selectedVendor) {
    if (!amount || amount <= SYSTEM_CONFIG.MIN_TRANSACTION_AMOUNT) {
      return {
        isValid: false,
        error: 'Please enter a valid amount'
      };
    }

    if (!selectedVendor) {
      return {
        isValid: false,
        error: 'Please select a vendor'
      };
    }

    if (amount > studentCredits) {
      return {
        isValid: false,
        error: 'Insufficient credits'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  static createTransaction(amount, fromId, toId) {
    return {
      type: 'payment',
      amount: Number(amount),
      date: new Date().toLocaleDateString(),
      from: fromId,
      to: toId,
      timestamp: Date.now(),
      id: this.generateTransactionId()
    };
  }

  static generateTransactionId() {
    return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Credit management
class CreditService {
  static updateCredits(currentCredits, transactionAmount) {
    return Math.max(0, currentCredits - transactionAmount);
  }

  static formatCredits(amount) {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(amount);
  }
}

// Data persistence service (localStorage)
class StorageService {
  static saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  static getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static clearLocalStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

// Custom hooks for React components
const useTransactionHistory = (userType, userId, vendorData, studentTransactions) => {
  const getCurrentTransactions = () => {
    if (userType === 'student') {
      return studentTransactions;
    }
    return vendorData[userId]?.transactions || [];
  };

  const sortTransactions = (transactions) => {
    return [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  };

  return {
    transactions: sortTransactions(getCurrentTransactions()),
    hasTransactions: getCurrentTransactions().length > 0
  };
};

// Error handling
class ErrorHandler {
  static handleError(error) {
    console.error('System Error:', error);
    return {
      message: 'An error occurred. Please try again.',
      code: error.code || 'UNKNOWN_ERROR'
    };
  }

  static getErrorMessage(code) {
    const errorMessages = {
      INVALID_AMOUNT: 'Please enter a valid amount',
      INSUFFICIENT_CREDITS: 'Insufficient credits available',
      INVALID_VENDOR: 'Please select a valid vendor',
      INVALID_USER: 'Invalid user credentials',
      TRANSACTION_FAILED: 'Transaction failed. Please try again.',
      UNKNOWN_ERROR: 'An unexpected error occurred'
    };

    return errorMessages[code] || errorMessages.UNKNOWN_ERROR;
  }
}

// Analytics service
class AnalyticsService {
  static trackTransaction(transaction) {
    // Implementation for tracking transactions
    console.log('Transaction tracked:', transaction);
  }

  static generateTransactionReport(transactions) {
    const report = {
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      count: transactions.length,
      averageAmount: 0,
      dateRange: {
        start: null,
        end: null
      }
    };

    if (transactions.length > 0) {
      report.averageAmount = report.totalAmount / report.count;
      const dates = transactions.map(t => new Date(t.timestamp));
      report.dateRange.start = new Date(Math.min(...dates));
      report.dateRange.end = new Date(Math.max(...dates));
    }

    return report;
  }
}

// Export all services and utilities
export {
  SYSTEM_CONFIG,
  UserService,
  TransactionService,
  CreditService,
  StorageService,
  useTransactionHistory,
  ErrorHandler,
  AnalyticsService
};
