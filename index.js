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
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'background-image';
                
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
            this.isDragging = true;
            this.draggedShape = shape;
            this.offsetX = e.clientX - x;
            this.offsetY = e.clientY - y;
        });
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
