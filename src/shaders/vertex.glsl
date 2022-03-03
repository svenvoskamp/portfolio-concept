precision mediump float;
uniform float uTime;
uniform float uValue;
varying vec2 vUv;


void main(){


  vUv = uv;
  
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
     modelPosition.z += sin(modelPosition.y * 0.1 - uTime) * 0.1;
     modelPosition.z += sin(modelPosition.x * 0.1 - uTime) * 0.1;
     modelPosition.y += sin(modelPosition.z * 0.5 - uTime) * 0.1;
     modelPosition.y += sin(modelPosition.x * 0.5 - uTime) * 0.1;
     modelPosition.x += sin(modelPosition.y * 1. - uTime) * 0.1;
     modelPosition.x += sin(modelPosition.z * 1. - uTime) * 0.1;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}