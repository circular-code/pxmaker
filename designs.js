"use strict";

const pxmaker = {
    init: function() {
        // prepare the site, get html elements, set up event listeners
        this.prepare();
        
        // define Prototypes of canvas class
        canvas.definePrototypes();

        // initialise the saved images bar
        loadBar.init();

        // create first grid, so the user does not get presented an empty page
        grid.makeGrid(grid.data.height,grid.data.width,grid.scaleInput.value);
        
        // save the grid if no data is present from previous sessions/ no grid has been saved yet
        if (!this.savedStates || this.savedStates.length === 0) {
            grid.save();
        }

        // set the load counter to 1, this counter is needed for redo/undo
        this.loadCounter = 1;
        
        // load the currently selected image
        grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);

        // create a color picker on the site to use
        grid.createColorPicker(0);
        
        // set the color of the current color
        grid.colorDisplay.style.backgroundColor = '#000000';
    },
    prepare: function() {

        // get saved Items from localstorage and save them into savedStates
        this.savedStates = JSON.parse(localStorage.getItem('pxmaker3000')) || [];

        // Get dom elements
        this.loadBarHtml = document.getElementById('loadBar');

        grid.heightInput = document.getElementById('gridHeight');
        grid.widthInput = document.getElementById('gridWidth');
        grid.scaleInput = document.getElementById('pixelScale');
        grid.colorDisplay = document.getElementById('colorDisplay');
        grid.colorPicker = document.getElementById('colorPickerHsl');
        grid.hueRange = document.getElementById('hueRange');
        grid.brushSize = document.getElementById('brushSize');
        grid.container = document.getElementById('pixelCanvasBody');
        grid.showGridButton = document.getElementById('showGrid');
        grid.erase = document.getElementById('erase');
        grid.replaceInput = document.getElementById('replace');
        grid.getColor = document.getElementById('getColor');
        grid.lineColorInput = document.getElementById('gridLineColor');
        grid.lineOpacityInput = document.getElementById('gridLineOpacity');
        grid.clearGridButton = document.getElementById('clearGrid');
        grid.makeGridButton = document.getElementById('makeGridButton');
        grid.button16px = document.getElementById('button16px');
        grid.button24px = document.getElementById('button24px');
        grid.button32px = document.getElementById('button32px');
        grid.button64px = document.getElementById('button64px');
        grid.deleteButton = document.getElementById('deleteButton');
        grid.hexInput = document.getElementById('hexInput');
        
        canvas.downloadButton = document.getElementById('downloadButton');
        grid.showOriginalButton = document.getElementById('showOriginal');

        grid.originalSizeCanvas = document.getElementById('originalSize');
        grid.hiddenCanvasWrapper = document.getElementById('hiddenCanvasWrapper');

        grid.reDo = document.getElementById('reDo');
        grid.unDo = document.getElementById('unDo');

        grid.palette = document.getElementById('palette');

        // Set up event listeners
        grid.heightInput.addEventListener('change', function() {
            grid.data.height = grid.heightInput.value; 
        });
        grid.widthInput.addEventListener('change', function() {
            grid.data.width = grid.widthInput.value;
        });

        // resize grid on enter of height input
        grid.heightInput.addEventListener('keyup', function(e) {
            if (e.keyCode === 13)
                grid.resize();
        });
        
        // resize grid on enter of width input
        grid.widthInput.addEventListener('keyup', function(e) {
            // on enter
            if (e.keyCode === 13)
                grid.resize();
        });

        // resize canvas when scale changes
        grid.scaleInput.addEventListener('change', function() {
            
            grid.data.scale = grid.scaleInput.value;
            grid.resize();
        });

        // replace old colorpicker with new colorpicker when the hue range changes
        grid.hueRange.addEventListener('change',function(e) {
            grid.createColorPicker(e.target.value);
        });

        // save the newly picked color from the colorpicker into all needed places
        grid.colorPicker.addEventListener('mouseup', function(e) {
            grid.data.color = e.target.style.backgroundColor;
            grid.hexInput.value = grid.data.color = grid.colorDisplay.style.backgroundColor = utility.colorConverter(e.target.style.backgroundColor, "hex");
        });

        // hide and show gridlines
        grid.showGridButton.addEventListener('click', function(e) {
            if (e.target.className !== 'active'){
                e.target.className = 'active';
                grid.lineColorInput.disabled = true;
                grid.lineOpacityInput.disabled = true;
                grid.clearGridLines();
            }
            else {
                grid.changeGridLines(grid.data.baseLineColor,grid.lineOpacityValue);
                grid.lineColorInput.disabled = false;
                grid.lineOpacityInput.disabled = false;
                e.target.className = '';
            }
        });
        
        // change grid line color
        grid.lineColorInput.addEventListener('change', function(e) {
            grid.data.baseLineColor = e.target.value;
            grid.changeGridLines(grid.data.baseLineColor,grid.lineOpacityValue);
        });

        // change grid line opacity
        grid.lineOpacityInput.addEventListener('change', function(e) {
            grid.lineOpacityValue = e.target.value/100;
            grid.changeGridLines(grid.data.baseLineColor,grid.lineOpacityValue);
        });

        // draw if pencil tool is selected, erase if eraser is selected, get color if get color tool is selected, replace if replacer tool is selected
        grid.container.addEventListener('mousedown', function(e) {
            if (grid.erase.checked !== true && grid.data.oldColor){
                grid.data.color = grid.data.oldColor;
                grid.data.oldColor = undefined;
            }
            if (grid.getColor.checked === true ) {
                if (e.target.style.backgroundColor !== 'transparent' && e.target.style.backgroundColor !== ''){
                    grid.hexInput.value = grid.data.color = grid.colorDisplay.style.backgroundColor = utility.colorConverter(e.target.style.backgroundColor, "hex");
                }
            } 
            else if (grid.replaceInput.checked === true) {
                grid.replace(e.target.style.backgroundColor);
            }
            else if (grid.erase.checked === true) {
                grid.draw(e.target,"transparent");
            }
            else {
                grid.draw(e.target,grid.data.color);
            }
        });

        
        // draw or erase on drag
        grid.container.addEventListener('mouseover', function(e) {
            if(pxmaker.mouseClicked && grid.getColor.checked !== true && grid.replaceInput.checked !== true) {
                if (grid.erase.checked === true) {
                    grid.draw(e.target,"transparent");
                } else {
                    grid.draw(e.target,grid.data.color);
                } 
            }
        });

        
        // autosave after making adjustments by drawing
        grid.container.addEventListener('mouseup', function() {
            if(grid.getColor.checked === false)
                grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        });

        
        // clear and save grid
        grid.clearGridButton.addEventListener('click', function() {
            grid.clearGrid();
            grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex, true);
        });

        grid.makeGridButton.addEventListener('click', function() {
            grid.makeAndSaveGrid(grid.data.width, grid.data.height, grid.scaleInput.value);
        });

        grid.button16px.addEventListener('click', function() {
            grid.data.width = 16;
            grid.data.height = 16;
            grid.makeAndSaveGrid(16, 16, grid.scaleInput.value);
        });
        grid.button24px.addEventListener('click', function() {
            grid.data.width = 24;
            grid.data.height = 24;
            grid.makeAndSaveGrid(24, 24, grid.scaleInput.value);
        });
        grid.button32px.addEventListener('click', function() {
            grid.data.width = 32;
            grid.data.height = 32;
            grid.makeAndSaveGrid(32, 32, grid.scaleInput.value);
        });
        grid.button64px.addEventListener('click', function() {
            grid.data.width = 64;
            grid.data.height = 64;
            grid.makeAndSaveGrid(64, 64, grid.scaleInput.value);
        });

        // delete current selected saved image
        grid.deleteButton.addEventListener('click', function() {
            grid.delete();
        });

        
        // load previous saved state of image
        grid.reDo.addEventListener('click', function() {
            pxmaker.loadCounter--;
            grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex, true);
        });

        
        // load next saved state of image
        grid.unDo.addEventListener('click', function() {
            pxmaker.loadCounter++;
            grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex, true);
        });

        
        // hide or show original size representation of current edited canvas
        grid.showOriginalButton.addEventListener('click', function() {
            if (!grid.originalShown){
                grid.showOriginal(document.getElementById('pixelCanvas'));
            } else {
                grid.hideOriginal();
            }
        });
        
        
        // download current selected image
        canvas.downloadButton.addEventListener('click', function() {
            canvas.download(this, 'canvas', 'your_creation.png');
        }, false);

        
        // track if mouse has been clicked for preventing drag event to happen on draw
        document.addEventListener('mousedown', function() {
            pxmaker.mouseClicked = true;
        });

        
        // track if mouse has been clicked for preventing drag event to happen on draw
        document.addEventListener('mouseup', function() {
            pxmaker.mouseClicked = false;
        });

        // zoom in / out on scroll
        document.getElementById('canvasWrapper').addEventListener('wheel', function(e) {
            e.deltaY > 0 ? grid.handleScroll("up") : grid.handleScroll("down");
        });

        // color dragging
        grid.colorDisplay.addEventListener('dragstart', function(e) {
            e.target.style.opacity = 0.3;
            grid.dragSource = e.target;
            grid.palette.classList = 'over';
        });
        grid.palette.addEventListener('dragover', function(e) {
            if (grid.dragSource !== grid.colorDisplay){
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
                }
        });
        grid.palette.addEventListener('drop', function(e) {
            if (grid.dragSource !== grid.colorDisplay){
                return;
            }
            console.log('dropped on ' + e.target);
            grid.palette.classList = '';
            grid.dragSource.style.opacity = 1;
            grid.addPaletteItem();
        });
        grid.colorDisplay.addEventListener('dragend', function() {
            grid.dragSource.style.opacity = 1;
            grid.palette.classList = '';
        });

        // track and react to hex input changes
        grid.hexInput.addEventListener('keyup', function(e) {
            if (utility.isHexColor(e.target.value))
                grid.data.color = grid.colorDisplay.style.backgroundColor = e.target.value;
        });
    }
};

