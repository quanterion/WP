export class ShaderProgram {
  vertex: string;
  fragment: string;
  constructor(vertex: string, fragment: string) {
    this.vertex = vertex;
    this.fragment = fragment;
  }
}

export const computeLighting = `
    #ifdef LIGHT_COUNT
    uniform vec3 u_lightPos[LIGHT_COUNT];
    // power, attenuation, specular, shininess
    uniform vec4 u_lightParams[LIGHT_COUNT];
    #endif

    #ifdef SHADOW_COUNT
    uniform mat4 u_cameraMatrix;
    uniform samplerCube u_shadowMaps[SHADOW_COUNT];
    uniform vec2 u_depthValues;

    float computeShadowWithESMCube(vec3 directionToLight, samplerCube shadowSampler, vec2 depthValues)
	{
		float depth = length(directionToLight);
        depth = (depth + depthValues.x) * depthValues.y;
        float shadowPixelDepth = clamp(depth, 0., 1.0);
    directionToLight = normalize(directionToLight);
    #ifdef WEBGL2
      float shadowMapSample = texture(shadowSampler, directionToLight).x;
    #else
      float shadowMapSample = textureCube(shadowSampler, directionToLight).x;
    #endif
		float esm = clamp(exp(-87.0 * shadowPixelDepth) * shadowMapSample, 0.0, 1.0);
		return esm;
    }
    #endif

    // lightParams = power, attenuation, specular, shininess
    // materialParams = ambient, specular, shininess, 0
    vec3 computeLightSource(vec3 pos, vec3 normal, vec3 lightPos, vec3 viewDir, vec4 lightParams, vec4 materialParams) {
        float distance = distance(lightPos, pos);
        vec3 lightDir = lightPos - pos;
        vec3 lightDirNorm = normalize(lightDir);
        float NdotD = abs(dot(normal, lightDirNorm));
        float falloff = 1.0 / (1.0 + lightParams[1] * distance * distance);
        float diffuse = NdotD * falloff * lightParams[0];

        float specular = clamp(diffuse * 1e6, 0.0, 1.0);
        vec3 H = normalize(viewDir + lightDirNorm);
        float NdotH = dot(normal, H);
        float specularIntensity = pow(max(NdotH, 0.0), materialParams.b * 127.0 + 1.0);
        specular *= specularIntensity * falloff * lightParams[0] * materialParams.g;
        float ambient = materialParams.r;
        return vec3(ambient, diffuse, specular);
    }

    vec3 computeLighting(vec3 pos, vec3 normal, vec3 viewDir, vec3 texColor, vec4 materialParams, float ao) {
        vec3 lighting = vec3(0.0);
        #ifdef LIGHT_COUNT
        #ifdef SHADOW_COUNT
        #define FIRST_LIGHT SHADOW_COUNT
        for(int i = 0; i < SHADOW_COUNT; i++) {
            vec3 curLight = computeLightSource(pos, normal, u_lightPos[i], viewDir, u_lightParams[i], materialParams);
            vec4 lightDir = u_cameraMatrix * vec4(pos, 1.0) - u_cameraMatrix * vec4(u_lightPos[i], 1.0);
            float shadow = computeShadowWithESMCube(lightDir.xyz, u_shadowMaps[i], u_depthValues);
            lighting.r += curLight.r;
            lighting.g += curLight.g * shadow;
            lighting.b += curLight.b * shadow;
        }
        #else
        #define FIRST_LIGHT 0
        #endif
        for(int i = FIRST_LIGHT; i < LIGHT_COUNT; i++) {
            vec3 curLight = computeLightSource(pos, normal, u_lightPos[i], viewDir, u_lightParams[i], materialParams);
            lighting += curLight;
        }
        #endif
        float ambient= lighting.r;
        float diffuse = lighting.g;
        float specular = lighting.b;
        diffuse = mix(ao, diffuse + ambient, 0.5);
        return texColor * diffuse + specular;
    }
`;

