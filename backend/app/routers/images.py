"""Image browsing and download API endpoints."""
import io
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/images", tags=["Images"])

STATIC_DIR = Path(__file__).resolve().parents[2] / "static"
IMAGES_DIR = STATIC_DIR / "images"

# Category definitions: id -> (display name, path relative to images/, recursive)
CATEGORIES: dict[str, tuple[str, str, bool, list[str] | None]] = {
    # id: (display_name, base_path, recursive, explicit_files_or_None)
    "cards": ("Cards", "cards", False, None),
    "characters": ("Characters", "characters", False, None),
    "monsters": ("Monsters", "monsters", False, None),
    "relics": ("Relics", "relics", False, None),
    "potions": ("Potions", "potions", False, None),
    "icons": ("Icons", "icons", False, None),
    "ancients": ("Ancients", "misc/ancients", False, None),
    "bosses": ("Bosses", "misc/bosses", False, None),
    "npcs": ("NPCs", "misc", False, ["neow.png", "tezcatara.png", "merchant.png", "fake_merchant.png"]),
    "renders": ("Spine Renders", "renders", True, None),
    "cards-beta": ("Cards (Beta Art)", "cards/beta", False, None),
    "relics-beta": ("Relics (Beta Art)", "relics/beta", False, None),
    "monsters-beta": ("Monsters (Beta Art)", "monsters/beta", False, None),
    "backgrounds": ("Backgrounds", "misc", False, ["main_menu.png", "main_menu_bg.png", "neow.png", "tezcatara.png", "merchant.png"]),
}


def _get_images_for_category(category_id: str) -> list[dict[str, str]]:
    """Return list of image dicts for a category."""
    if category_id not in CATEGORIES:
        return []

    display_name, base_path, recursive, explicit_files = CATEGORIES[category_id]
    dir_path = IMAGES_DIR / base_path

    if not dir_path.exists():
        return []

    if explicit_files is not None:
        # Only specific files from the directory
        png_files = [dir_path / f for f in explicit_files if (dir_path / f).exists()]
    elif recursive:
        png_files = sorted(dir_path.rglob("*.png"))
    else:
        png_files = sorted(dir_path.glob("*.png"))

    images = []
    for f in png_files:
        rel = f.relative_to(STATIC_DIR)
        images.append({
            "filename": f.name,
            "url": f"/static/{rel}",
        })
    return images


@router.get("", tags=["Images"])
def list_image_categories(request: Request):
    """Return all image categories with their contents."""
    result = []
    for cat_id, (display_name, *_) in CATEGORIES.items():
        images = _get_images_for_category(cat_id)
        result.append({
            "id": cat_id,
            "name": display_name,
            "count": len(images),
            "images": images,
        })
    return result


@router.get("/{category}/download", tags=["Images"])
def download_category_zip(category: str, request: Request):
    """Download all images in a category as a zip file."""
    if category not in CATEGORIES:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found")

    images = _get_images_for_category(category)
    if not images:
        raise HTTPException(status_code=404, detail=f"No images found for category '{category}'")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for img in images:
            # Resolve the actual file path from the static URL
            rel_path = img["url"].removeprefix("/static/")
            file_path = STATIC_DIR / rel_path
            if file_path.exists():
                zf.write(file_path, arcname=img["filename"])
    buf.seek(0)

    filename = f"spire-codex-{category}.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
