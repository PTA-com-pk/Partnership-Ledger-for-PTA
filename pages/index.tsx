import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../src/styles/Home.module.css';

interface Transaction {
  id: number;
  date: string;
  type: string;
  partner: string;
  description: string;
  amount: number;
  deleted: boolean;
  createdAt: string;
  updatedAt?: string;
  createdTimestamp: number;
  updatedTimestamp?: number;
  deletedAt?: string;
  deletedTimestamp?: number;
}

interface Summary {
  investments: number;
  expenses: number;
  profits: number;
  withdrawals: number;
  balance: number;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextId, setNextId] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    type: '',
    partner: '',
    description: '',
    amount: ''
  });
  const [filterType, setFilterType] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    setDefaultDate();
  }, []);

  const setDefaultDate = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setNextId(data.nextId || 1);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate amount
    const amount = Number(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const transactionData = {
        ...formData,
        amount: amount
      };
      
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        const result = await response.json();
        setTransactions(prev => [...prev, result.transaction]);
        setNextId(result.transaction.id + 1);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: '',
          partner: '',
          description: '',
          amount: ''
        });
        setDefaultDate();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to add transaction'}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        setIsDeleting(id);
        const response = await fetch(`/api/transaction/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const result = await response.json();
          setTransactions(prev => 
            prev.map(t => t.id === id ? { ...t, ...result.transaction } : t)
          );
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || 'Failed to delete transaction'}`);
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Network error. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      if (transaction.deleted) return false;
      const typeMatch = !filterType || transaction.type === filterType;
      const partnerMatch = !filterPartner || transaction.partner === filterPartner;
      return typeMatch && partnerMatch;
    });
  };

  const calculatePartnerSummary = (partner: string): Summary => {
    const partnerTransactions = transactions.filter(t => 
      (t.partner === partner || t.partner === 'Both') && !t.deleted
    );

    const summary = {
      investments: 0,
      expenses: 0,
      profits: 0,
      withdrawals: 0,
      balance: 0
    };

    partnerTransactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      const isBoth = transaction.partner === 'Both';
      const multiplier = isBoth ? 0.5 : 1;

      switch (transaction.type) {
        case 'Investment':
          summary.investments += amount * multiplier;
          break;
        case 'Expense':
          summary.expenses += amount * multiplier;
          break;
        case 'Profit':
          summary.profits += amount * multiplier;
          break;
        case 'Withdrawal':
          summary.withdrawals += amount * multiplier;
          break;
      }
    });

    summary.balance = (summary.investments + summary.profits) - (summary.expenses + summary.withdrawals);
    return summary;
  };

  const calculateCombinedSummary = (): Summary => {
    const summary = {
      investments: 0,
      expenses: 0,
      profits: 0,
      withdrawals: 0,
      balance: 0
    };

    transactions.filter(t => !t.deleted).forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      const isBoth = transaction.partner === 'Both';
      const multiplier = isBoth ? 1 : 1;

      switch (transaction.type) {
        case 'Investment':
          summary.investments += amount * multiplier;
          break;
        case 'Expense':
          summary.expenses += amount * multiplier;
          break;
        case 'Profit':
          summary.profits += amount * multiplier;
          break;
        case 'Withdrawal':
          summary.withdrawals += amount * multiplier;
          break;
      }
    });

    summary.balance = (summary.investments + summary.profits) - (summary.expenses + summary.withdrawals);
    return summary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const partnerASummary = calculatePartnerSummary('Nouman');
  const partnerBSummary = calculatePartnerSummary('Abdullah');
  const combinedSummary = calculateCombinedSummary();
  const filteredTransactions = getFilteredTransactions();

  return (
    <>
      <Head>
        <title>Digital Partnership Ledger</title>
        <meta name="description" content="Nouman and Abdullah's Partnership Ledger" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Nouman and Abdullah's Partnership Ledger</h1>
        </header>

        <div className={styles.mainContent}>
          {/* Add Transaction Form */}
          <section className={styles.addTransaction}>
            <h2>Add Transaction</h2>
            <form onSubmit={addTransaction}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Date:</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="type">Type:</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Investment">Investment</option>
                    <option value="Expense">Expense</option>
                    <option value="Profit">Profit</option>
                    <option value="Withdrawal">Withdrawal</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="partner">Partner:</label>
                  <select
                    id="partner"
                    value={formData.partner}
                    onChange={(e) => setFormData(prev => ({ ...prev, partner: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select Partner</option>
                    <option value="Nouman">Nouman</option>
                    <option value="Abdullah">Abdullah</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="amount">Amount:</label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description">Description:</label>
                <input
                  type="text"
                  id="description"
                  placeholder="Enter transaction description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.btnPrimary}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Transaction...' : 'Add Transaction'}
              </button>
            </form>
          </section>

          {/* Summary Section */}
          <section className={styles.summary}>
            <h2>Partnership Summary</h2>
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <h3>Nouman</h3>
                <div className={styles.summaryItem}>
                  <span>Investments:</span>
                  <span>${partnerASummary.investments.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Expenses:</span>
                  <span>${partnerASummary.expenses.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Profits:</span>
                  <span>${partnerASummary.profits.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Withdrawals:</span>
                  <span>${partnerASummary.withdrawals.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Net Balance:</span>
                  <span>${partnerASummary.balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <h3>Abdullah</h3>
                <div className={styles.summaryItem}>
                  <span>Investments:</span>
                  <span>${partnerBSummary.investments.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Expenses:</span>
                  <span>${partnerBSummary.expenses.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Profits:</span>
                  <span>${partnerBSummary.profits.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Withdrawals:</span>
                  <span>${partnerBSummary.withdrawals.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Net Balance:</span>
                  <span>${partnerBSummary.balance.toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <h3>Combined</h3>
                <div className={styles.summaryItem}>
                  <span>Total Investments:</span>
                  <span>${combinedSummary.investments.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Total Expenses:</span>
                  <span>${combinedSummary.expenses.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Total Profits:</span>
                  <span>${combinedSummary.profits.toFixed(2)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Total Withdrawals:</span>
                  <span>${combinedSummary.withdrawals.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Partnership Value:</span>
                  <span>${combinedSummary.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Transaction History */}
          <section className={styles.transactionHistory}>
            <div className={styles.sectionHeader}>
              <h2>Transaction History</h2>
            </div>
            
            <div className={styles.filters}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Investment">Investment</option>
                <option value="Expense">Expense</option>
                <option value="Profit">Profit</option>
                <option value="Withdrawal">Withdrawal</option>
              </select>
              <select
                value={filterPartner}
                onChange={(e) => setFilterPartner(e.target.value)}
              >
                <option value="">All Partners</option>
                <option value="Nouman">Nouman</option>
                <option value="Abdullah">Abdullah</option>
                <option value="Both">Both</option>
              </select>
            </div>
            
            <div className={styles.transactionsList}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading transactions from Google Sheets...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No transactions found</h3>
                  <p>Add your first transaction using the form above</p>
                </div>
              ) : (
                filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(transaction => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionDate}>
                        {formatDate(transaction.date)}
                      </div>
                      <div className={`${styles.transactionType} ${styles[transaction.type.toLowerCase()]}`}>
                        {transaction.type}
                      </div>
                      <div className={styles.transactionPartner}>
                        {transaction.partner}
                      </div>
                      <div className={styles.transactionDescription}>
                        {transaction.description}
                      </div>
                      <div className={styles.transactionAmount}>
                        ${(Number(transaction.amount) || 0).toFixed(2)}
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteTransaction(transaction.id)}
                        disabled={isDeleting === transaction.id}
                        style={{ display: 'none' }}
                      >
                        {isDeleting === transaction.id ? 'Deleting...' : '×'}
                      </button>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
