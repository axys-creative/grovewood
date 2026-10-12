import type { Attachment } from 'svelte/attachments';

export type BgWavesOptions = {
	/** Covers the whole screen and follows it, instead of covering this element. Meant for `<body>`. */
	fixed?: boolean;
	/** How far the field spreads from side to side, in the field's own units. */
	width?: number;
	/** How far it spreads front to back, in the same units. */
	depth?: number;
	/** The space between particles, in the same units. Smaller means more of them. */
	gap?: number;
	/** Any CSS color for the particles, including `var(--color-accent)`. */
	color?: string;
	/** How solid the particles are (0-1). Below `1`, `follow` can light them up. */
	opacity?: number;
	/** How fast the waves move. */
	speed?: number;
	/** How far from the pointer particles light up to full strength, in the field's own units. `0` turns it off. */
	follow?: number;
	/** How much of the top edge fades out, as a percent of the height. `0` leaves it hard. */
	fadeTop?: number;
	/** Where the camera looks down from. */
	camera?: { height?: number; distance?: number; fov?: number };
};

const VERTEX = `
attribute vec3 position;
attribute float scale;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uTime;
uniform float uPixelRatio;
varying vec2 vPos;

void main() {
	vec3 p = position;
	float s = scale;

	p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
	p.x += (sin(p.y + uTime) * 0.5);
	s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;

	vPos = p.xz;

	vec4 view = uView * vec4(p, 1.0);
	gl_PointSize = s * 15.0 * uPixelRatio * (1.0 / -view.z);
	gl_Position = uProjection * view;
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
uniform vec2 uMouse;
uniform vec2 uHalf;
uniform float uFollowRange;
varying vec2 vPos;

void main() {
	float dist = distance(vPos, vec2(uMouse.x * uHalf.x, -uMouse.y * uHalf.y));
	float glow = smoothstep(uFollowRange, 0.0, dist);
	gl_FragColor = vec4(uColor, mix(uOpacity, 1.0, glow));
}`;

const THEME_EVENTS = { attributes: true, attributeFilter: ['data-theme'] };

// Any CSS color to 0-1 red, green and blue, by letting the browser paint one pixel of it.
let swatch: CanvasRenderingContext2D | null | undefined;
function toRgb(color: string): [number, number, number] {
	swatch ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
	if (!swatch) return [1, 1, 1];
	swatch.clearRect(0, 0, 1, 1);
	swatch.fillStyle = '#fff';
	swatch.fillStyle = color;
	swatch.fillRect(0, 0, 1, 1);
	const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
	return [r / 255, g / 255, b / 255];
}

const perspective = (fov: number, aspect: number, near: number, far: number) => {
	const f = 1 / Math.tan((fov * Math.PI) / 360);
	return new Float32Array([
		f / aspect,
		0,
		0,
		0,
		0,
		f,
		0,
		0,
		0,
		0,
		(far + near) / (near - far),
		-1,
		0,
		0,
		(2 * far * near) / (near - far),
		0
	]);
};

// A view from (0, height, distance) looking at the origin, with up as +y.
const lookAtOrigin = (height: number, distance: number) => {
	const length = Math.hypot(height, distance);
	const zx = 0;
	const zy = height / length;
	const zz = distance / length;
	// x = up × z, where up is (0, 1, 0)
	const xx = zz;
	const xz = -zx;
	const xl = Math.hypot(xx, xz);
	const x = [xx / xl, 0, xz / xl];
	const y = [zy * x[2] - zz * x[1], zz * x[0] - zx * x[2], zx * x[1] - zy * x[0]];
	const eye = [0, height, distance];
	const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const z = [zx, zy, zz];
	return new Float32Array([
		x[0],
		y[0],
		z[0],
		0,
		x[1],
		y[1],
		z[1],
		0,
		x[2],
		y[2],
		z[2],
		0,
		-dot(x, eye),
		-dot(y, eye),
		-dot(z, eye),
		1
	]);
};

/**
 * A field of particles that ripples like water, seen from above and behind, drawn on the GPU. Optionally the
 * particles near the pointer light up. It follows the site's theme for its color, only runs while the element is on
 * screen, and with reduced motion draws one still frame.
 */
