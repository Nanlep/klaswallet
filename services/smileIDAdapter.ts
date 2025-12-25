
export enum SmileIDStatus {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
  REJECTED = 'Rejected',
  PROCESSING = 'Processing'
}

export class SmileIDAdapter {
  private static instance: SmileIDAdapter;
  private readonly partnerId: string;
  private readonly apiKey: string;
  private readonly sidServer: string;

  private constructor() {
    this.partnerId = process.env.SMILE_ID_PARTNER_ID || 'KLAS_DEV_001';
    this.apiKey = process.env.SMILE_ID_API_KEY || '';
    this.sidServer = process.env.SMILE_ID_ENV === 'production' 
      ? 'https://api.smileidentity.com/v1' 
      : 'https://sandbox.smileidentity.com/v1';
  }

  static getInstance(): SmileIDAdapter {
    if (!this.instance) this.instance = new SmileIDAdapter();
    return this.instance;
  }

  /**
   * Submits a KYC request for Basic or Enhanced ID verification.
   * In a real implementation, this would send an image and metadata to SmileID.
   */
  async submitIDVerification(payload: {
    userId: string;
    idType: string;
    idNumber: string;
    firstName: string;
    lastName: string;
    dob: string;
    imageBase64?: string;
  }): Promise<{ jobId: string; status: SmileIDStatus }> {
    console.log(`[SmileID] Submitting ${payload.idType} for ${payload.userId}`);
    
    // Simulation of network delay
    await new Promise(r => setTimeout(r, 1500));

    // For Demo: NIN 12345678901 is the "Verified" trigger
    if (payload.idNumber === '12345678901') {
      return { jobId: `job_${Date.now()}`, status: SmileIDStatus.VERIFIED };
    }
    
    // Simulate "Processing" state for webhook testing
    return { jobId: `job_${Date.now()}`, status: SmileIDStatus.PROCESSING };
  }

  /**
   * Handles SmileID Liveness & Face Match check
   */
  async verifyLiveness(userId: string, selfieBase64: string): Promise<boolean> {
    console.log(`[SmileID] Processing Liveness for ${userId}`);
    await new Promise(r => setTimeout(r, 2000));
    return true; // Simulate liveness pass
  }
}
