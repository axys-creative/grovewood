import type { Attachment } from 'svelte/attachments';

type Palette = { base: string; highlight: string };

export type BgDustOptions = {
	/** Covers the whole screen and follows it, instead of covering this element. Meant for `<body>`. */
	fixed?: boolean;
	/** The two colors of each theme: the field, and the glow that drifts across it. Any CSS color. */
	colors?: { dark?: Partial<Palette>; light?: Partial<Palette> };
	/** `follow` matches the site's theme (the `data-theme` on `<html>`), or pin it to one. */
	theme?: 'follow' | 'dark' | 'light';
	/** Changes theme as the page scrolls, to match each element with `data-bg-theme="light"` or `"dark"`. */
	sections?: boolean;
	/** The pace of everything that moves. `0` freezes it, `1` is slow. */
	motionSpeed?: number;
	/** Seconds the glow takes to fade in on load. */
	fadeIn?: number;
	/** The soft moving glows. */
	lobes?: {
		/** How many, 1-4. */
		count?: number;
		/** How far each wanders from where it started. */
		drift?: number;
		/** The average size of a glow. */
		radius?: number;
		/** How much each glow's size varies, plus or minus. */
		radiusVariance?: number;
		/** The lowest brightness a glow dips to. `0` lets it vanish. */
		formMin?: number;
	};
	/** Stationary rings that cut the glow into bands. */
	ripple?: {
		enabled?: boolean;
		centerX?: number;
		/** Above the top edge is positive. */
		centerY?: number;
		/** The distance between rings. */
		spacing?: number;
		/** How far the glow jumps at each ring. */
		shift?: number;
		cycles?: number;
	};
	/** The fine sparkle that drifts through the glow. */
	turbulence?: {
		speed?: number;
		/** Higher is finer. */
		scale?: number;
		intensity?: number;
		curl?: number;
		curlScale?: number;
	};
	/** How the pointer pushes the glow and lights the field under it. */
	mouse?: {
		/** How close a glow must be to be pushed. */
		radius?: number;
		/** The size of the light under the pointer. */
		glowRadius?: number;
		/** How far glows are pushed the way the pointer travels. */
		push?: number;
		/** The extra brightness under the pointer. */
		glowBoost?: number;
		/** Easing toward the pointer, per frame. Lower is smoother and slower. */
		positionSmoothing?: number;
		/** Easing for the effect fading in and out as the pointer enters and leaves. */
		influenceSmoothing?: number;
		/** The pointer speed at which the push is strongest. */
		velocityReference?: number;
		/** Easing as the pointer speeds up. */
		velocityAttack?: number;
		/** Easing as the pointer slows. Lower lingers longer. */
		velocityRelease?: number;
		/** Lets the pointer push the sparkle too, with a trail behind it. */
		sparkle?: boolean;
		/** The size of the sparkle's push zone. */
		sparkleRadius?: number;
		sparklePush?: number;
		sparkleTrail?: number;
		/** How far behind the pointer the trail runs, as a multiple of the zone. */
		sparkleTrailLength?: number;
		/** How ragged the edge of the zone is. */
		sparkleEdgeNoise?: number;
		/** The pointer pulls in at the front and pushes at the back, instead of the other way. */
		sparkleSwap?: boolean;
		/** Easing of the sparkle's direction. Lower keeps momentum longer. */
		sparkleDirectionSmoothing?: number;
	};
	/** A soft diagonal shadow. */
	crease?: { angle?: number; offset?: number; width?: number; strength?: number };
	/** Darkens the edges. */
	vignette?: { start?: number; end?: number; strength?: number };
	/** The film grain, from 0 up. */
	grain?: number;
};