export function bgWaves({
	fixed = false,
	width = 40,
	depth = 25,
	gap = 0.5,
	color = 'var(--color-text)',
	opacity = 1,
	speed = 0.01,
	follow = 0,
	fadeTop = 0,
	camera = {}
}: BgWavesOptions = {}): Attachment<HTMLElement> {
	return (host) => {
		const { height: cameraHeight = 6, distance = 5, fov = 75 } = camera;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl', {
			antialias: true,
			alpha: true,
			premultipliedAlpha: true
		});
		if (!gl) return;

		canvas.setAttribute('aria-hidden', 'true');
		Object.assign(canvas.style, {
			position: fixed ? 'fixed' : 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			zIndex: '-1',
			pointerEvents: 'none'
		});
		if (fadeTop > 0) {
			const mask = `linear-gradient(180deg, transparent 0%, #000 ${fadeTop}%)`;
			canvas.style.maskImage = mask;
			canvas.style.webkitMaskImage = mask;
		}

		// The canvas sits behind the element's content but above its own background, which needs a stacking
		// context to hold it, and a position to be placed against.
		const previous = { position: host.style.position, isolation: host.style.isolation };
		if (!fixed) {
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

		const columns = Math.floor(width / gap);
		const rows = Math.floor(depth / gap);
		const count = columns * rows;
		const positions = new Float32Array(count * 3);
		const scales = new Float32Array(count).fill(1);
		let at = 0;
		for (let column = 0; column < columns; column++) {
			for (let row = 0; row < rows; row++) {
				positions[at++] = column * gap - (columns * gap) / 2;
				positions[at++] = 0;
				positions[at++] = row * gap - (rows * gap) / 2;
			}
		}

		const attribute = (name: string, data: Float32Array, size: number) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			const location = gl.getAttribLocation(program, name);
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
		};
		attribute('position', positions, 3);
		attribute('scale', scales, 1);

		const uniform = (name: string) => gl.getUniformLocation(program, name);
		const uTime = uniform('uTime');
		const uMouse = uniform('uMouse');
		gl.uniformMatrix4fv(uniform('uView'), false, lookAtOrigin(cameraHeight, distance));
		gl.uniform1f(uniform('uOpacity'), opacity);
		gl.uniform1f(uniform('uFollowRange'), follow);
		gl.uniform2f(uniform('uHalf'), width / 2, depth / 2);

		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0, 0, 0, 0);

		let time = 0;
		let frame = 0;
		let visible = fixed;
		let last = 0;
		const target = { x: -10, y: -10 };
		const mouse = { x: -10, y: -10 };

		const paintColor = () => {
			canvas.style.color = color;
			gl.uniform3fv(uniform('uColor'), toRgb(getComputedStyle(canvas).color));
		};

		const render = () => {
			gl.uniform1f(uTime, time);
			gl.uniform2f(uMouse, mouse.x, mouse.y);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.POINTS, 0, count);
		};

		const resize = () => {
			const ratio = Math.min(devicePixelRatio || 1, 2);
			const w = Math.round(canvas.clientWidth * ratio);
			const h = Math.round(canvas.clientHeight * ratio);
			if (!w || !h) return;
			canvas.width = w;
			canvas.height = h;
			gl.viewport(0, 0, w, h);
			gl.uniform1f(uniform('uPixelRatio'), ratio);
			gl.uniformMatrix4fv(uniform('uProjection'), false, perspective(fov, w / h, 0.01, 1000));
			if (reduced || !frame) render();
		};

		const tick = (now: number) => {
			frame = 0;
			// The speed was per frame at 60 frames a second, so it holds on faster and slower screens.
			time += speed * Math.min((now - last) / (1000 / 60), 4);
			last = now;
			mouse.x += (target.x - mouse.x) * 0.15;
			mouse.y += (target.y - mouse.y) * 0.15;
			render();
			if (visible && !document.hidden) frame = requestAnimationFrame(tick);
		};

		const wake = () => {
			if (frame || !visible || document.hidden || reduced) return;
			last = performance.now();
			frame = requestAnimationFrame(tick);
		};

		const onMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			const y = (event.clientY - rect.top) / rect.height;
			if (x < 0 || x > 1 || y < 0 || y > 1) {
				target.x = target.y = -10;
				return;
			}
			target.x = x * 2 - 1;
			target.y = -(y * 2 - 1);
		};

		paintColor();
		const resizer = new ResizeObserver(resize);
		resizer.observe(host);
		resize();

		const themeWatcher = new MutationObserver(() => {
			paintColor();
			if (!frame) render();
		});
		themeWatcher.observe(document.documentElement, THEME_EVENTS);

		const cleanups: (() => void)[] = [];
		if (!reduced) {
			const observer = new IntersectionObserver(([entry]) => {
				if (!fixed) visible = entry.isIntersecting;
				wake();
			});
			observer.observe(host);
			document.addEventListener('visibilitychange', wake);
			cleanups.push(() => {
				observer.disconnect();
				document.removeEventListener('visibilitychange', wake);
			});
			if (follow > 0 && matchMedia('(hover: hover) and (pointer: fine)').matches) {
				addEventListener('pointermove', onMove, { passive: true });
				cleanups.push(() => removeEventListener('pointermove', onMove));
			}
			wake();
		} else {
			render();
		}

		return () => {
			cancelAnimationFrame(frame);
			resizer.disconnect();
			themeWatcher.disconnect();
			cleanups.forEach((cleanup) => cleanup());
			canvas.remove();
			gl.getExtension('WEBGL_lose_context')?.loseContext();
			host.style.position = previous.position;
			host.style.isolation = previous.isolation;
		};
	};
}
