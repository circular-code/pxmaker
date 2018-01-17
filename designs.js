"use strict";

const pxmaker = {
    init: function() {
        this.prepare();
        canvas.definePrototypes();
        loadBar.init();
        grid.makeGrid(grid.data.height,grid.data.width,grid.data.scale);
        if (!this.savedStates || this.savedStates.length === 0) {
            grid.save();
        }
        this.loadCounter = 1;
        grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        grid.createColorPicker(0);
        grid.colorDisplay.style.backgroundColor = '#000000';
    },
    prepare: function() {

        this.savedStates = JSON.parse(localStorage.getItem('pxmaker3000')) || [];
        this.loadBarHtml = document.getElementById('loadBar');

        // Get dom elements
        grid.heightInput = document.getElementById('gridHeight');
        grid.widthInput = document.getElementById('gridWidth');
        grid.scaleInput = document.getElementById('pixelScale');
        grid.colorDisplay = document.getElementById('colorDisplay');
        grid.colorPicker = document.getElementById('colorPickerHsl');
        grid.hueRange = document.getElementById('hueRange');
        grid.brushSize = document.getElementById('brushSize');
        grid.container = document.getElementById('pixelCanvasBody');
        grid.showGridInput = document.getElementById('showGrid');
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

        grid.next = document.getElementById('next');
        grid.prev = document.getElementById('prev');

        grid.palette = document.getElementById('palette');

        // Set up event listeners
        grid.heightInput.addEventListener('change', function() {
            grid.data.height = grid.heightInput.value; 
        });
        grid.widthInput.addEventListener('change', function() {
            grid.data.width = grid.widthInput.value;
        });
        grid.scaleInput.addEventListener('change', function() {
            grid.data.scale = grid.scaleInput.value;
        });

        grid.hueRange.addEventListener('change',function(e) {
            grid.createColorPicker(e.target.value);
        });

        grid.colorPicker.addEventListener('mouseup', function(e) {
            grid.data.color = e.target.style.backgroundColor;
            grid.hexInput.value = grid.data.color = grid.colorDisplay.style.backgroundColor = utility.colorConverter(e.target.style.backgroundColor, "hex");
        });

        grid.showGridInput.addEventListener('change', function(e) {
            if (e.target.checked === true){
                grid.changeGridLines(grid.data.baseLineColor,grid.data.lineOpacityValue);
                grid.lineColorInput.disabled = false;
                grid.lineOpacityInput.disabled = false;
            }
            else {
                grid.lineColorInput.disabled = true;
                grid.lineOpacityInput.disabled = true;
                grid.clearGridLines();
            }
        });
        
        grid.lineColorInput.addEventListener('change', function(e) {
            grid.data.baseLineColor = e.target.value;
            grid.changeGridLines(grid.data.baseLineColor,grid.data.lineOpacityValue);
        });

        grid.lineOpacityInput.addEventListener('change', function(e) {
            grid.data.lineOpacityValue = e.target.value/100;
            grid.changeGridLines(grid.data.baseLineColor,grid.data.lineOpacityValue);
        });

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
        grid.container.addEventListener('mouseover', function(e) {
            if(pxmaker.mouseClicked && grid.getColor.checked !== true && grid.replaceInput.checked !== true) {
                if (grid.erase.checked === true) {
                    grid.draw(e.target,"transparent");
                } else {
                    grid.draw(e.target,grid.data.color);
                } 
            }
                
        });
        grid.container.addEventListener('mouseup', function() {
            if(grid.getColor.checked === false)
                grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        });

        grid.clearGridButton.addEventListener('click', function() {
            grid.clearGrid();
            grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex, true);
        });

        grid.makeGridButton.addEventListener('click', function() {
            grid.makeAndSaveGrid(grid.data.width, grid.data.height, grid.data.scale);
        });

        grid.button16px.addEventListener('click', function() {
            grid.makeAndSaveGrid(16, 16, grid.data.scale);
        });
        grid.button24px.addEventListener('click', function() {
            grid.makeAndSaveGrid(24, 24, grid.data.scale);
        });
        grid.button32px.addEventListener('click', function() {
            grid.makeAndSaveGrid(32, 32, grid.data.scale);
        });
        grid.button64px.addEventListener('click', function() {
            grid.makeAndSaveGrid(64, 64, grid.data.scale);
        });

        grid.deleteButton.addEventListener('click', function() {
            grid.delete();
        });

        grid.next.addEventListener('click', function() {
            pxmaker.loadCounter--;
            grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        });

        grid.prev.addEventListener('click', function() {
            pxmaker.loadCounter++;
            grid.load(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        });

        grid.showOriginalButton.addEventListener('click', function() {
            if (!grid.originalShown){
                grid.showOriginal(document.getElementById('pixelCanvas'));
            } else {
                grid.hideOriginal();
            }
        });
        
        canvas.downloadButton.addEventListener('click', function() {
            canvas.download(this, 'canvas', 'test.png');
        }, false);

        document.addEventListener('mousedown', function() {
            pxmaker.mouseClicked = true;
        });

        document.addEventListener('mouseup', function() {
            pxmaker.mouseClicked = false;
        });

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

        grid.hexInput.addEventListener('keyup', function(e) {
            if (utility.isValidHexColor(e.target.value))
                grid.data.color = grid.colorDisplay.style.backgroundColor = e.target.value;
        });
    }
};

