// WebAuthn Biometric & Hardware Security Key Types

export type BiometricDeviceType = 'fingerprint' | 'faceid' | 'hardware_key';
export type AuthenticatorAttachmentType = 'platform' | 'cross-platform';

export interface WebAuthnPasskey {
  id: string;
  userEmail: string;
  officerName: string;
  clientEntity: string;
  nickname: string;
  deviceType: BiometricDeviceType;
  authenticatorAttachment: AuthenticatorAttachmentType;
  algorithm: string;
  aaguid: string;
  publicKeyHex: string;
  createdAt: string;
  lastUsedAt?: string;
  transports: string[];
  rpId: string;
  isDefault?: boolean;
}

export const SEEDED_PASSKEYS: WebAuthnPasskey[] = [
  {
    id: 'cred_angela_touchid_2026',
    userEmail: 'legal@energyholdings.co.ke',
    officerName: 'Dr. Angela Kibera',
    clientEntity: 'Consolidated Energy Holdings Ltd',
    nickname: "Angela's MacBook Pro (Touch ID Secure Enclave)",
    deviceType: 'fingerprint',
    authenticatorAttachment: 'platform',
    algorithm: 'ES256 (NIST P-256 / SHA-256)',
    aaguid: 'adce0002-35bc-c60a-648b-0b25f1f05503',
    publicKeyHex: '3059301306072a8648ce3d020106082a8648ce3d03010703420004c5a880...',
    createdAt: '2026-11-01 10:14 EAT',
    lastUsedAt: '2026-11-10 16:32 EAT',
    transports: ['internal'],
    rpId: 'petersonsadvocates.co.ke',
    isDefault: true
  },
  {
    id: 'cred_brian_winhello_2026',
    userEmail: 'legal@apexrealestate.co.ke',
    officerName: "Brian Ndung'u",
    clientEntity: 'Apex Real Estate PLC',
    nickname: "Brian's ThinkPad X1 (Windows Hello Facial)",
    deviceType: 'faceid',
    authenticatorAttachment: 'platform',
    algorithm: 'RS256 (RSA 2048 / SHA-256)',
    aaguid: '6028b012-b0b0-4240-9a37-a6c570c40a7c',
    publicKeyHex: '30820122300d06092a864886f70d01010105000382010f003082010a0282...',
    createdAt: '2026-10-28 14:05 EAT',
    lastUsedAt: '2026-11-08 09:20 EAT',
    transports: ['internal'],
    rpId: 'petersonsadvocates.co.ke',
    isDefault: true
  },
  {
    id: 'cred_grace_yubikey_2026',
    userEmail: 'compliance@equatorialbank.co.ke',
    officerName: 'Grace W. Muthoni',
    clientEntity: 'Equatorial Commercial Bank Group',
    nickname: 'Equatorial Bank YubiKey 5C NFC Token',
    deviceType: 'hardware_key',
    authenticatorAttachment: 'cross-platform',
    algorithm: 'ES256 (NIST P-256)',
    aaguid: 'cb69481e-8ff7-4039-93ec-0a2729a100a8',
    publicKeyHex: '3059301306072a8648ce3d020106082a8648ce3d03010703420004f21a44...',
    createdAt: '2026-10-15 11:45 EAT',
    lastUsedAt: '2026-11-09 11:15 EAT',
    transports: ['usb', 'nfc'],
    rpId: 'petersonsadvocates.co.ke',
    isDefault: true
  }
];

// Helper to get passkeys for a given user email
export function getRegisteredPasskeys(userEmail?: string): WebAuthnPasskey[] {
  try {
    const stored = localStorage.getItem('paa_webauthn_passkeys');
    let allKeys: WebAuthnPasskey[] = stored ? JSON.parse(stored) : [];
    
    // If not stored yet, initialize with seeded
    if (!stored || allKeys.length === 0) {
      allKeys = SEEDED_PASSKEYS;
      localStorage.setItem('paa_webauthn_passkeys', JSON.stringify(allKeys));
    }

    if (!userEmail) return allKeys;
    return allKeys.filter(k => k.userEmail.toLowerCase() === userEmail.toLowerCase());
  } catch {
    return SEEDED_PASSKEYS;
  }
}

// Helper to save a new passkey
export function saveRegisteredPasskey(passkey: WebAuthnPasskey): void {
  try {
    const existing = getRegisteredPasskeys();
    const updated = [passkey, ...existing.filter(k => k.id !== passkey.id)];
    localStorage.setItem('paa_webauthn_passkeys', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save passkey:', err);
  }
}

// Helper to delete/revoke a passkey
export function deleteRegisteredPasskey(id: string): void {
  try {
    const existing = getRegisteredPasskeys();
    const updated = existing.filter(k => k.id !== id);
    localStorage.setItem('paa_webauthn_passkeys', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete passkey:', err);
  }
}
