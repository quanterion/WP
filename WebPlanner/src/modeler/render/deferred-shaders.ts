import { ShaderProgram, computeLighting } from './shaders';

const screenQuadGeometry = `
    in vec4 a_vertex; // [-1 .. 1]
    out vec2 v_texCoord; // [0 .. 1]

    void main(void)
    {
        v_texCoord = a_vertex.xy * 0.5 + 0.5;
        gl_Position = a_vertex;
    }
    `;

const deferredGeometryInfo = `
    uniform mat4 u_inverseProjectionMatrix;
    uniform sampler2D u_normalTexture;
    uniform sampler2D u_depthTexture;

    float getDepth(vec2 texCoord) {
        return texture(u_depthTexture, texCoord).r;
    }

    vec4 getViewPos(vec2 texCoord, float depthPos)
    {
        // Calculate out of the fragment in screen space the view space position.
        float x = texCoord.s * 2.0 - 1.0;
        float y = texCoord.t * 2.0 - 1.0;
        // Assume we have a normal depth range between 0.0 and 1.0
        float z = depthPos * 2.0 - 1.0;
        vec4 posProj = vec4(x, y, z, 1.0);
        vec4 posView = u_inverseProjectionMatrix * posProj;
        posView /= posView.w;
        return posView;
    }

    vec3 getNormal(vec2 texCoord) {
        vec3 normalizedNormal = texture(u_normalTexture, texCoord).xyz;
        return normalize(normalizedNormal * 2.0 - 1.0);
    }
`;

export const ssao = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform vec2 u_depthRange;

    uniform vec3 u_kernel[KERNEL_SIZE];

    uniform sampler2D u_rotationNoiseTexture;
    uniform vec2 u_rotationNoiseScale;

    uniform mat4 u_projectionMatrix;
    uniform vec3 u_viewDir;

    uniform float u_radius;

    in vec2 v_texCoord;

    layout(location = 0) out vec4 fragColor;

    ${deferredGeometryInfo}

    float computeAo(vec4 posView, vec3 normalView) {
        vec3 randomVector = normalize(texture(u_rotationNoiseTexture, v_texCoord * u_rotationNoiseScale).xyz * 2.0 - 1.0);

        // Using Gram-Schmidt process to get an orthogonal vector to the normal vector.
        // The resulting tangent is on the same plane as the random and normal vector.
        // see http://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process
        // Note: No division by <u,u> needed, as this is for normal vectors 1.
        vec3 tangentView = normalize(randomVector - dot(randomVector, normalView) * normalView);
        vec3 bitangentView = cross(normalView, tangentView);

        // Final matrix to reorient the kernel depending on the normal and the random vector.
        mat3 kernelMatrix = mat3(tangentView, bitangentView, normalView);

        // Go through the kernel samples and create occlusion factor.
        float occlusion = 0.0;
        for (int i = 0; i < KERNEL_SIZE; i++) {
                // Reorient sample vector in view space ...
                vec3 sampleVectorView = kernelMatrix * u_kernel[i];
                // ... and calculate sample point.
                vec4 samplePointView = posView + u_radius * vec4(sampleVectorView, 0.0);
                // Project point and calculate NDC.
                vec4 samplePointNDC = u_projectionMatrix * samplePointView;
                samplePointNDC /= samplePointNDC.w;
                // Create texture coordinate out of it.
                vec2 samplePointTexCoord = samplePointNDC.xy * 0.5 + 0.5;

                // Get sample out of depth texture
                float zSceneNDC = texture(u_depthTexture, samplePointTexCoord).r * 2.0 - 1.0;
                float delta = (samplePointNDC.z - zSceneNDC);// / u_radius;
                if (delta > u_depthRange[0] && delta < u_depthRange[1])
                    occlusion += 1.0;//occlusion = float(KERNEL_SIZE);

                /*
                float sampleDepth = texture(u_depthTexture, samplePointTexCoord).r * 2.0 - 1.0;
                sampleDepth = linearizeDepth(sampleDepth, u_projectionMatrix);

                float rangeCheck = smoothstep(0.0, 1.0, u_radius / abs(posView.z - sampleDepth));
                occlusion += rangeCheck * step(sampleDepth, samplePointView.z);
                */
        }

        // No occlusion gets white, full occlusion gets black.
        occlusion = 1.0 - occlusion / float(KERNEL_SIZE);
        return occlusion * occlusion;
    }

    void main(void)
    {
        float depthPos = getDepth(v_texCoord);
        if (depthPos < 1.0) {
            // Calculate out of the current fragment in screen space the view space position.
            vec4 pos = getViewPos(v_texCoord, depthPos);
            vec3 normal = getNormal(v_texCoord);
            float occlusion = computeAo(pos, normal);
            fragColor = vec4(0.0, 0.0, 0.0, occlusion);
        }
        else {
            fragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    }`
);

export const combine = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform sampler2D u_colorTexture;
    uniform sampler2D u_ssaoTexture;
    uniform sampler2D u_lightTexture;
    uniform vec3 u_selectionOutlineColor;

    in vec2 v_texCoord;
    layout(location = 0) out vec4 fragColor;

    uniform sampler2D u_materialParams;
    ${deferredGeometryInfo}
    ${computeLighting}

    void main(void)
    {
        vec4 ssao = texture(u_ssaoTexture, v_texCoord);
        float ao = ssao.a;
        float background = ssao.b; // 1.0 if this is background
        vec3 texColor = texture(u_colorTexture, v_texCoord).rgb;
        // TODO: take into account effect resolution v_texCoord * scale
        vec4 lightAndSelection = texture(u_lightTexture, v_texCoord * 0.5);
        vec3 lightColor = lightAndSelection.rgb;
        float sel = lightAndSelection.a - 0.4;
        // visualize via https://www.desmos.com/calculator -50 * x * x + 10 * x + 1
        sel = max(0.0, -50.0 * sel * sel + 10.0 * sel + 1.0);

        float depthPos = getDepth(v_texCoord);
        vec3 pos = getViewPos(v_texCoord, depthPos).xyz;
        vec3 viewDir = normalize(-pos);
        vec4 normalMaterialInfo = texture(u_normalTexture, v_texCoord);
        vec3 normal = normalize(normalMaterialInfo.xyz * 2.0 - 1.0);
        vec4 materialParams = texture(u_materialParams, vec2(normalMaterialInfo.a + 0.5 / 256.0, 0.5));
        vec3 color = computeLighting(pos, normal, viewDir, texColor, materialParams, ao);
        vec3 finalColor = mix(color, texColor, background);

        // light and selection adds up as postprocess
        vec3 result = mix(finalColor + lightColor, u_selectionOutlineColor, sel);

        fragColor = vec4(result, 1.0);
    }`
);

