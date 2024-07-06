import React, { useState, useMemo, useRef } from 'react';

const ComprehensiveSVGPatternBuilder = () => {
  const [shapeColor, setShapeColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [shapeType, setShapeType] = useState('dots');
  const [minSize, setMinSize] = useState(0.5);
  const [maxSize, setMaxSize] = useState(5);
  const [spacing, setSpacing] = useState(20);
  const [opacityPattern, setOpacityPattern] = useState('uniform');
  const [seed, setSeed] = useState(Math.random());
  const [baseOpacity, setBaseOpacity] = useState(1);
  const [randomizeOpacity, setRandomizeOpacity] = useState(false);
  const [rotation, setRotation] = useState(0);

  const canvasSize = { width: 400, height: 400 };
  const svgRef = useRef(null);

  const generateShapes = useMemo(() => {
    const shapes = [];
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const random = mulberry32(seed);

    for (let x = spacing; x < canvasSize.width; x += spacing) {
      for (let y = spacing; y < canvasSize.height; y += spacing) {
        let opacity = baseOpacity;
        switch (opacityPattern) {
          case 'linear':
            opacity *= x / canvasSize.width;
            break;
          case 'radial':
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            opacity *= 1 - (distance / maxDistance);
            break;
          case 'angular':
            const angle = Math.atan2(y - centerY, x - centerX);
            opacity *= (angle + Math.PI) / (2 * Math.PI);
            break;
          case 'wave':
            opacity *= Math.abs(Math.sin((x / 50 + seed * 10) * Math.PI) * Math.cos((y / 50 + seed * 10) * Math.PI));
            break;
        }

        if (randomizeOpacity) {
          opacity *= 0.5 + random() * 0.5;
        }

        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const sizeRatio = 1 - (distanceFromCenter / maxDistance);
        const size = minSize + (sizeRatio * (maxSize - minSize) + random() * (maxSize - minSize) * 0.2);

        shapes.push({ 
          x, 
          y, 
          size, 
          opacity: Math.max(0.1, Math.min(1, opacity))
        });
      }
    }
    return shapes;
  }, [shapeType, minSize, maxSize, spacing, opacityPattern, seed, baseOpacity, randomizeOpacity, canvasSize.width, canvasSize.height]);

  const renderShape = (shape, index) => {
    const rotationTransform = `rotate(${rotation} ${shape.x} ${shape.y})`;
    switch (shapeType) {
      case 'dots':
        return (
          <circle
            key={index}
            cx={shape.x}
            cy={shape.y}
            r={shape.size / 2}
            fill={shapeColor}
            opacity={shape.opacity}
            transform={rotationTransform}
          />
        );
      case 'squares':
        return (
          <rect
            key={index}
            x={shape.x - shape.size / 2}
            y={shape.y - shape.size / 2}
            width={shape.size}
            height={shape.size}
            fill={shapeColor}
            opacity={shape.opacity}
            transform={rotationTransform}
          />
        );
      case 'triangles':
        const height = shape.size * Math.sqrt(3) / 2;
        return (
          <polygon
            key={index}
            points={`${shape.x},${shape.y - height / 2} ${shape.x - shape.size / 2},${shape.y + height / 2} ${shape.x + shape.size / 2},${shape.y + height / 2}`}
            fill={shapeColor}
            opacity={shape.opacity}
            transform={rotationTransform}
          />
        );
      case 'lines':
        return (
          <line
            key={index}
            x1={shape.x - shape.size / 2}
            y1={shape.y}
            x2={shape.x + shape.size / 2}
            y2={shape.y}
            stroke={shapeColor}
            strokeWidth={shape.size / 4}
            opacity={shape.opacity}
            transform={rotationTransform}
          />
        );
      case 'plus':
        return (
          <g key={index} opacity={shape.opacity} transform={rotationTransform}>
            <line
              x1={shape.x - shape.size / 2}
              y1={shape.y}
              x2={shape.x + shape.size / 2}
              y2={shape.y}
              stroke={shapeColor}
              strokeWidth={shape.size / 4}
            />
            <line
              x1={shape.x}
              y1={shape.y - shape.size / 2}
              x2={shape.x}
              y2={shape.y + shape.size / 2}
              stroke={shapeColor}
              strokeWidth={shape.size / 4}
            />
          </g>
        );
      default:
        return null;
    }
  };

  function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  const downloadSVG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "pattern.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const styles = {
    container: {
      display: 'flex',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1e1e1e',
      color: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    },
    column: {
      flex: 1,
      padding: '0 20px',
    },
    control: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '5px',
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: '3px',
    },
    select: {
      width: '100%',
      padding: '5px',
      backgroundColor: '#333',
      color: '#fff',
      border: '1px solid #555',
      borderRadius: '3px',
    },
    canvas: {
      border: '1px solid #444',
      borderRadius: '5px',
      overflow: 'hidden',
    },
    colorInput: {
      width: '50px',
      height: '50px',
      padding: '0',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    button: {
      padding: '10px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '16px',
      marginRight: '10px',
    },
    switch: {
      position: 'relative',
      display: 'inline-block',
      width: '60px',
      height: '34px',
      marginLeft: '10px',
    },
    switchInput: {
      opacity: 0,
      width: 0,
      height: 0,
    },
    switchSlider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      transition: '.4s',
      borderRadius: '34px',
    },
    switchSliderBefore: {
      position: 'absolute',
      content: '""',
      height: '26px',
      width: '26px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      transition: '.4s',
      borderRadius: '50%',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.column}>
        <div style={styles.control}>
          <label style={styles.label}>Shape Color</label>
          <input
            type="color"
            value={shapeColor}
            onChange={(e) => setShapeColor(e.target.value)}
            style={styles.colorInput}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Background Color</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            style={styles.colorInput}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Shape Type</label>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value)}
            style={styles.select}
          >
            <option value="dots">Dots</option>
            <option value="squares">Squares</option>
            <option value="triangles">Triangles</option>
            <option value="lines">Lines</option>
            <option value="plus">Plus</option>
          </select>
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Min Size (px): {minSize.toFixed(1)}px</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={minSize}
            onChange={(e) => setMinSize(Number(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Max Size (px): {maxSize.toFixed(1)}px</label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Spacing (px): {spacing}px</label>
          <input
            type="range"
            min="10"
            max="50"
            value={spacing}
            onChange={(e) => setSpacing(Number(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Opacity Pattern</label>
          <select
            value={opacityPattern}
            onChange={(e) => setOpacityPattern(e.target.value)}
            style={styles.select}
          >
            <option value="uniform">Uniform</option>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="angular">Angular</option>
            <option value="wave">Wave</option>
          </select>
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Base Opacity: {baseOpacity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={baseOpacity}
            onChange={(e) => setBaseOpacity(Number(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.control}>
          <label style={styles.label}>
            Randomize Opacity
            <div style={styles.switch}>
              <input
                type="checkbox"
                checked={randomizeOpacity}
                onChange={(e) => setRandomizeOpacity(e.target.checked)}
                style={styles.switchInput}
              />
              <span style={{
                ...styles.switchSlider,
                backgroundColor: randomizeOpacity ? '#4CAF50' : '#ccc',
              }}>
                <span style={{
                  ...styles.switchSliderBefore,
                  transform: randomizeOpacity ? 'translateX(26px)' : 'translateX(0)',
                }}></span>
              </span>
            </div>
          </label>
        </div>
        <div style={styles.control}>
          <label style={styles.label}>Rotation: {rotation}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            style={styles.input}
          />
        </div>
        <div style={styles.control}>
          <button onClick={() => setSeed(Math.random())} style={styles.button}>
            Randomize Seed
          </button>
          <button onClick={downloadSVG} style={styles.button}>
            Download SVG
          </button>
        </div>
      </div>
      <div style={styles.column}>
        <div style={styles.canvas}>
          <svg
            ref={svgRef}
            width={canvasSize.width}
            height={canvasSize.height}
          >
            <rect width="100%" height="100%" fill={backgroundColor} />
            {generateShapes.map((shape, index) => renderShape(shape, index))}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveSVGPatternBuilder;