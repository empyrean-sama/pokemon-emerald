import * as ImGui from "./imgui";
import imguiShaderSource from "bundle-text:./imguiShader.wgsl";
import {canvas, canvasContext, device, InitializeRenderer} from '../Renderer';
import { glMatrix, mat4 } from "gl-matrix";

let clipboard_text: string = "";

// export let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
// let g_ShaderHandle: WebGLProgram | null = null;
// let g_VertHandle: WebGLShader | null = null;
// let g_FragHandle: WebGLShader | null = null;
// let g_AttribLocationTex: WebGLUniformLocation | null = null;
// let g_AttribLocationProjMtx: WebGLUniformLocation | null = null;
// let g_AttribLocationPosition: GLint = -1;
// let g_AttribLocationUV: GLint = -1;
// let g_AttribLocationColor: GLint = -1;
// let g_VboHandle: WebGLBuffer | null = null;
// let g_ElementsHandle: WebGLBuffer | null = null;
// let g_FontTexture: WebGLTexture | null = null;

let prev_time: number = 0;

function document_on_copy(event: ClipboardEvent): void {
    if (event.clipboardData) {
        event.clipboardData.setData("text/plain", clipboard_text);
    }
    // console.log(`${event.type}: "${clipboard_text}"`);
    event.preventDefault();
}

function document_on_cut(event: ClipboardEvent): void {
    if (event.clipboardData) {
        event.clipboardData.setData("text/plain", clipboard_text);
    }
    // console.log(`${event.type}: "${clipboard_text}"`);
    event.preventDefault();
}

function document_on_paste(event: ClipboardEvent): void {
    if (event.clipboardData) {
        clipboard_text = event.clipboardData.getData("text/plain");
    }
    // console.log(`${event.type}: "${clipboard_text}"`);
    event.preventDefault();
}

function window_on_resize(): void {
    if (canvas !== null) {
        canvas.width = canvas.scrollWidth;
        canvas.height = canvas.scrollHeight;
    }
}

function window_on_gamepadconnected(event: any /* GamepadEvent */): void {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    event.gamepad.index, event.gamepad.id,
    event.gamepad.buttons.length, event.gamepad.axes.length);
}

function window_on_gamepaddisconnected(event: any /* GamepadEvent */): void {
    console.log("Gamepad disconnected at index %d: %s.",
    event.gamepad.index, event.gamepad.id);
}

function canvas_on_blur(event: FocusEvent): void {
    const io = ImGui.GetIO();
    io.KeyCtrl = false;
    io.KeyShift = false;
    io.KeyAlt = false;
    io.KeySuper = false;
    for (let i = 0; i < io.KeysDown.length; ++i) {
        io.KeysDown[i] = false;
    }
    for (let i = 0; i < io.MouseDown.length; ++i) {
        io.MouseDown[i] = false;
    }
}

const key_code_to_index: Record<string, number> = {
    "NumpadEnter": 176,
};

function canvas_on_keydown(event: KeyboardEvent): void {
    // console.log(event.type, event.key, event.code, event.keyCode);
    const io = ImGui.GetIO();
    io.KeyCtrl = event.ctrlKey;
    io.KeyShift = event.shiftKey;
    io.KeyAlt = event.altKey;
    io.KeySuper = event.metaKey;
    const key_index: number = key_code_to_index[event.code] || event.keyCode;
    ImGui.ASSERT(key_index >= 0 && key_index < ImGui.ARRAYSIZE(io.KeysDown));
    io.KeysDown[key_index] = true;
    // forward to the keypress event
    if (/*io.WantCaptureKeyboard ||*/ event.key === "Tab") {
        event.preventDefault();
    }
}

