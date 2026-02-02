import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, FileCheck, AlertTriangle, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { ViewerNavigationTarget } from "./OpenSeadragonViewer";

export interface AnnotatedRegion {
  id: string;
  diagnosis: string;
  confidence: number;
  image: string;
  x: number;
  y: number;
  zoom: number;
  title: string;
  category?: string;
}

interface SlideGridViewProps {
  slideData: any;
  onNavigateToRegion?: (target: ViewerNavigationTarget) => void;
  onSlideSelect?: (slideId: string) => void;
  onGenerateReport?: () => void;
}

const SlideGridView = ({ slideData, onNavigateToRegion, onSlideSelect, onGenerateReport }: SlideGridViewProps) => {
  const [gridCols, setGridCols] = useState(4);
  const [gridRows, setGridRows] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = gridCols * gridRows;

  // Mock annotated regions from AI analysis with coordinates
  const slideRegions: AnnotatedRegion[] = [
    { id: 'region-1', diagnosis: 'HSIL', confidence: 94, image: '/slides/histo_image.jpg', x: 0.25, y: 0.25, zoom: 8, title: 'HSIL-1', category: 'none' },
    { id: 'region-2', diagnosis: 'LSIL', confidence: 92, image: '/slides/histo_image.jpg', x: 0.5, y: 0.3, zoom: 8, title: 'LSIL-1', category: 'none' },
    { id: 'region-3', diagnosis: 'LSIL', confidence: 85, image: '/slides/histo_image.jpg', x: 0.7, y: 0.4, zoom: 8, title: 'LSIL-2', category: 'none' },
    { id: 'region-4', diagnosis: 'ASCUS', confidence: 78, image: '/slides/histo_image.jpg', x: 0.3, y: 0.6, zoom: 8, title: 'ASCUS-1', category: 'none' },
    { id: 'region-5', diagnosis: 'ASCH', confidence: 88, image: '/slides/histo_image.jpg', x: 0.6, y: 0.5, zoom: 8, title: 'ASCH-1', category: 'none' },
    { id: 'region-6', diagnosis: 'LSIL', confidence: 76, image: '/slides/histo_image.jpg', x: 0.4, y: 0.7, zoom: 8, title: 'LSIL-3', category: 'none' },
    { id: 'region-7', diagnosis: 'LSIL', confidence: 82, image: '/slides/histo_image.jpg', x: 0.8, y: 0.6, zoom: 8, title: 'LSIL-4', category: 'none' },
    { id: 'region-8', diagnosis: 'ASCUS', confidence: 71, image: '/slides/histo_image.jpg', x: 0.2, y: 0.8, zoom: 8, title: 'ASCUS-2', category: 'none' },
    { id: 'region-9', diagnosis: 'HSIL', confidence: 91, image: '/slides/histo_image.jpg', x: 0.55, y: 0.75, zoom: 8, title: 'HSIL-2', category: 'none' },
    { id: 'region-10', diagnosis: 'AGUS', confidence: 73, image: '/slides/histo_image.jpg', x: 0.35, y: 0.45, zoom: 8, title: 'AGUS-1', category: 'none' },
    { id: 'region-11', diagnosis: 'LSIL', confidence: 79, image: '/slides/histo_image.jpg', x: 0.65, y: 0.35, zoom: 8, title: 'LSIL-5', category: 'none' },
    { id: 'region-12', diagnosis: 'ASCUS', confidence: 68, image: '/slides/histo_image.jpg', x: 0.45, y: 0.55, zoom: 8, title: 'ASCUS-3', category: 'none' },
  ];

  const totalPages = Math.ceil(slideRegions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = slideRegions.slice(indexOfFirstItem, indexOfLastItem);

  const handleDoubleClick = (region: AnnotatedRegion) => {
    // Navigate to the exact position in the slide viewer
    if (onNavigateToRegion) {
      onNavigateToRegion({
        x: region.x,
        y: region.y,
        zoom: region.zoom
      });
    }
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getDiagnosisBadgeColor = (diagnosis: string) => {
    switch (diagnosis) {
      case 'HSIL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'LSIL':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ASCH':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'ASCUS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'AGUS':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return null;
    if (confidence >= 75) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    return <AlertTriangle className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">AI Analysis Results</h3>
          <p className="text-sm text-muted-foreground">
            Sample: {slideData.barcode} | Regions: {slideRegions.length} | Double-click to navigate
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Grid dimension controls */}
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={gridCols}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0 && val <= 6) setGridCols(val);
              }}
              className="w-14 h-8"
              min={1}
              max={6}
            />
            <span className="text-muted-foreground">×</span>
            <Input
              type="number"
              value={gridRows}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0 && val <= 6) setGridRows(val);
              }}
              className="w-14 h-8"
              min={1}
              max={6}
            />
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange('next')}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={onGenerateReport} className="bg-green-600 hover:bg-green-700">
            <FileCheck className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Grid of slide regions */}
      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`
        }}
      >
        {currentItems.map((region) => (
          <Card 
            key={region.id} 
            className="cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary transition-all relative group"
            onDoubleClick={() => handleDoubleClick(region)}
            onClick={() => onSlideSelect?.(region.id)}
          >
            <CardContent className="p-2">
              {/* Title overlay */}
              <div className="absolute top-4 left-4 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {region.title}
              </div>

              {/* Category overlay */}
              {region.category && region.category !== 'none' && (
                <div className="absolute bottom-16 left-4 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {region.category}
                </div>
              )}

              <div className="aspect-square bg-muted rounded border overflow-hidden relative">
                <img 
                  src={region.image} 
                  alt={`Slide region ${region.id}`}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${region.x * 100}% ${region.y * 100}%`
                  }}
                />
                
                {/* Hover overlay with instruction */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Double-click to view
                  </span>
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <Badge className={`text-xs font-semibold ${getDiagnosisBadgeColor(region.diagnosis)}`}>
                  {region.diagnosis}
                </Badge>
                <div className="flex items-center space-x-1">
                  {getConfidenceIcon(region.confidence)}
                  <span className="text-xs text-muted-foreground">{region.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-600">
                {slideRegions.filter(r => r.diagnosis === 'HSIL').length}
              </div>
              <div className="text-xs text-muted-foreground">HSIL</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {slideRegions.filter(r => r.diagnosis === 'LSIL').length}
              </div>
              <div className="text-xs text-muted-foreground">LSIL</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-600">
                {slideRegions.filter(r => r.diagnosis === 'ASCH').length}
              </div>
              <div className="text-xs text-muted-foreground">ASCH</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-yellow-600">
                {slideRegions.filter(r => r.diagnosis === 'ASCUS').length}
              </div>
              <div className="text-xs text-muted-foreground">ASCUS</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {slideRegions.filter(r => r.diagnosis === 'AGUS').length}
              </div>
              <div className="text-xs text-muted-foreground">AGUS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcut hint */}
      <div className="text-xs text-muted-foreground text-center">
        Use ← → arrow keys to navigate pages | Double-click any region to view in slide viewer
      </div>
    </div>
  );
};

export default SlideGridView;
