'use client';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

// import imagereport from "../resources/test.jpg";
// import homeIcon from "../resources/icons/home (1).png";
import gridIcon from "./icons/menu.png";
import nextIcon from "./icons/next.png";
import prevIcon from "./icons/arrow.png";
import fullScreenIcon from "./icons/fullscreen.png";
import nextPatient from "./icons/next (1).png";
import previousPatient from "./icons/back.png";
import measureIcon from "./icons/measure.png";
import imageEdit from "./icons/eye.png";

import util from './util/datamanager';

import FreqIntGraph from "./FreqIntGraph";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';


// import { Modal } from 'react-bootstrap';
import DeepZoomViewer from "./DeepZoomViewer";
import OpenSeadragon from "openseadragon";
// import Slider from '@mui/material/Slider';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

// import Draggable from 'react-draggable';

// import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { ContextMenu } from 'primereact/contextmenu';


import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

// Be sure to include styles at some point, probably during your bootstraping
import '@trendmicro/react-sidenav/dist/react-sidenav.css'


const SuspectedTileViewer = ({ Doctor, tileName }) => {
  //api call to get coordinates of selected file from the server

  const navigate = useNavigate();

  const childRef = useRef();

  const [zoomLevel, setZoomLevel] = useState();
  const [xCoord, setXCoord] = useState();
  const [yCoord, setYCoord] = useState();

  const [annotArr, setAnnotArr] = useState([]);
  // const [annotArrNDPI, setAnnotArrNDPI] = useState([]);

  const [showDragonView, setShowDragonView] = useState(false);
  const [selectedAnnotaiton, setSelectedAnnotation] = useState(null);

  const [images, setImages] = useState([])
  const [totalImagesCount, setTotalImagesCount] = useState(0);

  const [gridx, setGridx] = useState(4);
  const [gridy, setGridy] = useState(3);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);

  const [imageId, setImageId] = useState();

  const [scaleSelected, setScaleSelected] = useState(false)

  const [gamma, setGamma] = useState(1);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const [imageSettings, setImageSettings] = useState(`brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`)

  const [viewer, setViewer] = useState('')

  const [widthTile, setWidthTile] = useState()
  const [heightTile, setHeightTile] = useState()

  const [RGBGraph, setRGBGraph] = useState(false)

  const [sliderValue, setSliderValue] = useState([20, 80]);

  const cm = useRef(null);

  const items = [
    { label: 'HSIL', command: (event) => handleMenuCategory('HSIL', imageId) },
    { label: 'LSIL', command: (event) => handleMenuCategory('LSIL', imageId) },
    { label: 'ASCH', command: (event) => handleMenuCategory('ASCH', imageId) },
    { label: 'ASCUS', command: (event) => handleMenuCategory('ASCUS', imageId) },
    { label: 'AGUS', command: (event) => handleMenuCategory('AGUS', imageId) },
    { label: 'REVIEW', command: (event) => handleMenuCategory('REVIEW', imageId) },
    { label: 'FP', command: (event) => handleMenuCategory('FP', imageId) },
    { label: 'UNDP', command: (event) => handleMenuCategory('UNDP', imageId) },

  ];



  useEffect(() => {

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowRight':
          // Call the function for the right arrow key here
          handlePageClick(currentPage + 1);
          break;
        case 'ArrowLeft':
          // Call the function for the left arrow key here
          handlePageClick(currentPage - 1);
          break;

        case 'F':
        case 'f':
          toggleFullScreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    window.addEventListener('click', (event) => {



      const x = event.clientX;
      const y = event.clientY;

      // Log the coordinates
      console.log(`X: ${x}, Y: ${y}`);

    });

    const setupScreen = async () => {

      let annotDet = await util.fetchData(`tileSlide/${Doctor}/${tileName}`, 'GET', 'application/json')

      setWidthTile(annotDet.tileDeatil.width)
      setHeightTile(annotDet.tileDeatil.height)

      let imagesArr = annotDet.Predicts.map(x => {
        return {
          id: x.id,
          src: `http://localhost:3000/get_image/${Doctor}/${tileName}/${x.id}`,
          // src: `http://127.0.0.1:8000/api/open-slide`,
          alt: x.title,
          zoom: 64,
          x: x.openSeaXCoord,
          y: x.openSeaYCoord,
          annotation: x.title,
          cat: x.cat,
          title: x.title
        }
      })

      setTotalImagesCount(imagesArr.length);


      let annotDetArr = annotDet.Predicts.map(x => {
        return {
          xywh: `xywh=pixel:${x.x1},${x.y1},${x.x2 - x.x1},${x.y2 - x.y1}`,
          id: x.id,
          title: x.title,
          cat: x.cat
        }
      })

      setAnnotArr(annotDetArr);

      let Images20, newImgArr = [], newImgArr2;
      let noCalls = Math.floor(imagesArr.length / 12);
      // noCalls=1
      for (var i = 0; i < noCalls; i++) {

        Images20 = imagesArr.slice(i * 12, (i + 1) * 12);

        let listImages = await Promise.all(Images20.map(images =>
          util.fetchData(`get_image/${Doctor}/${tileName}/${images.id}`, 'GET', 'image/jpeg')
            .then(response => response.blob())
            .then(blob => URL.createObjectURL(blob))
        )
        );

        Images20.forEach((x, index) => {

          x.src2 = listImages[index]

        })

        // Images20 = [...Images20[0], ...Images20[2]]
        Images20.forEach((x, index) => {

          x.src2 = listImages[index]

        })

        newImgArr = [...newImgArr, ...Images20]

        setImages(newImgArr)

        // console.log(noCalls)
      }

    }

    setupScreen()

  }, []);

  const onRightClick = (event, id) => {
    if (cm.current) {
      setImageId(id);
      cm.current.show(event);
    }
  };

  const handleMenuCategory = (cat, id) => {

    let oldCat = images.find(x => x.id === id).cat;
    if (oldCat.indexOf(cat) > -1) {
      return;
    }

    let newCat = oldCat + "," + cat;
    newCat = newCat.replace('none,', '')
    images.find(x => x.id === id).cat = newCat;
    setImages([...images]);
    currentItems.find(x => x.id === id).cat = newCat;

    util.fetchData(`updateCategory/${Doctor}/${tileName}/${id}/${newCat}`, 'GET', 'application/json')

  }

  const handleImageClick = (zoom, x, y, annotation) => {

    if (scaleSelected) {
      return;
    }

    setSelectedAnnotation(annotation)
    setShowDragonView(true)
    // setZoomLevel(1);
    // setXCoord(0);
    // setYCoord(0);
    setZoomLevel(zoom);
    setXCoord(x);
    setYCoord(y);

  };



  const handlePageClick = (pageNumber) => {
    if (
      pageNumber < 1
      // ||
      // pageNumber > Math.ceil(images.length / itemsPerPage)
    ) {
      return;
    }
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(images.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const toggleFullScreen = (event) => {

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
      document.documentElement.msRequestFullscreen();
    }
  }

  const updateFilterBrigtness = (filterObj) => {
    const val = filterObj.target.value;
    setBrightness(val);
    setImageSettings(`brightness(${val}%) contrast(${contrast}%) saturate(${saturation}%)`);
  };
  const updateFilterContrast = (filterObj) => {
    const val = filterObj.target.value;
    setContrast(val);
    setImageSettings(`brightness(${brightness}%) contrast(${val}%) saturate(${saturation}%)`);
  };

  const updateFilterGamma = (filterObj) => {
    // Gamma not supported in standard CSS filters, ignoring for now or mapping if possible
    // Keeping state but not applying to filter string
    setGamma(filterObj.target.value);
  };

  //write a similart method for saturation
  const updateFilterSaturation = (filterObj) => {
    const val = filterObj.target.value;
    setSaturation(val);
    setImageSettings(`brightness(${brightness}%) contrast(${contrast}%) saturate(${val}%)`);
  };

  const resetFilters = function () {
    setBrightness(100);
    setContrast(100);
    setGamma(1);
    setSaturation(100);
    setImageSettings(`brightness(100%) contrast(100%) saturate(100%)`);
  };

  const filterStyle = {
    // filter: `brightness(${red}%) contrast(${green}%) saturate(${blue}%)`
    filter: `brightness(40%) contrast(200%) saturate(150%)`
  };

  const onClose = () => {
    setRGBGraph(false)
  }

  const handleSliderChange = (newValue) => {
    setSliderValue(newValue);
    console.log(`Slider values: ${newValue}`);
  };

  return (
    <div>

      <Dialog open={RGBGraph} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Frequency Intensity Graph</DialogTitle>
        <DialogContent>
          <FreqIntGraph min={0} max={255} step={1} onChange={handleSliderChange} />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={onClose}>Close</Button> */}
        </DialogActions>
      </Dialog>

      {/* <Draggable >
        <div className="dialogBox" style={{position: "absolute", top: "50%", zIndex:"1000", transform: "translate(-50%, -50%)"}}>
          This dialog box can be dragged around.
        </div>
      </Draggable> */}


      <div style={{ display: "flex" }}>
        <div>
          <SideNav
            onSelect={(selected) => {

            }}
            style={{ background: "#1976d2" }}>
            <SideNav.Toggle />
            <SideNav.Nav defaultSelected="fullScreen">
              <NavItem eventKey="home" onClick={(event) => toggleFullScreen(event)}>
                <NavIcon>
                  <img src={fullScreenIcon} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                </NavIcon>
                <NavText>
                  Home
                </NavText>
              </NavItem>
              {!showDragonView && (
                <>
                  <NavItem eventKey="changeDimension">
                    <NavIcon>
                      <img src={gridIcon} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                    </NavIcon>
                    <NavText>
                      Adjust Dimension
                    </NavText>
                    <NavItem eventKey="charts/linechart">
                      <NavText>
                        <input
                          type="number"
                          value={gridx}
                          onChange={(event) => {
                            const newGridx = Number(event.target.value);
                            if (newGridx === 0) {
                              setGridx("")
                              return;
                            }
                            setGridx(newGridx);
                            setItemsPerPage(newGridx * gridy);
                          }}
                          style={{ height: "1rem" }}
                        />
                        <input
                          type="number"
                          value={gridy}
                          onChange={(event) => {
                            const newGridy = Number(event.target.value);
                            if (newGridy === 0) {
                              setGridy("")
                              return;
                            }
                            setGridy(newGridy);
                            setItemsPerPage(gridx * newGridy);
                          }}
                          style={{ height: "1rem" }}
                        />
                      </NavText>
                    </NavItem>
                  </NavItem>
                  <NavItem eventKey="nextPage" disabled={currentPage >= Math.ceil(images.length / itemsPerPage)}>
                    <NavIcon>
                      <img
                        onClick={() => {
                          if (currentPage < Math.ceil(images.length / itemsPerPage)) {
                            handlePageClick(currentPage + 1);
                          }
                        }}
                        src={nextIcon}
                        style={{
                          fontSize: '1rem',
                          width: "2rem",
                          color: "white",
                          opacity: currentPage >= Math.ceil(images.length / itemsPerPage) ? 0.5 : 1,
                          cursor: currentPage >= Math.ceil(images.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </NavIcon>
                    <NavText>
                      Next Page
                    </NavText>
                  </NavItem>
                  <NavItem eventKey="previousPage" onClick={() => handlePageClick(currentPage - 1)}>
                    <NavIcon>
                      <img src={prevIcon} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                    </NavIcon>
                    <NavText>
                      Previous Page
                    </NavText>
                  </NavItem>
                  <NavItem eventKey="nextPatient" >
                    <NavIcon>
                      <img src={nextPatient} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                    </NavIcon>
                    <NavText>
                      Next Patient
                    </NavText>
                  </NavItem>
                  <NavItem eventKey="previousPatient" >
                    <NavIcon>
                      <img src={previousPatient} style={{ fontSize: '1rem', width: "2rem", color: "white" }} className={filterStyle} />
                    </NavIcon>
                    <NavText>
                      Previous Patient
                    </NavText>
                  </NavItem>

                  <NavItem eventKey="pageStats" style={{ pointerEvents: 'none' }}>
                    <NavText style={{ paddingLeft: '10px', color: '#ccc', fontSize: '0.8em', lineHeight: '1.4' }}>
                      <div style={{ marginTop: '10px' }}>total: {Math.ceil(totalImagesCount / itemsPerPage) || 1}</div>
                      <div>current: {currentPage}</div>
                      <div>loaded: {Math.ceil(images.length / itemsPerPage)}</div>
                    </NavText>
                  </NavItem>

                </>
              )}

              {showDragonView && (
                <>
                  <NavItem active={scaleSelected} eventKey="measure" onClick={() => { setScaleSelected(!scaleSelected); }}>
                    <NavIcon>
                      <img src={measureIcon} style={{ fontSize: '1rem', width: "2rem", color: "white", backgroundColor: scaleSelected ? "rgba(255,255,255,0.3)" : "transparent" }} />
                    </NavIcon>
                    <NavText>
                      Enable Measure
                    </NavText>
                  </NavItem>
                  <NavItem active={false} eventKey="changeImage" onClick={() => { }}>
                    <NavIcon>
                      <img src={imageEdit} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                    </NavIcon>
                    <NavItem>
                      <NavText>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginLeft: "0.8rem",
                            width: "200px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                        >
                          <button className="btn btn-primary" onClick={resetFilters}>
                            Reset
                          </button>
                          <label>
                            Brightness
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={brightness}
                              onChange={updateFilterBrigtness}
                              className="form-range"
                              step="1"
                            />
                          </label>
                          <label>
                            Contrast
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={contrast}
                              onChange={updateFilterContrast}
                              className="form-range"
                            />
                          </label>
                          <label>
                            Saturation
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={saturation}
                              onChange={updateFilterSaturation}
                              className="form-range"
                              step="1"
                            />
                          </label>
                        </div>
                      </NavText>
                    </NavItem>
                  </NavItem>
                  <NavItem active={false} eventKey="graphs" onClick={() => { setRGBGraph(true) }}>
                    <NavIcon>
                      {/* Using a graph-like icon or reusing eye if requested, but user said 'graph' */}
                      <img src={imageEdit} style={{ fontSize: '1rem', width: "2rem", color: "white" }} />
                    </NavIcon>
                    <NavItem>
                      <NavText>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginLeft: "0.8rem",
                            width: "20rem",
                            height: "20rem",
                            overflowY: "auto",
                            overflowX: "hidden"
                          }}
                        >
                          <FreqIntGraph min={0} max={255} step={1} onChange={handleSliderChange}></FreqIntGraph>
                        </div>
                      </NavText>
                    </NavItem>
                  </NavItem>
                </>
              )}
            </SideNav.Nav>
          </SideNav>
        </div>
        <div className="grid" style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridx}, 1fr)`,
          gridTemplateRows: `repeat(${gridy}, 1fr)`,
          marginLeft: "65px"
        }}>
          {currentItems.map((image, index) => (
            <div key={index} className="grid-item" style={{ position: 'relative' }}>
              <ContextMenu model={[...items,]} ref={cm} breakpoint="767px" />
              <img className={(scaleSelected) ? 'imageBtnScale' : 'imageBtn'} src={image.src2} alt="" onClick={() => handleImageClick(image.zoom, image.x, image.y, image.annotation)} style={{ height: "100%" }} onContextMenu={(event) => onRightClick(event, image.id)} />


              <div style={{ position: "absolute", top: "10px", left: "10px", color: "white", background: "rgba(0, 0, 0, 0.5)", padding: "5px" }}>
                {image.title}
              </div>
              <div style={{ position: "absolute", bottom: "10px", left: "10px", color: "white", background: "rgba(0, 0, 0, 0.5)", padding: "5px" }}>
                {image.cat === "none" ? '' : image.cat}
              </div>
            </div>
          ))}
        </div>
        <SlidingPane
          className="some-custom-class fullScreenSlidePane"
          overlayClassName="some-custom-overlay-class"
          isOpen={showDragonView}

          // title={selectedAnnotaiton}
          hideHeader={true}

          // subtitle="Optional subtitle."
          onRequestClose={() => {
            // triggered on "<" on left top click or on outside click
            setShowDragonView(false);
          }}
        >
          <DeepZoomViewer widthTile={widthTile} heightTile={heightTile} setViewer2={setViewer} imageSettings={imageSettings} ref={childRef} zoomLevel={zoomLevel} xCoord={xCoord} yCoord={yCoord} annotDetArr={annotArr} Doctor={Doctor} tileName={tileName} scaleSelected={scaleSelected}></DeepZoomViewer>
        </SlidingPane>
      </div >

    </div >
  );
};

export default SuspectedTileViewer;
