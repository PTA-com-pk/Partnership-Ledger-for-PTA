# Google Sheets Integration Setup

This guide will help you set up Google Sheets integration for your partnership ledger.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Sheet that will store your partnership data

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and enable the API

## Step 3: Create Service Account Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `partnership-ledger-service`
   - Description: `Service account for partnership ledger Google Sheets integration`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 4: Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file (keep it secure!)

## Step 5: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "Partnership Ledger"
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
5. Set up the headers in row 1:
   - A1: ID
   - B1: Date
   - C1: Type
   - D1: Partner
   - E1: Description
   - F1: Amount
   - G1: Deleted
   - H1: Created At
   - I1: Updated At
   - J1: Created Timestamp
   - K1: Updated Timestamp

## Step 6: Share the Sheet with Service Account

1. In your Google Sheet, click "Share"
2. Add the service account email (from the JSON file) as an editor
3. Make sure to uncheck "Notify people" to avoid sending an email

## Step 7: Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_PROJECT_ID=your_project_id_here
GOOGLE_PRIVATE_KEY_ID=your_private_key_id_here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your_service_account_email@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id_here
```

Replace the values with the actual values from your downloaded JSON file.

## Step 8: Test the Integration

1. Start your development server: `npm run dev`
2. Try adding a transaction through your app
3. Check your Google Sheet to see if the data appears

## Troubleshooting

### Common Issues:

1. **"The caller does not have permission"**
   - Make sure you've shared the Google Sheet with the service account email
   - Verify the service account has editor permissions

2. **"Spreadsheet not found"**
   - Double-check your `GOOGLE_SHEET_ID` in the environment variables
   - Make sure the spreadsheet ID is correct (it's the long string in the URL)

3. **"Invalid credentials"**
   - Verify all environment variables are set correctly
   - Make sure the private key includes the full key with newlines

4. **"API not enabled"**
   - Go back to Google Cloud Console and make sure Google Sheets API is enabled

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your service account JSON file secure
- Consider using environment-specific service accounts for production

## Benefits of Google Sheets Integration

- **Real-time collaboration**: Multiple people can view/edit data
- **Automatic backups**: Google handles data persistence
- **Rich formatting**: Better data visualization
- **Version history**: Track all changes
- **Easy data export**: Download as Excel, CSV, etc.
- **Mobile access**: View/edit from anywhere

## Migration from JSON

Your existing JSON data will be automatically migrated when you first run the app with Google Sheets integration. The app will read from Google Sheets instead of the JSON file.

