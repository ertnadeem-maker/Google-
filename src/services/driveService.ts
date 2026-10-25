import { LedgerBackupData, Party, Transaction } from '../types';
import { getAccessToken } from './auth';

const FILE_NAME = 'hisabkitab_vyapar_data.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime?: string;
}

/**
 * Searches for the app's backup JSON file on Google Drive
 */
export async function findDriveFile(): Promise<DriveFileInfo | null> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const query = encodeURIComponent(`name = '${FILE_NAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('AUTH_EXPIRED');
    }
    const errText = await response.text();
    throw new Error(`Failed to search Google Drive: ${errText}`);
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0];
  }
  return null;
}

/**
 * Downloads the current backup data from Google Drive
 */
export async function downloadFromDrive(fileId: string): Promise<LedgerBackupData> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) throw new Error('AUTH_EXPIRED');
    throw new Error(`Failed to download data from Google Drive: ${response.statusText}`);
  }

  const data = (await response.json()) as LedgerBackupData;
  return data;
}

/**
 * Saves or updates the ledger backup file in Google Drive
 */
export async function saveToDrive(data: LedgerBackupData): Promise<{ fileId: string; modifiedTime: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  // Check if file already exists
  const existingFile = await findDriveFile();
  const fileContent = JSON.stringify(data, null, 2);

  if (existingFile) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      }
    );

    if (!updateRes.ok) {
      if (updateRes.status === 401) throw new Error('AUTH_EXPIRED');
      const err = await updateRes.text();
      throw new Error(`Failed to update file in Google Drive: ${err}`);
    }

    const updated = await updateRes.json();
    return {
      fileId: existingFile.id,
      modifiedTime: updated.modifiedTime || new Date().toISOString(),
    };
  } else {
    // Create new file with multipart upload
    const metadata = {
      name: FILE_NAME,
      mimeType: 'application/json',
      description: 'Vyapar Khata - Small Business Hisab Kitab Ledger Data',
    };

    const boundary = '-------VyaparKhataBoundary' + Math.random().toString(36).substring(2);
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!createRes.ok) {
      if (createRes.status === 401) throw new Error('AUTH_EXPIRED');
      const err = await createRes.text();
      throw new Error(`Failed to create file in Google Drive: ${err}`);
    }

    const created = await createRes.json();
    return {
      fileId: created.id,
      modifiedTime: created.modifiedTime || new Date().toISOString(),
    };
  }
}

/**
 * Merges local and remote ledger data intelligently without losing any records
 */
export function mergeLedgerData(
  localData: LedgerBackupData,
  remoteData: LedgerBackupData
): LedgerBackupData {
  // Merge Parties by ID
  const partyMap = new Map<string, Party>();
  for (const party of remoteData.parties || []) {
    partyMap.set(party.id, party);
  }
  for (const party of localData.parties || []) {
    const remoteParty = partyMap.get(party.id);
    if (!remoteParty || new Date(party.updatedAt) >= new Date(remoteParty.updatedAt)) {
      partyMap.set(party.id, party);
    }
  }

  // Merge Transactions by ID
  const txMap = new Map<string, Transaction>();
  for (const tx of remoteData.transactions || []) {
    txMap.set(tx.id, tx);
  }
  for (const tx of localData.transactions || []) {
    const remoteTx = txMap.get(tx.id);
    if (!remoteTx || new Date(tx.updatedAt) >= new Date(remoteTx.updatedAt)) {
      txMap.set(tx.id, tx);
    }
  }

  return {
    version: 1,
    businessProfile: {
      ...remoteData.businessProfile,
      ...localData.businessProfile,
      businessName: localData.businessProfile.businessName || remoteData.businessProfile.businessName,
    },
    parties: Array.from(partyMap.values()),
    transactions: Array.from(txMap.values()),
    lastSyncedAt: new Date().toISOString(),
    exportedAt: new Date().toISOString(),
  };
}