function canvas_on_keyup(event: KeyboardEvent): void  {
    // console.log(event.type, event.key, event.code, event.keyCode);
    const io = ImGui.GetIO();
    io.KeyCtrl = event.ctrlKey;
    io.KeyShift = event.shiftKey;
    io.KeyAlt = event.altKey;
    io.KeySuper = event.metaKey;
    const key_index: number = key_code_to_index[event.code] || event.keyCode;
    ImGui.ASSERT(key_index >= 0 && key_index < ImGui.ARRAYSIZE(io.KeysDown));
    io.KeysDown[key_index] = false;
    if (io.WantCaptureKeyboard) {
        event.preventDefault();
    }
}

function canvas_on_keypress(event: KeyboardEvent): void  {
    // console.log(event.type, event.key, event.code, event.keyCode);
    const io = ImGui.GetIO();
    io.AddInputCharacter(event.charCode);
    if (io.WantCaptureKeyboard) {
        event.preventDefault();
    }
}

function canvas_on_pointermove(event: PointerEvent): void  {
    const io = ImGui.GetIO();
    io.MousePos.x = event.offsetX;
    io.MousePos.y = event.offsetY;
    if (io.WantCaptureMouse) {
        event.preventDefault();
    }
}

// MouseEvent.button
// A number representing a given button:
// 0: Main button pressed, usually the left button or the un-initialized state
// 1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
const mouse_button_map: number[] = [ 0, 2, 1, 3, 4 ];

function canvas_on_pointerdown(event: PointerEvent): void  {
    const io = ImGui.GetIO();
    io.MousePos.x = event.offsetX;
    io.MousePos.y = event.offsetY;
    io.MouseDown[mouse_button_map[event.button]] = true;
    // if (io.WantCaptureMouse) {
    //     event.preventDefault();
    // }
}
function canvas_on_contextmenu(event: Event): void  {
    const io = ImGui.GetIO();
    if (io.WantCaptureMouse) {
        event.preventDefault();
    }
}

function canvas_on_pointerup(event: PointerEvent): void  {
    const io = ImGui.GetIO();
    io.MouseDown[mouse_button_map[event.button]] = false;
    if (io.WantCaptureMouse) {
        event.preventDefault();
    }
}

function canvas_on_wheel(event: WheelEvent): void  {
    const io = ImGui.GetIO();
    let scale: number = 1.0;
    switch (event.deltaMode) {
        case event.DOM_DELTA_PIXEL: scale = 0.01; break;
        case event.DOM_DELTA_LINE: scale = 0.2; break;
        case event.DOM_DELTA_PAGE: scale = 1.0; break;
    }
    io.MouseWheelH = event.deltaX * scale;
    io.MouseWheel = -event.deltaY * scale; // Mouse wheel: 1 unit scrolls about 5 lines text.
    if (io.WantCaptureMouse) {
        event.preventDefault();
    }
}

