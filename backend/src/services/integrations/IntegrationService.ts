export class IntegrationService {
  async list(userId: string) {
    return [
      {
        id: 'notion',
        status: 'connected',
        userId,
      },
    ];
  }
}
