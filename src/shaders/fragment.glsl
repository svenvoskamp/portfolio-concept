precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform float uValue;
uniform vec2 uMousePos;
uniform float uHover;
uniform float uVelo;


varying vec2 vUv;

float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
    uv -= disc_center;
    uv *=uResolution;
    float dist = sqrt(dot(uv, uv));
    return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}


void main() {

  // float c = circle(vUv, uMousePos, 0.0, 0.1+uVelo*4.)*30.*uVelo;

  vec2 distortion = 0.02 * vec2(
    sin(uTime + vUv.x * uValue + vUv.y * uValue),
    sin(uTime + vUv.x * uValue + vUv.y * uValue)
  );

  vec4 redChannel = texture2D(uTexture, vUv + 0.3 * distortion);
    // redChannel.r = redChannel.r + c  * uHover;
    redChannel.g = 0.0;
    redChannel.b = 0.0;
  vec4 blueChannel = texture2D(uTexture, vUv - 0.5 * distortion);
    // blueChannel.b = blueChannel.b + c * uHover;
    blueChannel.g = 0.0;
    blueChannel.r = 0.0;
  vec4 greenChannel = texture2D(uTexture, vUv + 0.8 * distortion);
    //redChannel.r = redChannel.r + c * uHover;
    greenChannel.b = 0.0;
    greenChannel.r = 0.0;
        
  vec4 color = redChannel  +  greenChannel + blueChannel;
  gl_FragColor = color;
}