const grid = {
    // grid basics
    originalShown: false,
    data: {
        baseColor: '#ffffff',
        baseLineColor: 'rgba(0,0,0,0)',
        lineOpacityValue: 1,
        height: 16,
        width: 16,
        scale: 20,
        color: '#000000',
        brushSize: 1,
        pixels: []
    },
    makeGrid: function(height,width,scale,loaded) {
        this.container.innerHTML = "";

        // use loops to create the grid
        for(let i=0; i<height; i++) {
            
            let tr = document.createElement('tr');
            tr.draggable = false;
            
            for(let j=0; j<width; j++) {

                let td = document.createElement('td');
                td.style.height = scale + "px";
                td.style.width = scale + "px";
                td.draggable = false;
                tr.appendChild(td);
            }

            this.container.appendChild(tr);
        }
        this.tdArray = [].slice.call(this.container.querySelectorAll('td'));

        // if grid was not loaded, add selected class to the new element
        if (!loaded){
            let nodes = pxmaker.loadBarHtml.childNodes;
            if (nodes.length > 0)
                nodes[nodes.length -1].classList += ' selected';
        }
    },
    // create and save the grid when inside size limitations
    makeAndSaveGrid: function(height, width, scale) {
        if (grid.checkIsContaining(width * scale, height * scale)) {
            if (pxmaker.loadCounter > 1) {
                grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
                pxmaker.loadCounter = 1;
            }
            grid.widthInput.value = width;
            grid.heightInput.value = height;
            grid.makeGrid(height, width, scale);
            grid.save();
        } else {
            grid.data.width = grid.widthInput.value ;
            grid.data.height = grid.heightInput.value;
        }
    },
    clearGrid: function() {
        this.tdArray.forEach(function(td) {
            td.style.backgroundColor = 'transparent';
        });
    },
    // change the color/opacity of gridlines
    changeGridLines: function(color,opacity) {

        if (!color.match(/.*\d.*/g)){
            console.log("invalid color value given for calculating grid opacity");
        }
        // hex & rgb
        else if (color.indexOf('rgba') === -1) {

            if (color.indexOf('#') !== -1) {
                color = utility.hexToRgb(color);
            }

            color = color.slice(0, -1) + ', ' + opacity + ')';
            color = color.replace('rgb', 'rgba');
        }
        //rgba
        else if ((color.indexOf('rgba') !== -1)){
            color = color.substring(0,color.lastIndexOf(',')) + ', ' + opacity + ')';
        }
        else {
            console.log("invalid color value given for calculating grid opacity");
        }

        this.tdArray.forEach(function(td) {
            td.style.border = '1px solid'; 
            td.style.borderColor = color;
        });
    },
    clearGridLines: function() {
        this.tdArray.forEach(function(td) {
            td.style.border = 'none'; 
        });
    },
    draw: function(elem,color) {

        // stop the function when element is not table cell (of canvas)
        if (elem.tagName !== 'TD')
            return;

        // transform brushsize to number (could be string)
        let size = +grid.brushSize.value;

        // basic draw the cell when brushsize = 1 cell
        if (size === 1) 
            elem.style.backgroundColor = color;
        // if brushsize is bigger than 1, calculate the according other cells that have to be painted as well. starting from first cell going right and down
        else if (size > 1) {   
            let tds = elem.parentNode.childNodes;
            let trs = elem.parentNode.parentNode.childNodes;
            let currentChildNodeIndex = utility.getChildNodeIndex(elem, tds);
            let currentRowIndex = utility.getChildNodeIndex(elem.parentNode, trs);

            for (let j = 0; j < size; j++) {
                if (trs[currentRowIndex + j]) {
                    tds = trs[currentRowIndex + j].childNodes;
                }

                for (let k = 0; k < size; k++) {
                    if (tds[currentChildNodeIndex + k]) {
                        tds[currentChildNodeIndex + k].style.backgroundColor = color;
                    }
                }
            }
        }
    },
    // draw complete image from data (happens when user loads old data)
    drawFull: function(target,data) {
        [].slice.call(target.children).forEach(function(row,rowindex) {
            if(row){       
                [].slice.call(row.children).forEach(function(cell,cellindex) {
                    if (cell)
                        cell.style.backgroundColor = data[rowindex] ? data[rowindex][cellindex] : 'transparent';
                });
            }
        });
    },
    // get actual pixel data from html table canvas and save them in grid.data.pixels
    getPixelData: function() {
        grid.data.pixels = [];

        [].slice.call(this.container.children).forEach(function(tr) {

            let trArray = [];
            
            [].slice.call(tr.children).forEach(function(td) {
                trArray.push(td.style.backgroundColor);
            });   

            grid.data.pixels.push(trArray);
        });
    },
    // save current edited image at the position (index) given
    save: function(index, clear) {
        this.getPixelData();

        if (index){
            if (pxmaker.loadCounter > 1) {
                // if undo button has been pressed replace to be overwritten state with current image state
                pxmaker.savedStates[index][pxmaker.savedStates[index].length - pxmaker.loadCounter] = JSON.parse(JSON.stringify(this.data));
                // remove every saved state before the new entry
                pxmaker.savedStates[index] = pxmaker.savedStates[index].slice(0,[pxmaker.savedStates[index].length - pxmaker.loadCounter +1]);
                // reset loadCounter
                pxmaker.loadCounter = 1;
            }
            else {
                // if no undo has been pressed, just add the data to the savedStates Array
                pxmaker.savedStates[index].push(JSON.parse(JSON.stringify(this.data)));
            }
            if (clear) {
                // clear all states of current index except the last
                pxmaker.savedStates[index] = pxmaker.savedStates[index].splice([pxmaker.savedStates[index].length - 1],1);
            }
        }
        else {
            // if its the first time saving the image parse and stringify to copy the data, to prevent the object from beeing linked
            pxmaker.savedStates.push([JSON.parse(JSON.stringify(this.data))]);
        }
            
        // push data to localstorage and refresh loadbar
        localStorage.setItem('pxmaker3000',JSON.stringify(pxmaker.savedStates));
        loadBar.init();

        // refresh selected state in loadbar
        let nodes = pxmaker.loadBarHtml.childNodes;
        if (nodes.length > 0) {
            typeof index === 'undefined' ?
            nodes[nodes.length -1].classList += ' selected' :
            nodes[index].classList += ' selected';
        }
    },
    // delete currently selected image from page and localStorage
    delete: function() {
        let index = pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex;
        this.clearGrid();

        //remove current image from savedstates/localstorage and reload loadbar
        pxmaker.savedStates.splice(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex,1);
        localStorage.setItem('pxmaker3000',JSON.stringify(pxmaker.savedStates));
        loadBar.init();

        let nodes = pxmaker.loadBarHtml.childNodes;

        if (!nodes){
            alert("nothing to delete");
            return;
        }

        if (index > nodes.length -1)
            index = nodes.length -1;

        if (pxmaker.savedStates.length > 0){
            this.load(index);
            nodes[index].classList += ' selected';
        } else {
            this.save();
        }

    },
    load: function(index, reDoOrUnDo) {
        // if nothing has been saved yet, save current first, then load current
        if(pxmaker.savedStates.length <= 0){
            this.save();
        }
        
        // if user goes back and forth with undo/redo alert if there is no data to load anymore
        if (pxmaker.loadCounter !== 1 && pxmaker.savedStates[index][pxmaker.savedStates[index].length - pxmaker.loadCounter ] === undefined) {
            alert("No Data to load");
            if (pxmaker.loadCounter < 1) {
                pxmaker.loadCounter = 1;
            } 
            else {
                pxmaker.loadCounter--;
            }
        }
        else {
            //copy selected image state data into grid.data
            this.data = JSON.parse(JSON.stringify(pxmaker.savedStates[index][pxmaker.savedStates[index].length - pxmaker.loadCounter ]));

            // set interface values to new data
            grid.heightInput.value = this.data.height;
            grid.widthInput.value = this.data.width;

            if(!reDoOrUnDo)
                grid.data.color = grid.colorDisplay.style.backgroundColor = this.data.color;

            // create grid and fill it with new pixels
            this.makeGrid(this.data.height, this.data.width, this.data.scale ,true);
            this.drawFull(this.container, this.data.pixels);
            grid.scaleInput.value = this.data.scale;

        }
    },
    // make new grid and fill it with pixels when size is possible for display
    resize: function(scale) {
        if (grid.checkIsContaining(this.data.width * this.data.scale, this.data.height * this.data.scale)) {
            this.makeGrid(this.data.height, this.data.width, grid.scaleInput.value,true);
            this.drawFull(this.container, this.data.pixels);
            if (!scale)
                grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        }
    },
    // create new Canvas element for original shown or download
    createCanvas: function(visible) {
        canvas.newCanvas = new canvas.Create(this.data.height,this.data.width,this.data.pixels);

        if (visible) {
            this.originalSizeCanvas.appendChild(canvas.newCanvas.html);
            this.originalSizeCanvas.childNodes[0].id = "canvas";
        }
        else {
            this.hiddenCanvasWrapper.innerHTML = "";
            this.hiddenCanvasWrapper.appendChild(canvas.newCanvas.html);
            this.hiddenCanvasWrapper.childNodes[0].id = "hiddenCanvas";
        }
    },
    // create and display original size representation of currently edited image
    showOriginal: function(targetNode) {
        this.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        this.createCanvas(true);

        targetNode.style.display = "none";
        this.showOriginalButton.className = "active";
        this.originalShown = true;
    },
    hideOriginal: function() {
        document.getElementById('pixelCanvas').style.display = 'table';
        this.originalSizeCanvas.innerHTML = "";
        this.showOriginalButton.className = "";
        this.originalShown = false;
    },
    // build a div table of 1px elements with each having one particular background color to get clicked on (changes current color)
    createColorPicker: function(hue) {
        this.colorPicker.innerHTML = "";

        for(let i=100; i>0; i--) {
            
            let tr = document.createElement('div');
            tr.style.height = "1px";
            
            for(let j=100; j>0; j--) {

                let td = document.createElement('div');
                td.style.display = "inline-block";
                td.style.width = "1px";
                td.style.height = "1px";
                td.style.backgroundColor = "hsl(" + hue + "," + j + "%," + i + "%)";
                tr.appendChild(td);
            }

            this.colorPicker.appendChild(tr);
        }
    },
    // replace all instances of a certain selected color with the current color in table canvas
    replace: function(color) {
        let trs = grid.container.childNodes;

        for(let i = 0; i < trs.length; i++) {

            let tds = trs[i].childNodes;

            for(let j = 0; j < tds.length; j++) {
                if (tds[j].style.backgroundColor === color) {
                    tds[j].style.backgroundColor = grid.data.color;
                }
            }
        }
        grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
    },
    // change scaleInput value depending on if scroll is zoom in or zoom out
    handleScroll: function(direction) {
        if (direction === "up") {
            // num = -1;
            grid.scaleInput.value = grid.data.scale = parseInt(grid.scaleInput.value) - 1 || 1;
        }
        else {
            if (!grid.checkIsContaining(grid.container.clientWidth, grid.container.clientHeight))
                return;
            // num = 1;
            grid.scaleInput.value = grid.data.scale = parseInt(grid.scaleInput.value) + 1;
        }

        grid.resize(true);
    },
    // check if the height and widht of a new canvas to be drawn fit into the current size if the canvas display area
    checkIsContaining: function(width, height, silent) {
        let canvasContainer = document.getElementById('canvasWrapper');
        if (canvasContainer.clientWidth - 30 <= width) {
            if(!silent)
                alert('Canvas will be too wide');
            return false;
        }
        if (canvasContainer.clientHeight - 30 <= height) {
            if(!silent)
                alert ('Canvas will be too high');
            return false;
        }
        return true;
    },
    // add a color to the color palette
    addPaletteItem: function() {
        let item = document.createElement('div');
        item.classList = "paletteItem";
        item.style.backgroundColor = grid.colorDisplay.style.backgroundColor;
        item.draggable = true;

        // add Event Listeners
         // color dragging
         item.addEventListener('dragstart', function(e) {
            e.target.style.opacity = 0.3;
            grid.dragSource = e.target;
            grid.dropSource = undefined;
        });
        item.addEventListener('dragover', function(e) {
            if (grid.dragSource === grid.colorDisplay){
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.target.classList = 'paletteItem over';
        });
        item.addEventListener('dragleave', function(e) {
            if (grid.dragSource === grid.colorDisplay){
                return;
            }
            if (e.target.className === 'paletteItem over'){
                e.target.classList = 'paletteItem';
            }
        });
        item.addEventListener('drop', function(e) {
            if (grid.dragSource === grid.colorDisplay){
                return;
            }
                
            if(e.target.className === 'paletteItem over') {
                e.target.classList = 'paletteItem';
                grid.changePaletteItemOrder(grid.dragSource,e.target);
            }
            grid.dropSource = e.target;
            grid.dragSource.style.opacity = 1;
        });
        item.addEventListener('dragend', function(e) {
            if (grid.dragSource === grid.colorDisplay){
                return;
            }
            grid.dragSource.style.opacity = 1;
            if (typeof grid.dropSource === 'undefined') {
                item.parentNode.removeChild(item);
            }
        });
        item.addEventListener('click', function() {
            grid.data.color = grid.colorDisplay.style.backgroundColor = item.style.backgroundColor;
        });

        grid.palette.appendChild(item);
    },
    changePaletteItemOrder: function(item, target) {

        let childNodes = item.parentNode.childNodes;

        if (utility.getChildNodeIndex(item, childNodes) > utility.getChildNodeIndex(target, childNodes))
            target.insertAdjacentElement('beforebegin', item);
        else 
            target.insertAdjacentElement('afterend', item);
    }
};

const canvas = {
    // Create class for loadbar canvases
    Create: function(height,width,pixels,scale) {
        if (!scale) {
            scale = 1;
        }

        this.html = document.createElement("canvas");
        this.context = this.html.getContext("2d");
        this.height = height;
        this.width = width;
        this.html.height = height * scale;
        this.html.width = width * scale;
        this.pixels = JSON.parse(JSON.stringify(pixels));

        // draw pixels onto the canvas from data
        for(let y=0; y<this.height; y++) {
                
            for(let x=0; x<this.width; x++) {

                this.context.fillStyle = this.pixels[y][x] || 'transparent';
                this.context.fillRect(x * scale, y * scale, scale, scale);
            }  
        }

    },
    // define additional functions of the Create class
    definePrototypes: function() {
        this.Create.prototype.appendTo = function(node){
            node.appendChild(this.html);
        };
    },
    // download current canvas
    download: function(link, filename) {
        grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        // modified from https://stackoverflow.com/questions/43859391/how-to-save-html-canvas-as-a-named-png-using-only-javascript
        if (!grid.originalShown) {
            grid.createCanvas();
            link.href = document.getElementById('hiddenCanvas').toDataURL();
        }
        else {
            link.href = document.getElementById('canvas').toDataURL();
        }
        link.download = filename;
    }
};

const utility = {
    hexToRgb: function (hex) {
        // modified from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ')' : null;
    },
    rgbToHex: function(arr) {
        // modified from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        return "#" + utility.componentToHex(+arr[0]) + utility.componentToHex(+arr[1]) + utility.componentToHex(+arr[2]);
    },
    componentToHex: function(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    getChildNodeIndex: function(node, nodeList) {
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i] === node)
                return i;
        }
    },
    isHexColor: function(colorString) {
        // from https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorString)
    },
    isRGBAColor: function(colorString) {
        return colorString.indexOf('rgba') !== -1;
    },
    isRGBColor: function(colorString) {
        return colorString.indexOf('rgb') !== -1 && colorString.indexOf('rgba') === -1;
    },
    colorConverter: function(colorString, outputFormat) {

        // if colorstring doesnt contain numbers and doesnt contain # on first index
        if (!colorString.match(/.*\d.*/g) && colorString.indexOf('#') !== 0){
            console.log("invalid color format or color format not supported for conversion");
        }

        if (outputFormat === 'hex') {

            if (utility.isHexColor(colorString)) {
                return colorString;
            }
            else if (utility.isRGBAColor(colorString)) {
                let colorArr = colorString.replace(/[^0-9,]/g, '').split(',');

                // remove opacity
                colorArr[3] = undefined;

                return utility.rgbToHex(colorArr);
            }
            else if (utility.isRGBColor(colorString)) {
                return utility.rgbToHex(colorString.replace(/[^0-9,]/g, '').split(','));
            }
            else {
                alert("invalid color format or color format not supported for conversion");
            }
        }
    }
};

