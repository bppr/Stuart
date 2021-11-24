interface APIBridge {
  receive(msgName: string, handler: (any) => void);
  replay(carNumber: string, sessionNum: number, sessionTime: number);
  focusCamera(carNumber: string);
  jumpToTime(sessionNum: number, sessionTime: number);
}

interface WindowWithSDK extends Window {
  api: APIBridge
}