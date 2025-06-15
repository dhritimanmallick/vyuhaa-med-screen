
import { useState, useRef, useEffect } from "react";
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
  MousePointer
} from "lucide-react";

interface SlideViewerProps {
  slideData: any;
  onAnnotationChange?: (annotations: any[]) => void;
}

const SlideViewer = ({ slideData, onAnnotationChange }: SlideViewerProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'pointer' | 'move' | 'rectangle' | 'circle' | 'ruler'>('pointer');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const zoomLevels = [25, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1200, 1600];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };

  const handleZoomFit = () => {
    setZoomLevel(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'move' || e.button === 1) { // Middle mouse button or move tool
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && (tool === 'move' || e.button === 1)) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Simulated slide regions with different magnifications
  const slideRegions = [
    { id: 'region1', x: 20, y: 15, width: 80, height: 60, type: 'normal', cells: 'Epithelial cells' },
    { id: 'region2', x: 45, y: 35, width: 30, height: 25, type: 'abnormal', cells: 'LSIL cells' },
    { id: 'region3', x: 75, y: 60, width: 20, height: 15, type: 'suspicious', cells: 'Atypical cells' },
  ];

  const getRegionColor = (type: string) => {
    switch (type) {
      case 'abnormal': return 'border-red-500 bg-red-500/10';
      case 'suspicious': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant={tool === 'pointer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pointer')}
          >
            <MousePointer className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'move' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('move')}
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('rectangle')}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('circle')}
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'ruler' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('ruler')}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 25}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium min-w-[60px] text-center">{zoomLevel}%</span>
            <select 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="text-sm border rounded px-1"
            >
              {zoomLevels.map(level => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 1600}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleZoomFit}>
            <Home className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Viewer Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-900 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: tool === 'move' ? 'grab' : 'crosshair' }}
      >
        <div
          ref={imageRef}
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Simulated Slide Background */}
          <div className="w-full h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative">
            {/* Grid overlay for high zoom levels */}
            {zoomLevel > 200 && (
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #ccc 1px, transparent 1px),
                    linear-gradient(to bottom, #ccc 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* Simulated cellular structures */}
            <div className="absolute inset-0">
              {Array.from({ length: Math.floor(zoomLevel / 10) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-pink-200 opacity-60"
                  style={{
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 90}%`,
                  }}
                />
              ))}
            </div>

            {/* Detected regions */}
            {slideRegions.map((region) => (
              <div
                key={region.id}
                className={`absolute border-2 ${getRegionColor(region.type)} cursor-pointer`}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}px`,
                  height: `${region.height}px`,
                }}
                title={`${region.type} - ${region.cells}`}
              >
                {zoomLevel > 150 && (
                  <div className="absolute -top-6 left-0 text-xs bg-black text-white px-1 rounded">
                    {region.cells}
                  </div>
                )}
              </div>
            ))}

            {/* AI Detection overlays */}
            <div className="absolute top-4 left-4 w-12 h-12 border-4 border-red-500 bg-red-500/20 rounded-full animate-pulse">
              {zoomLevel > 200 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-1 rounded whitespace-nowrap">
                  HSIL Detection (92%)
                </div>
              )}
            </div>
            
            <div className="absolute top-20 right-12 w-8 h-8 border-3 border-yellow-500 bg-yellow-500/20 rounded-full">
              {zoomLevel > 200 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-yellow-500 text-white px-2 py-1 rounded whitespace-nowrap">
                  LSIL (78%)
                </div>
              )}
            </div>
            
            <div className="absolute bottom-12 left-16 w-16 h-16 border-3 border-orange-500 bg-orange-500/20 rounded-full animate-pulse">
              {zoomLevel > 200 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-orange-500 text-white px-2 py-1 rounded whitespace-nowrap">
                  Inflammation
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coordinates and info overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          Zoom: {zoomLevel}% | Position: ({Math.round(position.x)}, {Math.round(position.y)}) | Tool: {tool}
        </div>

        {/* Scale bar */}
        {zoomLevel > 100 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-white"></div>
              <span>{Math.round(100 / (zoomLevel / 100))}μm</span>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-sm">
        <div className="flex items-center space-x-4">
          <span>Objective: 20x</span>
          <span>Pixel Size: 0.5μm/pixel</span>
          <span>Field: {Math.round(500 / (zoomLevel / 100))}μm</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-red-50">
            HSIL: 2 regions
          </Badge>
          <Badge variant="outline" className="bg-yellow-50">
            LSIL: 1 region
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Normal: 15 regions
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;
