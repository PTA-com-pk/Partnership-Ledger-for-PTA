import { NextApiRequest, NextApiResponse } from 'next';
import { loadDataFromSheets, saveDataToSheets, addTransactionToSheets } from '../../lib/googleSheets';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'partnership-ledger-data.json');

// Load data from Google Sheets or fallback to JSON
async function loadData() {
    try {
        // Try Google Sheets first
        const sheetsData = await loadDataFromSheets();
        if (sheetsData.transactions.length > 0 || process.env.GOOGLE_SHEET_ID) {
            return sheetsData;
        }
        
        // Fallback to JSON file
        console.log('Falling back to JSON file');
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading data:', error);
        return {
            transactions: [],
            nextId: 1,
            lastUpdated: new Date().toISOString(),
            version: "1.0"
        };
    }
}

// Save data to Google Sheets or fallback to JSON
async function saveData(data: any) {
    try {
        data.lastUpdated = new Date().toISOString();
        
        // Try Google Sheets first
        const sheetsSuccess = await saveDataToSheets(data);
        if (sheetsSuccess) {
            return true;
        }
        
        // Fallback to JSON file
        console.log('Falling back to JSON file for save');
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

    if (req.method === 'POST') {
        try {
            const data = await loadData();
            const now = new Date();
            const transaction = {
                ...req.body,
                id: data.nextId++,
                deleted: false,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                createdTimestamp: now.getTime(),
                updatedTimestamp: now.getTime()
            };
            
            data.transactions.push(transaction);
            const success = await saveData(data);
            
            if (success) {
                res.status(200).json({ message: 'Transaction added successfully', transaction });
            } else {
                res.status(500).json({ error: 'Failed to save transaction' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to add transaction' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