export const blur9 = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform vec2 u_direction;

    in vec2 v_texCoord;
    layout(location = 0) out vec4 fragColor;

    void main(void)
    {
        vec2 uv = v_texCoord;
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * u_direction;
        vec2 off2 = vec2(3.2307692308) * u_direction;
        color += texture(u_image, uv) * 0.2270270270;
        color += texture(u_image, uv + (off1 / u_resolution)) * 0.3162162162;
        color += texture(u_image, uv - (off1 / u_resolution)) * 0.3162162162;
        color += texture(u_image, uv + (off2 / u_resolution)) * 0.0702702703;
        color += texture(u_image, uv - (off2 / u_resolution)) * 0.0702702703;
        fragColor = color;
    }`
);

export const blurAlpha5 = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform vec2 u_direction;

    in vec2 v_texCoord;
    layout(location = 0) out vec4 fragColor;

    void main(void)
    {
        vec2 uv = v_texCoord;
        vec4 src = texture(u_image, uv);
        vec2 off1 = vec2(1.3333333333333333) * u_direction;
        float alpha = 0.0;
        alpha += src.a * 0.29411764705882354;
        alpha += texture(u_image, uv + (off1 / u_resolution)).a * 0.35294117647058826;
        alpha += texture(u_image, uv - (off1 / u_resolution)).a * 0.35294117647058826;
        src.a = alpha;
        fragColor = src;
    }`
);