export function Init(): void {
    const io = ImGui.GetIO();

    if (typeof(window) !== "undefined") {
        io.BackendPlatformName = "imgui_impl_browser";
        ImGui.LoadIniSettingsFromMemory(window.localStorage.getItem("imgui.ini") || "");
    }
    else {
        io.BackendPlatformName = "imgui_impl_console";
    }

    if (typeof(navigator) !== "undefined") {
        io.ConfigMacOSXBehaviors = navigator.platform.match(/Mac/) !== null;
    }

    if (typeof(document) !== "undefined") {
        document.body.addEventListener("copy", document_on_copy);
        document.body.addEventListener("cut", document_on_cut);
        document.body.addEventListener("paste", document_on_paste);
    }

    io.SetClipboardTextFn = (user_data: any, text: string): void => {
        clipboard_text = text;
        // console.log(`set clipboard_text: "${clipboard_text}"`);
        if (typeof navigator !== "undefined" && typeof (navigator as any).clipboard !== "undefined") {
            // console.log(`clipboard.writeText: "${clipboard_text}"`);
            (navigator as any).clipboard.writeText(clipboard_text).then((): void => {
                // console.log(`clipboard.writeText: "${clipboard_text}" done.`);
            });
        }
    };
    io.GetClipboardTextFn = (user_data: any): string => {
        // if (typeof navigator !== "undefined" && typeof (navigator as any).clipboard !== "undefined") {
        //     console.log(`clipboard.readText: "${clipboard_text}"`);
        //     (navigator as any).clipboard.readText().then((text: string): void => {
        //         clipboard_text = text;
        //         console.log(`clipboard.readText: "${clipboard_text}" done.`);
        //     });
        // }
        // console.log(`get clipboard_text: "${clipboard_text}"`);
        return clipboard_text;
    };
    
    io.ClipboardUserData = null;
    io.BackendRendererName = "imgui_impl_webgpu";

    if (typeof(window) !== "undefined") {
        window.addEventListener("resize", window_on_resize);
    }

    window_on_resize();
    canvas.style.touchAction = "none"; // Disable browser handling of all panning and zooming gestures.
    canvas.addEventListener("blur", canvas_on_blur);
    canvas.addEventListener("keydown", canvas_on_keydown);
    canvas.addEventListener("keyup", canvas_on_keyup);
    canvas.addEventListener("keypress", canvas_on_keypress);
    canvas.addEventListener("pointermove", canvas_on_pointermove);
    canvas.addEventListener("pointerdown", canvas_on_pointerdown);
    canvas.addEventListener("contextmenu", canvas_on_contextmenu);
    canvas.addEventListener("pointerup", canvas_on_pointerup);
    canvas.addEventListener("wheel", canvas_on_wheel);

    // Setup back-end capabilities flags
    io.BackendFlags |= ImGui.BackendFlags.HasMouseCursors;   // We can honor GetMouseCursor() values (optional)

    // Keyboard mapping. ImGui will use those indices to peek into the io.KeyDown[] array.
    io.KeyMap[ImGui.Key.Tab] = 9;
    io.KeyMap[ImGui.Key.LeftArrow] = 37;
    io.KeyMap[ImGui.Key.RightArrow] = 39;
    io.KeyMap[ImGui.Key.UpArrow] = 38;
    io.KeyMap[ImGui.Key.DownArrow] = 40;
    io.KeyMap[ImGui.Key.PageUp] = 33;
    io.KeyMap[ImGui.Key.PageDown] = 34;
    io.KeyMap[ImGui.Key.Home] = 36;
    io.KeyMap[ImGui.Key.End] = 35;
    io.KeyMap[ImGui.Key.Insert] = 45;
    io.KeyMap[ImGui.Key.Delete] = 46;
    io.KeyMap[ImGui.Key.Backspace] = 8;
    io.KeyMap[ImGui.Key.Space] = 32;
    io.KeyMap[ImGui.Key.Enter] = 13;
    io.KeyMap[ImGui.Key.Escape] = 27;
    io.KeyMap[ImGui.Key.KeyPadEnter] = key_code_to_index["NumpadEnter"];
    io.KeyMap[ImGui.Key.A] = 65;
    io.KeyMap[ImGui.Key.C] = 67;
    io.KeyMap[ImGui.Key.V] = 86;
    io.KeyMap[ImGui.Key.X] = 88;
    io.KeyMap[ImGui.Key.Y] = 89;
    io.KeyMap[ImGui.Key.Z] = 90;

    CreateDeviceObjects();
}

