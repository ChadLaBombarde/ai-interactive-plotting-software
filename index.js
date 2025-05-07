class PlottingTool {
    constructor() {
        this.backgroundContainer = document.querySelector('.background-container');
        this.imageUpload = document.getElementById('imageUpload');
        this.shapeSize = document.getElementById('shapeSize');
        this.shapeColor = document.getElementById('shapeColor');
        this.categorySelect = document.getElementById('categorySelect');
        this.categoryLegend = document.getElementById('categoryLegend');
        
        // Default categories with properties
        this.categories = {
            waypoints: { color: 'green', size: 20 },
            ships: { color: 'orange', size: 25 },
            danger: { color: 'red', size: 30 }
        };
        
        this.setupEventListeners();
        this.updateLegend();
    }

    setupEventListeners() {
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        
        // Enable drag and drop for shapes
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.isDragging = false);

        // Touch events
        document.addEventListener('touchmove', (e) => this.handleTouchDrag(e), { passive: false });
        document.addEventListener('touchend', () => this.stopDragging());
        document.addEventListener('touchcancel', () => this.stopDragging());
    }
    

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'background-image';
                img.draggable = false; // Prevent image from being draggable
                img.style.userSelect = 'none'; // Prevent text/image selection
                // Clear existing background
                this.backgroundContainer.innerHTML = '';
                this.backgroundContainer.appendChild(img);
                this.backgroundContainer.appendChild(this.createLegend());
            };
            reader.readAsDataURL(file);
        }
    }

    addShape(x, y) {
        const category = this.categorySelect.value;
        const shape = document.createElement('div');
        shape.className = 'shape';
        shape.dataset.category = category;
        
        const categoryProps = this.categories[category];
        const size = parseInt(this.shapeSize.value);
        const color = this.shapeColor.value || categoryProps.color;
        
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.backgroundColor = color;
        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;
        
        this.backgroundContainer.appendChild(shape);
        
        // Make shape draggable
        shape.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent default browser behavior (e.g., image drag)
            e.stopPropagation(); // Stop event from bubbling to image/container
            this.isDragging = true;
            this.draggedShape = shape;
            const rect = shape.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left; // Offset from shape's left edge
            this.offsetY = e.clientY - rect.top;  // Offset from shape's top edge
        });
        // Touch drag
        shape.addEventListener('touchstart', (e) => { // Added: Initiate dragging on touch start
            e.preventDefault(); // Added: Prevent default touch behavior (e.g., scrolling)
            e.stopPropagation(); // Added: Stop event bubbling
            const touch = e.touches[0]; // Added: Get the first touch point
            this.startDragging(shape, touch.clientX, touch.clientY); // Added: Start dragging with touch coordinates
        }, { passive: false }); // Added: Ensure preventDefault works for touch events
    
    }
    startDragging(shape, clientX, clientY) { // Modified: Extracted dragging logic to reusable method for mouse and touch
        this.isDragging = true;
        this.draggedShape = shape;
        const rect = shape.getBoundingClientRect();
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
    }

    stopDragging() { // Modified: Extracted stop logic to reusable method for mouse and touch
        this.isDragging = false;
        this.draggedShape = null;
    }

    handleDrag(e) {
        if (!this.isDragging || !this.draggedShape) return;

        const rect = this.backgroundContainer.getBoundingClientRect();
        let x = e.clientX - rect.left - this.offsetX;
        let y = e.clientY - rect.top - this.offsetY;

        // Keep shape within bounds
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        this.draggedShape.style.left = `${x}px`;
        this.draggedShape.style.top = `${y}px`;
    }
    handleTouchDrag(e) { // Added: Handle touch dragging
        if (!this.isDragging || !this.draggedShape) return;
        
        e.preventDefault(); // Added: Prevent default touch behavior
        const touch = e.touches[0]; // Added: Get the current touch point
        const rect = this.backgroundContainer.getBoundingClientRect();
        let x = touch.clientX - rect.left - this.offsetX; // Added: Calculate shape position using touch coordinates
        let y = touch.clientY - rect.top - this.offsetY; // Added: Calculate shape position using touch coordinates

        x = Math.max(0, Math.min(x, rect.width)); // Added: Constrain within bounds
        y = Math.max(0, Math.min(y, rect.height)); // Added: Constrain within bounds

        this.draggedShape.style.left = `${x}px`; // Added: Update shape position
        this.draggedShape.style.top = `${y}px`; // Added: Update shape position
    }

    addCategory() {
        const categoryName = document.getElementById('newCategoryName').value.trim();
        const categoryColor = document.getElementById('newCategoryColor').value;
        
        if (categoryName && !this.categories[categoryName]) {
            this.categories[categoryName] = { 
                color: categoryColor,
                size: parseInt(this.shapeSize.value)
            };
            
            const option = document.createElement('option');
            option.value = categoryName;
            option.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            this.categorySelect.add(option);
            
            this.updateLegend();
            document.getElementById('newCategoryName').value = '';
        }
    }

    updateLegend() {
        this.categoryLegend.innerHTML = Object.entries(this.categories)
            .map(([name, props]) => `
                <div style="margin: 4px 0;">
                    <span style="display: inline-block; width: 12px; height: 12px; background-color: ${props.color}; margin-right: 8px;"></span>
                    <span>${name.charAt(0).toUpperCase() + name.slice(1)}</span>
                </div>
            `).join('');
    }
    clearMap() {
        this.backgroundContainer.innerHTML = '';
    }
    
    clearCategory(category) {
        const shapes = document.querySelectorAll(`.shape[data-category="${category}"]`);
        shapes.forEach(shape => shape.remove());
    }
}
// Clear map function
function clearMap() {
    plotter.clearMap();
}

// Clear category functions
function clearCategory(category) {
    plotter.clearCategory(category);
}

// Initialize plotting tool
const plotter = new PlottingTool();

// Add shape at click position
function addShape() {
    const rect = document.querySelector('.plotting-area').getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    plotter.addShape(x, y);
}

function addCategory() {
    plotter.addCategory();
}
