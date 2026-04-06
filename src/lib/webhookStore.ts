declare global {
  var _mockWebhooks: any[];
}

if (!globalThis._mockWebhooks) {
  globalThis._mockWebhooks = [];
}

export const getWebhooks = () => globalThis._mockWebhooks || [];

export const addWebhook = (wh: any) => {
  if (!globalThis._mockWebhooks) {
    globalThis._mockWebhooks = [];
  }
  globalThis._mockWebhooks.push(wh);
  if (globalThis._mockWebhooks.length > 1000) {
    globalThis._mockWebhooks.shift();
  }
};