export function NewFrame(time: number): void {
    const io = ImGui.GetIO();

    if (io.WantSaveIniSettings) {
        io.WantSaveIniSettings = false;
        if (typeof(window) !== "undefined") {
            window.localStorage.setItem("imgui.ini", ImGui.SaveIniSettingsToMemory());
        }
    }

    const w: number = canvas && canvas.scrollWidth || 640;
    const h: number = canvas && canvas.scrollHeight || 480;
    const display_w: number = w;
    const display_h: number = h;
    io.DisplaySize.x = w;
    io.DisplaySize.y = h;
    io.DisplayFramebufferScale.x = w > 0 ? (display_w / w) : 0;
    io.DisplayFramebufferScale.y = h > 0 ? (display_h / h) : 0;

    const dt: number = time - prev_time;
    prev_time = time;
    io.DeltaTime = dt / 1000;

    if (io.WantSetMousePos) {
        console.log("TODO: MousePos", io.MousePos.x, io.MousePos.y);
    }

    if (typeof(document) !== "undefined") {
        if (io.MouseDrawCursor) {
            document.body.style.cursor = "none";
        } else {
            switch (ImGui.GetMouseCursor()) {
                case ImGui.MouseCursor.None: document.body.style.cursor = "none"; break;
                default: case ImGui.MouseCursor.Arrow: document.body.style.cursor = "default"; break;
                case ImGui.MouseCursor.TextInput: document.body.style.cursor = "text"; break;         // When hovering over InputText, etc.
                case ImGui.MouseCursor.ResizeAll: document.body.style.cursor = "all-scroll"; break;         // Unused
                case ImGui.MouseCursor.ResizeNS: document.body.style.cursor = "ns-resize"; break;     // When hovering over an horizontal border
                case ImGui.MouseCursor.ResizeEW: document.body.style.cursor = "ew-resize"; break;     // When hovering over a vertical border or a column
                case ImGui.MouseCursor.ResizeNESW: document.body.style.cursor = "nesw-resize"; break; // When hovering over the bottom-left corner of a window
                case ImGui.MouseCursor.ResizeNWSE: document.body.style.cursor = "nwse-resize"; break; // When hovering over the bottom-right corner of a window
                case ImGui.MouseCursor.Hand: document.body.style.cursor = "move"; break;
                case ImGui.MouseCursor.NotAllowed: document.body.style.cursor = "not-allowed"; break;
            }
        }
    }

    // Gamepad navigation mapping [BETA]
    for (let i = 0; i < io.NavInputs.length; ++i) {
        // TODO: This is currently causing an issue and I have no gamepad to test with.
        //       The error is: ''set' on proxy: trap returned falsish for property '21'
        //       I think that the NavInputs are zeroed out by ImGui at the start of each frame anyway
        //       so I am not sure if the following is even necessary.
        //io.NavInputs[i] = 0.0;
    }
    if (io.ConfigFlags & ImGui.ConfigFlags.NavEnableGamepad) {
        // Update gamepad inputs
        const gamepads: (Gamepad | null)[] = (typeof(navigator) !== "undefined" && typeof(navigator.getGamepads) === "function") ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; ++i) {
            const gamepad: Gamepad | null = gamepads[i];
            if (!gamepad) { continue; }
            io.BackendFlags |= ImGui.BackendFlags.HasGamepad;
            const buttons_count: number = gamepad.buttons.length;
            const axes_count: number = gamepad.axes.length;
            function MAP_BUTTON(NAV_NO: number, BUTTON_NO: number): void {
                if (!gamepad) { return; }
                if (buttons_count > BUTTON_NO && gamepad.buttons[BUTTON_NO].pressed)
                    io.NavInputs[NAV_NO] = 1.0;
            }
            function MAP_ANALOG(NAV_NO: number, AXIS_NO: number, V0: number, V1: number): void {
                if (!gamepad) { return; }
                let v: number = (axes_count > AXIS_NO) ? gamepad.axes[AXIS_NO] : V0;
                v = (v - V0) / (V1 - V0);
                if (v > 1.0) v = 1.0;
                if (io.NavInputs[NAV_NO] < v) io.NavInputs[NAV_NO] = v;
            }
            // TODO: map input based on vendor and product id
            // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/id
            const match: RegExpMatchArray | null = gamepad.id.match(/^([0-9a-f]{4})-([0-9a-f]{4})-.*$/);
            const match_chrome: RegExpMatchArray | null = gamepad.id.match(/^.*\(.*Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})\).*$/);
            const vendor: string = (match && match[1]) || (match_chrome && match_chrome[1]) || "0000";
            const product: string = (match && match[2]) || (match_chrome && match_chrome[2]) || "0000";
            switch (vendor + product) {
                case "046dc216": // Logitech Logitech Dual Action (Vendor: 046d Product: c216)
                MAP_BUTTON(ImGui.NavInput.Activate,    1); // Cross / A
                MAP_BUTTON(ImGui.NavInput.Cancel,      2); // Circle / B
                MAP_BUTTON(ImGui.NavInput.Menu,        0); // Square / X
                MAP_BUTTON(ImGui.NavInput.Input,       3); // Triangle / Y
                MAP_ANALOG(ImGui.NavInput.DpadLeft,    4, -0.3, -0.9); // D-Pad Left
                MAP_ANALOG(ImGui.NavInput.DpadRight,   4, +0.3, +0.9); // D-Pad Right
                MAP_ANALOG(ImGui.NavInput.DpadUp,      5, -0.3, -0.9); // D-Pad Up
                MAP_ANALOG(ImGui.NavInput.DpadDown,    5, +0.3, +0.9); // D-Pad Down
                MAP_BUTTON(ImGui.NavInput.FocusPrev,   4); // L1 / LB
                MAP_BUTTON(ImGui.NavInput.FocusNext,   5); // R1 / RB
                MAP_BUTTON(ImGui.NavInput.TweakSlow,   6); // L2 / LT
                MAP_BUTTON(ImGui.NavInput.TweakFast,   7); // R2 / RT
                MAP_ANALOG(ImGui.NavInput.LStickLeft,  0, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickRight, 0, +0.3, +0.9);
                MAP_ANALOG(ImGui.NavInput.LStickUp,    1, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickDown,  1, +0.3, +0.9);
                break;
                case "046dc21d": // Logitech Gamepad F310 (STANDARD GAMEPAD Vendor: 046d Product: c21d)
                MAP_BUTTON(ImGui.NavInput.Activate,    0); // Cross / A
                MAP_BUTTON(ImGui.NavInput.Cancel,      1); // Circle / B
                MAP_BUTTON(ImGui.NavInput.Menu,        2); // Square / X
                MAP_BUTTON(ImGui.NavInput.Input,       3); // Triangle / Y
                MAP_BUTTON(ImGui.NavInput.DpadLeft,    14); // D-Pad Left
                MAP_BUTTON(ImGui.NavInput.DpadRight,   15); // D-Pad Right
                MAP_BUTTON(ImGui.NavInput.DpadUp,      12); // D-Pad Up
                MAP_BUTTON(ImGui.NavInput.DpadDown,    13); // D-Pad Down
                MAP_BUTTON(ImGui.NavInput.FocusPrev,   4); // L1 / LB
                MAP_BUTTON(ImGui.NavInput.FocusNext,   5); // R1 / RB
                MAP_ANALOG(ImGui.NavInput.TweakSlow,   6, +0.3, +0.9); // L2 / LT
                MAP_ANALOG(ImGui.NavInput.TweakFast,   7, +0.3, +0.9); // R2 / RT
                MAP_ANALOG(ImGui.NavInput.LStickLeft,  0, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickRight, 0, +0.3, +0.9);
                MAP_ANALOG(ImGui.NavInput.LStickUp,    1, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickDown,  1, +0.3, +0.9);
                break;
                case "2dc86001": // 8Bitdo SN30 Pro  8Bitdo SN30 Pro (Vendor: 2dc8 Product: 6001)
                case "2dc86101": // 8Bitdo SN30 Pro (Vendor: 2dc8 Product: 6101)
                MAP_BUTTON(ImGui.NavInput.Activate,    1); // Cross / A
                MAP_BUTTON(ImGui.NavInput.Cancel,      0); // Circle / B
                MAP_BUTTON(ImGui.NavInput.Menu,        4); // Square / X
                MAP_BUTTON(ImGui.NavInput.Input,       3); // Triangle / Y
                MAP_ANALOG(ImGui.NavInput.DpadLeft,    6, -0.3, -0.9); // D-Pad Left
                MAP_ANALOG(ImGui.NavInput.DpadRight,   6, +0.3, +0.9); // D-Pad Right
                MAP_ANALOG(ImGui.NavInput.DpadUp,      7, -0.3, -0.9); // D-Pad Up
                MAP_ANALOG(ImGui.NavInput.DpadDown,    7, +0.3, +0.9); // D-Pad Down
                MAP_BUTTON(ImGui.NavInput.FocusPrev,   6); // L1 / LB
                MAP_BUTTON(ImGui.NavInput.FocusNext,   7); // R1 / RB
                MAP_BUTTON(ImGui.NavInput.TweakSlow,   8); // L2 / LT
                MAP_BUTTON(ImGui.NavInput.TweakFast,   9); // R2 / RT
                MAP_ANALOG(ImGui.NavInput.LStickLeft,  0, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickRight, 0, +0.3, +0.9);
                MAP_ANALOG(ImGui.NavInput.LStickUp,    1, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickDown,  1, +0.3, +0.9);
                break;
                default: // standard gamepad: https://w3c.github.io/gamepad/#remapping
                MAP_BUTTON(ImGui.NavInput.Activate,    0); // Cross / A
                MAP_BUTTON(ImGui.NavInput.Cancel,      1); // Circle / B
                MAP_BUTTON(ImGui.NavInput.Menu,        2); // Square / X
                MAP_BUTTON(ImGui.NavInput.Input,       3); // Triangle / Y
                MAP_BUTTON(ImGui.NavInput.DpadLeft,    14); // D-Pad Left
                MAP_BUTTON(ImGui.NavInput.DpadRight,   15); // D-Pad Right
                MAP_BUTTON(ImGui.NavInput.DpadUp,      12); // D-Pad Up
                MAP_BUTTON(ImGui.NavInput.DpadDown,    13); // D-Pad Down
                MAP_BUTTON(ImGui.NavInput.FocusPrev,   4); // L1 / LB
                MAP_BUTTON(ImGui.NavInput.FocusNext,   5); // R1 / RB
                MAP_BUTTON(ImGui.NavInput.TweakSlow,   6); // L2 / LT
                MAP_BUTTON(ImGui.NavInput.TweakFast,   7); // R2 / RT
                MAP_ANALOG(ImGui.NavInput.LStickLeft,  0, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickRight, 0, +0.3, +0.9);
                MAP_ANALOG(ImGui.NavInput.LStickUp,    1, -0.3, -0.9);
                MAP_ANALOG(ImGui.NavInput.LStickDown,  1, +0.3, +0.9);
                break;
            }
        }
    }
}

