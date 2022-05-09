import ffi from "ffi-napi";
import { Key, keyboard } from "@nut-tree/nut-js";
import sendkeys from 'sendkeys';

const IRACING_WINDOW_TITLE = "iRacing.com Simulator";
const IRACING_WINDOW_CLASS = "SimWinClass";

// hacky implementation copied from stackoverflow. probably not necessary to do all this, but it works
const user32 = new ffi.Library('user32', {
    'GetTopWindow': ['long', ['long']],
    'FindWindowA': ['long', ['string', 'string']],
    'SetActiveWindow': ['long', ['long']],
    'SetForegroundWindow': ['bool', ['long']],
    'BringWindowToTop': ['bool', ['long']],
    'ShowWindow': ['bool', ['long', 'int']],
    'SwitchToThisWindow': ['void', ['long', 'bool']],
    'GetForegroundWindow': ['long', []],
    'AttachThreadInput': ['bool', ['int', 'long', 'bool']],
    'GetWindowThreadProcessId': ['int', ['long', 'int']],
    'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
    'SetFocus': ['long', ['long']]
});

const kernel32 = new ffi.Library('Kernel32.dll', {
    'GetCurrentThreadId': ['int', []]
});

function focusWindow(windowClass: string | null, windowName: string) {

    let winToSetOnTop = user32.FindWindowA(windowClass, windowName)
    let foregroundHWnd = user32.GetForegroundWindow()
    var currentThreadId = kernel32.GetCurrentThreadId()
    let windowThreadProcessId = user32.GetWindowThreadProcessId(foregroundHWnd, 0)
    let showWindow = user32.ShowWindow(winToSetOnTop, 9)
    //var setWindowPos1 = user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3)
    //var setWindowPos2 = user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3)
    let setForegroundWindow = user32.SetForegroundWindow(winToSetOnTop)
    let attachThreadInput = user32.AttachThreadInput(windowThreadProcessId, currentThreadId, false)
    let setFocus = user32.SetFocus(winToSetOnTop)
    let setActiveWindow = user32.SetActiveWindow(winToSetOnTop)
}

export async function focusIRacingWindow() : Promise<void> {
    focusWindow(IRACING_WINDOW_CLASS, IRACING_WINDOW_TITLE);
}

async function typeMessageNutjs(msg: string, printLn = false) : Promise<void> {
    keyboard.config.autoDelayMs=1;
    await keyboard.type(msg);
    if(printLn) {
    await keyboard.pressKey(Key.Return);
    await sleep(30);
    await keyboard.releaseKey(Key.Return);
    }
}

async function typeMessageSendkeys(msg: string, printLn = false) {
    if(printLn) {
        msg = msg + "\r";
    }
    await sendkeys(msg);
}

export function typeMessage(msg: string, printLn = false) : Promise<void> {
    return typeMessageSendkeys(msg, printLn);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}