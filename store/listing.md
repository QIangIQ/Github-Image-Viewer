# Chrome Web Store listing

Copy these fields into the Developer Dashboard (https://chrome.google.com/webstore/devconsole).

## Package
`github-image-viewer-1.0.0.zip` (in the GitHub release, or build it by zipping the contents of `extension/`).

## Store listing

**Name** (from manifest): GitHub Image Viewer - Thumbnail Gallery for Repos

**Summary** (from manifest, max 132 chars):
See every image in a GitHub folder as a thumbnail grid. Adjustable size, images per row, and a full-size lightbox.

**Category:** Developer Tools
**Language:** English

**Description:**

Stop clicking image files one by one on GitHub.

GitHub Image Viewer turns any GitHub folder into a thumbnail gallery. Open a folder of sprites, icons, screenshots, textures, UI mockups or dataset samples and every image appears as a grid above the file list.

FEATURES
• Thumbnail grid for PNG, JPG, GIF, SVG, WebP, AVIF, BMP and ICO files
• Thumbnail size slider from 48 px to 512 px
• Images per row: pick an exact number or let it fit automatically
• Full-size lightbox with image dimensions; arrow keys to browse, Esc to close
• Pixel art is scaled up sharply, not blurred
• Show or hide file names, or hide GitHub's file list entirely
• Works on private repositories through your normal GitHub login
• Matches GitHub's light and dark themes
• Lazy loading keeps large folders fast
• Ctrl-click or middle-click a thumbnail to open the file page

PRIVACY
No analytics, no tracking, no servers. The extension only stores your grid settings in your browser. Images are loaded from github.com exactly as GitHub loads them.

Open source (MIT): https://github.com/QIangIQ/Github-Image-Viewer
Website: https://qiangiq.github.io/Github-Image-Viewer/

Not affiliated with GitHub, Inc.

## Graphics
- Store icon 128×128 (96 px art + 16 px padding): `store/store-icon-128.png`
- Screenshots 1280×800: `store/screenshot-1-grid.png`, `store/screenshot-2-perrow.png`, `store/screenshot-3-lightbox.png`
- Small promo tile 440×280: `store/promo-small-440x280.png`
- Marquee promo tile 1400×560: `store/promo-marquee-1400x560.png`

## Additional fields
- **Official URL / Homepage:** https://qiangiq.github.io/Github-Image-Viewer/
- **Support URL:** https://github.com/QIangIQ/Github-Image-Viewer/issues

## Privacy practices tab
- **Single purpose:** Shows the images in a GitHub folder as a thumbnail grid with a lightbox.
- **Permission justification, storage:** Saves the user's grid settings (thumbnail size, images per row, show names, hide list).
- **Permission justification, host access (https://github.com/*):** The content script adds the thumbnail grid to GitHub folder pages and reads the file links on that page.
- **Remote code:** No, the extension does not use remote code.
- **Data usage:** Collects none of the listed data types. Tick the three certification boxes.
- **Privacy policy URL:** https://qiangiq.github.io/Github-Image-Viewer/privacy.html

## Distribution
Public, all regions, free.
