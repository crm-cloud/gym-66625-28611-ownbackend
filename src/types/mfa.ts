export interface MFASetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes?: string[];
}

export interface MFAStatus {
  enabled: boolean;
  method?: 'totp' | 'sms';
  backupCodesRemaining?: number;
}

export interface MFAVerifyInput {
  token: string;
  backupCode?: boolean;
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: string;
}

export interface MFAEnableInput {
  secret: string;
  token: string;
}