export const fill = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;

    attribute vec4 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;

    varying float v_lighting;
    varying vec3 v_normal;
    varying vec3 v_position;
    varying vec2 v_texcoord;

    void main(void)
    {
        vec4 vertex4 = u_meshMatrix * a_position;
        vec3 normal = (u_meshMatrix * vec4(a_normal, 0.0)).xyz;
        v_normal = (u_modelViewMatrix * vec4(normal, 0.0)).xyz;;
        v_position = (u_modelViewMatrix * vertex4).xyz;
        gl_Position = u_transformMatrix * vertex4;
        v_lighting = min(abs(dot(normal, u_viewDir)) + 0.4, 1.0);
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
    uniform vec4 u_materialParams;

    varying float v_lighting;
    varying vec2 v_texcoord;
    varying vec3 v_normal;
    varying vec3 v_position;

    ${computeLighting}

    void main(void)
    {
        vec3 cur_color = vec3(0.0, 1.0, 1.0);
        float ligtMapVal = v_lighting;
        vec2 texCoord = (u_textureMatrix * vec4(v_texcoord, 0.0, 1.0)).xy;
        vec3 texColor = texture2D(u_texture, texCoord).xyz;
        //vec3 texColor = vec3(0.4, 0.4, 0.6);
        vec3 selectionColor = vec3(0.0, 0.0, 1.0);
        vec3 color = mix(texColor, selectionColor, u_selection);

        vec3 viewDir = normalize(-v_position);
        color = computeLighting(v_position, v_normal, viewDir, color, u_materialParams, 1.0);
        gl_FragColor = vec4(color, u_opacity);
    }
`
);

export const colorFill = new ShaderProgram(
  // vertex shader
  fill.vertex,
  // fragment shader
  `
    uniform lowp vec4 u_color;

    void main(void)
    {
        gl_FragColor = u_color;
    }
`
);

export const navigatorCube = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;

    attribute vec4 a_position;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;

    varying float v_lighting;
    varying vec3 v_normal;
    varying vec3 v_position;
    varying vec2 v_texcoord;

    void main(void)
    {
        vec4 vertex4 = u_meshMatrix * a_position;
        vec3 normal = (u_meshMatrix * vec4(a_normal, 0.0)).xyz;
        gl_Position = u_transformMatrix * vertex4;
        v_lighting = min(abs(dot(normal, u_viewDir)) + 0.4, 1.0);
        v_texcoord = a_texcoord;
    }
    `,
  // fragment shader
  `
    uniform lowp vec4 u_color;
    uniform sampler2D u_texture;
    uniform float u_useTexture;

    varying vec2 v_texcoord;

    void main(void)
    {
      vec2 texCoord = v_texcoord;
      texCoord.y = -texCoord.y;
      vec4 texColor = texture2D(u_texture, texCoord);
      const float pi = 3.141592653589793238462643383279502884197169;
      float shading = pow(abs(sin(4.0 * pi * texCoord.x) * sin(2.0 * pi * texCoord.y)), 0.4);
      float hasColor = float(min(texColor.x, texColor.y) < 0.7);
      texColor = texColor * shading;
      texColor.a = max(0.2, hasColor);
      gl_FragColor = mix(u_color, texColor, u_useTexture);
    }
`
);

export const wireframe = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;

    attribute vec4 a_position;
    //attribute vec3 a_normal;


    void main(void)
    {
        vec4 vertex4 = u_meshMatrix * a_position;
        //vec3 normal = (u_meshMatrix * vec4(a_normal, 0.0)).xyz;
        gl_Position = u_transformMatrix * vertex4;
    }
    `,
  // fragment shader
  `
    precision mediump float;
    uniform lowp vec3 u_color;
    uniform lowp float u_selection;

    void main(void)
    {
        gl_FragColor = vec4(u_color, 1.0);
    }
`
);

export const line = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform vec4 u_viewport;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;
    uniform float u_lineWidth;

    attribute vec4 a_data; // x, y - pos, z, w - tangent
    attribute vec4 a_color;

    varying vec2 v_tangent; // varies its length from -1 to +1
    varying float v_lineWidth;
    varying vec4 v_color;

    vec2 ndcToScreen(vec4 ndc) {
        return vec2((ndc.x + 1.0) * u_viewport[2] / 2.0,
            (ndc.y + 1.0) * u_viewport[3] / 2.0);
    }

    void main(void)
    {
        vec4 vertex = vec4(a_data.xy, 0, 1);
        v_tangent = a_data.zw;
        v_color = a_color;
        v_lineWidth = length(v_tangent);
        v_tangent /= v_lineWidth;
        vec4 tangent = vec4(a_data.zw, 0, 0);
        vec4 offsetPosition = vertex + tangent;

        vertex = u_meshMatrix * vertex;
        offsetPosition = u_meshMatrix * offsetPosition;

        vec4 projectedPosition = u_transformMatrix * vertex;
        vec4 projectedOffsetPosition = u_transformMatrix * offsetPosition;

        float wp = projectedPosition.w;
        projectedPosition = projectedPosition / wp;
        float w = projectedOffsetPosition.w;
        projectedOffsetPosition = projectedOffsetPosition / projectedOffsetPosition.w;
        vec2 screenPosition = ndcToScreen(projectedPosition);
        vec2 screenOffsetPosition = ndcToScreen(projectedOffsetPosition);

        vec2 projectedTangent = screenOffsetPosition - screenPosition;
        // Add a small offset to the divisor here to avoid division by zero.
        float scale = v_lineWidth / (length(projectedTangent) + 0.00001);
        vec2 projectedNormal = vec2(projectedTangent.y, -projectedTangent.x) * scale;
        screenPosition += projectedNormal;

        projectedPosition.x = (2.0 * screenPosition.x / u_viewport[2]) - 1.0;
        projectedPosition.y = (2.0 * screenPosition.y / u_viewport[3]) - 1.0;
        // Do I really need to scale vector back into projected space for correct clipping???
        gl_Position = projectedPosition * wp;
    }
    `,
  // fragment shader
  `
    uniform float u_lineWidth;

    varying vec2 v_tangent; // varies its length from -1 to +1
    varying float v_lineWidth;
    varying vec4 v_color;

    void main(void)
    {
        float dist = length(v_tangent) * v_lineWidth;
        float alpha = max(v_lineWidth - dist, 1.5) / 1.5;
        vec4 color = v_color;
        color.a *= alpha;
        gl_FragColor = color;
    }
`
);

