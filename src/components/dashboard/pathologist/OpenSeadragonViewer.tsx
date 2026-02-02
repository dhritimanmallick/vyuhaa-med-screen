import React, { useEffect, useRef, useState, useCallback } from "react";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Grid3X3
} from "lucide-react";

interface OpenSeadragonViewerProps {
  slideData?: any;
  imageUrl?: string;
  onAnnotationChange?: (annotations: any[]) => void;
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

const OpenSeadragonViewer = ({ slideData, imageUrl, onAnnotationChange }: OpenSeadragonViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tool, setTool] = useState<'pointer' | 'move' | 'rectangle' | 'circle' | 'ruler'>('pointer');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewportInfo, setViewportInfo] = useState({ x: 0, y: 0 });
  
  // Default to the uploaded slide image if no imageUrl provided
  const slideImageUrl = imageUrl || '/lovable-uploads/f07723c3-179d-4293-b0ed-55e8945aa47f.png';

  // Initialize OpenSeadragon
  useEffect(() => {
    if (!viewerRef.current) return;

    // Destroy existing viewer if any
    if (osdViewerRef.current) {
      osdViewerRef.current.destroy();
    }

    // Create OpenSeadragon viewer
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
      showNavigationControl: false, // We'll use custom controls
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true,
      },
      gestureSettingsTouch: {
        pinchToZoom: true,
        flickEnabled: true,
      },
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
      // Set initial zoom
      viewer.viewport.zoomTo(1);
    });

    // Cleanup
    return () => {
      if (osdViewerRef.current) {
        osdViewerRef.current.destroy();
        osdViewerRef.current = null;
      }
    };
  }, [slideImageUrl]);

  // Handle tool changes
  useEffect(() => {
    if (!osdViewerRef.current) return;
    
    const viewer = osdViewerRef.current;
    
    if (tool === 'move') {
      viewer.setMouseNavEnabled(true);
    } else if (tool === 'pointer') {
      viewer.setMouseNavEnabled(true);
    } else {
      // For annotation tools, we might want to disable panning
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
      <div className="flex items-center justify-between p-2 bg-muted border-b">
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
      <div className="flex-1 relative bg-gray-900">
        <div
          ref={viewerRef}
          className="absolute inset-0"
          style={{ background: '#1a1a1a' }}
        />

        {/* Coordinates and info overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-10">
          Zoom: {zoomPercentage}% | Position: ({viewportInfo.x.toFixed(3)}, {viewportInfo.y.toFixed(3)}) | Tool: {tool}
        </div>

        {/* Scale bar */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-2 right-24 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded z-10">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-white"></div>
              <span>{Math.round(100 / zoomLevel)}μm</span>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-muted border-t text-sm">
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
};

export default OpenSeadragonViewer;