export const blurShadowCube1 = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform samplerCube u_image;
    uniform float u_size;
    uniform mat4 u_rotation;

    in vec2 v_texCoord;
    layout(location = 0) out float result;

    float getTexture(vec2 uv) {
        vec3 pos = (u_rotation * vec4(uv * 2.0 - 1.0, 1.0, 1.0)).xyz;
        return texture(u_image, pos).r;
    }

    void main(void)
    {
        vec2 uv = v_texCoord;
        float src = getTexture(uv);
        vec2 off1 = vec2(1.3333333333333333, 0.0);
        float red = 0.0;
        red += src * 0.29411764705882354;
        red += getTexture(uv + (off1 / u_size)) * 0.35294117647058826;
        red += getTexture(uv - (off1 / u_size)) * 0.35294117647058826;
        result = red;
    }`
);

export const blurShadowCube2 = new ShaderProgram(
  screenQuadGeometry,
  `
    uniform sampler2D u_image;
    uniform float u_size;

    in vec2 v_texCoord;
    layout(location = 0) out float result;

    void main(void)
    {
        vec2 uv = v_texCoord;
        float src = texture(u_image, uv).r;
        vec2 off1 = vec2(0.0, 1.3333333333333333);
        float red = 0.0;
        red += src * 0.29411764705882354;
        red += texture(u_image, uv + (off1 / u_size)).r * 0.35294117647058826;
        red += texture(u_image, uv - (off1 / u_size)).r * 0.35294117647058826;
        result = red;
    }`
);

export const geometry = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_meshMatrix; // to render large objects in LCS
    uniform lowp mat4 u_textureMatrix;

    in vec4 a_position;
    in vec3 a_normal;
    in vec2 a_texcoord;

    out vec3 v_normal;
    out vec3 v_worldNormal;
    out vec3 v_position;
    out vec3 v_worldPosition;
    out vec2 v_texCoord;

    void main(void)
    {
        vec4 vertex4 = u_meshMatrix * a_position;
        vec3 normal = (u_meshMatrix * vec4(a_normal, 0.0)).xyz;
        v_worldNormal = normal;
        v_normal = (u_modelViewMatrix * vec4(normal, 0.0)).xyz;;
        v_worldPosition = vertex4.xyz;
        v_position = (u_modelViewMatrix * vertex4).xyz;
        gl_Position = u_transformMatrix * vertex4;
        v_texCoord = (u_textureMatrix * vec4(a_texcoord, 0.0, 1.0)).xy;
    }
    `,
  // fragment shader
  `
    uniform lowp vec4 color;
    uniform lowp float u_selection;
    uniform sampler2D u_texture;
    uniform lowp float u_opacity;
    uniform float u_materialIndex;
    uniform float u_frontFace;
    #ifdef REFLECTIONS
    uniform vec3 u_viewPos;
    uniform samplerCube u_environmentMap;
    uniform float u_reflection;
    #endif
    #ifdef BUMPMAP
    uniform sampler2D u_bumpMap;
    #endif

    in vec2 v_texCoord;
    in vec3 v_normal;
    in vec3 v_worldNormal;
    in vec3 v_position;
    in vec3 v_worldPosition;

    layout(location = 0) out vec4 fragColor;
    layout(location = 1) out vec4 fragNormal;

    mat3 cotangent_frame(vec3 N, vec3 p, vec2 uv)
    {
        // get edge vectors of the pixel triangle
        vec3 dp1 = dFdx(p);
        vec3 dp2 = dFdy(p);
        vec2 duv1 = dFdx(uv);
        vec2 duv2 = dFdy(uv);

        // solve the linear system
        vec3 dp2perp = cross(dp2, N);
        vec3 dp1perp = cross(N, dp1);
        vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
        vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

        // construct a scale-invariant frame
        float invmax = inversesqrt(max(dot(T,T), dot(B,B)));
        return mat3(T * invmax, B * invmax, N);
    }

    void main(void)
    {
        vec3 texColor = texture(u_texture, v_texCoord).xyz;
        vec3 selectionColor = vec3(0.0, 0.0, 1.0);
        vec3 color = mix(texColor, selectionColor, u_selection);

        #ifdef REFLECTIONS
        vec3 viewDir = u_viewPos - v_worldPosition;
        vec3 reflectDir = -reflect(viewDir, v_worldNormal);
        vec3 reflectionColor = texture(u_environmentMap, reflectDir).xyz;
        color = mix(color, reflectionColor, u_reflection);
        #endif
        fragColor = vec4(color, u_opacity);

        #ifdef BUMPMAP
        vec3 normal = normalize(v_normal);
        vec3 map = texture(u_bumpMap, v_texCoord ).xyz;
        map = map * 255./127. - 128./127.;
        mat3 TBN = cotangent_frame(normal, -v_position, v_texCoord);
        normal = normalize(TBN * map) * u_frontFace;
        fragNormal = vec4(normal * 0.5 + 0.5, u_materialIndex / 256.0);
        #else
        fragNormal = vec4(normalize(v_normal) * u_frontFace * 0.5 + 0.5, u_materialIndex / 256.0);
        #endif
    }
`
);

