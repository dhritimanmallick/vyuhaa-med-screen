import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Home,
  Square,
  Circle,
  Ruler,
  MousePointer,
  Maximize,
  SunMedium,
  Contrast,
  Palette,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ViewerNavigationTarget {
  x: number;
  y: number;
  zoom: number;
}

export interface OpenSeadragonViewerHandle {
  navigateToPosition: (x: number, y: number, zoom: number) => void;
  getViewer: () => OpenSeadragon.Viewer | null;
}

interface OpenSeadragonViewerProps {
  slideData?: any;
  imageUrl?: string;
  onAnnotationChange?: (annotations: any[]) => void;
  initialPosition?: ViewerNavigationTarget;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rectangle' | 'circle' | 'measurement';
  label?: string;
  color?: string;
}

const OpenSeadragonViewer = forwardRef<OpenSeadragonViewerHandle, OpenSeadragonViewerProps>(
  ({ slideData, imageUrl, onAnnotationChange, initialPosition }, ref) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);
    
    const [zoomLevel, setZoomLevel] = useState(1);
    const [tool, setTool] = useState<'pointer' | 'move' | 'rectangle' | 'circle' | 'ruler'>('pointer');
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewportInfo, setViewportInfo] = useState({ x: 0, y: 0 });
    
    // Image adjustment filters
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    
    // Use the uploaded histology image for the viewer
    const slideImageUrl = imageUrl || '/slides/histo_image.jpg';

    // Expose navigation method to parent
    useImperativeHandle(ref, () => ({
      navigateToPosition: (x: number, y: number, zoom: number) => {
        if (osdViewerRef.current) {
          osdViewerRef.current.viewport.zoomTo(zoom);
          osdViewerRef.current.viewport.panTo(new OpenSeadragon.Point(x, y));
          osdViewerRef.current.forceRedraw();
        }
      },
      getViewer: () => osdViewerRef.current
    }));

    // Initialize OpenSeadragon
    useEffect(() => {
      if (!viewerRef.current) return;

      // Destroy existing viewer if any
      if (osdViewerRef.current) {
        osdViewerRef.current.destroy();
      }

      // Create OpenSeadragon viewer with image source
      const viewer = OpenSeadragon({
        element: viewerRef.current,
        prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
        tileSources: {
          type: 'image',
          url: slideImageUrl,
        },
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 10,
        minZoomImageRatio: 0.5,
        visibilityRatio: 0.5,
        zoomPerScroll: 1.5,
        maxZoomLevel: 40,
        minZoomLevel: 0.5,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        navigatorSizeRatio: 0.15,
        navigatorMaintainSizeRatio: true,
        navigatorAutoFade: false,
        showNavigationControl: false,
        gestureSettingsMouse: {
          clickToZoom: false,
          dblClickToZoom: true,
        },
        gestureSettingsTouch: {
          pinchToZoom: true,
          flickEnabled: true,
        },
        crossOriginPolicy: "Anonymous",
      });

      osdViewerRef.current = viewer;

      // Add zoom handler
      viewer.addHandler('zoom', (event) => {
        setZoomLevel(event.zoom || 1);
      });

      // Add viewport change handler for position tracking
      viewer.addHandler('animation', () => {
        const center = viewer.viewport.getCenter();
        if (center) {
          setViewportInfo({ x: center.x, y: center.y });
        }
      });

      // Add open handler
      viewer.addHandler('open', () => {
        console.log('OpenSeadragon viewer opened');
        
        // Navigate to initial position if provided
        if (initialPosition) {
          viewer.viewport.zoomTo(initialPosition.zoom);
          viewer.viewport.panTo(new OpenSeadragon.Point(initialPosition.x, initialPosition.y));
        } else {
          viewer.viewport.zoomTo(1);
        }
      });

      // Cleanup
      return () => {
        if (osdViewerRef.current) {
          osdViewerRef.current.destroy();
          osdViewerRef.current = null;
        }
      };
    }, [slideImageUrl, initialPosition]);

    // Apply image filters
    useEffect(() => {
      if (osdViewerRef.current && osdViewerRef.current.canvas) {
        osdViewerRef.current.canvas.style.filter = 
          `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      }
    }, [brightness, contrast, saturation]);

    // Handle tool changes
    useEffect(() => {
      if (!osdViewerRef.current) return;
      
      const viewer = osdViewerRef.current;
      
      if (tool === 'move' || tool === 'pointer') {
        viewer.setMouseNavEnabled(true);
      } else {
        viewer.setMouseNavEnabled(false);
      }
    }, [tool]);

    const handleZoomIn = useCallback(() => {
      if (osdViewerRef.current) {
        const currentZoom = osdViewerRef.current.viewport.getZoom();
        osdViewerRef.current.viewport.zoomTo(currentZoom * 1.5);
      }
    }, []);

    const handleZoomOut = useCallback(() => {
      if (osdViewerRef.current) {
        const currentZoom = osdViewerRef.current.viewport.getZoom();
        osdViewerRef.current.viewport.zoomTo(currentZoom / 1.5);
      }
    }, []);

    const handleZoomFit = useCallback(() => {
      if (osdViewerRef.current) {
        osdViewerRef.current.viewport.goHome();
      }
    }, []);

    const handleRotate = useCallback(() => {
      if (osdViewerRef.current) {
        const currentRotation = osdViewerRef.current.viewport.getRotation();
        osdViewerRef.current.viewport.setRotation(currentRotation + 90);
      }
    }, []);

    const handleFullScreen = useCallback(() => {
      if (osdViewerRef.current) {
        osdViewerRef.current.setFullScreen(!isFullScreen);
        setIsFullScreen(!isFullScreen);
      }
    }, [isFullScreen]);

    const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      const newZoom = parseFloat(e.target.value);
      if (osdViewerRef.current) {
        osdViewerRef.current.viewport.zoomTo(newZoom);
      }
    }, []);

    const resetFilters = useCallback(() => {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }, []);

    const zoomLevels = [0.5, 1, 2, 4, 8, 16, 20, 32, 40];
    const zoomPercentage = Math.round(zoomLevel * 100);

    // Simulated AI detection regions
    const detectionRegions = [
      { id: 'hsil1', type: 'HSIL', confidence: 92, count: 2 },
      { id: 'lsil1', type: 'LSIL', confidence: 78, count: 1 },
      { id: 'normal', type: 'Normal', confidence: 95, count: 15 },
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-muted border-b flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Button
              variant={tool === 'pointer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('pointer')}
              title="Pointer Tool"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'move' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('move')}
              title="Pan Tool"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('rectangle')}
              title="Rectangle Annotation"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('circle')}
              title="Circle Annotation"
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'ruler' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTool('ruler')}
              title="Measurement Tool"
            >
              <Ruler className="h-4 w-4" />
            </Button>

            {/* Image Adjustments Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" title="Image Adjustments">
                  <SunMedium className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Image Adjustments</h4>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <SunMedium className="h-4 w-4" /> Brightness
                      </span>
                      <span className="text-sm text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={([val]) => setBrightness(val)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Contrast className="h-4 w-4" /> Contrast
                      </span>
                      <span className="text-sm text-muted-foreground">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={([val]) => setContrast(val)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Saturation
                      </span>
                      <span className="text-sm text-muted-foreground">{saturation}%</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      onValueChange={([val]) => setSaturation(val)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium min-w-[60px] text-center">{zoomPercentage}%</span>
              <select
                value={zoomLevel}
                onChange={handleZoomChange}
                className="text-sm border rounded px-1 bg-background"
              >
                {zoomLevels.map((level) => (
                  <option key={level} value={level}>
                    {level * 100}%
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleZoomFit} title="Fit to View">
              <Home className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleRotate} title="Rotate 90°">
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleFullScreen} title="Full Screen">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* OpenSeadragon Viewer Container */}
        <div className="flex-1 relative bg-background min-h-[400px]">
          <div
            ref={viewerRef}
            className="absolute inset-0 w-full h-full"
            style={{ background: '#1a1a1a', minHeight: '400px' }}
          />

          {/* Coordinates and info overlay */}
          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            Zoom: {zoomPercentage}% | Position: ({viewportInfo.x.toFixed(3)}, {viewportInfo.y.toFixed(3)}) | Tool: {tool}
          </div>

          {/* Scale bar */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-2 right-24 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-1 bg-white"></div>
                <span>{Math.round(100 / zoomLevel)}μm</span>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between p-2 bg-muted border-t text-sm flex-wrap gap-2">
          <div className="flex items-center space-x-4">
            <span>Objective: 20x</span>
            <span>Pixel Size: 0.5μm/pixel</span>
            <span>Field: {Math.round(500 / zoomLevel)}μm</span>
          </div>
          <div className="flex items-center space-x-2">
            {detectionRegions.map((region) => (
              <Badge
                key={region.id}
                variant="outline"
                className={
                  region.type === 'HSIL'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : region.type === 'LSIL'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }
              >
                {region.type}: {region.count} regions
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

OpenSeadragonViewer.displayName = 'OpenSeadragonViewer';

export default OpenSeadragonViewer;
