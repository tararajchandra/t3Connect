pub fn bgra_to_nv12(bgra: &[u8], width: usize, height: usize) -> Vec<u8> {
    let y_size = width * height;
    let uv_size = (width / 2) * (height / 2) * 2;
    let mut nv12 = vec![0u8; y_size + uv_size];

    let (y_plane, uv_plane) = nv12.split_at_mut(y_size);

    for j in 0..height {
        for i in 0..width {
            let bgra_idx = (j * width + i) * 4;
            let b = bgra[bgra_idx] as f32;
            let g = bgra[bgra_idx + 1] as f32;
            let r = bgra[bgra_idx + 2] as f32;

            // BT.601 conversion
            let y = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
            y_plane[j * width + i] = y;

            if j % 2 == 0 && i % 2 == 0 {
                let u = (-0.14713 * r - 0.28886 * g + 0.436 * b + 128.0) as u8;
                let v = (0.615 * r - 0.51499 * g - 0.10001 * b + 128.0) as u8;

                let uv_idx = (j / 2) * width + i; // UV interleaved: U, V, U, V
                uv_plane[uv_idx] = u;
                uv_plane[uv_idx + 1] = v;
            }
        }
    }

    nv12
}
