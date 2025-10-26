import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'partnership-ledger-data.json');

// Load data from JSON file
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            transactions: [],
            nextId: 1,
            lastUpdated: new Date().toISOString(),
            version: "1.0"
        };
    }
}

// Save data to JSON file
async function saveData(data: any) {
    try {
        data.lastUpdated = new Date().toISOString();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const data = await loadData();
            const transaction = data.transactions.find((t: any) => t.id === parseInt(id as string));
            
            if (transaction) {
                const now = new Date();
                Object.assign(transaction, req.body);
                transaction.updatedAt = now.toISOString();
                transaction.updatedTimestamp = now.getTime();
                
                const success = await saveData(data);
                
                if (success) {
                    res.status(200).json({ message: 'Transaction updated successfully', transaction });
                } else {
                    res.status(500).json({ error: 'Failed to save changes' });
                }
            } else {
                res.status(404).json({ error: 'Transaction not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const data = await loadData();
            const transaction = data.transactions.find((t: any) => t.id === parseInt(id as string));
            
            if (transaction) {
                const now = new Date();
                transaction.deleted = true;
                transaction.deletedAt = now.toISOString();
                transaction.updatedAt = now.toISOString();
                transaction.updatedTimestamp = now.getTime();
                transaction.deletedTimestamp = now.getTime();
                
                const success = await saveData(data);
                
                if (success) {
                    res.status(200).json({ message: 'Transaction marked as deleted', transaction });
                } else {
                    res.status(500).json({ error: 'Failed to save changes' });
                }
            } else {
                res.status(404).json({ error: 'Transaction not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