const grid = {
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

        if (!loaded){
            let nodes = pxmaker.loadBarHtml.childNodes;
            if (nodes.length > 0)
                nodes[nodes.length -1].classList += ' selected';
        }
    },
    makeAndSaveGrid: function(height, width, scale) {
        if (grid.checkIsContaining(height * scale, width * scale)) {
            grid.makeGrid(height, width, scale);
            grid.save();
        }
    },
    clearGrid: function() {
        this.tdArray.forEach(function(td) {
            td.style.backgroundColor = 'transparent';
        });
    },
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

        if (elem.tagName !== 'TD')
            return;

        var size = +grid.brushSize.value;

        if (size === 1) 
            elem.style.backgroundColor = color;
        else if (size > 1) {   
            var tds = elem.parentNode.childNodes;
            var trs = elem.parentNode.parentNode.childNodes;
            var currentChildNodeIndex = utility.getChildNodeIndex(elem, tds);
            var currentRowIndex = utility.getChildNodeIndex(elem.parentNode, trs);

            for (var j = 0; j < size; j++) {
                if (trs[currentRowIndex + j]) {
                    tds = trs[currentRowIndex + j].childNodes;
                }

                for (var k = 0; k < size; k++) {
                    if (tds[currentChildNodeIndex + k]) {
                        tds[currentChildNodeIndex + k].style.backgroundColor = color;
                    }
                }
            }
        }
    },
    drawFull: function(target,data) {

        [].slice.call(target.children).forEach(function(row,rowindex) {
            
            [].slice.call(row.children).forEach(function(cell,cellindex) {
                cell.style.backgroundColor = data[rowindex][cellindex] || 'transparent';
            });
        });
    },
    getPixelData: function() {
        //reset array
        grid.data.pixels = [];

        [].slice.call(this.container.children).forEach(function(tr) {

            let trArray = [];
            
            [].slice.call(tr.children).forEach(function(td) {
                trArray.push(td.style.backgroundColor);
            });   

            grid.data.pixels.push(trArray);
        });
    },
    save: function(index, clear) {
        this.getPixelData();

        // FIXME: checken und berichtigen, funktioniert noch nicht 100%
        if (index){
            if (pxmaker.loadCounter > 1) {
                pxmaker.savedStates[index][pxmaker.savedStates[index].length - pxmaker.loadCounter] = JSON.parse(JSON.stringify(this.data));
                pxmaker.savedStates[index] = pxmaker.savedStates[index].slice(0,[pxmaker.savedStates[index].length - pxmaker.loadCounter +1]);
                pxmaker.loadCounter = 1;
            }
            else {
                pxmaker.savedStates[index].push(JSON.parse(JSON.stringify(this.data)));
            }
            if (clear) {
                pxmaker.savedStates[index] = pxmaker.savedStates[index].splice([pxmaker.savedStates[index].length - 1],1);
            }
        }
        else {
            pxmaker.savedStates.push([JSON.parse(JSON.stringify(this.data))]);
        }
            
        localStorage.setItem('pxmaker3000',JSON.stringify(pxmaker.savedStates));
        loadBar.init();

        let nodes = pxmaker.loadBarHtml.childNodes;
        if (nodes.length > 0) {
            typeof index === 'undefined' ?
            nodes[nodes.length -1].classList += ' selected' :
            nodes[index].classList += ' selected';
        }
    },
    delete: function() {
        let index = pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex;
        this.clearGrid();
        pxmaker.savedStates.splice(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex,1);
        localStorage.setItem('pxmaker3000',JSON.stringify(pxmaker.savedStates));
        loadBar.init();
        let nodes = pxmaker.loadBarHtml.childNodes;

        //FIXME: load new sheet
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
    load: function(index) {
        if(pxmaker.savedStates.length <= 0){
            this.save();
        }
        
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
            this.data = pxmaker.savedStates[index][pxmaker.savedStates[index].length - pxmaker.loadCounter ];

            this.makeGrid(grid.data.height,grid.data.width,grid.data.scale,true);
            this.drawFull(grid.container,grid.data.pixels);
        }
    },
    createCanvas: function(visible) {
        canvas.newCanvas = new canvas.Create(this.data.height,this.data.width,this.data.pixels);

        if (visible) {
            grid.originalSizeCanvas.appendChild(canvas.newCanvas.html);
            grid.originalSizeCanvas.childNodes[0].id = "canvas";
        }
        else {
            grid.hiddenCanvasWrapper.innerHTML = "";
            grid.hiddenCanvasWrapper.appendChild(canvas.newCanvas.html);
            grid.hiddenCanvasWrapper.childNodes[0].id = "hiddenCanvas";
        }
    },
    showOriginal: function(targetNode) {
        this.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
        this.createCanvas(true);

        targetNode.style.display = "none";
        grid.showOriginalButton.className = "active";
        grid.originalShown = true;
    },
    hideOriginal: function() {
        document.getElementById('pixelCanvas').style.display = 'table';
        grid.originalSizeCanvas.innerHTML = "";
        grid.showOriginalButton.className = "";
        grid.originalShown = false;
    },
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
    replace: function(color) {
        var trs = grid.container.childNodes;

        for(var i = 0; i < trs.length; i++) {

            var tds = trs[i].childNodes;

            for(var j = 0; j < tds.length; j++) {
                if (tds[j].style.backgroundColor === color) {
                    tds[j].style.backgroundColor = grid.data.color;
                }
            }
        }
        grid.save(pxmaker.loadBarHtml.querySelector('.selected').dataset.loadBarIndex);
    },
    handleScroll: function(direction) {

        var num;
        if (direction === "up") {
            num = -1;
        }
        else {
            if (!grid.checkIsContaining(grid.container.clientWidth, grid.container.clientHeight))
                return;
            num = 1;
        }
            

        var i = 0, arr = grid.container.querySelectorAll('td'); 

        for (i; i < arr.length; i++) {
            arr[i].style.width = parseInt(arr[i].style.width) + num + 'px';
            arr[i].style.height = parseInt(arr[i].style.height) + num + 'px';
        }
        
    },
    checkIsContaining: function(width, height) {
        var canvasContainer = document.getElementById('canvasWrapper');
        if (canvasContainer.clientWidth - 30 <= width) {
            alert('Canvas will be too wide');
            return false;
        }
        if (canvasContainer.clientHeight - 30 <= height) {
            alert ('Canvas will be too high');
            return false;
        }
        return true;
    },
    addPaletteItem: function() {
        var item = document.createElement('div');
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

        var childNodes = item.parentNode.childNodes;

        if (utility.getChildNodeIndex(item, childNodes) > utility.getChildNodeIndex(target, childNodes))
            target.insertAdjacentElement('beforebegin', item);
        else 
            target.insertAdjacentElement('afterend', item);
    }
};