export const floodfill = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;

    attribute vec4 a_position;
    attribute vec4 a_color;

    varying vec4 v_color;

    void main(void)
    {
        v_color = a_color;
        gl_Position = u_transformMatrix * u_meshMatrix * a_position;
    }
    `,
  // fragment shader
  `
    precision mediump float;

    varying vec4 v_color;

    void main(void)
    {
        gl_FragColor = v_color;
    }
`
);

export const text = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_transformMatrix;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_meshMatrix;
    uniform vec3 u_viewDir;

    attribute vec2 a_texcoord;
    attribute vec4 a_position;
    attribute vec4 a_color;

    varying vec2 vUv;
    varying vec4 v_color;

    void main(void)
    {
        vUv = a_texcoord;
        v_color = a_color;
        gl_Position = u_transformMatrix * u_meshMatrix * a_position;
    }
    `,
  // fragment shader
  `
    precision mediump float;

    uniform sampler2D u_texture;

    varying vec2 vUv;
    varying vec4 v_color;

    float contour(in float d, in float w) {
        return smoothstep(0.47 - w, 0.47 + w, d);
    }

    float samp(in vec2 uv, float w) {
        return contour(texture2D(u_texture, uv).a, w);
    }

    void main(void)
    {
        float dist = texture2D(u_texture, vUv).a;
        float width = 0.17;
        float alpha = contour( dist, width );

        vec4 color = v_color;
        color.a *= alpha;
        gl_FragColor = color;
    }
`
);

export const skybox = new ShaderProgram(
  // vertex shader
  `
    uniform mat4 u_invProjectionMatrix;
    uniform mat4 u_cameraMatrix;

    attribute vec3 a_position;
    varying vec3 v_position;

    void main() {
        vec4 pos = vec4(a_position.xy, -1.0, 1.0);
        mat3 inverseModelview = mat3(u_cameraMatrix);
        vec3 unprojected = (u_invProjectionMatrix * pos).xyz;
        v_position = inverseModelview * unprojected;
        gl_Position = pos;
    }
    `,
  // fragment shader
  `
    uniform samplerCube u_skybox;
    varying vec3 v_position;
    void main() {
        gl_FragColor = textureCube(u_skybox, v_position);
    }
`
);

export const combine = new ShaderProgram(
    // vertex shader
    `
      uniform mat4 u_invProjectionMatrix;
      uniform mat4 u_cameraMatrix;

      attribute vec3 a_position;
      varying vec2 v_position;

      void main() {
          vec4 pos = vec4(a_position.xy, -1.0, 1.0);
          v_position = a_position.xy * 0.5 + 0.5;
          gl_Position = vec4(a_position.xy, -1.0, 1.0);;
      }
    `,
    // fragment shader
    `
      uniform sampler2D u_lightAndSelection;
      varying vec2 v_position;

      // 0.001 if compensate color shift with alpha, 1.0 if none
      uniform float u_colorCompensation;
      uniform float u_alphaCompensation;

      void main() {
          vec4 color = texture2D(u_lightAndSelection, v_position);
          color.rgb /= max(u_colorCompensation, color.a);
          float sel = color.a;
          sel = max(0.0, -4.0 * sel * sel + 4.0 * sel);
          color.a = mix(color.a, pow(sel, 2.0), u_alphaCompensation);
          gl_FragColor = color;
      }
  `
  );

  export const blur9 = new ShaderProgram(
    `
    uniform mat4 u_invProjectionMatrix;
    uniform mat4 u_cameraMatrix;

    attribute vec3 a_position;
    varying vec2 v_texCoord;

    void main() {
        vec4 pos = vec4(a_position.xy, -1.0, 1.0);
        v_texCoord = a_position.xy * 0.5 + 0.5;
        gl_Position = vec4(a_position.xy, -1.0, 1.0);;
    }
    `,

    `
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform vec2 u_direction;

      varying vec2 v_texCoord;

      void main(void)
      {
          vec2 uv = v_texCoord;
          vec4 color = vec4(0.0);
          vec2 off1 = vec2(1.3846153846) * u_direction;
          vec2 off2 = vec2(3.2307692308) * u_direction;
          color += texture2D(u_image, uv) * 0.2270270270;
          color += texture2D(u_image, uv + (off1 / u_resolution)) * 0.3162162162;
          color += texture2D(u_image, uv - (off1 / u_resolution)) * 0.3162162162;
          color += texture2D(u_image, uv + (off2 / u_resolution)) * 0.0702702703;
          color += texture2D(u_image, uv - (off2 / u_resolution)) * 0.0702702703;
          gl_FragColor = color;
      }`
  );

  export const sunsky = new ShaderProgram(
    // vertex shader
    `
    uniform mat4 u_invProjectionMatrix;
    uniform mat4 u_cameraMatrix;

    attribute vec3 a_position;

    uniform vec3 u_sunPosition;
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;
    const vec3 up = vec3( 0.0, 1.0, 0.0 );
    const float e = 2.71828182845904523536028747135266249775724709369995957;
    const float pi = 3.141592653589793238462643383279502884197169;
    const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
    const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );
    const float v = 4.0;
    const vec3 K = vec3( 0.686, 0.678, 0.666 );
    const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );
    const float cutoffAngle = 1.6110731556870734;
    const float steepness = 1.5;
    const float EE = 1000.0;
    float sunIntensity( float zenithAngleCos ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
    }
    vec3 totalMie( float T ) {
        float c = ( 0.2 * T ) * 10E-18;
        return 0.434 * c * MieConst;
    }
    void main() {
        float rayleigh = 2.0;
        float turbidity = 10.0;
        float mieCoefficient = 0.005;

        vec4 pos = vec4(a_position.x, a_position.y + 0.15, -1.0, 1.0);
        mat3 inverseModelview = mat3(u_cameraMatrix);
        vec3 unprojected = (u_invProjectionMatrix * pos).xyz;
        vec4 worldPosition = vec4(inverseModelview * unprojected, 1.0 );
        vWorldPosition = worldPosition.xyz;
        gl_Position = vec4(a_position.xy, -1.0, 1.0);

        vec3 sunPosition = u_sunPosition;
        vSunDirection = normalize(sunPosition);
        vSunE = sunIntensity( dot( vSunDirection, up ) );
        vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );
        float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );
        vBetaR = totalRayleigh * rayleighCoefficient;
        vBetaM = totalMie( turbidity ) * mieCoefficient;
    }
      `,
    // fragment shader
    `
    uniform float u_luminance;
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;
    const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );
    const float pi = 3.141592653589793238462643383279502884197169;
    const float n = 1.0003;
    const float N = 2.545E25;
    const float rayleighZenithLength = 8.4E3;
    const float mieZenithLength = 1.25E3;
    const vec3 up = vec3( 0.0, 1.0, 0.0 );
    const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
    const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
    const float ONE_OVER_FOURPI = 0.07957747154594767;
    float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
    }
    float hgPhase( float cosTheta, float g ) {
        float g2 = pow( g, 2.0 );
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
        return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
    }
    const float A = 0.15;
    const float B = 0.50;
    const float C = 0.10;
    const float D = 0.20;
    const float E = 0.02;
    const float F = 0.30;
    const float whiteScale = 1.0748724675633854;
    vec3 Uncharted2Tonemap( vec3 x ) {
        return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;
    }
    void main() {
        float mieDirectionalG = 0.8;

        float zenithAngle = acos( max( 0.0, dot( up, normalize( vWorldPosition - cameraPos ) ) ) );
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;
        vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );
        float cosTheta = dot( normalize( vWorldPosition - cameraPos ), vSunDirection );
        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;
        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;
        vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        Lin *= mix(vec3( 1.0 ),
            pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ),
            clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );
        vec3 direction = normalize( vWorldPosition - cameraPos );
        float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
        float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
        vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
        vec3 L0 = vec3( 0.1 ) * Fex;
        float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
        L0 += ( vSunE * 19000.0 * Fex ) * sundisk;
        vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
        vec3 curr = Uncharted2Tonemap( ( log2( 2.0 / pow( u_luminance, 4.0 ) ) ) * texColor );
        vec3 color = curr * whiteScale;
        vec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
        gl_FragColor = vec4( retColor, 1.0 );
    }
  `
  );
