export class TaniAuth {
  private apiKey: string;
  private groupId: string;

  constructor(apiKey: string, groupId: string) {
    this.apiKey = apiKey;
    this.groupId = groupId;
  }

  getGroupId(): string {
    return this.groupId;
  }

  getHeaders(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'x-group-id': this.groupId,
    };
  }
}
