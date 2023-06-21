export class OverAgreedLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OverAgreedLimit';
  }
}