export const lightGeometry = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_meshMatrix;

    in vec4 a_position;
    in vec3 a_normal;
    in vec2 a_texcoord;

    void main(void)
    {
        vec4 vertex4 = u_meshMatrix * a_position;
        gl_Position = u_transformMatrix * vertex4;
    }
    `,
  // fragment shader
  `
    layout(location = 0) out vec4 fragColor;

    uniform vec3 u_lightColor;
    uniform float u_alpha;

    void main(void)
    {
        fragColor = vec4(u_lightColor, u_alpha);
    }
`
);

export const selectionGeometry = new ShaderProgram(
    // vertex shader
    `
      uniform mat4 u_transformMatrix;
      uniform mat4 u_meshMatrix;

      in vec4 a_position;
      in vec3 a_normal;
      in vec2 a_texcoord;

      void main(void)
      {
          vec4 vertex4 = u_meshMatrix * a_position;
          gl_Position = u_transformMatrix * vertex4;
      }
      `,
    // fragment shader
    `
      layout(location = 0) out vec4 fragColor;

      void main(void)
      {
          fragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
  `
  );

export const skybox = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_cameraMatrix;

    in vec3 a_position;
    out vec3 v_position;

    void main() {
        vec4 pos = vec4(a_position.xy, -1.0, 1.0);
        mat4 inverseProjection = inverse(u_projectionMatrix);
        mat3 inverseModelview = mat3(u_cameraMatrix);
        vec3 unprojected = (inverseProjection * pos).xyz;
        v_position = inverseModelview * unprojected;
        gl_Position = pos;
    }
    `,
  // fragment shader
  `
    uniform samplerCube u_skybox;

    in vec3 v_position;
    layout(location = 0) out vec4 fragColor;

    void main() {
        fragColor = texture(u_skybox, v_position);
    }
`
);

export const image = new ShaderProgram(
  // vertex shader
  `
    uniform vec2 u_pos;
    uniform vec2 u_size;

    in vec3 a_position;
    out vec2 a_uv;

    void main() {
        a_uv = a_position.xy * 0.5 + 0.5;
        gl_Position = vec4(u_pos + u_size * a_uv, 0.0, 1.0);
    }
    `,
  // fragment shader
  `
    uniform sampler2D u_image;

    in vec2 a_uv;
    layout(location = 0) out vec4 fragColor;

    void main() {
        //fragColor = vec4(texture(u_image, a_uv).xyz, 1.0);
        fragColor = vec4(texture(u_image, a_uv).a, 0.0, 0.0, 1.0);
    }
`
);

export const taa = new ShaderProgram(
    // vertex shader
    `
      uniform vec2 u_pos;
      uniform vec2 u_size;

      in vec3 a_position;
      out vec2 a_uv;

      void main() {
        a_uv = a_position.xy * 0.5 + 0.5;
        gl_Position = vec4( a_position.xy, 0.0, 1.0);
      }
      `,
    // fragment shader
    `
      uniform sampler2D u_image;
      uniform float u_factor;

      in vec2 a_uv;
      layout(location = 0) out vec4 fragColor;

      void main() {
        vec4 pixel = texture(u_image, a_uv);
        fragColor = vec4(pixel.xyz * u_factor, pixel.w);
      }
  `
  );

