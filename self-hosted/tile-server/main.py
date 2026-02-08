"""
Vyuhaa Med Screen - Tile Server for DZI Slide Images
FastAPI server for serving Deep Zoom Image tiles
"""

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json

app = FastAPI(
    title="Vyuhaa Tile Server",
    description="Deep Zoom Image (DZI) tile server for pathology slides",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TILES_PATH = os.environ.get("TILES_PATH", "/app/tiles")

# Ensure tiles directory exists
Path(TILES_PATH).mkdir(parents=True, exist_ok=True)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tile-server"}

@app.get("/api/fastapi/dzi/{slide_name}")
async def get_dzi_descriptor(slide_name: str):
    """Get DZI descriptor XML for a slide"""
    dzi_path = Path(TILES_PATH) / slide_name / f"{slide_name}.dzi"
    
    if not dzi_path.exists():
        # Return default DZI structure for compatibility
        return JSONResponse({
            "Image": {
                "xmlns": "http://schemas.microsoft.com/deepzoom/2008",
                "Format": "jpeg",
                "Overlap": "1",
                "TileSize": "254",
                "Size": {
                    "Width": "10000",
                    "Height": "10000"
                }
            }
        })
    
    return FileResponse(dzi_path, media_type="application/xml")

@app.get("/api/fastapi/tiles/{slide_name}/{level}/{col}_{row}.{format}")
async def get_tile(slide_name: str, level: int, col: int, row: int, format: str = "jpeg"):
    """Get individual tile image"""
    tile_path = Path(TILES_PATH) / slide_name / f"{slide_name}_files" / str(level) / f"{col}_{row}.{format}"
    
    if not tile_path.exists():
        # Try alternative path structures
        alt_path = Path(TILES_PATH) / slide_name / str(level) / f"{col}_{row}.{format}"
        if alt_path.exists():
            tile_path = alt_path
        else:
            raise HTTPException(status_code=404, detail="Tile not found")
    
    media_type = "image/jpeg" if format in ["jpg", "jpeg"] else f"image/{format}"
    return FileResponse(tile_path, media_type=media_type)

@app.get("/api/fastapi/regions/{slide_name}")
async def get_regions(slide_name: str):
    """Get annotated regions for a slide"""
    regions_path = Path(TILES_PATH) / slide_name / "regions.json"
    
    if not regions_path.exists():
        # Return empty regions array
        return {"regions": []}
    
    with open(regions_path, "r") as f:
        return json.load(f)

@app.get("/api/fastapi/images/{slide_name}")
async def list_slide_images(slide_name: str):
    """List available images for a slide"""
    slide_path = Path(TILES_PATH) / slide_name
    
    if not slide_path.exists():
        return {"images": []}
    
    images = []
    for ext in ["jpg", "jpeg", "png", "tiff"]:
        images.extend([f.name for f in slide_path.glob(f"*.{ext}")])
    
    return {"images": images}

@app.get("/api/fastapi/image/{slide_name}/{image_name}")
async def get_image(slide_name: str, image_name: str):
    """Get a specific image file"""
    image_path = Path(TILES_PATH) / slide_name / image_name
    
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    ext = image_path.suffix.lower()
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".tiff": "image/tiff",
        ".tif": "image/tiff"
    }
    
    return FileResponse(image_path, media_type=media_types.get(ext, "application/octet-stream"))

# Mount static files for direct tile access
if Path(TILES_PATH).exists():
    app.mount("/tiles", StaticFiles(directory=TILES_PATH), name="tiles")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
