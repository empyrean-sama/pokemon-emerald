struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) fragUV: vec2f,
    @interpolate(flat) @location(1) fragColor: vec4f
}

@group(0) @binding(0) var<uniform> projectionViewMatrix: mat4x4f;

@vertex
fn vertexMain(
    @location(0) position: vec2f,
    @location(1) uv: vec2f,
    @location(2) color: vec4f
) -> VertexOutput {
    var vo: VertexOutput;
    vo.fragUV = uv;
    vo.fragColor = color;
    vo.position = projectionViewMatrix * vec4f(position.xy,0,1);   
    return vo;
}

@group(1) @binding(0) var tex: texture_2d<f32>;
@group(1) @binding(1) var textureSampler: sampler;

@fragment
fn fragMain(fragData: VertexOutput) -> @location(0) vec4f {
    return fragData.fragColor * textureSample(tex, textureSampler, fragData.fragUV);
}