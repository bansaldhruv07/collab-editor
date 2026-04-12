class SaveQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }
  add(documentId, content, htmlContent, saveFunction) {
    this.queue = this.queue.filter(item => item.documentId !== documentId);
    this.queue.push({ documentId, content, htmlContent, saveFunction });
  }
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const items = [...this.queue];
    this.queue = [];
    for (const item of items) {
      try {
        await item.saveFunction(
          item.documentId,
          item.content,
          item.htmlContent
        );
        console.log(`Queued save for ${item.documentId} completed`);
      } catch (err) {
        console.error('Queued save failed:', err);
        this.queue.push(item);
      }
    }
    this.processing = false;
  }
  get pendingCount() {
    return this.queue.length;
  }
}
const saveQueue = new SaveQueue();
export default saveQueue;