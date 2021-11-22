interface APIBridge {
  receive(msgName: string, handler: (any) => void)
}

interface WindowWithSDK extends Window {
  api: APIBridge
}