export const zfill = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_meshMatrix;

    in vec4 a_position;

    void main(void)
    {
        gl_Position = u_transformMatrix * u_meshMatrix * a_position;
    }
    `,
  // fragment shader
  `
    out vec4 fragColor;

    void main(void)
    {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
`
);

export const fxaa = new ShaderProgram(
  // vertex shader
  `
    // Attributes
    in vec4 a_vertex;
    uniform vec2 u_texelSize;

    // Output
    out vec2 v_uv;
    out vec2 sampleCoordS;
    out vec2 sampleCoordE;
    out vec2 sampleCoordN;
    out vec2 sampleCoordW;
    out vec2 sampleCoordNW;
    out vec2 sampleCoordSE;
    out vec2 sampleCoordNE;
    out vec2 sampleCoordSW;

    const vec2 madd = vec2(0.5, 0.5);

    void main(void) {
        v_uv = (a_vertex.xy * madd + madd);

        sampleCoordS = v_uv + vec2( 0.0, 1.0) * u_texelSize;
        sampleCoordE = v_uv + vec2( 1.0, 0.0) * u_texelSize;
        sampleCoordN = v_uv + vec2( 0.0,-1.0) * u_texelSize;
        sampleCoordW = v_uv + vec2(-1.0, 0.0) * u_texelSize;

        sampleCoordNW = v_uv + vec2(-1.0,-1.0) * u_texelSize;
        sampleCoordSE = v_uv + vec2( 1.0, 1.0) * u_texelSize;
        sampleCoordNE = v_uv + vec2( 1.0,-1.0) * u_texelSize;
        sampleCoordSW = v_uv + vec2(-1.0, 1.0) * u_texelSize;

        gl_Position = a_vertex;
    }
    `,

    `
    uniform sampler2D textureSampler;
    uniform vec2 u_texelSize;
    uniform float u_factor;

    in vec2 v_uv;
    in vec2 sampleCoordS;
    in vec2 sampleCoordE;
    in vec2 sampleCoordN;
    in vec2 sampleCoordW;
    in vec2 sampleCoordNW;
    in vec2 sampleCoordSE;
    in vec2 sampleCoordNE;
    in vec2 sampleCoordSW;

    layout(location = 0) out vec4 fragColor;

    const float fxaaQualitySubpix = 1.0;
    const float fxaaQualityEdgeThreshold = 0.166;
    const float fxaaQualityEdgeThresholdMin = 0.0833;
    const vec3 kLumaCoefficients = vec3(0.2126, 0.7152, 0.0722);

    #define FxaaLuma(rgba) dot(rgba.rgb, kLumaCoefficients)

    void main(){
        vec2 posM;

        posM.x = v_uv.x;
        posM.y = v_uv.y;

        vec4 rgbyM = texture(textureSampler, v_uv, 0.0);
        float lumaM = FxaaLuma(rgbyM);
        float lumaS = FxaaLuma(texture(textureSampler, sampleCoordS, 0.0));
        float lumaE = FxaaLuma(texture(textureSampler, sampleCoordE, 0.0));
        float lumaN = FxaaLuma(texture(textureSampler, sampleCoordN, 0.0));
        float lumaW = FxaaLuma(texture(textureSampler, sampleCoordW, 0.0));
        float maxSM = max(lumaS, lumaM);
        float minSM = min(lumaS, lumaM);
        float maxESM = max(lumaE, maxSM);
        float minESM = min(lumaE, minSM);
        float maxWN = max(lumaN, lumaW);
        float minWN = min(lumaN, lumaW);
        float rangeMax = max(maxWN, maxESM);
        float rangeMin = min(minWN, minESM);
        float rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;
        float range = rangeMax - rangeMin;
        float rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);

        if(range < rangeMaxClamped)
        {
            fragColor = rgbyM * u_factor;
            return;
        }

        float lumaNW = FxaaLuma(texture(textureSampler, sampleCoordNW, 0.0));
        float lumaSE = FxaaLuma(texture(textureSampler, sampleCoordSE, 0.0));
        float lumaNE = FxaaLuma(texture(textureSampler, sampleCoordNE, 0.0));
        float lumaSW = FxaaLuma(texture(textureSampler, sampleCoordSW, 0.0));
        float lumaNS = lumaN + lumaS;
        float lumaWE = lumaW + lumaE;
        float subpixRcpRange = 1.0 / range;
        float subpixNSWE = lumaNS + lumaWE;
        float edgeHorz1 = (-2.0 * lumaM) + lumaNS;
        float edgeVert1 = (-2.0 * lumaM) + lumaWE;
        float lumaNESE = lumaNE + lumaSE;
        float lumaNWNE = lumaNW + lumaNE;
        float edgeHorz2 = (-2.0 * lumaE) + lumaNESE;
        float edgeVert2 = (-2.0 * lumaN) + lumaNWNE;
        float lumaNWSW = lumaNW + lumaSW;
        float lumaSWSE = lumaSW + lumaSE;
        float edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);
        float edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);
        float edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;
        float edgeVert3 = (-2.0 * lumaS) + lumaSWSE;
        float edgeHorz = abs(edgeHorz3) + edgeHorz4;
        float edgeVert = abs(edgeVert3) + edgeVert4;
        float subpixNWSWNESE = lumaNWSW + lumaNESE;
        float lengthSign = u_texelSize.x;
        bool horzSpan = edgeHorz >= edgeVert;
        float subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;

        if (!horzSpan)
        {
            lumaN = lumaW;
        }

        if (!horzSpan)
        {
            lumaS = lumaE;
        }

        if (horzSpan)
        {
            lengthSign = u_texelSize.y;
        }

        float subpixB = (subpixA * (1.0 / 12.0)) - lumaM;
        float gradientN = lumaN - lumaM;
        float gradientS = lumaS - lumaM;
        float lumaNN = lumaN + lumaM;
        float lumaSS = lumaS + lumaM;
        bool pairN = abs(gradientN) >= abs(gradientS);
        float gradient = max(abs(gradientN), abs(gradientS));

        if (pairN)
        {
            lengthSign = -lengthSign;
        }

        float subpixC = clamp(abs(subpixB) * subpixRcpRange, 0.0, 1.0);
        vec2 posB;

        posB.x = posM.x;
        posB.y = posM.y;

        vec2 offNP;

        offNP.x = (!horzSpan) ? 0.0 : u_texelSize.x;
        offNP.y = (horzSpan) ? 0.0 : u_texelSize.y;

        if (!horzSpan)
        {
            posB.x += lengthSign * 0.5;
        }

        if (horzSpan)
        {
            posB.y += lengthSign * 0.5;
        }

        vec2 posN;

        posN.x = posB.x - offNP.x * 1.5;
        posN.y = posB.y - offNP.y * 1.5;

        vec2 posP;

        posP.x = posB.x + offNP.x * 1.5;
        posP.y = posB.y + offNP.y * 1.5;

        float subpixD = ((-2.0) * subpixC) + 3.0;
        float lumaEndN = FxaaLuma(texture(textureSampler, posN, 0.0));
        float subpixE = subpixC * subpixC;
        float lumaEndP = FxaaLuma(texture(textureSampler, posP, 0.0));

        if (!pairN)
        {
            lumaNN = lumaSS;
        }

        float gradientScaled = gradient * 1.0 / 4.0;
        float lumaMM = lumaM - lumaNN * 0.5;
        float subpixF = subpixD * subpixE;
        bool lumaMLTZero = lumaMM < 0.0;

        lumaEndN -= lumaNN * 0.5;
        lumaEndP -= lumaNN * 0.5;

        bool doneN = abs(lumaEndN) >= gradientScaled;
        bool doneP = abs(lumaEndP) >= gradientScaled;

        if (!doneN)
        {
            posN.x -= offNP.x * 3.0;
        }

        if (!doneN)
        {
            posN.y -= offNP.y * 3.0;
        }

        bool doneNP = (!doneN) || (!doneP);

        if (!doneP)
        {
            posP.x += offNP.x * 3.0;
        }

        if (!doneP)
        {
            posP.y += offNP.y * 3.0;
        }

        if (doneNP)
        {
            if (!doneN) lumaEndN = FxaaLuma(texture(textureSampler, posN.xy, 0.0));
            if (!doneP) lumaEndP = FxaaLuma(texture(textureSampler, posP.xy, 0.0));
            if (!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;
            if (!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;

            doneN = abs(lumaEndN) >= gradientScaled;
            doneP = abs(lumaEndP) >= gradientScaled;

            if (!doneN) posN.x -= offNP.x * 12.0;
            if (!doneN) posN.y -= offNP.y * 12.0;

            doneNP = (!doneN) || (!doneP);

            if (!doneP) posP.x += offNP.x * 12.0;
            if (!doneP) posP.y += offNP.y * 12.0;
        }

        float dstN = posM.x - posN.x;
        float dstP = posP.x - posM.x;

        if (!horzSpan)
        {
            dstN = posM.y - posN.y;
        }
        if (!horzSpan)
        {
            dstP = posP.y - posM.y;
        }

        bool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;
        float spanLength = (dstP + dstN);
        bool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;
        float spanLengthRcp = 1.0 / spanLength;
        bool directionN = dstN < dstP;
        float dst = min(dstN, dstP);
        bool goodSpan = directionN ? goodSpanN : goodSpanP;
        float subpixG = subpixF * subpixF;
        float pixelOffset = (dst * (-spanLengthRcp)) + 0.5;
        float subpixH = subpixG * fxaaQualitySubpix;
        float pixelOffsetGood = goodSpan ? pixelOffset : 0.0;
        float pixelOffsetSubpix = max(pixelOffsetGood, subpixH);

        if (!horzSpan)
        {
            posM.x += pixelOffsetSubpix * lengthSign;
        }

        if (horzSpan)
        {
            posM.y += pixelOffsetSubpix * lengthSign;
        }

        fragColor = texture(textureSampler, posM, 0.0) * u_factor;
    }
    `
);

export const forwardFill = new ShaderProgram(
    // vertex shader
    `
      uniform mat4 u_projectionMatrix;
      uniform mat4 u_modelViewMatrix;

      in vec4 a_position;
      in vec3 a_normal;
      in vec2 a_texcoord;

      out vec3 v_normal;
      out vec3 v_position;
      out vec2 v_texcoord;

      void main(void)
      {
          vec4 vertex4 = a_position;
          vec3 normal = a_normal.xyz;
          v_normal = (u_modelViewMatrix * vec4(normal, 0.0)).xyz;;
          vec4 position = u_modelViewMatrix * vertex4;
          v_position = position.xyz;
          gl_Position = u_projectionMatrix * position;
          v_texcoord = a_texcoord;
      }
      `,
    // fragment shader
    `
      uniform lowp vec4 color;
      uniform lowp float u_selection;
      uniform sampler2D u_texture;
      uniform lowp float u_opacity;
      uniform mediump mat4 u_textureMatrix;
      uniform vec3 u_viewPos;
      uniform vec4 u_materialParams;

      in vec2 v_texcoord;
      in vec3 v_normal;
      in vec3 v_position;

      out vec4 fragColor;

      ${computeLighting}

      void main(void)
      {
          vec2 texCoord = (u_textureMatrix * vec4(v_texcoord, 0.0, 1.0)).xy;
          vec3 texColor = texture(u_texture, texCoord).xyz;
          vec3 viewDir = normalize(-v_position);
          vec3 color = computeLighting(v_position, v_normal, viewDir, texColor, u_materialParams, 1.0);
          fragColor = vec4(color, u_opacity);
      }
  `
  );

  export const shadowMap = new ShaderProgram(
    // vertex shader
    `
      uniform mat4 u_projectionMatrix;
      uniform mat4 u_modelViewMatrix;

      in vec4 a_position;
      out vec3 v_cameraPos;

      void main(void)
      {
          vec4 cameraPos = u_modelViewMatrix * vec4(a_position.xyz, 1.0);
          vec4 projPos = u_projectionMatrix * cameraPos;
          gl_Position = projPos;
          v_cameraPos = cameraPos.xyz;
      }
      `,
    // fragment shader
    `
      uniform vec2 u_depthValues;

      in vec3 v_cameraPos;

      layout(location = 0) out float expDepth;

      void main(void)
      {
        float depth = length(v_cameraPos);
        depth = clamp((depth + u_depthValues.x) * u_depthValues.y - 0.002, 0.0, 1.0);
        expDepth = exp(87.0 * depth);
      }
  `
  );
