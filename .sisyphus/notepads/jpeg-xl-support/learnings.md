# Learnings - JPEG XL Support Integration

## Patterns & Conventions

### CxImage Format Integration Pattern
1. **ximacfg.h**: Add `CXIMAGE_SUPPORT_<FMT>` macro, guarded by `SUPPORT_LIB_<FMT>_SOURCES` and `BUILDING_WASM_MODULE` (same pattern as HEIF)
2. **ximage.h**: Add `CXIMAGE_FORMAT_<FMT> = N` enum entry (conditional on support macro), add to `CMAX_IMAGE_FORMATS` sum
3. **ImageFileFormatChecker.h**: Add `_CXIMAGE_FORMAT_<FMT> = N` in separate `__ENUM_CXIMAGE_FORMATS` enum, add detection method declarations (both filename and buffer variants)
4. **ImageFileFormatChecker.cpp**: Implement `is<Fmt>File(BYTE*, DWORD)` with magic byte detection, implement `is<Fmt>File(const std::wstring&)` with extension check, add mapping in BOTH `isImageFile` overloads
5. **ximajxl.h / ximajxl.cpp**: CxImage subclass with `Decode(CxFile*)` method

### Key Detail: Two Separate Enums
- `ximage.h` has `ENUM_CXIMAGE_FORMATS` (used by CxImage internally)
- `ImageFileFormatChecker.h` has `__ENUM_CXIMAGE_FORMATS` (used by raster layer)
- These are INDEPENDENT enums with different numbering — WebP is 27 in checker but not in ximage.h

### CxImage Decoder Pattern (from ximajpg.cpp)
- Constructor calls `CxImage(CXIMAGE_FORMAT_*)` to set type
- `Decode(CxFile*)` reads data, creates internal DIB via `Create(w, h, bpp, type)`, uses `CImageIterator` for bottom-up row writing
- Uses `info.nEscape == -1` for dimensions-only query
- Returns `true` on success, `false` on failure (with `strcpy(info.szLastError, ...)`)

### libjxl API (stable, well-documented)
- `JxlDecoderCreate(NULL)` / `JxlDecoderDestroy()`
- `JxlDecoderSubscribeEvents(dec, JXL_DEC_BASIC_INFO | JXL_DEC_NEED_IMAGE_OUT_BUFFER | JXL_DEC_FULL_IMAGE)`
- `JxlDecoderSetInput(dec, data, size)` + `JxlDecoderCloseInput(dec)`
- `JxlDecoderProcessInput(dec)` returns `JxlDecoderStatus`
- `JxlDecoderGetBasicInfo(dec, &info)` fills `JxlBasicInfo` (xsize, ysize, alpha_bits, bits_per_sample)
- `JxlDecoderImageOutBufferSize(dec, &fmt, &size)` / `JxlDecoderSetImageOutBuffer(dec, &fmt, buf, size)`
- Pixel format: `JxlPixelFormat{.num_channels=4, .data_type=JXL_TYPE_UINT8, .endianness=JXL_NATIVE_ENDIAN, .align=0}`

### File Format Detection
- JPEG XL codestream: `0xFF 0x0A` (2 bytes)
- JPEG XL container (ISOBMFF): bytes [8:12] = "ftyp", bytes [12:16] = "jxl " or "jxlc"

### Important Gotcha
- `ximage.h` line 134 has typo `CXIMAGE_FORMAR_PIC` — left as-is per instructions
- All LSP errors in the codebase are pre-existing (Windows SDK headers not in LSP include path)
