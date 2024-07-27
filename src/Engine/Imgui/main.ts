import * as ImGui from "./imgui";
import * as ImGui_Impl from "./imgui_impl_webgpu";

let font: ImGui.Font | null = null;

async function LoadArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response: Response = await fetch(url);
    return response.arrayBuffer();
}

export default async function main(): Promise<void> {
    await ImGui.default();
    if (typeof(window) !== "undefined") {
        window.requestAnimationFrame(_init);
    } else {
        async function _main(): Promise<void> {
            await _init();
            for (let i = 0; i < 3; ++i) { _loop(1 / 60); }
            // await _done();
        }
        _main().catch(console.error);
    }
}

async function AddFontFromFileTTF(url: string, size_pixels: number, font_cfg: ImGui.FontConfig | null = null, glyph_ranges: number | null = null): Promise<ImGui.Font> {
    font_cfg = font_cfg || new ImGui.FontConfig();
    font_cfg.Name = font_cfg.Name || `${url.split(/[\\\/]/).pop()}, ${size_pixels.toFixed(0)}px`;
    return ImGui.GetIO().Fonts.AddFontFromMemoryTTF(await LoadArrayBuffer(url), size_pixels, font_cfg, glyph_ranges);
}

async function _init(): Promise<void> {
    // Setup Dear ImGui context
    ImGui.CHECKVERSION();
    ImGui.CreateContext();
    ImGui.StyleColorsDark();
    
    // Load Fonts 
    const io: ImGui.IO = ImGui.GetIO();
    io.Fonts.AddFontDefault();
   
    // Setup Platform/Renderer backends
    ImGui_Impl.Init(); //document.getElementById('webGPU-view') as HTMLCanvasElement);
    window.requestAnimationFrame(_loop);
}

// Main loop
function _loop(time: number): void {
    ImGui_Impl.NewFrame(time);
    ImGui.NewFrame();

        ImGui.Begin("Another Window")
            ImGui.Text("Hello from another window!");
        ImGui.End(); 

        // ImGui.Begin("Not Another Window")
        //     ImGui.Text("Hello from NOT another window!");
        // ImGui.End(); 
    
    ImGui.EndFrame();

    // Rendering
    ImGui.Render();
    // const gl: WebGLRenderingContext | null = ImGui_Impl.gl;
    // if (gl) {
    //     gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    //     gl.clearColor(.6,.6,.6,1);
    //     gl.clear(gl.COLOR_BUFFER_BIT);
    // }

    ImGui_Impl.RenderDrawData(ImGui.GetDrawData());

    if (typeof(window) !== "undefined") {
        window.requestAnimationFrame(_loop);
    }
}