const canvas = {
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
        this.pixels = pixels;

        for(let y=0; y<this.height; y++) {
                
            for(let x=0; x<this.width; x++) {

                this.context.fillStyle = this.pixels[y][x] || 'transparent';
                this.context.fillRect(x * scale, y * scale, scale, scale);
            }  
        }

    },
    definePrototypes: function() {
        this.Create.prototype.appendTo = function(node){
            node.appendChild(this.html);
        };
    },
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
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    getChildNodeIndex: function(node, nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
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
                var colorArr = colorString.replace(/[^0-9,]/g, '').split(',');

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
        pxmaker.savedStates.forEach(function(canvasData,index) {
            canvasData = canvasData[canvasData.length -1];
            if(canvasData.hasOwnProperty('pixels')) {
                let div = document.createElement('div');
                div.classList = 'canvasWrapper';
                div.dataset.loadBarIndex = index;

                loadBar.canvas = new canvas.Create(canvasData.height,canvasData.width,canvasData.pixels,2);
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

// resize?
// grid settings stylen
// image load bar image sizes
// canvas size nach zoomin/out undo redo
// keyboard shortcuts for tools (e.g view original size, save etc)
// bug delete delete new drawing --> beide Weiß anstatt nur eins
// buttons disablen wenn nichts ausgewählt wurde
// color picker verbessern / stylen /color preview & color ranges brightness / Farb vorschau
// tooltips für alles inkl. shortcuts?
// brush präzision/vorschau evtl. mit Farbe?
// set document minwidth, minheight dynamically after grid resizing/creation
// getColor fixen
// alles kommentieren/refactoren 
// auf github hosten
// ins Forum stellen