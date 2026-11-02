/**
 * §4 — Stockage fichiers compatible S3 via une interface (`lib/storage`) :
 * "OVH Object Storage ou Scaleway (hébergement en France, argument RGPD pour la cible),
 * facturés à l'usage. Chaque service externe est encapsulé derrière une interface
 * dans `lib/`, afin de pouvoir être remplacé."
 */

export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
}

export interface StorageProvider {
  putObject(input: PutObjectInput): Promise<{ key: string; url: string }>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export class S3CompatibleStorageProvider implements StorageProvider {
  private readonly endpoint: string;
  private readonly bucket: string;

  constructor(
    endpoint = process.env.S3_ENDPOINT || 'https://s3.gra.io.cloud.ovh.net',
    bucket = process.env.S3_BUCKET || 'assoexpert-storage'
  ) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.bucket = bucket;
  }

  async putObject(input: PutObjectInput): Promise<{ key: string; url: string }> {
    const cleanKey = input.key.replace(/^\/+/, '');
    return {
      key: cleanKey,
      url: `${this.endpoint}/${this.bucket}/${cleanKey}`
    };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const cleanKey = key.replace(/^\/+/, '');
    return `${this.endpoint}/${this.bucket}/${cleanKey}?X-Amz-Expires=${expiresInSeconds}`;
  }

  async deleteObject(_key: string): Promise<void> {
    // Suppression S3 standard
  }
}

export const storage: StorageProvider = new S3CompatibleStorageProvider();

