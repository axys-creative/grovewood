import type { Attachment } from 'svelte/attachments';
import './grid-flow-img.scss';

export type GridFlowImgOptions = {
	/** How quickly the effect follows the pointer (0-1). Lower trails further behind. */
	ease?: number;
	/** How far from the pointer the effect reaches, as a share of the image (0-1). */
	range?: number;
	/** How many blocks the image is cut into, along each side. Fewer is chunkier. */
	grid?: number;
	/** How strong the color split is while the pointer moves. */
	intensity?: number;
	/** How the picture sits in the image's box, like `object-fit`. */
	fit?: 'cover' | 'contain' | 'stretch';
	/** Draws in black and white until the pointer is over it. */
	greyscale?: boolean;
};

const VERTEX = `
attribute vec2 position;
varying vec2 vUv;
void main() {
	vUv = position * 0.5 + 0.5;
	gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;
uniform float u_aberration;
uniform float u_grid;
uniform vec2 u_scale;
uniform float u_range;

void main() {
	vec2 gridUv = floor(vUv * u_grid) / u_grid;
	vec2 cell = gridUv + vec2(1.0 / u_grid);

	vec2 direction = u_mouse - u_prevMouse;
	float strength = smoothstep(u_range, 0.0, length(cell - u_mouse));

	vec2 uv = (vUv - 0.5) * u_scale + 0.5 - strength * -direction * 0.2;
	vec2 split = vec2(strength * u_aberration * 0.01, 0.0);

	gl_FragColor = vec4(
		texture2D(u_texture, uv + split).r,
		texture2D(u_texture, uv).g,
		texture2D(u_texture, uv - split).b,
		1.0
	);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

/**
 * Turns an `<img>` into a grid of blocks that the pointer drags along, with a color split that follows the speed
 * of the move. A canvas is laid over the image and draws the same picture with a small WebGL shader, so there
 * is no library to load. It does nothing without a mouse or with reduced motion, and the image stays as it is.
 */
export function gridFlowImg({
	ease = 0.05,
	range = 0.3,
	grid = 32,
	intensity = 1,
	fit = 'cover',
	greyscale = true
}: GridFlowImgOptions = {}): Attachment<HTMLImageElement> {
	return (img) => {
		if (
			!matchMedia('(hover: hover) and (pointer: fine)').matches ||
			matchMedia('(prefers-reduced-motion: reduce)').matches
		)
			return;

		const canvas = document.createElement('canvas');
		canvas.className = 'grid-flow-canvas';
		canvas.setAttribute('aria-hidden', 'true');
		if (greyscale) canvas.classList.add('grid-flow-canvas--greyscale');

		const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
		if (!gl) return;

		const program = gl.createProgram()!;
		gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
		gl.linkProgram(program);
		gl.useProgram(program);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

		const uniform = (name: string) => gl.getUniformLocation(program, name);
		const uMouse = uniform('u_mouse');
		const uPrevious = uniform('u_prevMouse');
		const uAberration = uniform('u_aberration');
		gl.uniform1f(uniform('u_grid'), grid);
		gl.uniform1f(uniform('u_range'), range);

		const mouse = { x: 0.5, y: 0.5 };
		const target = { x: 0.5, y: 0.5 };
		let previous = { x: 0.5, y: 0.5 };
		let aberration = 0;
		let frame = 0;
		let ready = false;
		let cancelled = false;

		const draw = () => {
			gl.uniform2f(uMouse, mouse.x, 1 - mouse.y);
			gl.uniform2f(uPrevious, previous.x, 1 - previous.y);
			gl.uniform1f(uAberration, aberration);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		};

		// The loop only runs while there is something to move: the pointer is trailing, or the split is fading.
		const loop = () => {
			mouse.x += (target.x - mouse.x) * ease;
			mouse.y += (target.y - mouse.y) * ease;
			aberration = Math.max(0, aberration - 0.05);
			draw();

			const settled =
				aberration === 0 &&
				Math.abs(target.x - mouse.x) < 1e-4 &&
				Math.abs(target.y - mouse.y) < 1e-4;
			frame = settled ? 0 : requestAnimationFrame(loop);
		};
		const wake = () => {
			if (!frame && ready) frame = requestAnimationFrame(loop);
		};

		const place = () => {
			const ratio = Math.min(devicePixelRatio || 1, 2);
			const width = img.offsetWidth;
			const height = img.offsetHeight;
			canvas.style.left = `${img.offsetLeft}px`;
			canvas.style.top = `${img.offsetTop}px`;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			canvas.style.borderRadius = getComputedStyle(img).borderRadius;
			canvas.width = Math.max(1, Math.round(width * ratio));
			canvas.height = Math.max(1, Math.round(height * ratio));
			gl.viewport(0, 0, canvas.width, canvas.height);

			// Scales the picture within the box the way `object-fit` would.
			const wide = img.naturalWidth / img.naturalHeight > width / height;
			const [x, y] =
				fit === 'stretch'
					? [1, 1]
					: (fit === 'cover') === wide
						? [width / height / (img.naturalWidth / img.naturalHeight), 1]
						: [1, img.naturalWidth / img.naturalHeight / (width / height)];
			gl.uniform2f(uniform('u_scale'), x, y);
			if (ready) draw();
		};

		const start = async () => {
			try {
				await img.decode();
			} catch {
				return;
			}
			if (cancelled) return;

			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			try {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			} catch {
				// A picture from another site without CORS cannot be read, so it is left as it is.
				return;
			}

			img.after(canvas);
			ready = true;
			place();
			img.style.visibility = 'hidden';
		};

		const pointerFrom = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: (event.clientX - rect.left) / rect.width,
				y: (event.clientY - rect.top) / rect.height
			};
		};
		const onEnter = (event: PointerEvent) => {
			const at = pointerFrom(event);
			mouse.x = target.x = at.x;
			mouse.y = target.y = at.y;
			previous = { ...at };
		};
		const onMove = (event: PointerEvent) => {
			previous = { ...target };
			Object.assign(target, pointerFrom(event));
			aberration = intensity;
			wake();
		};
		const onLeave = () => {
			target.x = previous.x;
			target.y = previous.y;
			wake();
		};

		canvas.addEventListener('pointerenter', onEnter);
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerleave', onLeave);

		const observer = new ResizeObserver(place);
		observer.observe(img);
		start();

		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
			observer.disconnect();
			canvas.remove();
			img.style.visibility = '';
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	};
}
