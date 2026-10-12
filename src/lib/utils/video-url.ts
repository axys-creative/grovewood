// A Mux playback ID is a long run of letters and digits with no dot or slash.
const muxId = (src: string) => (/^[A-Za-z0-9]{20,}$/.test(src.trim()) ? src.trim() : undefined);

// Admins can paste a Mux playback ID or a Dropbox share link as copied; this turns either into a playable URL.
export function videoUrl(src: string) {
	const id = muxId(src);
	if (id) return `https://stream.mux.com/${id}.m3u8`;
	try {
		const url = new URL(src);
		if (!/(^|\.)dropbox\.com$/.test(url.hostname)) return src;
		url.searchParams.delete('dl');
		url.searchParams.set('raw', '1');
		return url.toString();
	} catch {
		return src;
	}
}

export const isHls = (url: string) => /\.m3u8(\?|$)/.test(url);

export function videoPoster(src: string) {
	const id = muxId(src);
	return id ? `https://image.mux.com/${id}/thumbnail.jpg` : undefined;
}
