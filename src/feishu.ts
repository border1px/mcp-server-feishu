export class FeishuBaseClient {
  private readonly apiUrl: string = ''

  constructor({ apiUrl }: { apiUrl: string }) {
    this.apiUrl = apiUrl;
  }

  async createNote({ title, content }: { title: string, content: string }) {
    try {
      if (!title && !content) {
        throw new Error("invalid input");
      }

      const req = {
        title,
        content,
      };

      const resp = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status ${resp.statusText}`);
      }

      return resp.json();
    } catch (e) {
      throw e;
    }
  }
}