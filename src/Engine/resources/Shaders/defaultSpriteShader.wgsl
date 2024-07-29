struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) texCoords: vec2f
}

@group(0) @binding(0) var<uniform> projectionViewMatrix: mat4x4f;

@vertex
fn vertexMain(@location(0) position: vec4f, @location(1) texCoords: vec2f) -> VertexOutput {
    var out: VertexOutput;
    out.position = projectionViewMatrix * position;
    out.texCoords = texCoords;
    return out;
}

@group(1) @binding(0) var tex: texture_2d<f32>;
@group(1) @binding(1) var textureSampler: sampler;

@fragment
fn fragMain(fragData: VertexOutput) -> @location(0) vec4f {
    return textureSample(tex,textureSampler,fragData.texCoords);
}