const loadBar = {
    init: function() {
        pxmaker.loadBarHtml.innerHTML = "";
        // create a new canvas image for each image saved
        pxmaker.savedStates.forEach(function(canvasData,index) {
            canvasData = canvasData[canvasData.length -1];
            if(canvasData.hasOwnProperty('pixels')) {
                let div = document.createElement('div');
                div.classList = 'canvasWrapper';
                div.dataset.loadBarIndex = index;

                loadBar.canvas = new canvas.Create(canvasData.height,canvasData.width,canvasData.pixels, canvasData.width > 90 ? 90 / canvasData.width : 2);
                loadBar.canvas.html.style.display = canvasData.width > 100 ?  'block' : 'inline-block';
                loadBar.canvas.html.addEventListener('click',function() {

                    pxmaker.loadCounter = 1;

                    [].slice.call(div.parentNode.querySelectorAll('div')).forEach(function(node) {
                        if(node !== div) {
                            node.classList = 'canvasWrapper';
                        }
                    });
                    if (!div.classList.contains('selected')) {
                        div.classList += ' selected';
                        grid.load(index);
                    }
                });
                loadBar.canvas.appendTo(div);
                pxmaker.loadBarHtml.appendChild(div);
            }
        });
    }
};

pxmaker.init();

// TODO:
// brush präzision/vorschau evtl. mit Farbe?
// keyboard shortcuts for tools (e.g view original size, save etc)
// drag resize canvas?
// drag resize loadbar
// firefox/ie issues
// localStore size limitations exceeded (save steps as changes, not complete canvas)
// size limitations when resizing
// buttons disablen wenn nichts ausgewählt wurde
// redo no data to load wenn schonmal redone wurde ( letzter eintrag speichereintrag wird überschrieben?)
// color picker verbessern / stylen /color preview & color ranges brightness / Farb vorschau
// code refactoren