const DEFAULTS = {
	fixed: false,
	colors: {
		dark: { base: '#040d1f', highlight: '#3d5f8a' },
		light: { base: '#f8fbfc', highlight: '#39a2d7' }
	},
	theme: 'follow' as const,
	sections: false,
	motionSpeed: 3.5,
	fadeIn: 3,
	lobes: { count: 3, drift: 0.46, radius: 0.3, radiusVariance: 0.14, formMin: 0.12 },
	ripple: { enabled: true, centerX: 0, centerY: 1.4, spacing: 0.18, shift: 0.85, cycles: 1 },
	turbulence: { speed: 0.0075, scale: 520, intensity: 0.08, curl: 0.5, curlScale: 3.5 },
	mouse: {
		radius: 0.35,
		glowRadius: 0.25,
		push: 0.14,
		glowBoost: 0.12,
		positionSmoothing: 0.08,
		influenceSmoothing: 0.05,
		velocityReference: 1.2,
		velocityAttack: 0.15,
		velocityRelease: 0.03,
		sparkle: false,
		sparkleRadius: 0.3,
		sparklePush: 0.08,
		sparkleTrail: 0.06,
		sparkleTrailLength: 1.8,
		sparkleEdgeNoise: 0.35,
		sparkleSwap: false,
		sparkleDirectionSmoothing: 0.08
	},
	crease: { angle: -20, offset: 0.08, width: 0.24, strength: 0.12 },
	vignette: { start: 0.15, end: 0.95, strength: 0.55 },
	grain: 0.035
};

const MAX_LOBES = 4;
const THEME_SPEED = 0.04;