export async function RenderDrawData(draw_data: ImGui.DrawData | null = ImGui.GetDrawData()): Promise<undefined> {
    const io = ImGui.GetIO();
    if (draw_data === null) { throw new Error(); }
    
    // Avoid rendering when minimized, scale coordinates for retina displays (screen coordinates != framebuffer coordinates)
    const fb_width: number = io.DisplaySize.x * io.DisplayFramebufferScale.x;
    const fb_height: number = io.DisplaySize.y * io.DisplayFramebufferScale.y;
    if (fb_width === 0 || fb_height === 0) {
        return;
    }
    draw_data.ScaleClipRects(io.DisplayFramebufferScale);

    // Setup viewport, orthographic projection matrix
    // Our visible imgui space lies from draw_data->DisplayPps (top left) to draw_data->DisplayPos+data_data->DisplaySize (bottom right). DisplayMin is typically (0,0) for single viewport apps.
    
    //gl && gl.viewport();
    const L: number = draw_data.DisplayPos.x;
    const R: number = draw_data.DisplayPos.x + draw_data.DisplaySize.x;
    const T: number = draw_data.DisplayPos.y;
    const B: number = draw_data.DisplayPos.y + draw_data.DisplaySize.y;
    const ortho_projection: Float32Array = new Float32Array([
        2.0 / (R - L),     0.0,                0.0, 0.0,
        0.0,               2.0 / (T - B),      0.0, 0.0,
        0.0,               0.0,               -1.0, 0.0,
        (R + L) / (L - R), (T + B) / (B - T),  0.0, 1.0,
    ]);
    // const ortho_projection = mat4.ortho(mat4.create(),L,R,B,T,0,1);

    const commandEncoder = device!.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
            {
                view: canvasContext!.getCurrentTexture().createView(),
                loadOp: 'clear',
                storeOp: 'store',
                clearValue: [.6,.6,.6,1]
            }
        ]
    });
    // renderPass.setViewport(0, 0, fb_width, fb_height, 0, 1); //-1 and 10 are arbitrary
    device!.queue.writeBuffer(projectionViewBuffer!, 0, new Float32Array(ortho_projection));

    renderPass.setPipeline(imguiPipeline!);
    renderPass.setBindGroup(0, projectionViewBindGroup!);

    const pos = draw_data.DisplayPos;
    // let drawingListCount = 0;
    draw_data.IterateDrawLists((draw_list: ImGui.DrawList): void => {
        const vertexBuffer = device!.createBuffer({
            size: vertexStride * draw_data.TotalVtxCount,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        const rawVertices = [];
        const vertexBufferDataView = new DataView(draw_list.VtxBuffer.buffer);
        for(let bytePos=0; bytePos < draw_list.VtxBuffer.byteLength; bytePos += ImGui.DrawVertSize) {
            
            const byteOffset = draw_list.VtxBuffer.byteOffset;

            const positionX = vertexBufferDataView.getFloat32(bytePos + byteOffset, true);
            const positionY = vertexBufferDataView.getFloat32(bytePos + 4 + byteOffset, true);

            const uvX = vertexBufferDataView.getFloat32(bytePos + 8 + byteOffset, true);
            const uvY = vertexBufferDataView.getFloat32(bytePos + 12 + byteOffset, true);

            const colorR = vertexBufferDataView.getUint8(bytePos + 16 + byteOffset);
            const colorG = vertexBufferDataView.getUint8(bytePos + 17 + byteOffset);
            const colorB = vertexBufferDataView.getUint8(bytePos + 18 + byteOffset);
            const colorA = vertexBufferDataView.getUint8(bytePos + 19 + byteOffset);

            rawVertices.push(positionX);
            rawVertices.push(positionY);

            rawVertices.push(uvX);
            rawVertices.push(uvY);

            rawVertices.push(colorR);
            rawVertices.push(colorG);
            rawVertices.push(colorB);
            rawVertices.push(colorA);
        }
        new Float32Array(vertexBuffer.getMappedRange()).set(rawVertices);
        vertexBuffer.unmap();

        const indexBufferView = new DataView(draw_list.IdxBuffer.buffer);
        const rawIndices = [];
        for(let bytePos = 0; bytePos < draw_list.IdxBuffer.byteLength; bytePos+=2){
            rawIndices.push(indexBufferView.getUint16(bytePos + draw_list.IdxBuffer.byteOffset, true));
        }
        const indexBuffer = device!.createBuffer({
            label: "indexBuffer",
            size: draw_data.TotalIdxCount * Uint32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Uint32Array(indexBuffer.getMappedRange()).set(rawIndices);
        indexBuffer.unmap();
        
        renderPass.setVertexBuffer(0,vertexBuffer);
        renderPass.setIndexBuffer(indexBuffer!, "uint32");

        draw_list.IterateDrawCmds((draw_cmd: ImGui.DrawCmd): void => {
            renderPass.setBindGroup(1, fontTextureBindGroup || null);
            renderPass.drawIndexed(draw_cmd.ElemCount, undefined, draw_cmd.IdxOffset);
        });

       
    });
    renderPass.end();
    device?.queue.submit([commandEncoder.finish()]);
    // vertexBuffer.destroy();
    // indexBuffer.destroy();

    //todo: destroy buffers properly
}

let fontTextureBindGroup: GPUBindGroup | undefined;
function CreateFontsTexture(device: GPUDevice): void {
    const io = ImGui.GetIO();
    let { width, height, pixels } = io.Fonts.GetTexDataAsRGBA32();
    
    const dataView = new DataView(pixels.buffer);
    const rawPixels = pixels.map((pixel: number) => pixel);

    pixels = pixels.map((pixelComp) => pixelComp / 255);

    const fontTexture = device.createTexture({
        size: [width, height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    }); 
    device.queue.writeTexture({texture: fontTexture}, pixels, {bytesPerRow: width * 4}, [width, height]);

    console.log(width * 16 * height);
    console.log(pixels)

    //Create the bind group and include the texture as a part of it
    fontTextureBindGroup = device.createBindGroup({
        layout: textureAndSampleBindGroupLayout!,
        entries: [
            {
                binding: 0,
                resource: fontTexture.createView()
            },
            {
                binding: 1,
                resource: device.createSampler({
                    minFilter: "linear",
                    magFilter: "linear"
                })
            }
        ]
    });

    // Store our identifier
    io.Fonts.TexID = fontTextureBindGroup;
}

let projectionViewBuffer: GPUBuffer | undefined;
let projectionViewBindGroup: GPUBindGroup | undefined;

let textureAndSampleBindGroupLayout: GPUBindGroupLayout | undefined; 

let imguiPipeline: GPURenderPipeline | undefined;
let textureAndSamplerLayout: GPUBufferBindingLayout | undefined;

const vertexStride: number = 8 * Float32Array.BYTES_PER_ELEMENT;
export function CreateDeviceObjects(): void {

    if(!device) {
        throw new Error('device not initialized');
    }
    
    const shaderModule = device.createShaderModule({code: imguiShaderSource});
    const vertexState: GPUVertexState = {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [
            {
                arrayStride: vertexStride,
                attributes: [
                    {
                        format: 'float32x2',
                        offset: 0,
                        shaderLocation: 0
                    },
                    {
                        format: 'float32x2',
                        offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                        shaderLocation: 1
                    },
                    {
                        format: "float32x4",
                        offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                        shaderLocation: 2
                    }
                ],
                stepMode: 'vertex'
            }
        ]
    };
    const fragmentState: GPUFragmentState = {
        module: shaderModule,
        entryPoint: 'fragMain',
        targets: [
            {
                format: navigator.gpu.getPreferredCanvasFormat(),
                blend: {
                    color: {
                        srcFactor: "src-alpha",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add"
                    },
                    alpha: {
                        srcFactor: "src-alpha",
                        dstFactor: "one-minus-src-alpha",
                        operation: "add"
                    }
                },
                
            }
        ]
    };

    projectionViewBuffer = device.createBuffer({
        label: "projectionViewBuffer",
        size: 16 * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
        mappedAtCreation: false
    });

    const projectionViewLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer:{
                    type: 'uniform'
                }
            }
        ]
    });
    projectionViewBindGroup = device.createBindGroup({
        layout: projectionViewLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: projectionViewBuffer
                }
            }
        ]
    });

    textureAndSampleBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {}
            },
            {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {}
            }
        ]
    });

    imguiPipeline = device.createRenderPipeline({
        vertex: vertexState,
        fragment: fragmentState,
        primitive: {topology: 'triangle-list'},
        layout: device.createPipelineLayout({
            bindGroupLayouts: [
                projectionViewLayout,
                textureAndSampleBindGroupLayout
            ]
        })
    });

    CreateFontsTexture(device);
}