const VERTEX = `
attribute vec2 aPos;
void main() {
	gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
  precision highp float;
  #define MAX_LOBES 4

  uniform vec2 uResolution;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uTime;

  uniform vec2 uLobeBasePos[MAX_LOBES];
  uniform vec2 uLobeDriftFreq[MAX_LOBES];
  uniform vec2 uLobePhase[MAX_LOBES];
  uniform float uLobeDriftAmp[MAX_LOBES];
  uniform float uLobeRadius[MAX_LOBES];
  uniform float uLobeFormFreq[MAX_LOBES];
  uniform float uLobeFormPhase[MAX_LOBES];
  uniform float uLobeFormMin;
  uniform int uLobeCount;
  uniform float uLoadFadeIn;

  uniform vec2 uRippleCenter;
  uniform float uRippleSpacing;
  uniform float uRippleShift;
  uniform float uRippleCycleCount;
  uniform float uRippleEnabled;

  uniform vec2 uMousePos;
  uniform float uMouseInfluence;
  uniform float uMouseRadius;
  uniform float uMouseGlowRadius;
  uniform float uMousePushStrength;
  uniform float uMouseGlowBoost;
  uniform vec2 uMouseVelocityDir;
  uniform vec2 uMouseTurbDir;
  uniform float uMouseVelocityFactor;
  uniform float uMouseTurbVelocityFactor;

  uniform float uCreaseAngle;
  uniform float uCreaseOffset;
  uniform float uCreaseWidth;
  uniform float uCreaseStrength;
  uniform float uVignetteStart;
  uniform float uVignetteEnd;
  uniform float uVignetteStrength;
  uniform float uGrainIntensity;

  uniform float uTurbSpeed;
  uniform float uTurbScale;
  uniform float uTurbIntensity;
  uniform float uTurbCurlAmount;
  uniform float uTurbCurlScale;
  uniform float uMouseTurbRadius;
  uniform float uMouseTurbPushStrength;
  uniform float uMouseTurbTrailStrength;
  uniform float uMouseTurbTrailLength;
  uniform float uMouseTurbEdgeNoise;
  uniform float uMouseTurbSwap;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Smoothly-interpolated noise — unlike raw hash(), this has spatial
  // continuity (soft blobs instead of per-cell static), which is what
  // lets a coordinate push actually read as visible motion.
  float valueNoise(vec2 coord) {
    vec2 i = floor(coord);
    vec2 f = fract(coord);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }


  void main() {
    // Centered, aspect-normalized coordinate space
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

    // Stationary ripple warp — only used for lobe glow sampling below,
    // nothing else. The shift cycles through a small number of states
    // (bounded via mod) rather than growing with raw ring index — an
    // unbounded shift at high ring counts was pushing the sample position
    // miles away from every lobe, collapsing glow to zero everywhere.
    vec2 rippleToPixel = p - uRippleCenter;
    float rippleDist = length(rippleToPixel);
    vec2 rippleDir = rippleDist > 0.0001 ? rippleToPixel / rippleDist : vec2(0.0, 1.0);
    float rippleRingIndex = floor(rippleDist / uRippleSpacing);
    float rippleCycle = mod(rippleRingIndex, uRippleCycleCount);
    vec2 pRippled = p + rippleDir * rippleCycle * uRippleShift * uRippleEnabled;

    // Accumulate drifting, forming/dissolving lobes
    float totalLobe = 0.0;
    for (int i = 0; i < MAX_LOBES; i++) {
      if (i >= uLobeCount) break;

      vec2 pos = uLobeBasePos[i] + uLobeDriftAmp[i] * vec2(
        sin(uTime * uLobeDriftFreq[i].x + uLobePhase[i].x),
        cos(uTime * uLobeDriftFreq[i].y + uLobePhase[i].y)
      );

      // Push this lobe in the direction of cursor travel — only while moving
      float mDist = length(pos - uMousePos);
      float mProximity = smoothstep(uMouseRadius, 0.0, mDist) * uMouseInfluence;
      float mPush = mProximity * uMouseVelocityFactor;
      pos += uMouseVelocityDir * mPush * uMousePushStrength;

      float pulse = 0.5 + 0.5 * sin(uTime * uLobeFormFreq[i] + uLobeFormPhase[i]);
      float envelope = mix(uLobeFormMin, 1.0, pulse * sqrt(pulse));

      float d = length(pRippled - pos);
      float g = exp(-(d * d) / (2.0 * uLobeRadius[i] * uLobeRadius[i]));

      totalLobe += g * envelope;
    }

    // Soft clamp so overlapping lobes don't blow out to flat white
    // Fades from 0 to 1 over the first 0.5s on load — cascades naturally to
    // turbulence too, since it's masked by this same glow value.
    float glow = (1.0 - exp(-totalLobe)) * uLoadFadeIn;
    vec3 color = mix(uBaseColor, uHighlightColor, clamp(glow, 0.0, 1.0));

    // Direct brightness boost right under the cursor
    float mouseGlowDist = length(p - uMousePos);
    float mouseGlowFalloff = exp(-(mouseGlowDist * mouseGlowDist) / (2.0 * uMouseGlowRadius * uMouseGlowRadius)) * uMouseInfluence;
    color += uHighlightColor * uMouseGlowBoost * mouseGlowFalloff;

    // Diagonal crease / shadow sweep (static)
    float rad = radians(uCreaseAngle);
    float ca = cos(rad);
    float sa = sin(rad);
    float along = p.x * ca - p.y * sa;
    float crease = smoothstep(uCreaseOffset, uCreaseOffset + uCreaseWidth, along)
                 * (1.0 - smoothstep(uCreaseOffset + uCreaseWidth, uCreaseOffset + uCreaseWidth * 2.2, along));
    color -= crease * uCreaseStrength;

    // Vignette
    float r = length(p);
    float vig = 1.0 - uVignetteStrength * smoothstep(uVignetteStart, uVignetteEnd, r);
    color *= vig;

    // Flowing turbulence — fine sparkle drifting left-to-right, masked to
    // only show up where it's already lit (glow), matching the reference.
    // Repelled from the cursor, but only in front of its travel direction
    // (not a full circle), and only while actually moving — resting the
    // cursor shows nothing at all. A trailing wake behind the cursor does
    // the inverse (pulls grain toward the path instead of away).
    vec2 turbP = p;
    vec2 toPoint = p - uMousePos;
    float turbMDist = length(toPoint);
    vec2 turbRepelDir = turbMDist > 0.0001 ? toPoint / turbMDist : vec2(0.0, 1.0);
    float travelDot = dot(turbRepelDir, uMouseTurbDir); // 1 = directly ahead, -1 = directly behind

    // Perturb the radius by angle (and slowly over time) so the boundary
    // reads as an organic, irregular blob instead of a clean geometric arc.
    float edgeN = valueNoise(turbRepelDir * 4.0 + vec2(uTime * 0.08, 17.0)) * 2.0 - 1.0;
    float frontRadius = uMouseTurbRadius * (1.0 + edgeN * uMouseTurbEdgeNoise);
    float trailRadius = frontRadius * uMouseTurbTrailLength;

    float frontWeight = max(0.0, travelDot);
    float trailWeight = max(0.0, -travelDot);

    // Single smooth falloff per zone, no plateau — avoids the banding from before.
    float frontProximity = smoothstep(frontRadius, 0.0, turbMDist) * frontWeight * uMouseInfluence;
    float trailProximity = smoothstep(trailRadius, 0.0, turbMDist) * trailWeight * uMouseInfluence;

    // Velocity-gated — zero at rest, so the effect only appears while moving.
    float frontPush = frontProximity * uMouseTurbVelocityFactor;
    float trailPull = trailProximity * uMouseTurbVelocityFactor;

    // Hard safety cap on both: the displacement can never exceed a fraction
    // of the pixel's actual distance to the cursor, so the sample point can
    // never overshoot past it and fold/mirror — that overshoot was the
    // exact mechanism behind the lensing/pinching layers before.
    float safeFrontAmount = min(uMouseTurbPushStrength, turbMDist * 0.8) * frontPush;
    float safeTrailAmount = min(uMouseTurbTrailStrength, turbMDist * 0.8) * trailPull;

    // Front normally pushes away (subtract), trail normally pulls in (add).
    // uMouseTurbSwap flips both signs, swapping which zone does which,
    // without touching the geometry (radii, shape, edge noise) at all.
    float frontSign = uMouseTurbSwap > 0.5 ? 1.0 : -1.0;
    float trailSign = uMouseTurbSwap > 0.5 ? -1.0 : 1.0;
    turbP += turbRepelDir * (safeFrontAmount * frontSign + safeTrailAmount * trailSign);

    vec2 flowCoord = turbP * uTurbScale;
    flowCoord.x -= uTime * uTurbSpeed * uTurbScale;
    flowCoord.y += sin(turbP.x * uTurbCurlScale + uTime * uTurbSpeed * 0.6) * uTurbCurlAmount * uTurbScale;
    float turb = valueNoise(flowCoord);

    color += vec3(turb) * uTurbIntensity * glow;

    // Static film grain
    float n = hash(gl_FragCoord.xy);
    color += (n - 0.5) * uGrainIntensity;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

const random = (min: number, max: number) => min + Math.random() * (max - min);

// Any CSS color to 0-1 red, green and blue, by letting the browser paint one pixel of it.
let swatch: CanvasRenderingContext2D | null | undefined;
function toRgb(color: string): [number, number, number] {
	swatch ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
	if (!swatch) return [0, 0, 0];
	swatch.clearRect(0, 0, 1, 1);
	swatch.fillStyle = '#000';
	swatch.fillStyle = color;
	swatch.fillRect(0, 0, 1, 1);
	const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
	return [r / 255, g / 255, b / 255];
}

/**
 * A moving, grainy light field behind an element, drawn on the GPU: soft glows drift, form and dissolve, a fine
 * sparkle flows through them, and the pointer pushes them along. It follows the site's light and dark theme. It only
 * runs while the element is on screen, and with reduced motion it draws one still frame.
 */
export function bgDust(options: BgDustOptions = {}): Attachment<HTMLElement> {
	return (host) => {
		const config = {
			...DEFAULTS,
			...options,
			colors: {
				dark: { ...DEFAULTS.colors.dark, ...options.colors?.dark },
				light: { ...DEFAULTS.colors.light, ...options.colors?.light }
			},
			lobes: { ...DEFAULTS.lobes, ...options.lobes },
			ripple: { ...DEFAULTS.ripple, ...options.ripple },
			turbulence: { ...DEFAULTS.turbulence, ...options.turbulence },
			mouse: { ...DEFAULTS.mouse, ...options.mouse },
			crease: { ...DEFAULTS.crease, ...options.crease },
			vignette: { ...DEFAULTS.vignette, ...options.vignette }
		};
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
		if (!gl) return;

		canvas.setAttribute('aria-hidden', 'true');
		Object.assign(canvas.style, {
			position: config.fixed ? 'fixed' : 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			zIndex: '-1',
			pointerEvents: 'none'
		});

		// The canvas sits behind the element's content but above its own background, which needs a stacking
		// context to hold it, and a position to be placed against.
		const previous = { position: host.style.position, isolation: host.style.isolation };
		if (!config.fixed) {
			if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
			host.style.isolation = 'isolate';
		}
		host.prepend(canvas);

		const compile = (type: number, source: string) => {
			const shader = gl.createShader(type)!;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			return shader;
		};
		const program = gl.createProgram()!;
		gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			canvas.remove();
			return;
		}
		gl.useProgram(program);

		// One big triangle covers the screen with fewer vertices than a quad.
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, 'aPos');
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

		const locations: Record<string, WebGLUniformLocation | null> = {};
		const at = (name: string) => (locations[name] ??= gl.getUniformLocation(program, name));
		const one = (name: string, value: number) => gl.uniform1f(at(name), value);
		const two = (name: string, x: number, y: number) => gl.uniform2f(at(name), x, y);

		// Each glow gets its own random path and rhythm, made once, so they wander and pulse out of step.
		const lobes = (() => {
			const out = {
				base: new Float32Array(MAX_LOBES * 2),
				freq: new Float32Array(MAX_LOBES * 2),
				phase: new Float32Array(MAX_LOBES * 2),
				amp: new Float32Array(MAX_LOBES),
				radius: new Float32Array(MAX_LOBES),
				formFreq: new Float32Array(MAX_LOBES),
				formPhase: new Float32Array(MAX_LOBES)
			};
			for (let i = 0; i < MAX_LOBES; i++) {
				out.base[i * 2] = random(-0.32, 0.32);
				out.base[i * 2 + 1] = random(-0.28, 0.28);
				out.freq[i * 2] = random(0.08, 0.22);
				out.freq[i * 2 + 1] = random(0.08, 0.22);
				out.phase[i * 2] = random(0, Math.PI * 2);
				out.phase[i * 2 + 1] = random(0, Math.PI * 2);
				out.amp[i] = config.lobes.drift * random(0.7, 1.3);
				out.radius[i] = config.lobes.radius + random(-1, 1) * config.lobes.radiusVariance;
				out.formFreq[i] = random(0.05, 0.14);
				out.formPhase[i] = random(0, Math.PI * 2);
			}
			return out;
		})();

		const palette = {
			dark: {
				base: toRgb(config.colors.dark.base),
				highlight: toRgb(config.colors.dark.highlight)
			},
			light: {
				base: toRgb(config.colors.light.base),
				highlight: toRgb(config.colors.light.highlight)
			}
		};

		const { mouse: m } = config;
		gl.uniform2fv(at('uLobeBasePos[0]'), lobes.base);
		gl.uniform2fv(at('uLobeDriftFreq[0]'), lobes.freq);
		gl.uniform2fv(at('uLobePhase[0]'), lobes.phase);
		gl.uniform1fv(at('uLobeDriftAmp[0]'), lobes.amp);
		gl.uniform1fv(at('uLobeRadius[0]'), lobes.radius);
		gl.uniform1fv(at('uLobeFormFreq[0]'), lobes.formFreq);
		gl.uniform1fv(at('uLobeFormPhase[0]'), lobes.formPhase);
		one('uLobeFormMin', config.lobes.formMin);
		gl.uniform1i(at('uLobeCount'), Math.min(Math.max(config.lobes.count, 1), MAX_LOBES));
		two('uRippleCenter', config.ripple.centerX, config.ripple.centerY);
		one('uRippleSpacing', config.ripple.spacing);
		one('uRippleShift', config.ripple.shift);
		one('uRippleCycleCount', config.ripple.cycles);
		one('uRippleEnabled', config.ripple.enabled ? 1 : 0);
		one('uMouseRadius', m.radius);
		one('uMouseGlowRadius', m.glowRadius);
		one('uMousePushStrength', m.push);
		one('uMouseGlowBoost', m.glowBoost);
		one('uCreaseAngle', config.crease.angle);
		one('uCreaseOffset', config.crease.offset);
		one('uCreaseWidth', config.crease.width);
		one('uCreaseStrength', config.crease.strength);
		one('uVignetteStart', config.vignette.start);
		one('uVignetteEnd', config.vignette.end);
		one('uVignetteStrength', config.vignette.strength);
		one('uGrainIntensity', config.grain);
		one('uTurbSpeed', config.turbulence.speed);
		one('uTurbScale', config.turbulence.scale);
		one('uTurbIntensity', config.turbulence.intensity);
		one('uTurbCurlAmount', config.turbulence.curl);
		one('uTurbCurlScale', config.turbulence.curlScale);
		one('uMouseTurbRadius', m.sparkleRadius);
		one('uMouseTurbPushStrength', m.sparklePush);
		one('uMouseTurbTrailStrength', m.sparkleTrail);
		one('uMouseTurbTrailLength', m.sparkleTrailLength);
		one('uMouseTurbEdgeNoise', m.sparkleEdgeNoise);
		one('uMouseTurbSwap', m.sparkleSwap ? 1 : 0);

		// Theme: the palette being eased toward is picked from the pinned theme, the sections scrolled past, or the
		// site's own theme, in that order.
		const siteTheme = (): 'dark' | 'light' => {
			const set = document.documentElement.dataset.theme;
			if (set === 'light' || set === 'dark') return set;
			return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
		};
		const sectionTheme = (): 'dark' | 'light' => {
			let active: 'dark' | 'light' = 'dark';
			for (const el of document.querySelectorAll<HTMLElement>('[data-bg-theme]')) {
				const threshold = parseFloat(el.dataset.bgThemeStart ?? '') || 0.5;
				const progress = Math.min(
					Math.max((innerHeight - el.getBoundingClientRect().top) / innerHeight, 0),
					1
				);
				if (progress >= threshold) active = el.dataset.bgTheme === 'light' ? 'light' : 'dark';
			}
			return active;
		};
		const targetTheme = () =>
			config.theme !== 'follow' ? config.theme : config.sections ? sectionTheme() : siteTheme();

		let themeName = targetTheme();
		const current = {
			base: palette[themeName].base.slice(),
			highlight: palette[themeName].highlight.slice()
		};
		const uploadColors = () => {
			gl.uniform3fv(at('uBaseColor'), current.base);
			gl.uniform3fv(at('uHighlightColor'), current.highlight);
		};
		uploadColors();

		const easeColors = () => {
			const target = palette[themeName];
			let farthest = 0;
			for (let i = 0; i < 3; i++) {
				const base = target.base[i] - current.base[i];
				const highlight = target.highlight[i] - current.highlight[i];
				farthest = Math.max(farthest, Math.abs(base), Math.abs(highlight));
				current.base[i] += base * THEME_SPEED;
				current.highlight[i] += highlight * THEME_SPEED;
			}
			if (farthest >= 0.0008) uploadColors();
		};

		const resize = () => {
			const ratio = Math.min(devicePixelRatio || 1, 2);
			const width = Math.round(canvas.clientWidth * ratio);
			const height = Math.round(canvas.clientHeight * ratio);
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				gl.viewport(0, 0, width, height);
			}
			if (reduced) still();
		};

		// Pointer, eased every frame and never read raw, so the push stays smooth.
		const target = { x: 0, y: 0 };
		const smooth = { x: 0, y: 0 };
		const before = { x: 0, y: 0 };
		const direction = { x: 0, y: 1 };
		const sparkleDirection = { x: 0, y: 1 };
		let active = false;
		let wasActive = false;
		let influence = 0;
		let speed = 0;
		let sparkleSpeed = 0;

		const onMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const inside =
				config.fixed ||
				(event.clientX >= rect.left &&
					event.clientX <= rect.right &&
					event.clientY >= rect.top &&
					event.clientY <= rect.bottom);
			active = inside;
			if (!inside) return;
			const smallest = Math.min(rect.width, rect.height);
			target.x = (event.clientX - rect.left - rect.width / 2) / smallest;
			target.y = (rect.height / 2 - (event.clientY - rect.top)) / smallest;
		};
		const onLeave = () => (active = false);

		let frame = 0;
		let visible = config.fixed;
		const started = performance.now();
		let last = started;
		let fadedIn = false;

		const draw = (now: number) => {
			frame = 0;
			const elapsed = (now - started) / 1000;
			const seconds = Math.min(Math.max((now - last) / 1000, 0.0001), 0.1);
			last = now;

			// Eased in over real time, so the motion speed does not stretch it.
			if (!fadedIn) {
				const t = Math.min(elapsed / config.fadeIn, 1);
				one('uLoadFadeIn', t * t * (3 - 2 * t));
				fadedIn = t >= 1;
			}
			two('uResolution', canvas.width, canvas.height);
			one('uTime', elapsed * config.motionSpeed);

			influence += ((active ? 1 : 0) - influence) * m.influenceSmoothing;
			// On entering, jump to the pointer so there is no fake burst of speed from where it last was.
			if (active && !wasActive) {
				smooth.x = before.x = target.x;
				smooth.y = before.y = target.y;
				speed = sparkleSpeed = 0;
			}
			wasActive = active;

			smooth.x += (target.x - smooth.x) * m.positionSmoothing;
			smooth.y += (target.y - smooth.y) * m.positionSmoothing;
			const dx = smooth.x - before.x;
			const dy = smooth.y - before.y;
			const travelled = Math.hypot(dx, dy);
			before.x = smooth.x;
			before.y = smooth.y;
			if (travelled > 0.00001) {
				direction.x = dx / travelled;
				direction.y = dy / travelled;
			}

			// The sparkle's direction eases on its own, which gives it momentum on a sharp turn. The glows follow
			// the raw direction.
			sparkleDirection.x += (direction.x - sparkleDirection.x) * m.sparkleDirectionSmoothing;
			sparkleDirection.y += (direction.y - sparkleDirection.y) * m.sparkleDirectionSmoothing;
			const length = Math.hypot(sparkleDirection.x, sparkleDirection.y) || 1;

			const perSecond = travelled / seconds;
			speed += (perSecond - speed) * (perSecond > speed ? m.velocityAttack : m.velocityRelease);
			sparkleSpeed +=
				(perSecond - sparkleSpeed) *
				(perSecond > sparkleSpeed ? m.velocityAttack : m.velocityRelease);

			two('uMousePos', smooth.x, smooth.y);
			one('uMouseInfluence', influence);
			two('uMouseVelocityDir', direction.x, direction.y);
			two('uMouseTurbDir', sparkleDirection.x / length, sparkleDirection.y / length);
			one('uMouseVelocityFactor', Math.min(speed / m.velocityReference, 1));
			one(
				'uMouseTurbVelocityFactor',
				m.sparkle ? Math.min(sparkleSpeed / m.velocityReference, 1) : 0
			);

			easeColors();
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			if (visible && !document.hidden) frame = requestAnimationFrame(draw);
		};

		// With reduced motion: one frame, already faded in, with nothing moving.
		function still() {
			one('uLoadFadeIn', 1);
			two('uResolution', canvas.width, canvas.height);
			one('uTime', 0);
			one('uMouseInfluence', 0);
			one('uMouseVelocityFactor', 0);
			one('uMouseTurbVelocityFactor', 0);
			current.base = palette[themeName].base.slice();
			current.highlight = palette[themeName].highlight.slice();
			uploadColors();
			gl!.drawArrays(gl!.TRIANGLES, 0, 3);
		}

		const refreshTheme = () => {
			themeName = targetTheme();
			if (reduced) still();
		};

		const resizer = new ResizeObserver(resize);
		resizer.observe(host);
		if (config.fixed) addEventListener('resize', resize, { passive: true });

		const cleanups: (() => void)[] = [];
		if (config.theme === 'follow') {
			const watcher = new MutationObserver(refreshTheme);
			watcher.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-theme']
			});
			const query = matchMedia('(prefers-color-scheme: light)');
			query.addEventListener('change', refreshTheme);
			cleanups.push(() => {
				watcher.disconnect();
				query.removeEventListener('change', refreshTheme);
			});
			if (config.sections) {
				let queued = false;
				const onScroll = () => {
					if (queued) return;
					queued = true;
					requestAnimationFrame(() => {
						queued = false;
						refreshTheme();
					});
				};
				addEventListener('scroll', onScroll, { passive: true });
				addEventListener('resize', onScroll);
				cleanups.push(() => {
					removeEventListener('scroll', onScroll);
					removeEventListener('resize', onScroll);
				});
			}
		}

		resize();

		if (reduced) {
			still();
		} else {
			addEventListener('pointermove', onMove, { passive: true });
			document.documentElement.addEventListener('pointerleave', onLeave);

			const wake = () => {
				if (!frame && visible && !document.hidden) {
					last = performance.now();
					frame = requestAnimationFrame(draw);
				}
			};
			const observer = new IntersectionObserver(([entry]) => {
				if (!config.fixed) visible = entry.isIntersecting;
				wake();
			});
			observer.observe(host);
			document.addEventListener('visibilitychange', wake);
			wake();
			cleanups.push(() => {
				observer.disconnect();
				document.removeEventListener('visibilitychange', wake);
				removeEventListener('pointermove', onMove);
				document.documentElement.removeEventListener('pointerleave', onLeave);
			});
		}

		return () => {
			cancelAnimationFrame(frame);
			resizer.disconnect();
			removeEventListener('resize', resize);
			cleanups.forEach((cleanup) => cleanup());
			canvas.remove();
			gl.getExtension('WEBGL_lose_context')?.loseContext();
			host.style.position = previous.position;
			host.style.isolation = previous.isolation;
		};
	};
}
